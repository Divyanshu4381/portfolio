import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILead, LeadStatus, ContactStatus, ADMIN_WRITABLE_FIELDS } from "@/lib/lead-engine/types";

// ─── Allowed sort/filter fields ───────────────────────────────────────────────
const SORTABLE_FIELDS = new Set([
  "companyName", "email", "phone", "website", "category",
  "city", "state", "country", "status", "contactStatus",
  "followUpDate", "createdAt", "updatedAt",
]);

const VALID_LEAD_STATUSES = new Set<string>([
  "new", "not_contacted", "contacted", "follow_up",
  "interested", "not_interested", "qualified", "converted", "archived",
]);

const VALID_CONTACT_STATUSES = new Set<string>([
  "not_contacted", "contacted", "unreachable",
]);

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const isExport = searchParams.get("export") === "true";
    const requestedFields = searchParams.get("fields") || "";
    const maxLimit = isExport || requestedFields === "leadId" ? 10000 : 100;
    const limit = Math.max(1, Math.min(maxLimit, parseInt(searchParams.get("limit") || "25", 10)));
    const search = (searchParams.get("search") || "").trim();

    // Status filters — validated against allowlists
    const rawStatus = searchParams.get("status") || "";
    const status = VALID_LEAD_STATUSES.has(rawStatus) ? rawStatus as LeadStatus : null;

    const rawContactStatus = searchParams.get("contactStatus") || "";
    const contactStatus = VALID_CONTACT_STATUSES.has(rawContactStatus)
      ? rawContactStatus as ContactStatus
      : null;

    // Text filters — validated to prevent regex DoS (max 100 chars each)
    const category = (searchParams.get("category") || "").trim().slice(0, 100);
    const city = (searchParams.get("city") || "").trim().slice(0, 100);
    const state = (searchParams.get("state") || "").trim().slice(0, 100);
    const country = (searchParams.get("country") || "").trim().slice(0, 100);
    const batchId = (searchParams.get("batchId") || "").trim().slice(0, 100);

    // Availability filters
    const hasWebsite = searchParams.get("hasWebsite") || ""; // "yes" | "no" | ""
    const hasEmail = searchParams.get("hasEmail") || "";
    const hasPhone = searchParams.get("hasPhone") || "";

    // Date filters
    const dateField = searchParams.get("dateField") || "createdAt";
    const safeDateField = ["createdAt", "updatedAt", "followUpDate"].includes(dateField)
      ? dateField
      : "createdAt";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Sort — only allow known fields
    const rawSortBy = searchParams.get("sortBy") || "createdAt";
    const sortBy = SORTABLE_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const db = await getDatabase();
    const query: Record<string, any> = {};

    if (status) query.status = status;
    if (contactStatus) query.contactStatus = contactStatus;

    if (category) query.category = { $regex: new RegExp(escapeRegex(category), "i") };
    if (city) query.city = { $regex: new RegExp(escapeRegex(city), "i") };
    if (state) query.state = { $regex: new RegExp(escapeRegex(state), "i") };
    if (country) query.country = { $regex: new RegExp(escapeRegex(country), "i") };
    if (batchId) query.batchId = batchId;

    // Availability filters — check actual field, never another field as substitute
    if (hasWebsite === "yes") query.website = { $exists: true, $ne: "" };
    if (hasWebsite === "no") query.$or = [{ website: "" }, { website: { $exists: false } }];

    if (hasEmail === "yes") {
      // Merge with existing $or if any
      const emailCond = { email: { $exists: true, $ne: "" } };
      query.$and = [...(query.$and || []), emailCond];
    }
    if (hasEmail === "no") {
      const emailCond = { $or: [{ email: "" }, { email: { $exists: false } }] };
      query.$and = [...(query.$and || []), emailCond];
    }

    if (hasPhone === "yes") {
      const phoneCond = { phone: { $exists: true, $ne: "" } };
      query.$and = [...(query.$and || []), phoneCond];
    }
    if (hasPhone === "no") {
      const phoneCond = { $or: [{ phone: "" }, { phone: { $exists: false } }] };
      query.$and = [...(query.$and || []), phoneCond];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateQuery: Record<string, any> = {};
      if (dateFrom) dateQuery.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999); // inclusive end-of-day
        dateQuery.$lte = end;
      }
      query[safeDateField] = dateQuery;
    }

    // Full-text search across multiple fields
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const searchClause = {
        $or: [
          { companyName: regex },
          { contactPerson: regex },
          { email: regex },
          { phone: regex },
          { website: regex },
          { city: regex },
          { category: regex },
        ],
      };
      // Merge with existing $and if date filter is also active
      query.$and = [...(query.$and || []), searchClause];
    }

    const collection = db.collection<ILead>("leads");
    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const projection =
      requestedFields === "leadId"
        ? { leadId: 1, _id: 0 }
        : {
            internalNotes: 0,
            customFields: 0,
          };

    const leads = await collection
      .find(query, { projection })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      leads,
      leadIds: requestedFields === "leadId" ? leads.map((l: any) => l.leadId) : undefined,
      pagination: { total, page, limit, totalPages },
    });
  } catch (err: any) {
    console.error("Fetch leads error:", err);
    return NextResponse.json(
      { error: "Failed to fetch leads." },
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

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ error: "updates object is required" }, { status: 400 });
    }

    // SECURITY: Only permit explicitly allowed fields — prevent arbitrary field injection
    const allowedUpdates: Record<string, any> = {};
    for (const field of ADMIN_WRITABLE_FIELDS) {
      if (field in updates) {
        allowedUpdates[field] = updates[field];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("leads");

    const setPayload = {
      ...allowedUpdates,
      updatedBy: admin.email,
      updatedAt: new Date(),
    };

    if (leadId) {
      const res = await collection.updateOne(
        { leadId },
        { $set: setPayload }
      );

      // Audit log
      await db.collection("lead_audit_logs").insertOne({
        action: "lead_updated_by_admin",
        performedBy: admin.email,
        leadId,
        details: { fields: Object.keys(allowedUpdates) },
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, modifiedCount: res.modifiedCount });
    } else if (Array.isArray(leadIds) && leadIds.length > 0) {
      // Limit bulk updates to 500 at a time
      if (leadIds.length > 500) {
        return NextResponse.json(
          { error: "Bulk update limited to 500 records at a time" },
          { status: 400 }
        );
      }

      const res = await collection.updateMany(
        { leadId: { $in: leadIds } },
        { $set: setPayload }
      );

      await db.collection("lead_audit_logs").insertOne({
        action: "lead_updated_by_admin",
        performedBy: admin.email,
        details: { leadIds: leadIds.slice(0, 20), count: leadIds.length, fields: Object.keys(allowedUpdates) },
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, modifiedCount: res.modifiedCount });
    }

    return NextResponse.json({ error: "leadId or leadIds array is required" }, { status: 400 });
  } catch (err: any) {
    console.error("Update leads error:", err);
    return NextResponse.json(
      { error: "Failed to update lead(s)." },
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

    if (leadIds.length > 1000) {
      return NextResponse.json({ error: "Delete limited to 1000 records at a time" }, { status: 400 });
    }

    const db = await getDatabase();
    const res = await db.collection("leads").deleteMany({
      leadId: { $in: leadIds },
    });

    await db.collection("lead_audit_logs").insertOne({
      action: "leads_deleted",
      performedBy: admin.email,
      details: { leadIds: leadIds.slice(0, 20), count: leadIds.length },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, deletedCount: res.deletedCount });
  } catch (err: any) {
    console.error("Delete leads error:", err);
    return NextResponse.json(
      { error: "Failed to delete lead(s)." },
      { status: 500 }
    );
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
