import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILead, LeadStatus } from "@/lib/lead-engine/types";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as LeadStatus | null;
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";
    const batchId = searchParams.get("batchId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const db = await getDatabase();
    const query: Record<string, any> = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = { $regex: new RegExp(category, "i") };
    }

    if (city) {
      query.city = { $regex: new RegExp(city, "i") };
    }

    if (state) {
      query.state = { $regex: new RegExp(state, "i") };
    }

    if (batchId) {
      query.batchId = batchId;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { companyName: regex },
        { contactPerson: regex },
        { email: regex },
        { phone: regex },
        { website: regex },
        { city: regex },
        { category: regex },
        { notes: regex },
      ];
    }

    const collection = db.collection<ILead>("leads");
    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const leads = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error("Fetch leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch leads." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, leadIds, updates } = body;

    const db = await getDatabase();
    const collection = db.collection("leads");

    if (leadId) {
      // Single lead update
      const res = await collection.updateOne(
        { leadId },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json({ success: true, modifiedCount: res.modifiedCount });
    } else if (Array.isArray(leadIds) && leadIds.length > 0) {
      // Bulk update
      const res = await collection.updateMany(
        { leadId: { $in: leadIds } },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json({ success: true, modifiedCount: res.modifiedCount });
    }

    return NextResponse.json({ error: "leadId or leadIds array is required" }, { status: 400 });
  } catch (err: any) {
    console.error("Update leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lead(s)." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    let leadIds: string[] = [];
    if (leadId) {
      leadIds = [leadId];
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.leadIds)) {
        leadIds = body.leadIds;
      }
    }

    if (leadIds.length === 0) {
      return NextResponse.json({ error: "No leadId provided" }, { status: 400 });
    }

    const db = await getDatabase();
    const res = await db.collection("leads").deleteMany({
      leadId: { $in: leadIds },
    });

    return NextResponse.json({ success: true, deletedCount: res.deletedCount });
  } catch (err: any) {
    console.error("Delete leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete lead(s)." },
      { status: 500 }
    );
  }
}
