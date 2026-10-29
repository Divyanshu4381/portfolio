import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare, PRIVATE_FIELDS } from "@/lib/lead-engine/types";
import crypto from "crypto";

// Fields the admin is allowed to update on a share via PATCH
const SHARE_UPDATABLE_FIELDS = ["isRevoked", "expiresAt", "maxViews", "title", "description"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { shareId } = await params;
    const db = await getDatabase();
    const share = await db.collection<ILeadShare>("lead_shares").findOne({ shareId });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Get lead count for this share
    const leadCount =
      share.leadIds && share.leadIds.length > 0
        ? await db.collection("leads").countDocuments({ leadId: { $in: share.leadIds } })
        : 0;

    // Get audit trail for this share (last 20 events)
    const auditLogs = await db
      .collection("lead_audit_logs")
      .find({ shareId })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      share: {
        ...share,
        hasPassword: Boolean(share.passwordHash),
        passwordHash: undefined,
      },
      leadCount,
      auditLogs,
    });
  } catch (err: any) {
    console.error("Get share detail error:", err);
    return NextResponse.json({ error: "Failed to get share details." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { shareId } = await params;
    const body = await req.json();

    const db = await getDatabase();
    const updateFields: Record<string, any> = { updatedAt: new Date() };

    // Only allow specific fields to be updated
    if (typeof body.isRevoked === "boolean") {
      updateFields.isRevoked = body.isRevoked;
    }
    if (body.expiresAt !== undefined) {
      updateFields.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    if (typeof body.maxViews === "number" || body.maxViews === null) {
      updateFields.maxViews = body.maxViews
        ? Math.max(1, Math.min(100000, Number(body.maxViews)))
        : null;
    }
    if (body.title && typeof body.title === "string") {
      updateFields.title = body.title.trim().slice(0, 200);
    }
    if (body.description !== undefined) {
      updateFields.description = String(body.description || "").trim().slice(0, 1000);
    }
    if (body.regenerateToken) {
      updateFields.token = crypto.randomBytes(32).toString("hex");
      updateFields.viewCount = 0; // reset view count on token regeneration
    }

    const res = await db.collection("lead_shares").findOneAndUpdate(
      { shareId },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!res) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Audit log
    const action = body.isRevoked === true
      ? "share_revoked"
      : body.isRevoked === false
      ? "share_reactivated"
      : "share_updated";

    await db.collection("lead_audit_logs").insertOne({
      action,
      performedBy: admin.email,
      shareId,
      details: { changedFields: Object.keys(updateFields).filter((k) => k !== "updatedAt") },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      share: {
        ...res,
        hasPassword: Boolean(res.passwordHash),
        passwordHash: undefined,
      },
    });
  } catch (err: any) {
    console.error("Update share error:", err);
    return NextResponse.json(
      { error: "Failed to update share." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { shareId } = await params;
    const db = await getDatabase();
    const share = await db.collection("lead_shares").findOne({ shareId });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    await db.collection("lead_shares").deleteOne({ shareId });

    await db.collection("lead_audit_logs").insertOne({
      action: "share_deleted",
      performedBy: admin.email,
      shareId,
      details: { title: (share as any).title },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete share error:", err);
    return NextResponse.json(
      { error: "Failed to delete share." },
      { status: 500 }
    );
  }
}
