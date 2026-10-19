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
    const mediaList = await db
      .collection("media")
      .find({}, { projection: { data: 0 } })
      .sort({ uploadedAt: -1 })
      .toArray();

    const formatted = mediaList.map((item) => ({
      id: item._id.toString(),
      filename: item.filename,
      contentType: item.contentType,
      size: item.size,
      uploadedAt: item.uploadedAt,
      url: `/api/media/${item._id.toString()}`,
    }));

    return NextResponse.json({ media: formatted });
  } catch (error: any) {
    console.error("Error fetching media list:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/x-icon",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, GIF, SVG, and ICO are allowed." },
        { status: 400 }
      );
    }

    // Limit to 8MB
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 8MB size limit. Please compress the image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const db = await getDatabase();
    const doc = {
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: base64Data,
      uploadedAt: new Date(),
      uploadedBy: admin.email,
    };

    const result = await db.collection("media").insertOne(doc);

    return NextResponse.json({
      success: true,
      media: {
        id: result.insertedId.toString(),
        filename: doc.filename,
        contentType: doc.contentType,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        url: `/api/media/${result.insertedId.toString()}`,
      },
    });
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
