import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { batchId } = await params;
    if (!batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    const db = await getDatabase();

    // 1. Delete associated leads for this batch
    const leadsRes = await db.collection("leads").deleteMany({ batchId });

    // 2. Delete the batch document
    const batchRes = await db.collection("lead_batches").deleteOne({ batchId });

    // 3. Remove staging if any
    await db.collection("lead_staging").deleteOne({ batchId });

    // 4. Audit log
    await db.collection("lead_audit_logs").insertOne({
      action: "batch_deleted",
      performedBy: admin.email,
      details: { batchId, deletedLeadsCount: leadsRes.deletedCount },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      deletedBatchCount: batchRes.deletedCount,
      deletedLeadsCount: leadsRes.deletedCount,
    });
  } catch (err: any) {
    console.error("Delete batch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete batch." },
      { status: 500 }
    );
  }
}
