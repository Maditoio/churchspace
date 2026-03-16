import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isOwner = listing.agentId === session.user.id;
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      isTaken: true,
      takenAt: new Date(),
      status: ListingStatus.INACTIVE,
      paymentStatus: "EXPIRED",
      paymentExpiresAt: null,
    },
  });

  return NextResponse.json({ listing: updated });
}
