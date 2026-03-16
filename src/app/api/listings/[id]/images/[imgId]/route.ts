import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imgId } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.agentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.listingImage.delete({ where: { id: imgId } });
  return NextResponse.json({ success: true });
}
