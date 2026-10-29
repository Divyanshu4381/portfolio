import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare, PRIVATE_FIELDS } from "@/lib/lead-engine/types";
import crypto from "crypto";

// Rate limiting state (in-memory; use Redis in production for multi-instance deployments)
const accessAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = accessAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    accessAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= MAX_ATTEMPTS) return false; // blocked
  entry.count++;
  return true;
}

/** Verify password against salted hash (format: "salt:hash") or legacy plain SHA-256 hash */
function verifyPassword(provided: string, storedHash: string): boolean {
  if (!provided || !storedHash) return false;

  if (storedHash.includes(":")) {
    // New salted format: "salt:sha256(salt:password)"
    const [salt, expectedHash] = storedHash.split(":");
    const actualHash = crypto
      .createHash("sha256")
      .update(`${salt}:${provided.trim()}`)
      .digest("hex");
    return actualHash === expectedHash;
  } else {
    // Legacy plain SHA-256 (for existing shares created before the update)
    const hashedProvided = crypto
      .createHash("sha256")
      .update(provided.trim())
      .digest("hex");
    return hashedProvided === storedHash;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Basic token format validation
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 400 });
    }

    // Rate limiting by token (prevents brute-force on password-protected shares)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `${token}:${clientIp}`;
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const db = await getDatabase();
    const share = await db.collection<ILeadShare>("lead_shares").findOne({ token });

    if (!share) {
      // Return same error as revoked/expired to avoid oracle attack
      return NextResponse.json(
        { error: "This share link is not available." },
        { status: 404 }
      );
    }

    // 1. Check if revoked
    if (share.isRevoked) {
      return NextResponse.json(
        { error: "This share link has been revoked by the administrator." },
        { status: 403 }
      );
    }

    // 2. Check if expired (server-side time — not trusting client)
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      // Mark as expired in DB for audit
      await db.collection("lead_shares").updateOne(
        { token },
        { $set: { isRevoked: true, updatedAt: new Date() } }
      );
      await db.collection("lead_audit_logs").insertOne({
        action: "share_expired",
        shareId: share.shareId,
        performedBy: "system",
        details: { expiredAt: share.expiresAt },
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "This share link has expired." },
        { status: 403 }
      );
    }

    // 3. Check view limit
    if (share.maxViews && share.viewCount >= share.maxViews) {
      return NextResponse.json(
        { error: "This share link has reached its maximum allowed view limit." },
        { status: 403 }
      );
    }

    // 4. Password check
    if (share.passwordHash) {
      const providedPassword = req.headers.get("x-share-password") || "";
      if (!verifyPassword(providedPassword, share.passwordHash)) {
        return NextResponse.json(
          {
            requiresPassword: true,
            title: share.title,
            mode: share.mode,
            description: share.description,
          },
          { status: 401 }
        );
      }
    }

    // 5. Update view count and last access
    await db.collection("lead_shares").updateOne(
      { token },
      {
        $inc: { viewCount: 1 },
        $set: { lastAccessedAt: new Date() },
      }
    );

    // Log access
    await db.collection("lead_audit_logs").insertOne({
      action: "share_accessed",
      shareId: share.shareId,
      performedBy: "client",
      details: { recipientEmail: share.recipientEmail || null, viewCount: share.viewCount + 1 },
      timestamp: new Date(),
    });

    // 6. Build query — ALWAYS scoped to authorized lead IDs
    if (!share.leadIds || share.leadIds.length === 0) {
      // No leads authorized — return empty result
      return buildResponse(share, [], { total: 0, page: 1, limit: 25, totalPages: 1 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "25", 10))); // clients max 50

    // Base query: always scoped to authorized IDs
    const leadQuery: Record<string, any> = {
      leadId: { $in: share.leadIds },
    };

    // Search within authorized leads only
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      leadQuery.$or = [
        { companyName: regex },
        { contactPerson: regex },
        { city: regex },
        { category: regex },
      ];
    }

    // 7. Strict projection — ONLY allowedFields, NEVER private fields
    const serverAllowed = (share.allowedFields || []).filter(
      (f) => !PRIVATE_FIELDS.includes(f as any)
    );

    const projection: Record<string, number> = { _id: 0, leadId: 1 };
    serverAllowed.forEach((field) => {
      projection[field] = 1;
    });

    const total = await db.collection("leads").countDocuments(leadQuery);
    const leads = await db
      .collection("leads")
      .find(leadQuery, { projection })
      .sort({ companyName: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };

    const response = buildResponse(share, leads, pagination);
    return response;
  } catch (err: any) {
    console.error("Shared leads view error:", err);
    return NextResponse.json(
      { error: "Failed to load shared leads." },
      { status: 500 }
    );
  }
}

function buildResponse(
  share: ILeadShare,
  leads: any[],
  pagination: { total: number; page: number; limit: number; totalPages: number }
): NextResponse {
  const serverAllowed = (share.allowedFields || []).filter(
    (f) => !PRIVATE_FIELDS.includes(f as any)
  );

  const res = NextResponse.json({
    title: share.title,
    description: share.description || "",
    recipientName: share.recipientName || "",
    mode: share.mode,
    allowedFields: serverAllowed,
    writableFields: (share.writableFields || []).filter(
      (f) => !PRIVATE_FIELDS.includes(f as any) && serverAllowed.includes(f)
    ),
    leads,
    pagination,
  });

  // Security headers
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.headers.set("Pragma", "no-cache");

  return res;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
