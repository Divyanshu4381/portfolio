import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { parseLeadFile } from "@/lib/lead-engine/fileParser";
import { inferColumnMapping } from "@/lib/lead-engine/columnMatcher";
import { normalizeLeadRecord } from "@/lib/lead-engine/normalizer";
import { checkDuplicateInDb } from "@/lib/lead-engine/duplicateDetector";
import { ILeadBatch } from "@/lib/lead-engine/types";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Strict admin authentication check
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "uploaded_leads_file";
    const fileSize = file.size;

    // 2. Parse file securely
    const parsed = await parseLeadFile(buffer, fileName);
    if (!parsed || parsed.rows.length === 0) {
      return NextResponse.json(
        { error: "No records found or extractable in this file." },
        { status: 400 }
      );
    }

    // 3. Infer column mappings
    const suggestedMapping = inferColumnMapping(parsed.headers);

    // 4. Check sample records for duplicates & preview
    const db = await getDatabase();
    const batchId = `BATCH-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    let duplicateEstimate = 0;
    const previewCount = Math.min(parsed.rows.length, 10);
    const sampleRows = parsed.rows.slice(0, previewCount);

    for (const row of sampleRows) {
      const normalized = normalizeLeadRecord(row, suggestedMapping, fileName, batchId);
      const dupCheck = await checkDuplicateInDb(
        db,
        normalized.email,
        normalized.phone,
        normalized.companyName
      );
      if (dupCheck.isDuplicate) {
        duplicateEstimate++;
      }
    }

    // 5. Store batch metadata in database
    const batchDoc: ILeadBatch = {
      batchId,
      fileName,
      fileSize,
      fileType: parsed.detectedType,
      status: "ready_for_review",
      totalDetected: parsed.totalRows,
      extractedCount: parsed.totalRows,
      duplicateCount: duplicateEstimate,
      rejectedCount: 0,
      detectedHeaders: parsed.headers,
      columnMapping: suggestedMapping,
      previewRows: sampleRows,
      uploadedBy: admin.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("lead_batches").insertOne(batchDoc);

    // Also cache raw rows temporarily in a staging collection for confirmation
    await db.collection("lead_staging").insertOne({
      batchId,
      rows: parsed.rows,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      batchId,
      fileName,
      fileSize,
      fileType: parsed.detectedType,
      totalRows: parsed.totalRows,
      headers: parsed.headers,
      suggestedMapping,
      sampleRows,
      duplicateEstimate,
    });
  } catch (err: any) {
    console.error("Lead upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process lead file." },
      { status: 500 }
    );
  }
}
