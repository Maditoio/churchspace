import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await params;
  const saved = await prisma.savedListing.upsert({
    where: { userId_listingId: { userId: session.user.id, listingId } },
    create: { userId: session.user.id, listingId },
    update: {},
  });

  return NextResponse.json({ saved }, { status: 201 });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await params;
  await prisma.savedListing.delete({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  return NextResponse.json({ success: true });
}
