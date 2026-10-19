import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ADMIN_EMAIL, ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const authorizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const cleanedOtp = (otp || "").trim();

    if (normalizedEmail !== authorizedEmail) {
      return NextResponse.json(
        { error: "Access denied. Unauthorized administrator email." },
        { status: 403 }
      );
    }

    if (!cleanedOtp || cleanedOtp.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit OTP." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const otpsCollection = db.collection("admin_otps");

    const record = await otpsCollection.findOne({
      email: normalizedEmail,
      otp: cleanedOtp,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      await otpsCollection.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "This OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP verified, remove it
    await otpsCollection.deleteOne({ _id: record._id });

    // Generate JWT token
    const token = await createAdminToken(normalizedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful. Welcome, Admin!",
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
