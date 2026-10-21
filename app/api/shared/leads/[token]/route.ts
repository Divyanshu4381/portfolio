import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare } from "@/lib/lead-engine/types";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 32) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 400 });
    }

    const db = await getDatabase();
    const share = await db.collection<ILeadShare>("lead_shares").findOne({ token });

    if (!share) {
      return NextResponse.json(
        { error: "Share link not found or has been removed." },
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

    // 2. Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired." },
        { status: 403 }
      );
    }

    // 3. Check if view limit exceeded
    if (share.maxViews && share.viewCount >= share.maxViews) {
      return NextResponse.json(
        { error: "This share link has reached its maximum allowed view limit." },
        { status: 403 }
      );
    }

    // 4. Check password protection
    if (share.passwordHash) {
      const providedPassword = req.headers.get("x-share-password") || "";
      const hashedProvided = crypto
        .createHash("sha256")
        .update(providedPassword.trim())
        .digest("hex");

      if (hashedProvided !== share.passwordHash) {
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

    // 5. Update view count and access timestamp
    await db.collection("lead_shares").updateOne(
      { token },
      {
        $inc: { viewCount: 1 },
        $set: { lastAccessedAt: new Date() },
      }
    );

    // 6. Fetch permitted leads
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));

    const leadQuery: Record<string, any> = {};

    // Scope to specific leads if configured
    if (share.leadIds && share.leadIds.length > 0) {
      leadQuery.leadId = { $in: share.leadIds };
    }

    // Optional search within allowed fields
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      leadQuery.$or = [
        { companyName: regex },
        { contactPerson: regex },
        { city: regex },
        { category: regex },
      ];
    }

    // 7. Strict projection: expose ONLY allowedFields
    const projection: Record<string, number> = { _id: 0, leadId: 1 };
    const allowed = share.allowedFields || [
      "companyName",
      "contactPerson",
      "email",
      "phone",
      "website",
      "category",
      "city",
      "state",
    ];

    allowed.forEach((field) => {
      projection[field] = 1;
    });

    const total = await db.collection("leads").countDocuments(leadQuery);
    const leads = await db
      .collection("leads")
      .find(leadQuery, { projection })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const response = NextResponse.json({
      title: share.title,
      description: share.description,
      mode: share.mode,
      allowedFields: allowed,
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });

    // Enforce no-index header on all shared views
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  } catch (err: any) {
    console.error("Shared leads view error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load shared leads." },
      { status: 500 }
    );
  }
}
