import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import crypto from "crypto";

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
    const { isRevoked, regenerateToken } = body;

    const db = await getDatabase();
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (typeof isRevoked === "boolean") {
      updateFields.isRevoked = isRevoked;
    }

    if (regenerateToken) {
      updateFields.token = crypto.randomBytes(32).toString("hex");
      updateFields.isRevoked = false;
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
    await db.collection("lead_audit_logs").insertOne({
      action: regenerateToken ? "share_token_regenerated" : "share_revocation_toggled",
      performedBy: admin.email,
      details: { shareId, isRevoked, regenerateToken },
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
      { error: err.message || "Failed to update share." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { shareId } = await params;
    const db = await getDatabase();
    const res = await db.collection("lead_shares").deleteOne({ shareId });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete share error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete share." },
      { status: 500 }
    );
  }
}
