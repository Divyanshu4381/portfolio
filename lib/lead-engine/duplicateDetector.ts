import { Db } from "mongodb";
import { ILead } from "./types";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOf?: string;
  matchField?: "email" | "phone" | "company";
}

/**
 * Checks a single candidate against the database.
 * Used for small imports or individual checks.
 */
export async function checkDuplicateInDb(
  db: Db,
  email: string,
  phone: string,
  companyName: string
): Promise<DuplicateCheckResult> {
  const collection = db.collection<ILead>("leads");

  // 1. Email match (strongest signal)
  if (email && email.trim()) {
    const existing = await collection.findOne(
      { email: email.trim().toLowerCase() },
      { projection: { leadId: 1, _id: 0 } }
    );
    if (existing) {
      return { isDuplicate: true, duplicateOf: existing.leadId, matchField: "email" };
    }
  }

  // 2. Phone match
  if (phone && phone.replace(/[^\d]/g, "").length >= 7) {
    const existing = await collection.findOne(
      { phone: phone.trim() },
      { projection: { leadId: 1, _id: 0 } }
    );
    if (existing) {
      return { isDuplicate: true, duplicateOf: existing.leadId, matchField: "phone" };
    }
  }

  // 3. Company name exact match (case-insensitive)
  if (companyName && companyName.trim().length >= 4) {
    const existing = await collection.findOne(
      { companyName: { $regex: new RegExp(`^${escapeRegex(companyName.trim())}$`, "i") } },
      { projection: { leadId: 1, _id: 0 } }
    );
    if (existing) {
      return { isDuplicate: true, duplicateOf: existing.leadId, matchField: "company" };
    }
  }

  return { isDuplicate: false };
}

/**
 * Batch duplicate detection — checks many candidates at once using
 * bulk DB lookups rather than N+1 individual queries.
 *
 * For each candidate it tries email → phone → company in priority order.
 * Returns a Map keyed by candidate index (0-based).
 */
export async function batchCheckDuplicates(
  db: Db,
  candidates: Array<{ email: string; phone: string; companyName: string }>
): Promise<Map<number, DuplicateCheckResult>> {
  const collection = db.collection<ILead>("leads");
  const results = new Map<number, DuplicateCheckResult>();

  // Initialize all as non-duplicate
  candidates.forEach((_, i) => results.set(i, { isDuplicate: false }));

  // ── Email batch lookup ────────────────────────────────────────────────────
  const emailsToCheck = candidates
    .map((c, i) => ({ i, email: c.email?.trim().toLowerCase() }))
    .filter((x) => x.email && x.email.length > 0);

  if (emailsToCheck.length > 0) {
    const emailValues = emailsToCheck.map((x) => x.email);
    const existingByEmail = await collection
      .find({ email: { $in: emailValues } }, { projection: { leadId: 1, email: 1, _id: 0 } })
      .toArray();

    const emailMap = new Map<string, string>();
    existingByEmail.forEach((doc) => {
      if (doc.email) emailMap.set(doc.email.toLowerCase(), doc.leadId);
    });

    emailsToCheck.forEach(({ i, email }) => {
      const existingLeadId = emailMap.get(email);
      if (existingLeadId) {
        results.set(i, { isDuplicate: true, duplicateOf: existingLeadId, matchField: "email" });
      }
    });
  }

  // ── Phone batch lookup (only for those not already matched by email) ─────
  const phonesToCheck = candidates
    .map((c, i) => ({ i, phone: c.phone?.trim() }))
    .filter((x) => !results.get(x.i)?.isDuplicate && x.phone && x.phone.replace(/\D/g, "").length >= 7);

  if (phonesToCheck.length > 0) {
    const phoneValues = phonesToCheck.map((x) => x.phone);
    const existingByPhone = await collection
      .find({ phone: { $in: phoneValues } }, { projection: { leadId: 1, phone: 1, _id: 0 } })
      .toArray();

    const phoneMap = new Map<string, string>();
    existingByPhone.forEach((doc) => {
      if (doc.phone) phoneMap.set(doc.phone.trim(), doc.leadId);
    });

    phonesToCheck.forEach(({ i, phone }) => {
      const existingLeadId = phoneMap.get(phone);
      if (existingLeadId) {
        results.set(i, { isDuplicate: true, duplicateOf: existingLeadId, matchField: "phone" });
      }
    });
  }

  // ── Company name lookup (only for those not already matched) ─────────────
  // Company matching uses individual queries because regex isn't easily bulk-queryable
  // We only check companies that have length >= 4 and aren't already matched
  const companiesToCheck = candidates
    .map((c, i) => ({ i, companyName: c.companyName?.trim() }))
    .filter(
      (x) =>
        !results.get(x.i)?.isDuplicate &&
        x.companyName &&
        x.companyName.length >= 4
    );

  // Batch company check using $or with case-insensitive regexes
  // Limit to avoid overly large $or queries
  if (companiesToCheck.length > 0 && companiesToCheck.length <= 200) {
    const orClauses = companiesToCheck.map((x) => ({
      companyName: { $regex: new RegExp(`^${escapeRegex(x.companyName)}$`, "i") },
    }));

    const existingByCompany = await collection
      .find({ $or: orClauses }, { projection: { leadId: 1, companyName: 1, _id: 0 } })
      .toArray();

    const companyMap = new Map<string, string>();
    existingByCompany.forEach((doc) => {
      if (doc.companyName) companyMap.set(doc.companyName.toLowerCase(), doc.leadId);
    });

    companiesToCheck.forEach(({ i, companyName }) => {
      const existingLeadId = companyMap.get(companyName.toLowerCase());
      if (existingLeadId) {
        results.set(i, { isDuplicate: true, duplicateOf: existingLeadId, matchField: "company" });
      }
    });
  } else if (companiesToCheck.length > 200) {
    // For very large sets, fall back to individual checks to avoid MongoDB $or limit issues
    for (const { i, companyName } of companiesToCheck) {
      const existing = await collection.findOne(
        { companyName: { $regex: new RegExp(`^${escapeRegex(companyName)}$`, "i") } },
        { projection: { leadId: 1, _id: 0 } }
      );
      if (existing) {
        results.set(i, { isDuplicate: true, duplicateOf: existing.leadId, matchField: "company" });
      }
    }
  }

  return results;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
