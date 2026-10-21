/**
 * Data normalization utilities for LeadVault
 */

export function normalizeEmail(email: any): string {
  if (!email || typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}

export function normalizePhone(phone: any): string {
  if (!phone) return "";
  const str = String(phone).trim();
  // Remove non-digit characters except leading plus
  const digits = str.replace(/[^\d+]/g, "");
  return digits.length >= 7 ? str : "";
}

export function normalizeWebsite(url: any): string {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim().toLowerCase();
  if (cleaned && !cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export function sanitizeString(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

/**
 * Normalizes a raw lead record mapped by the column mapping
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
    city: "",
    state: "",
    country: "",
    address: "",
    notes: "",
    source,
    batchId,
    customFields: {},
    status: "new",
  };

  for (const [rawKey, canonicalKey] of Object.entries(mapping)) {
    const rawVal = rawRow[rawKey];
    if (rawVal === undefined || rawVal === null) continue;

    if (canonicalKey === "email") {
      result.email = normalizeEmail(rawVal);
    } else if (canonicalKey === "phone") {
      result.phone = normalizePhone(rawVal);
    } else if (canonicalKey === "website") {
      result.website = normalizeWebsite(rawVal);
    } else if (
      [
        "companyName",
        "contactPerson",
        "category",
        "city",
        "state",
        "country",
        "address",
        "notes",
      ].includes(canonicalKey)
    ) {
      result[canonicalKey] = sanitizeString(rawVal);
    } else if (canonicalKey.startsWith("custom_")) {
      const customName = canonicalKey.replace(/^custom_/, "");
      result.customFields[customName] = rawVal;
    }
  }

  return result;
}
