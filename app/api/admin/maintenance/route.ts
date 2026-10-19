import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const settings = await db.collection("site_settings").findOne({ key: "maintenance" });

    return NextResponse.json({
      enabled: settings?.enabled ?? false,
      title: settings?.title || "Under Maintenance",
      message:
        settings?.message ||
        "I am currently updating my portfolio with exciting new features and projects. Please check back soon!",
      updatedAt: settings?.updatedAt || null,
      updatedBy: settings?.updatedBy || null,
    });
  } catch (error: any) {
    console.error("Error fetching maintenance settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { enabled, title, message } = body;

    const db = await getDatabase();
    await db.collection("site_settings").updateOne(
      { key: "maintenance" },
      {
        $set: {
          key: "maintenance",
          enabled: Boolean(enabled),
          title: title || "Under Maintenance",
          message:
            message ||
            "I am currently updating my portfolio with exciting new features and projects. Please check back soon!",
          updatedAt: new Date(),
          updatedBy: admin.email,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      enabled: Boolean(enabled),
      message: `Maintenance mode ${enabled ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error: any) {
    console.error("Error updating maintenance settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
