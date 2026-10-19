import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db
      .collection("media")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
