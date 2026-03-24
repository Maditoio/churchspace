import { createHmac, timingSafeEqual } from "node:crypto";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const LISTING_PAYMENT_AMOUNT_USD = 14.99;
export const LISTING_PAYMENT_CURRENCY = "USD";

type PaystackInitializeArgs = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
  currency?: string;
};

type PaystackVerificationData = {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string | null;
  metadata?: {
    listingId?: string;
    userId?: string;
  } | null;
};

function getAppBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    "http://localhost:3000";

  return configuredBaseUrl.replace(/\/$/, "");
}

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return secretKey;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const secretKey = getPaystackSecretKey();
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message ?? "Paystack request failed");
  }

  return payload.data as T;
}

export function getPaystackCallbackUrl() {
  return `${getAppBaseUrl()}/api/paystack/callback`;
}

export function getPaystackWebhookUrl() {
  return `${getAppBaseUrl()}/api/paystack/webhook`;
}

export async function initializePaystackTransaction(args: PaystackInitializeArgs) {
  return paystackRequest<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: args.email,
      amount: Math.round(args.amount * 100),
      reference: args.reference,
      callback_url: args.callbackUrl,
      currency: args.currency ?? LISTING_PAYMENT_CURRENCY,
      metadata: args.metadata,
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackVerificationData>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function isValidPaystackWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const digest = createHmac("sha512", getPaystackSecretKey()).update(rawBody).digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function finalizeListingPaymentFromPaystack(reference: string) {
  const transaction = await verifyPaystackTransaction(reference);
  if (transaction.status !== "success") {
    throw new Error(`Paystack transaction not successful: ${transaction.status}`);
  }

  const listingId = transaction.metadata?.listingId;
  const userId = transaction.metadata?.userId;
  if (!listingId || !userId) {
    throw new Error("Paystack transaction metadata is missing listingId or userId");
  }

  const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
  const expiresAt = addOneYear(paidAt);

  const [listing, payment] = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new Error("Listing not found for verified Paystack payment");
    }

    const nextStatus = listing.status === ListingStatus.INACTIVE ? ListingStatus.ACTIVE : listing.status;

    const nextListing = await tx.listing.update({
      where: { id: listingId },
      data: {
        paymentStatus: "PAID",
        paymentPaidAt: paidAt,
        paymentExpiresAt: expiresAt,
        isTaken: false,
        takenAt: null,
        status: nextStatus,
      },
    });

    const payment = await tx.listingPayment.upsert({
      where: { reference },
      update: {
        amount: transaction.amount / 100,
        currency: transaction.currency,
        status: "PAID",
        provider: "PAYSTACK",
        paidAt,
        expiresAt,
      },
      create: {
        listingId,
        userId,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        status: "PAID",
        provider: "PAYSTACK",
        reference,
        paidAt,
        expiresAt,
      },
    });

    return [nextListing, payment] as const;
  });

  return { listing, payment, transaction };
}

export function addOneYear(date: Date) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function isPaymentActive(args: { paymentStatus?: "UNPAID" | "PAID" | "EXPIRED"; paymentExpiresAt?: Date | null; isTaken?: boolean }) {
  if (args.isTaken) return false;
  if (args.paymentStatus !== "PAID") return false;
  if (!args.paymentExpiresAt) return false;
  return args.paymentExpiresAt >= new Date();
}
