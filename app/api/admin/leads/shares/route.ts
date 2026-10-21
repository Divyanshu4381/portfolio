import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare, ShareMode } from "@/lib/lead-engine/types";
import crypto from "crypto";

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

    // Map out raw passwordHash to keep it secure
    const sanitizedShares = shares.map((s) => ({
      ...s,
      hasPassword: Boolean(s.passwordHash),
      passwordHash: undefined,
    }));

    return NextResponse.json({ shares: sanitizedShares });
  } catch (err: any) {
    console.error("Fetch shares error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch share links." },
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
      mode = "restricted" as ShareMode,
      leadIds = [],
      allowedFields = [
        "companyName",
        "contactPerson",
        "email",
        "phone",
        "website",
        "category",
        "city",
        "state",
      ],
      password = null,
      expiresAt = null,
      maxViews = null,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Share title is required" }, { status: 400 });
    }

    // Cryptographically secure, unguessable token
    const token = crypto.randomBytes(32).toString("hex");
    const shareId = `SHARE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Hash password if set
    let passwordHash: string | null = null;
    if (password && String(password).trim()) {
      passwordHash = crypto
        .createHash("sha256")
        .update(String(password).trim())
        .digest("hex");
    }

    const shareDoc: ILeadShare = {
      shareId,
      title: title.trim(),
      description: description.trim(),
      mode,
      token,
      leadIds: Array.isArray(leadIds) ? leadIds : [],
      allowedFields: Array.isArray(allowedFields) ? allowedFields : [],
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxViews: maxViews ? Number(maxViews) : null,
      viewCount: 0,
      isRevoked: false,
      lastAccessedAt: null,
      createdBy: admin.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    await db.collection("lead_shares").insertOne(shareDoc);

    // Audit log
    await db.collection("lead_audit_logs").insertOne({
      action: "share_created",
      performedBy: admin.email,
      details: {
        shareId,
        title,
        mode,
        hasPassword: Boolean(passwordHash),
        expiresAt,
        maxViews,
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
      { error: err.message || "Failed to create share link." },
      { status: 500 }
    );
  }
}
