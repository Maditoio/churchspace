import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { signUpSchema } from "@/lib/validations";

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

    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Could not create account right now." }, { status: 500 });
  }
}
