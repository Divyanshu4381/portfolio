import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadUpdateRequest } from "@/lib/lead-engine/types";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const db = await getDatabase();
    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = status;
    }

    const requests = await db
      .collection<ILeadUpdateRequest>("lead_update_requests")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const pendingCount = await db
      .collection("lead_update_requests")
      .countDocuments({ status: "pending" });

    return NextResponse.json({ requests, pendingCount });
  } catch (err: any) {
    console.error("Fetch lead requests error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch lead requests." },
      { status: 500 }
    );
  }
}
