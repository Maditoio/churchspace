import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const errorRedirect = (code: string) =>
    NextResponse.redirect(new URL(`/verify-email?error=${code}`, origin));

  if (!token || !email) return errorRedirect("invalid");

  const normalizedEmail = email.toLowerCase();

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.identifier !== normalizedEmail) return errorRedirect("invalid");

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return errorRedirect("expired");
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return errorRedirect("invalid");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  // Send welcome email after successful verification (non-blocking)
  sendWelcomeEmail(user.email, user.name).catch(() => {
    console.warn("[verify-email] welcome email failed to send");
  });

  return NextResponse.redirect(new URL("/verify-email?success=true", origin));
}
