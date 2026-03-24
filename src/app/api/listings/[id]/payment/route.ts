import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getListingPaymentAmount,
  getPaystackCallbackUrl,
  initializePaystackTransaction,
  LISTING_PAYMENT_CURRENCY,
} from "@/lib/payments";

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

  if (!session.user.email) {
    return NextResponse.json({ error: "A verified email is required to pay for a listing" }, { status: 400 });
  }

  const reference = `PAYSTACK-${listing.id.slice(-6)}-${Date.now()}`;
  const listingPaymentAmount = await getListingPaymentAmount();
  const paymentSession = await initializePaystackTransaction({
    email: session.user.email,
    amount: listingPaymentAmount,
    reference,
    callbackUrl: getPaystackCallbackUrl(),
    currency: LISTING_PAYMENT_CURRENCY,
    metadata: {
      listingId: listing.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    authorizationUrl: paymentSession.authorization_url,
    payment: {
      amount: listingPaymentAmount,
      currency: LISTING_PAYMENT_CURRENCY,
      reference: paymentSession.reference,
      simulated: false,
    },
  });
}
