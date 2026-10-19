import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default_portfolio_secret_fallback_2026";
const encodedKey = new TextEncoder().encode(secretKey);

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "divyanshu4381@gmail.com";
export const ADMIN_COOKIE_NAME = "portfolio_admin_token";

export interface AdminSession {
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export async function createAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
