import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email.toLowerCase().trim()))
      .limit(1);
    if (!profile || !profile.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await verifyPassword(password, profile.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await createSession(profile.id);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, user: { id: profile.id, email: profile.email, role: profile.role } });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
