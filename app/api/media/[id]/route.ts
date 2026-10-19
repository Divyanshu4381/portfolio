import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    const db = await getDatabase();
    const media = await db.collection("media").findOne({ _id: new ObjectId(id) });

    if (!media || !media.data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const buffer = Buffer.from(media.data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": media.contentType || "image/png",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving media:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
