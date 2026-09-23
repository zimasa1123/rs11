import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "rs_nexus_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET || "rs-nexus-dev-secret-change-in-prod";
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  branchId: string | null;
  employeeId: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const jwt = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
  return jwt;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub as string;
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    if (!profile || !profile.active) return null;
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      branchId: profile.branchId,
      employeeId: profile.employeeId,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export const ROLES = [
  "super_admin",
  "ceo",
  "general_manager",
  "marketing",
  "sales",
  "sourcing",
  "procurement",
  "logistics",
  "finance",
  "hr",
  "employee",
  "read_only",
] as const;

export type Role = (typeof ROLES)[number];

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  ceo: 90,
  general_manager: 80,
  marketing: 50,
  sales: 50,
  sourcing: 50,
  procurement: 50,
  logistics: 50,
  finance: 50,
  hr: 50,
  employee: 30,
  read_only: 10,
};

export function hasRole(user: { role: string }, minRole: string): boolean {
  return (ROLE_HIERARCHY[user.role] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function canEdit(user: { role: string }): boolean {
  return user.role !== "read_only";
}

export function canManageUsers(user: { role: string }): boolean {
  return hasRole(user, "hr");
}

export function canAdmin(user: { role: string }): boolean {
  return user.role === "super_admin" || user.role === "ceo";
}
