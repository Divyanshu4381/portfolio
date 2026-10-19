import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const messages = await db
      .collection("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      phone: m.phone || "",
      message: m.message,
      read: Boolean(m.read),
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ messages: formatted });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, read } = await req.json();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    const db = await getDatabase();
    await db
      .collection("messages")
      .updateOne({ _id: new ObjectId(id) }, { $set: { read: Boolean(read) } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating message status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection("messages").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
