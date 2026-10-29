import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { normalizeLeadRecord } from "@/lib/lead-engine/normalizer";
import { batchCheckDuplicates } from "@/lib/lead-engine/duplicateDetector";
import { ILead } from "@/lib/lead-engine/types";
import crypto from "crypto";

const BATCH_SIZE = 100; // Process in batches of 100

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

    // Validate duplicateStrategy
    if (!["skip", "update", "import_all"].includes(duplicateStrategy)) {
      return NextResponse.json({ error: "Invalid duplicateStrategy" }, { status: 400 });
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

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const errorReasons: Array<{ row: number; reason: string }> = [];

    // Process in batches to avoid large memory allocations and timeouts
    for (let batchStart = 0; batchStart < rawRows.length; batchStart += BATCH_SIZE) {
      const batchRows = rawRows.slice(batchStart, batchStart + BATCH_SIZE);
      const normalizedBatch: Array<{
        idx: number;
        normalized: Record<string, any>;
        valid: boolean;
      }> = [];

      // Normalize all rows in this batch
      for (let i = 0; i < batchRows.length; i++) {
        const rawRow = batchRows[i];
        const globalIdx = batchStart + i + 1; // 1-indexed for error reporting

        const normalized = normalizeLeadRecord(rawRow, columnMapping, fileName, batchId);

        const hasContent =
          normalized.companyName ||
          normalized.contactPerson ||
          normalized.email ||
          normalized.phone;

        if (!hasContent) {
          invalidCount++;
          skippedCount++;
          errorReasons.push({ row: globalIdx, reason: "Empty row — no usable content" });
          continue;
        }

        normalizedBatch.push({ idx: globalIdx, normalized, valid: true });
      }

      if (normalizedBatch.length === 0) continue;

      // Batch duplicate check (3 bulk queries instead of N*3 individual queries)
      const dupResults = await batchCheckDuplicates(
        db,
        normalizedBatch.map((n) => ({
          email: n.normalized.email,
          phone: n.normalized.phone,
          companyName: n.normalized.companyName,
        }))
      );

      const leadsToInsert: ILead[] = [];
      const leadsToUpdate: Array<{ leadId: string; normalized: Record<string, any> }> = [];

      for (let i = 0; i < normalizedBatch.length; i++) {
        const { idx, normalized } = normalizedBatch[i];
        const dupResult = dupResults.get(i) || { isDuplicate: false };

        if (dupResult.isDuplicate) {
          duplicateCount++;

          if (duplicateStrategy === "skip") {
            skippedCount++;
            errorReasons.push({
              row: idx,
              reason: `Duplicate — matches existing record by ${dupResult.matchField}`,
            });
            continue;
          } else if (duplicateStrategy === "update" && dupResult.duplicateOf) {
            leadsToUpdate.push({ leadId: dupResult.duplicateOf, normalized });
            updatedCount++;
            continue;
          }
          // import_all falls through to insert
        }

        const leadId = `LV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const leadRecord: ILead = {
          leadId,
          companyName: normalized.companyName,
          contactPerson: normalized.contactPerson,
          email: normalized.email,
          phone: normalized.phone,
          website: normalized.website,
          category: normalized.category,
          businessDescription: normalized.businessDescription || "",
          city: normalized.city,
          state: normalized.state,
          country: normalized.country,
          address: normalized.address,
          source: fileName,
          notes: normalized.notes,
          internalNotes: normalized.internalNotes || "",
          customFields: normalized.customFields,
          contactStatus: "not_contacted",
          status: "new",
          followUpDate: null,
          batchId,
          listIds: [],
          isDuplicate: dupResult.isDuplicate,
          duplicateOf: dupResult.duplicateOf,
          createdBy: admin.email,
          updatedBy: admin.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        leadsToInsert.push(leadRecord);
        insertedCount++;
      }

      // Bulk insert
      if (leadsToInsert.length > 0) {
        await db.collection("leads").insertMany(leadsToInsert as any);
      }

      // Bulk updates (still individual per record since we need specific leadIds)
      if (leadsToUpdate.length > 0) {
        const bulkOps = leadsToUpdate.map(({ leadId, normalized }) => ({
          updateOne: {
            filter: { leadId },
            update: {
              $set: {
                companyName: normalized.companyName,
                contactPerson: normalized.contactPerson,
                email: normalized.email,
                phone: normalized.phone,
                website: normalized.website,
                category: normalized.category,
                businessDescription: normalized.businessDescription || "",
                city: normalized.city,
                state: normalized.state,
                country: normalized.country,
                address: normalized.address,
                notes: normalized.notes,
                updatedBy: admin.email,
                updatedAt: new Date(),
              },
            },
          },
        }));
        await db.collection("leads").bulkWrite(bulkOps);
      }
    }

    // Update batch status
    await db.collection("lead_batches").updateOne(
      { batchId },
      {
        $set: {
          status: "imported",
          extractedCount: insertedCount + updatedCount,
          duplicateCount,
          rejectedCount: skippedCount,
          skippedCount,
          columnMapping,
          updatedAt: new Date(),
        },
      }
    );

    // Remove staging document
    await db.collection("lead_staging").deleteOne({ batchId });

    // Audit log
    await db.collection("lead_audit_logs").insertOne({
      action: "batch_imported",
      performedBy: admin.email,
      batchId,
      details: {
        fileName,
        insertedCount,
        updatedCount,
        skippedCount,
        duplicateCount,
        invalidCount,
        totalProcessed: rawRows.length,
        duplicateStrategy,
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
      invalidCount,
      totalProcessed: rawRows.length,
      // Only return first 50 error reasons — full list available in audit logs
      errorSummary: errorReasons.slice(0, 50),
      hasMoreErrors: errorReasons.length > 50,
    });
  } catch (err: any) {
    console.error("Import confirmation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm and import leads." },
      { status: 500 }
    );
  }
}
