import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { getDatabase } from "@/lib/mongodb";
import { ADMIN_EMAIL } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const authorizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    if (normalizedEmail !== authorizedEmail) {
      return NextResponse.json(
        { error: "Access denied. Only the authorized administrator email is permitted." },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store in MongoDB
    const db = await getDatabase();
    const otpsCollection = db.collection("admin_otps");

    // Remove any previous OTPs for this email
    await otpsCollection.deleteMany({ email: normalizedEmail });

    // Insert new OTP
    await otpsCollection.insertOne({
      email: normalizedEmail,
      otp,
      expiresAt,
      createdAt: new Date(),
    });

    // Send email via Nodemailer
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { error: "Email service credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #f3f4f6; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #121212; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #15803d, #22c55e); padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Portfolio Admin Access</h1>
            <p style="color: #dcfce7; margin: 6px 0 0; font-size: 14px;">One-Time Verification Code</p>
          </div>
          
          <div style="padding: 30px 25px; text-align: center;">
            <p style="color: #9ca3af; font-size: 15px; margin: 0 0 20px;">
              A sign-in attempt was initiated for the Portfolio Admin Dashboard. Use the verification code below to complete your login:
            </p>

            <div style="background: #18181b; border: 2px dashed #22c55e; border-radius: 12px; padding: 18px 24px; margin: 25px 0; display: inline-block;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4ade80;">
                ${otp}
              </span>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 15px 0 0;">
              ⏳ This code will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.
            </p>
          </div>

          <div style="background: #0a0a0a; border-top: 1px solid #27272a; padding: 16px 20px; text-align: center;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">
              Security notification for Divyanshu Kushwaha Portfolio System • ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Divyanshu Portfolio Admin" <${emailUser}>`,
      to: normalizedEmail,
      subject: `🔑 Your Admin Login Code: ${otp}`,
      text: `Your Portfolio Admin login verification code is: ${otp}. It expires in 5 minutes.`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate or send OTP." },
      { status: 500 }
    );
  }
}
