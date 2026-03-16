import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LISTING_PAYMENT_AMOUNT_USD, addOneYear } from "@/lib/payments";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const now = new Date();
  const expiresAt = addOneYear(now);
  const reference = `SIM-${listing.id.slice(-6)}-${Date.now()}`;

  const updated = await prisma.$transaction(async (tx) => {
    const nextStatus = listing.status === ListingStatus.INACTIVE ? ListingStatus.ACTIVE : listing.status;

    const nextListing = await tx.listing.update({
      where: { id: listing.id },
      data: {
        paymentStatus: "PAID",
        paymentPaidAt: now,
        paymentExpiresAt: expiresAt,
        isTaken: false,
        takenAt: null,
        status: nextStatus,
      },
    });

    await tx.listingPayment.create({
      data: {
        listingId: listing.id,
        userId: session.user.id,
        amount: LISTING_PAYMENT_AMOUNT_USD,
        currency: "USD",
        status: "PAID",
        provider: "SIMULATED",
        reference,
        paidAt: now,
        expiresAt,
      },
    });

    return nextListing;
  });

  return NextResponse.json({
    listing: updated,
    payment: {
      amount: LISTING_PAYMENT_AMOUNT_USD,
      currency: "USD",
      paidAt: now,
      expiresAt,
      reference,
      simulated: true,
    },
  });
}
