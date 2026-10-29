/**
 * Data normalization utilities for LeadVault.
 *
 * CRITICAL: Each normalization function only processes its own data type.
 * An email value is NEVER placed into the website field, and vice versa.
 * Missing values result in empty strings — never fallback to another field.
 */

import { ContactStatus, LeadStatus } from "./types";

// ─── Field Validators ─────────────────────────────────────────────────────────

/** Returns a valid, normalized email or empty string. Never a URL or phone. */
export function normalizeEmail(email: any): string {
  if (!email || typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase();
  // Strict RFC-like check: must have exactly one @, with non-empty parts on both sides,
  // and a valid TLD-like suffix.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(cleaned)) return "";
  // Reject values that look like URLs (some cells have "http" in them)
  if (cleaned.startsWith("http") || cleaned.startsWith("www.")) return "";
  return cleaned;
}

/** Returns a normalized phone string or empty string. Never an email or URL. */
export function normalizePhone(phone: any): string {
  if (phone === null || phone === undefined) return "";
  const str = String(phone).trim();
  if (!str) return "";
  // If the value looks like an email, reject it
  if (str.includes("@")) return "";
  // If the value looks like a URL, reject it
  if (str.startsWith("http") || str.startsWith("www.")) return "";
  // Must contain at least 7 digit characters
  const digitCount = (str.match(/\d/g) || []).length;
  if (digitCount < 7) return "";
  // Preserve original formatting (country codes, spaces, dashes) — only strip
  // characters that are clearly not part of a phone number
  return str.replace(/[^\d\s+\-().ext]/gi, "").trim();
}

/**
 * Returns a normalized website URL or empty string.
 * NEVER accepts email addresses or phone numbers as URLs.
 */
export function normalizeWebsite(url: any): string {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim().toLowerCase();

  // Reject emails masquerading as websites
  if (cleaned.includes("@")) return "";
  // Reject phone numbers
  const digitOnly = cleaned.replace(/\D/g, "");
  if (digitOnly.length >= 7 && cleaned.replace(/[\d\s+\-().]/g, "").length < 3) return "";
  // Must look like a domain or URL
  const hasProtocol = cleaned.startsWith("http://") || cleaned.startsWith("https://");
  const hasDomainPattern = /^(https?:\/\/)?([\w-]+\.)+[\w]{2,}/.test(cleaned);
  if (!hasDomainPattern) return "";

  if (!hasProtocol) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/** Sanitizes a plain text string — trims whitespace, prevents rendering as HTML. */
export function sanitizeString(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .slice(0, 2000); // cap at 2000 chars
}

/**
 * Sanitize a value for CSV export.
 * Prevents formula injection by prefixing dangerous leading characters with a tab.
 */
export function sanitizeForCsv(val: any): string {
  const str = String(val ?? "");
  // Excel/Sheets formula injection: cells starting with =, +, -, @, TAB, CR
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`; // prefix with single quote to neutralize
  }
  return str;
}

/** Validates a ContactStatus value */
export function normalizeContactStatus(val: any): ContactStatus {
  const valid: ContactStatus[] = ["not_contacted", "contacted", "unreachable"];
  if (valid.includes(val)) return val as ContactStatus;
  return "not_contacted";
}

/** Validates a LeadStatus value */
export function normalizeLeadStatus(val: any): LeadStatus {
  const valid: LeadStatus[] = [
    "new", "not_contacted", "contacted", "follow_up",
    "interested", "not_interested", "qualified", "converted", "archived",
  ];
  if (valid.includes(val)) return val as LeadStatus;
  return "new";
}

// ─── Record Normalization ──────────────────────────────────────────────────────

/**
 * Normalizes a raw lead record using the confirmed column mapping.
 *
 * Each field receives ONLY its own typed value.
 * If the source cell for a field does not validate as that field's type,
 * the field is left empty — the value is NOT moved to another field.
 */
export function normalizeLeadRecord(
  rawRow: Record<string, any>,
  mapping: Record<string, string>,
  source: string,
  batchId: string
): Record<string, any> {
  const result: Record<string, any> = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    businessDescription: "",
    city: "",
    state: "",
    country: "",
    address: "",
    notes: "",
    internalNotes: "",
    source,
    batchId,
    customFields: {} as Record<string, any>,
    contactStatus: "not_contacted",
    status: "new",
    followUpDate: null,
  };

  for (const [rawKey, canonicalKey] of Object.entries(mapping)) {
    const rawVal = rawRow[rawKey];
    if (rawVal === undefined || rawVal === null || rawVal === "") continue;

    switch (canonicalKey) {
      case "email":
        result.email = normalizeEmail(rawVal);
        break;
      case "phone":
        result.phone = normalizePhone(rawVal);
        break;
      case "website":
        result.website = normalizeWebsite(rawVal);
        break;
      case "companyName":
      case "contactPerson":
      case "category":
      case "businessDescription":
      case "city":
      case "state":
      case "country":
      case "address":
      case "notes":
      case "internalNotes":
        result[canonicalKey] = sanitizeString(rawVal);
        break;
      default:
        if (canonicalKey.startsWith("custom_")) {
          const customName = canonicalKey.replace(/^custom_/, "");
          result.customFields[customName] = sanitizeString(rawVal);
        }
        break;
    }
  }

  return result;
}
