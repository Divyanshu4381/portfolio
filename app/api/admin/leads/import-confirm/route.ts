import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { normalizeLeadRecord } from "@/lib/lead-engine/normalizer";
import { checkDuplicateInDb } from "@/lib/lead-engine/duplicateDetector";
import { ILead } from "@/lib/lead-engine/types";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { batchId, columnMapping, duplicateStrategy = "skip" } = body;

    if (!batchId || !columnMapping) {
      return NextResponse.json(
        { error: "batchId and columnMapping are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // 1. Fetch staging rows for this batch
    const staging = await db.collection("lead_staging").findOne({ batchId });
    if (!staging || !staging.rows || staging.rows.length === 0) {
      return NextResponse.json(
        { error: "Staging data not found or already processed. Please re-upload." },
        { status: 404 }
      );
    }

    const batchDoc = await db.collection("lead_batches").findOne({ batchId });
    const fileName = batchDoc?.fileName || "imported_file";

    const rawRows = staging.rows as Record<string, any>[];
    const leadsToInsert: ILead[] = [];

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;

    for (const rawRow of rawRows) {
      const normalized = normalizeLeadRecord(rawRow, columnMapping, fileName, batchId);

      // Check if lead has at least some useful identifier
      const hasContent =
        normalized.companyName ||
        normalized.contactPerson ||
        normalized.email ||
        normalized.phone;

      if (!hasContent) {
        skippedCount++;
        continue;
      }

      // Check for duplicate
      const dupCheck = await checkDuplicateInDb(
        db,
        normalized.email,
        normalized.phone,
        normalized.companyName
      );

      if (dupCheck.isDuplicate) {
        duplicateCount++;

        if (duplicateStrategy === "skip") {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === "update" && dupCheck.duplicateOf) {
          // Update existing lead record
          await db.collection("leads").updateOne(
            { leadId: dupCheck.duplicateOf },
            {
              $set: {
                ...normalized,
                updatedAt: new Date(),
              },
            }
          );
          updatedCount++;
          continue;
        }
      }

      // Prepare new lead
      const leadId = `LV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const leadRecord: ILead = {
        leadId,
        companyName: normalized.companyName,
        contactPerson: normalized.contactPerson,
        email: normalized.email,
        phone: normalized.phone,
        website: normalized.website,
        category: normalized.category,
        city: normalized.city,
        state: normalized.state,
        country: normalized.country,
        address: normalized.address,
        source: fileName,
        notes: normalized.notes,
        customFields: normalized.customFields,
        status: "new",
        batchId,
        listIds: [],
        isDuplicate: dupCheck.isDuplicate,
        duplicateOf: dupCheck.duplicateOf,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      leadsToInsert.push(leadRecord);
      insertedCount++;
    }

    // 2. Bulk insert new leads if any
    if (leadsToInsert.length > 0) {
      await db.collection("leads").insertMany(leadsToInsert as any);
    }

    // 3. Update batch status
    await db.collection("lead_batches").updateOne(
      { batchId },
      {
        $set: {
          status: "imported",
          extractedCount: insertedCount + updatedCount,
          duplicateCount,
          rejectedCount: skippedCount,
          columnMapping,
          updatedAt: new Date(),
        },
      }
    );

    // 4. Remove staging document
    await db.collection("lead_staging").deleteOne({ batchId });

    // 5. Log audit event
    await db.collection("lead_audit_logs").insertOne({
      action: "batch_imported",
      performedBy: admin.email,
      details: {
        batchId,
        fileName,
        insertedCount,
        updatedCount,
        skippedCount,
        duplicateCount,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      batchId,
      insertedCount,
      updatedCount,
      skippedCount,
      duplicateCount,
      totalProcessed: rawRows.length,
    });
  } catch (err: any) {
    console.error("Import confirmation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm and import leads." },
      { status: 500 }
    );
  }
}
