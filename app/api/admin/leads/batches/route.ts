import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadBatch } from "@/lib/lead-engine/types";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const db = await getDatabase();
    const batches = await db
      .collection<ILeadBatch>("lead_batches")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ batches });
  } catch (err: any) {
    console.error("Fetch batches error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch batches." },
      { status: 500 }
    );
  }
}
