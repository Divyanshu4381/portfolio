export const CANONICAL_FIELDS: { key: string; label: string; aliases: string[] }[] = [
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
      "org",
      "agency",
      "enterprise",
      "account",
      "client",
      "title",
    ],
  },
  {
    key: "contactPerson",
    label: "Contact Person Name",
    aliases: [
      "name",
      "contact",
      "contact person",
      "contact name",
      "full name",
      "person",
      "owner",
      "lead name",
      "representative",
      "rep",
      "decision maker",
      "first name",
    ],
  },
  {
    key: "email",
    label: "Email Address",
    aliases: [
      "email",
      "e-mail",
      "mail",
      "email address",
      "contact email",
      "work email",
      "primary email",
      "inbox",
    ],
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
      "phone_number",
    ],
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
      "link",
    ],
  },
  {
    key: "category",
    label: "Industry / Category",
    aliases: [
      "category",
      "industry",
      "business category",
      "sector",
      "niche",
      "type",
      "vertical",
      "specialization",
      "profession",
    ],
  },
  {
    key: "city",
    label: "City",
    aliases: ["city", "town", "locality", "district", "metro"],
  },
  {
    key: "state",
    label: "State / Province",
    aliases: ["state", "province", "region", "territory", "pr"],
  },
  {
    key: "country",
    label: "Country",
    aliases: ["country", "nation", "country code", "geo"],
  },
  {
    key: "address",
    label: "Full Address",
    aliases: [
      "address",
      "full address",
      "street",
      "street address",
      "location",
      "office address",
      "postal address",
      "addr",
    ],
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
    ],
  },
];

/**
 * Automatically infers canonical field mapping for a raw column header
 */
export function inferColumnMapping(rawHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedCanonical = new Set<string>();

  for (const raw of rawHeaders) {
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, " ");

    let matchedField: string | null = null;

    // 1. Direct or alias match
    for (const item of CANONICAL_FIELDS) {
      if (usedCanonical.has(item.key)) continue;

      if (clean === item.key.toLowerCase() || item.aliases.includes(clean)) {
        matchedField = item.key;
        break;
      }
    }

    // 2. Partial substring match
    if (!matchedField) {
      for (const item of CANONICAL_FIELDS) {
        if (usedCanonical.has(item.key)) continue;

        for (const alias of item.aliases) {
          if (clean.includes(alias) || alias.includes(clean)) {
            matchedField = item.key;
            break;
          }
        }
        if (matchedField) break;
      }
    }

    if (matchedField) {
      mapping[raw] = matchedField;
      usedCanonical.add(matchedField);
    } else {
      // Keep as custom field
      mapping[raw] = `custom_${raw.trim().replace(/\s+/g, "_").toLowerCase()}`;
    }
  }

  return mapping;
}
