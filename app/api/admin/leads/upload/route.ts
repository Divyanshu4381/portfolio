import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { parseLeadFile } from "@/lib/lead-engine/fileParser";
import { inferColumnMapping, getMappingConfidence } from "@/lib/lead-engine/columnMatcher";
import { normalizeLeadRecord } from "@/lib/lead-engine/normalizer";
import { batchCheckDuplicates } from "@/lib/lead-engine/duplicateDetector";
import { ILeadBatch } from "@/lib/lead-engine/types";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "uploaded_leads_file";
    const fileSize = file.size;

    // 2. Parse file
    const parsed = await parseLeadFile(buffer, fileName);
    if (!parsed || parsed.rows.length === 0) {
      return NextResponse.json(
        { error: "No records could be extracted from this file. Ensure it has structured rows with headers." },
        { status: 400 }
      );
    }

    // 3. Infer column mappings with the improved scorer
    const suggestedMapping = inferColumnMapping(parsed.headers);

    // Add confidence metadata for UI display
    const mappingWithConfidence: Record<string, { canonicalKey: string; confidence: string; sampleValues: string[] }> = {};
    for (const header of parsed.headers) {
      const canonicalKey = suggestedMapping[header] || "";
      const confidence = getMappingConfidence(header, canonicalKey);
      // Collect up to 3 non-empty sample values from first 20 rows
      const sampleValues = parsed.rows
        .slice(0, 20)
        .map((row: any) => (row[header] != null ? String(row[header]).trim() : ""))
        .filter((v: string) => v.length > 0)
        .slice(0, 3);

      mappingWithConfidence[header] = { canonicalKey, confidence, sampleValues };
    }

    // 4. Check sample records for duplicates & preview
    const db = await getDatabase();
    const batchId = `BATCH-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const previewCount = Math.min(parsed.rows.length, 10);
    const sampleRows = parsed.rows.slice(0, previewCount);

    // Use batch duplicate check even for the preview
    const normalizedSamples = sampleRows.map((row: any) =>
      normalizeLeadRecord(row, suggestedMapping, fileName, batchId)
    );

    const dupResults = await batchCheckDuplicates(
      db,
      normalizedSamples.map((n: any) => ({
        email: n.email,
        phone: n.phone,
        companyName: n.companyName,
      }))
    );

    let duplicateEstimate = 0;
    dupResults.forEach((r) => {
      if (r.isDuplicate) duplicateEstimate++;
    });

    // Annotate preview rows with duplicate status
    const annotatedPreview = sampleRows.map((row: any, i: number) => ({
      ...row,
      _isDuplicate: dupResults.get(i)?.isDuplicate || false,
      _duplicateOf: dupResults.get(i)?.duplicateOf || null,
      _matchField: dupResults.get(i)?.matchField || null,
    }));

    // 5. Store batch metadata
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

    // Store full raw rows in staging collection for the confirm step
    await db.collection("lead_staging").insertOne({
      batchId,
      rows: parsed.rows,
      createdAt: new Date(),
      // Staging docs auto-expire after 2 hours if not confirmed (set up TTL index)
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
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
      mappingWithConfidence,
      sampleRows: annotatedPreview,
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
