import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

/**
 * Returns distinct values for filterable fields to populate filter dropdowns.
 * Only returns non-empty values, sorted alphabetically, capped at 200 per field.
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const db = await getDatabase();
    const leadsCol = db.collection("leads");

    const [categories, cities, states, countries, batches] = await Promise.all([
      leadsCol.distinct("category", { category: { $exists: true, $ne: "" } }),
      leadsCol.distinct("city", { city: { $exists: true, $ne: "" } }),
      leadsCol.distinct("state", { state: { $exists: true, $ne: "" } }),
      leadsCol.distinct("country", { country: { $exists: true, $ne: "" } }),
      db
        .collection("lead_batches")
        .find({}, { projection: { batchId: 1, fileName: 1, _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
    ]);

    // Sort and limit
    const sort = (arr: string[]) =>
      [...new Set(arr)]
        .filter((v) => v && v.trim().length > 0)
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 200);

    return NextResponse.json({
      categories: sort(categories as string[]),
      cities: sort(cities as string[]),
      states: sort(states as string[]),
      countries: sort(countries as string[]),
      batches: batches.map((b: any) => ({ batchId: b.batchId, fileName: b.fileName })),
    });
  } catch (err: any) {
    console.error("Fetch filter values error:", err);
    return NextResponse.json(
      { error: "Failed to fetch filter values." },
      { status: 500 }
    );
  }
}
