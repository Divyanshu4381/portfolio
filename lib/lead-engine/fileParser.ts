import * as XLSX from "xlsx";
import mammoth from "mammoth";

export interface ParsedFileResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  detectedType: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
const ALLOWED_EXTENSIONS = ["csv", "xlsx", "xls", "pdf", "docx"];

export async function parseLeadFile(
  buffer: Buffer,
  fileName: string
): Promise<ParsedFileResult> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum allowed size of 15MB.");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file format ".${ext}". Supported: CSV, Excel (.xlsx, .xls), PDF, Word (.docx).`
    );
  }

  switch (ext) {
    case "csv":
    case "xlsx":
    case "xls":
      return parseSpreadsheet(buffer, ext);
    case "docx":
      return parseDocx(buffer);
    case "pdf":
      return parsePdf(buffer);
    default:
      throw new Error(`Parser not available for .${ext}`);
  }
}

/**
 * Parses Excel and CSV files via XLSX
 */
function parseSpreadsheet(buffer: Buffer, ext: string): ParsedFileResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Spreadsheet contains no sheets or data.");
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert worksheet to array of objects
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
      raw: false,
    });

    if (rawRows.length === 0) {
      throw new Error("Spreadsheet is empty or headers could not be found.");
    }

    // Extract headers from first row keys
    const headers = Object.keys(rawRows[0] || {}).filter(
      (h) => h && !h.startsWith("__EMPTY")
    );

    return {
      headers,
      rows: rawRows,
      totalRows: rawRows.length,
      detectedType: ext.toUpperCase(),
    };
  } catch (err: any) {
    throw new Error(`Failed to parse ${ext.toUpperCase()} spreadsheet: ${err.message}`);
  }
}

/**
 * Parses DOCX files extracting structured paragraphs and tables
 */
async function parseDocx(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    const { value: rawText } = await mammoth.extractRawText({ buffer });
    if (!rawText || !rawText.trim()) {
      throw new Error("Word document contains no extractable text.");
    }

    // Split by lines and clean empty lines
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const rows: Record<string, any>[] = [];

    // Check if DOCX is tab-separated or comma-separated table
    if (lines.length > 1 && (lines[0].includes("\t") || lines[0].includes(","))) {
      const delimiter = lines[0].includes("\t") ? "\t" : ",";
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ""));
        const row: Record<string, any> = {};
        headers.forEach((h, idx) => {
          row[h] = parts[idx] || "";
        });
        rows.push(row);
      }

      return {
        headers,
        rows,
        totalRows: rows.length,
        detectedType: "DOCX Table",
      };
    }

    // Otherwise, parse key-value lines (e.g. "Company: Acme Corp", "Email: john@acme.com")
    // or grouped lead blocks separated by blank lines / lead labels
    const extractedLeads: Record<string, string>[] = [];
    let currentLead: Record<string, string> = {};

    const keyRegex = /^(company|name|person|email|phone|mobile|website|url|city|state|address|notes|industry|category)\s*[:=-]\s*(.*)$/i;

    for (const line of lines) {
      const match = line.match(keyRegex);
      if (match) {
        const rawKey = match[1].toLowerCase();
        const rawVal = match[2].trim();

        if (currentLead[rawKey] && Object.keys(currentLead).length >= 2) {
          extractedLeads.push(currentLead);
          currentLead = {};
        }

        currentLead[rawKey] = rawVal;
      } else if (line.match(/^---+$|^===+$|^lead\s*#?\d+/i)) {
        if (Object.keys(currentLead).length > 0) {
          extractedLeads.push(currentLead);
          currentLead = {};
        }
      }
    }

    if (Object.keys(currentLead).length > 0) {
      extractedLeads.push(currentLead);
    }

    if (extractedLeads.length > 0) {
      const headerSet = new Set<string>();
      extractedLeads.forEach((l) => Object.keys(l).forEach((k) => headerSet.add(k)));
      return {
        headers: Array.from(headerSet),
        rows: extractedLeads,
        totalRows: extractedLeads.length,
        detectedType: "DOCX Key-Value",
      };
    }

    // Fallback: treat each line with email/phone as a lead row
    const fallbackRows: Record<string, any>[] = [];
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+?[0-9\s-]{8,15})/;

    lines.forEach((line, idx) => {
      const emailMatch = line.match(emailRegex);
      const phoneMatch = line.match(phoneRegex);
      if (emailMatch || phoneMatch) {
        fallbackRows.push({
          rawText: line,
          email: emailMatch ? emailMatch[1] : "",
          phone: phoneMatch ? phoneMatch[1] : "",
          entry: `Entry #${idx + 1}`,
        });
      }
    });

    return {
      headers: ["entry", "email", "phone", "rawText"],
      rows: fallbackRows,
      totalRows: fallbackRows.length,
      detectedType: "DOCX Extracted",
    };
  } catch (err: any) {
    throw new Error(`Failed to extract DOCX: ${err.message}`);
  }
}

/**
 * Parses PDF files extracting text blocks, tables, and structured contacts
 */
async function parsePdf(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    // Dynamic import/require to prevent bundling issues with Next.js/webpack
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require("pdf-parse");
    const pdfParse = typeof pdfParseModule === "function" ? pdfParseModule : pdfParseModule.default;
    const data = await pdfParse(buffer);
    const rawText: string = data && typeof data.text === "string" ? data.text : "";
    if (!rawText.trim()) {
      throw new Error("PDF contains no selectable text (scanned or protected).");
    }

    const lines: string[] = rawText
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+?[0-9\s-]{8,15})/;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/;

    const rows: Record<string, any>[] = [];
    let currentRecord: Record<string, any> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check key-value matches
      const kvMatch = line.match(
        /^(company|name|person|email|phone|mobile|website|url|city|state|address|notes|category)\s*[:=-]\s*(.*)$/i
      );

      if (kvMatch) {
        const k = kvMatch[1].toLowerCase();
        const v = kvMatch[2].trim();

        if (currentRecord[k] && Object.keys(currentRecord).length >= 2) {
          rows.push(currentRecord);
          currentRecord = {};
        }
        currentRecord[k] = v;
        continue;
      }

      // Check inline contacts
      const foundEmail = line.match(emailRegex);
      const foundPhone = line.match(phoneRegex);
      const foundUrl = line.match(urlRegex);

      if (foundEmail || foundPhone) {
        if (Object.keys(currentRecord).length >= 2) {
          rows.push(currentRecord);
          currentRecord = {};
        }

        currentRecord["company"] = currentRecord["company"] || line.split(/[,|\t]/)[0] || "";
        if (foundEmail) currentRecord["email"] = foundEmail[1];
        if (foundPhone) currentRecord["phone"] = foundPhone[1].trim();
        if (foundUrl) currentRecord["website"] = foundUrl[1];
      }
    }

    if (Object.keys(currentRecord).length > 0) {
      rows.push(currentRecord);
    }

    if (rows.length === 0) {
      // Fallback: create single raw entries
      lines.slice(0, 50).forEach((l, i) => {
        rows.push({
          row: `Line ${i + 1}`,
          content: l,
        });
      });
    }

    const headers = Array.from(
      new Set(rows.flatMap((r) => Object.keys(r)))
    );

    return {
      headers,
      rows,
      totalRows: rows.length,
      detectedType: "PDF Document",
    };
  } catch (err: any) {
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}
