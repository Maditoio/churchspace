import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, churchName: true, denomination: true, phone: true, whatsapp: true, avatar: true, avatarThumb: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json();
  const { name, churchName, denomination, phone, whatsapp, avatar, avatarThumb } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(churchName !== undefined && { churchName: String(churchName).trim() || null }),
      ...(denomination !== undefined && { denomination: String(denomination).trim() || null }),
      ...(phone !== undefined && { phone: String(phone).trim() || null }),
      ...(whatsapp !== undefined && { whatsapp: String(whatsapp).trim() || null }),
      ...(avatar !== undefined && { avatar: String(avatar).trim() || null }),
      ...(avatarThumb !== undefined && { avatarThumb: String(avatarThumb).trim() || null }),
    },
    select: { id: true, name: true, churchName: true, denomination: true, phone: true, whatsapp: true, avatar: true, avatarThumb: true },
  });

  return NextResponse.json(updated);
}
