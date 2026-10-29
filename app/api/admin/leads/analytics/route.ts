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
    const leadsCol = db.collection("leads");
    const batchesCol = db.collection("lead_batches");
    const sharesCol = db.collection("lead_shares");
    const requestsCol = db.collection("lead_update_requests");

    // Run all aggregations in parallel
    const [
      totalLeads,
      leadsThisMonth,
      totalBatches,
      failedBatches,
      duplicateAgg,
      activeShares,
      revokedShares,
      pendingRequestsCount,
      statusAgg,
      contactStatusAgg,
      hasWebsiteCount,
      hasEmailCount,
      hasPhoneCount,
    ] = await Promise.all([
      leadsCol.countDocuments({}),

      leadsCol.countDocuments({
        createdAt: { $gte: (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; })() },
      }),

      batchesCol.countDocuments({}),
      batchesCol.countDocuments({ status: "failed" }),

      batchesCol
        .aggregate([{ $group: { _id: null, totalDups: { $sum: "$duplicateCount" } } }])
        .toArray(),

      sharesCol.countDocuments({ isRevoked: false }),
      sharesCol.countDocuments({ isRevoked: true }),

      requestsCol.countDocuments({ status: "pending" }),

      leadsCol
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray(),

      leadsCol
        .aggregate([{ $group: { _id: "$contactStatus", count: { $sum: 1 } } }])
        .toArray(),

      // Has website: website field exists and is non-empty
      leadsCol.countDocuments({ website: { $exists: true, $ne: "" } }),
      // Has email
      leadsCol.countDocuments({ email: { $exists: true, $ne: "" } }),
      // Has phone
      leadsCol.countDocuments({ phone: { $exists: true, $ne: "" } }),
    ]);

    // Build status breakdown
    const statusBreakdown: Partial<Record<string, number>> = {};
    statusAgg.forEach((item: any) => {
      if (item._id) statusBreakdown[item._id] = item.count;
    });

    const contactStatusBreakdown: Partial<Record<string, number>> = {};
    contactStatusAgg.forEach((item: any) => {
      if (item._id) contactStatusBreakdown[item._id] = item.count;
    });

    const analytics: ILeadAnalytics = {
      totalLeads,
      leadsThisMonth,
      leadsWithWebsite: hasWebsiteCount,
      leadsWithoutWebsite: totalLeads - hasWebsiteCount,
      leadsWithEmail: hasEmailCount,
      leadsWithPhone: hasPhoneCount,
      contactedLeads: (contactStatusBreakdown["contacted"] as number) || 0,
      notContactedLeads: (contactStatusBreakdown["not_contacted"] as number) || 0,
      interestedLeads: (statusBreakdown["interested"] as number) || 0,
      followUpRequired: (statusBreakdown["follow_up"] as number) || 0,
      convertedLeads: (statusBreakdown["converted"] as number) || 0,
      totalBatches,
      failedBatches,
      duplicatesDetected: (duplicateAgg[0]?.totalDups as number) || 0,
      activeShares,
      revokedShares,
      pendingRequestsCount,
      statusBreakdown: statusBreakdown as any,
      contactStatusBreakdown: contactStatusBreakdown as any,
    };

    return NextResponse.json({ analytics });
  } catch (err: any) {
    console.error("Fetch lead analytics error:", err);
    return NextResponse.json(
      { error: "Failed to calculate analytics." },
      { status: 500 }
    );
  }
}
