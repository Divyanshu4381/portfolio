import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ISavedFilterView } from "@/lib/lead-engine/types";
import crypto from "crypto";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const views = await db
      .collection<ISavedFilterView>("lead_saved_views")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ views });
  } catch (err: any) {
    console.error("Fetch saved views error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch saved views" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description = "", filters } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "View name is required" }, { status: 400 });
    }

    if (!filters || typeof filters !== "object") {
      return NextResponse.json({ error: "Filters object is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const viewId = `VIEW-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const newView: ISavedFilterView = {
      viewId,
      name: name.trim(),
      description: String(description).trim(),
      filters,
      createdBy: admin.email || "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("lead_saved_views").insertOne(newView);

    return NextResponse.json({ success: true, view: newView }, { status: 201 });
  } catch (err: any) {
    console.error("Create saved view error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create saved view" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get("viewId");

    if (!viewId) {
      return NextResponse.json({ error: "viewId query param is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection("lead_saved_views").deleteOne({ viewId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Saved view not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Saved view deleted" });
  } catch (err: any) {
    console.error("Delete saved view error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete saved view" },
      { status: 500 }
    );
  }
}
