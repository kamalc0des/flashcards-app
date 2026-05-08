import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ALLOWED_EMAILS, sanitizeText, checkRateLimit, getIp } from "@/lib/security";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  // Rate limit: 5 attempts per 15 minutes per IP
  if (!checkRateLimit(getIp(req), 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const name = sanitizeText(parsed.data.name);

  if (!ALLOWED_EMAILS.includes(email)) {
    return NextResponse.json({ error: "emailTaken" }, { status: 409 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "emailTaken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
