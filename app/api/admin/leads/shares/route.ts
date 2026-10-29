import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare, ShareMode, PRIVATE_FIELDS } from "@/lib/lead-engine/types";
import crypto from "crypto";

// Fields that can never be in allowedFields, regardless of what admin sends
const NEVER_ALLOWED: string[] = [...PRIVATE_FIELDS];

// Allowlist of fields that CAN be shared with clients
const SHAREABLE_FIELDS = [
  "companyName",
  "contactPerson",
  "email",
  "phone",
  "website",
  "category",
  "businessDescription",
  "city",
  "state",
  "country",
  "address",
  "notes",
  "contactStatus",
  "status",
  "followUpDate",
] as const;

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const db = await getDatabase();
    const shares = await db
      .collection<ILeadShare>("lead_shares")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Sanitize: remove password hash before sending to admin frontend
    const sanitizedShares = shares.map((s) => ({
      ...s,
      hasPassword: Boolean(s.passwordHash),
      passwordHash: undefined,
    }));

    return NextResponse.json({ shares: sanitizedShares });
  } catch (err: any) {
    console.error("Fetch shares error:", err);
    return NextResponse.json(
      { error: "Failed to fetch share links." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description = "",
      recipientName = "",
      recipientEmail = "",
      mode = "restricted" as ShareMode,
      leadIds = [],
      allowedFields: rawAllowedFields = [],
      writableFields: rawWritableFields = [],
      password = null,
      expiresAt = null,
      maxViews = null,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Share title is required" }, { status: 400 });
    }

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "At least one lead must be selected to create a share" }, { status: 400 });
    }

    // Validate that all leadIds actually exist in the database
    const db = await getDatabase();
    const existingLeads = await db
      .collection("leads")
      .find({ leadId: { $in: leadIds } }, { projection: { leadId: 1, _id: 0 } })
      .toArray();

    if (existingLeads.length !== leadIds.length) {
      const foundIds = new Set(existingLeads.map((l: any) => l.leadId));
      const missing = leadIds.filter((id: string) => !foundIds.has(id));
      return NextResponse.json(
        { error: `Some lead IDs do not exist: ${missing.slice(0, 5).join(", ")}` },
        { status: 400 }
      );
    }

    // Sanitize allowedFields — only permit fields in SHAREABLE_FIELDS, reject NEVER_ALLOWED
    const allowedFields = (Array.isArray(rawAllowedFields) ? rawAllowedFields : [])
      .filter((f: string) =>
        SHAREABLE_FIELDS.includes(f as any) && !NEVER_ALLOWED.includes(f)
      );

    if (allowedFields.length === 0) {
      return NextResponse.json({ error: "At least one visible field must be selected" }, { status: 400 });
    }

    // Sanitize writableFields — must be a subset of allowedFields AND a client-writable field
    const CLIENT_WRITABLE = ["contactStatus", "status", "followUpDate", "notes"];
    const writableFields = (Array.isArray(rawWritableFields) ? rawWritableFields : [])
      .filter((f: string) => CLIENT_WRITABLE.includes(f) && allowedFields.includes(f));

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex"); // 64 hex chars = 256 bits entropy
    const shareId = `SHARE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password && String(password).trim()) {
      // Use SHA-256 with a per-share salt for better security than plain SHA-256
      const salt = crypto.randomBytes(16).toString("hex");
      passwordHash = `${salt}:${crypto
        .createHash("sha256")
        .update(`${salt}:${String(password).trim()}`)
        .digest("hex")}`;
    }

    const shareDoc: ILeadShare = {
      shareId,
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 1000),
      recipientName: recipientName.trim().slice(0, 200),
      recipientEmail: recipientEmail.trim().toLowerCase().slice(0, 200),
      mode,
      token,
      leadIds: leadIds,
      allowedFields,
      writableFields,
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxViews: maxViews ? Math.max(1, Math.min(100000, Number(maxViews))) : null,
      viewCount: 0,
      isRevoked: false,
      lastAccessedAt: null,
      lastUpdateAt: null,
      createdBy: admin.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("lead_shares").insertOne(shareDoc);

    // Audit log
    await db.collection("lead_audit_logs").insertOne({
      action: "share_created",
      performedBy: admin.email,
      shareId,
      details: {
        title: shareDoc.title,
        mode,
        leadCount: leadIds.length,
        hasPassword: Boolean(passwordHash),
        recipientEmail: recipientEmail || null,
        expiresAt,
        allowedFields,
        writableFields,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      share: {
        ...shareDoc,
        hasPassword: Boolean(passwordHash),
        passwordHash: undefined,
      },
    });
  } catch (err: any) {
    console.error("Create share error:", err);
    return NextResponse.json(
      { error: "Failed to create share link." },
      { status: 500 }
    );
  }
}
