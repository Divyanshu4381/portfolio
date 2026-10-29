/**
 * Column Matcher — maps raw Excel/CSV headers to canonical lead fields.
 *
 * SAFETY RULES:
 * - Never map a field solely because its value "looks similar" to another.
 * - Email NEVER maps to website. Phone NEVER maps to email.
 * - If confidence is low (only a weak partial match), leave unmapped.
 * - Each canonical field can only be assigned once per import.
 */

export const CANONICAL_FIELDS: {
  key: string;
  label: string;
  /** Exact alias matches (normalized to lowercase, alphanumeric + spaces only) */
  aliases: string[];
  /** Additional substrings that STRONGLY suggest this field (used only when no alias matched) */
  strongSubstrings: string[];
}[] = [
  {
    key: "companyName",
    label: "Company / Business Name",
    aliases: [
      "company",
      "company name",
      "business",
      "business name",
      "firm",
      "firm name",
      "organization",
      "organization name",
      "org",
      "agency",
      "enterprise",
      "account",
      "client",
      "client name",
      "brand",
      "shop name",
      "store name",
    ],
    strongSubstrings: ["company", "business", "firm", "organization", "enterprise"],
  },
  {
    key: "contactPerson",
    label: "Contact Person Name",
    aliases: [
      "contact person",
      "contact name",
      "contact",
      "full name",
      "person",
      "owner name",
      "owner",
      "lead name",
      "representative",
      "rep",
      "decision maker",
      "point of contact",
      "poc",
    ],
    // "name" alone is intentionally NOT a strong substring — too ambiguous (could be company name)
    strongSubstrings: ["contact person", "contact name", "owner name", "poc"],
  },
  {
    key: "email",
    label: "Email Address",
    aliases: [
      "email",
      "e-mail",
      "email address",
      "contact email",
      "work email",
      "primary email",
      "business email",
      "mail id",
      "email id",
    ],
    strongSubstrings: ["email", "e-mail", "mail id"],
  },
  {
    key: "phone",
    label: "Phone Number",
    aliases: [
      "phone",
      "telephone",
      "tel",
      "mobile",
      "mobile number",
      "phone number",
      "contact no",
      "contact number",
      "cell",
      "cell phone",
      "cellphone",
      "whatsapp",
      "phone no",
      "mob no",
      "mob",
      "number",
      "contact",
    ],
    // "contact" alone is NOT here since contact is also used for contactPerson
    strongSubstrings: ["phone", "mobile", "telephone", "whatsapp", "cell"],
  },
  {
    key: "website",
    label: "Website URL",
    aliases: [
      "website",
      "web",
      "url",
      "site",
      "homepage",
      "domain",
      "web page",
      "company website",
      "website url",
      "web address",
    ],
    strongSubstrings: ["website", "domain", "url", "web url", "homepage"],
  },
  {
    key: "category",
    label: "Industry / Category",
    aliases: [
      "category",
      "industry",
      "business category",
      "business type",
      "sector",
      "niche",
      "vertical",
      "specialization",
      "profession",
      "field",
      "type of business",
    ],
    // "type" alone is intentionally NOT here — too ambiguous
    strongSubstrings: ["industry", "category", "sector", "niche", "business type"],
  },
  {
    key: "city",
    label: "City",
    aliases: ["city", "town", "locality", "district", "metro", "city name"],
    strongSubstrings: ["city", "town", "locality"],
  },
  {
    key: "state",
    label: "State / Province",
    aliases: ["state", "province", "region", "territory", "state name"],
    strongSubstrings: ["state", "province", "region"],
  },
  {
    key: "country",
    label: "Country",
    aliases: ["country", "nation", "country name", "country code"],
    strongSubstrings: ["country", "nation"],
  },
  {
    key: "address",
    label: "Full Address",
    aliases: [
      "address",
      "full address",
      "street",
      "street address",
      "office address",
      "postal address",
      "addr",
      "location",
    ],
    strongSubstrings: ["address", "street address", "postal"],
  },
  {
    key: "contactPerson", // will be deduplicated if already assigned
    label: "Contact Person Name",
    aliases: [],
    strongSubstrings: [],
  },
  {
    key: "notes",
    label: "Notes / Details",
    aliases: [
      "notes",
      "note",
      "description",
      "comments",
      "remarks",
      "info",
      "details",
      "additional info",
      "extra",
      "remark",
    ],
    strongSubstrings: ["notes", "remarks", "comments"],
  },
].filter((f, index, arr) =>
  // deduplicate by key (contactPerson appeared twice above — remove second entry)
  arr.findIndex((x) => x.key === f.key) === index
);

/**
 * Normalize a raw header string for matching:
 * lowercase, collapse whitespace, keep letters/digits/spaces only.
 */
function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Score a raw header against a canonical field.
 * Returns:
 *  3 = exact key match
 *  2 = exact alias match
 *  1 = strong substring match
 *  0 = no confident match
 *
 * Intentionally does NOT use general substring matching to avoid cross-field contamination.
 */
function scoreHeader(clean: string, field: (typeof CANONICAL_FIELDS)[0]): number {
  // Exact key match
  if (clean === field.key.toLowerCase()) return 3;

  // Exact alias match
  if (field.aliases.includes(clean)) return 2;

  // Strong substring: the clean header MUST contain one of the strongSubstrings
  // AND the strongSubstring must be multi-word OR > 4 chars to avoid spurious matches
  for (const sub of field.strongSubstrings) {
    if (sub.length > 4 && clean.includes(sub)) return 1;
    if (sub.includes(" ") && clean.includes(sub)) return 1;
  }

  return 0;
}

/**
 * Automatically infers canonical field mapping for raw column headers.
 *
 * Each canonical field is assigned at most once (first-come-first-served by score).
 * Columns that don't match confidently are left as custom_ fields.
 */
export function inferColumnMapping(rawHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedCanonical = new Set<string>();

  // Sort headers by score descending so high-confidence matches run first
  const scored: { raw: string; clean: string; fieldKey: string; score: number }[] = [];

  for (const raw of rawHeaders) {
    const clean = normalizeHeader(raw);
    let bestScore = 0;
    let bestKey = "";

    for (const field of CANONICAL_FIELDS) {
      if (usedCanonical.has(field.key)) continue;
      const s = scoreHeader(clean, field);
      if (s > bestScore) {
        bestScore = s;
        bestKey = field.key;
      }
    }

    scored.push({ raw, clean, fieldKey: bestKey, score: bestScore });
  }

  // Assign mappings in order of score (highest first) to avoid conflicts
  scored.sort((a, b) => b.score - a.score);

  for (const { raw, fieldKey, score } of scored) {
    if (score > 0 && !usedCanonical.has(fieldKey)) {
      mapping[raw] = fieldKey;
      usedCanonical.add(fieldKey);
    } else {
      // Leave unmapped but mark as custom so the admin sees it
      const safeKey = `custom_${raw.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
      mapping[raw] = safeKey;
    }
  }

  return mapping;
}

/**
 * Returns suggested mapping confidence labels for display in the UI.
 */
export function getMappingConfidence(rawHeader: string, canonicalKey: string): "high" | "medium" | "low" | "none" {
  const clean = normalizeHeader(rawHeader);
  const field = CANONICAL_FIELDS.find((f) => f.key === canonicalKey);
  if (!field) return "none";

  const score = scoreHeader(clean, field);
  if (score === 3) return "high";
  if (score === 2) return "high";
  if (score === 1) return "medium";
  return "none";
}
