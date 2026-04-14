import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  finalizeListingPaymentViaPromotion,
  getListingPaymentAmount,
  getPaystackCallbackUrl,
  initializePaystackTransaction,
  LISTING_PAYMENT_CURRENCY,
} from "@/lib/payments";
import {
  hasActivePromotions,
  PromotionValidationError,
  releasePromotionUsageReservation,
  reservePromotionUsageForListing,
} from "@/lib/promotions";
import { checkSimpleRateLimit } from "@/lib/simple-rate-limit";

type PaymentRequestBody = {
  promotionCode?: string;
  skipPromotionEntry?: boolean;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PaymentRequestBody | null;
  const submittedPromotionCode = typeof body?.promotionCode === "string" ? body.promotionCode.trim() : "";
  const isPromotionAttempt = submittedPromotionCode.length > 0;
  const skipPromotionEntry = !!body?.skipPromotionEntry;

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

  if (isPromotionAttempt) {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimit = checkSimpleRateLimit({
      key: `promo:${session.user.id}:${id}:${forwardedFor}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many promotion attempts. Please wait a minute and try again." }, { status: 429 });
    }
  }

  const listingPaymentAmount = await getListingPaymentAmount();
  const hasPromotions = await hasActivePromotions();

  if (!isPromotionAttempt && hasPromotions && !skipPromotionEntry) {
    return NextResponse.json({
      requiresPromotion: true,
      redirectUrl: `/dashboard/listings/${listing.id}/promotion`,
      payment: {
        amount: listingPaymentAmount,
        currency: LISTING_PAYMENT_CURRENCY,
      },
    });
  }

  if (!isPromotionAttempt) {
    const reference = `PAYSTACK-${listing.id.slice(-6)}-${Date.now()}`;
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
        originalAmount: listingPaymentAmount,
        discountApplied: 0,
        finalAmount: listingPaymentAmount,
        currency: LISTING_PAYMENT_CURRENCY,
        reference: paymentSession.reference,
        simulated: false,
      },
    });
  }

  let reservation: Awaited<ReturnType<typeof reservePromotionUsageForListing>>;

  try {
    reservation = await reservePromotionUsageForListing({
      code: submittedPromotionCode,
      userId: session.user.id,
      listingId: listing.id,
      originalPrice: listingPaymentAmount,
    });
  } catch (error) {
    if (error instanceof PromotionValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }

  if (reservation.isFree) {
    const promoReference = `PROMO-${listing.id.slice(-6)}-${Date.now()}`;
    await finalizeListingPaymentViaPromotion({
      listingId: listing.id,
      userId: session.user.id,
      reference: promoReference,
      amount: 0,
      currency: LISTING_PAYMENT_CURRENCY,
      promotionUsageId: reservation.usage.id,
    });

    return NextResponse.json({
      freeApplied: true,
      payment: {
        amount: 0,
        originalAmount: reservation.originalPrice,
        discountApplied: reservation.discountApplied,
        finalAmount: reservation.finalPrice,
        currency: LISTING_PAYMENT_CURRENCY,
        reference: promoReference,
        simulated: false,
      },
      promotion: {
        id: reservation.usage.promotion.id,
        name: reservation.usage.promotion.name,
        type: reservation.usage.promotion.type,
      },
    });
  }

  try {
    const reference = `PAYSTACK-${listing.id.slice(-6)}-${Date.now()}`;
    const paymentSession = await initializePaystackTransaction({
      email: session.user.email,
      amount: reservation.finalPrice,
      reference,
      callbackUrl: getPaystackCallbackUrl(),
      currency: LISTING_PAYMENT_CURRENCY,
      metadata: {
        listingId: listing.id,
        userId: session.user.id,
        promotionUsageId: reservation.usage.id,
      },
    });

    return NextResponse.json({
      authorizationUrl: paymentSession.authorization_url,
      payment: {
        amount: reservation.finalPrice,
        originalAmount: reservation.originalPrice,
        discountApplied: reservation.discountApplied,
        finalAmount: reservation.finalPrice,
        currency: LISTING_PAYMENT_CURRENCY,
        reference: paymentSession.reference,
        simulated: false,
      },
      promotion: {
        id: reservation.usage.promotion.id,
        name: reservation.usage.promotion.name,
        type: reservation.usage.promotion.type,
      },
    });
  } catch (error) {
    await releasePromotionUsageReservation(reservation.usage.id);
    throw error;
  }
}
