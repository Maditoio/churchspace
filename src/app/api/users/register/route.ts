import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";
import { signUpSchema } from "@/lib/validations";

const EMAIL_VERIFICATION_TTL_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please complete all required fields correctly.", details: parsed.error.flatten() }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const password = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...parsed.data,
        password,
        role: "USER",
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: user.email, token, expires },
    });

    await sendEmailVerificationEmail({ to: user.email, name: user.name, token, email: user.email });

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Could not create account right now." }, { status: 500 });
  }
}
