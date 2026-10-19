import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    const isAdmin = Boolean(admin);

    const db = await getDatabase();
    const settings = await db.collection("site_settings").findOne({ key: "maintenance" });

    const enabled = settings?.enabled ?? false;

    return NextResponse.json({
      enabled,
      isAdmin,
      title: settings?.title || "Under Maintenance",
      message:
        settings?.message ||
        "I am currently updating my portfolio with exciting new features and projects. Please check back soon!",
    });
  } catch (error: any) {
    console.error("Error reading public maintenance status:", error);
    return NextResponse.json(
      { enabled: false, isAdmin: false, error: error.message },
      { status: 200 }
    );
  }
}
