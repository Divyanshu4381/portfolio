import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadAnalytics } from "@/lib/lead-engine/types";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const db = await getDatabase();
    const leadsCollection = db.collection("leads");
    const batchesCollection = db.collection("lead_batches");
    const sharesCollection = db.collection("lead_shares");

    // Total leads
    const totalLeads = await leadsCollection.countDocuments({});

    // Leads added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leadsThisMonth = await leadsCollection.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Batches stats
    const totalBatches = await batchesCollection.countDocuments({});
    const failedBatches = await batchesCollection.countDocuments({ status: "failed" });

    // Duplicates count from batches
    const duplicateAggregation = await batchesCollection
      .aggregate([{ $group: { _id: null, totalDups: { $sum: "$duplicateCount" } } }])
      .toArray();
    const duplicatesDetected = duplicateAggregation[0]?.totalDups || 0;

    // Shares stats
    const activeRestrictedShares = await sharesCollection.countDocuments({
      mode: "restricted",
      isRevoked: false,
    });

    const publicPublishedShares = await sharesCollection.countDocuments({
      mode: "public",
      isRevoked: false,
    });

    // Status breakdown
    const statusAgg = await leadsCollection
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .toArray();

    const statusBreakdown = {
      new: 0,
      reviewed: 0,
      contacted: 0,
      qualified: 0,
      archived: 0,
    };

    statusAgg.forEach((item: any) => {
      if (item._id && item._id in statusBreakdown) {
        statusBreakdown[item._id as keyof typeof statusBreakdown] = item.count;
      }
    });

    const analytics: ILeadAnalytics = {
      totalLeads,
      leadsThisMonth,
      totalBatches,
      failedBatches,
      duplicatesDetected,
      privateListsCount: Math.max(0, totalLeads - (activeRestrictedShares + publicPublishedShares)),
      activeRestrictedShares,
      publicPublishedShares,
      statusBreakdown,
    };

    return NextResponse.json({ analytics });
  } catch (err: any) {
    console.error("Fetch lead analytics error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to calculate analytics." },
      { status: 500 }
    );
  }
}
