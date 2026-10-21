import { Db } from "mongodb";
import { ILead } from "./types";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOf?: string;
  matchField?: "email" | "phone" | "company";
}

/**
 * Checks if a candidate lead matches any existing lead in the database
 */
export async function checkDuplicateInDb(
  db: Db,
  email: string,
  phone: string,
  companyName: string
): Promise<DuplicateCheckResult> {
  const collection = db.collection<ILead>("leads");

  // 1. Primary check: Email match (strongest signal)
  if (email && email.trim()) {
    const existing = await collection.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      return {
        isDuplicate: true,
        duplicateOf: existing.leadId,
        matchField: "email",
      };
    }
  }

  // 2. Secondary check: Phone match
  if (phone && phone.replace(/[^\d]/g, "").length >= 7) {
    const cleanPhone = phone.trim();
    const existing = await collection.findOne({
      phone: cleanPhone,
    });
    if (existing) {
      return {
        isDuplicate: true,
        duplicateOf: existing.leadId,
        matchField: "phone",
      };
    }
  }

  // 3. Tertiary check: Company Name exact match
  if (companyName && companyName.trim().length >= 4) {
    const existing = await collection.findOne({
      companyName: { $regex: new RegExp(`^${companyName.trim()}$`, "i") },
    });
    if (existing) {
      return {
        isDuplicate: true,
        duplicateOf: existing.leadId,
        matchField: "company",
      };
    }
  }

  return { isDuplicate: false };
}
