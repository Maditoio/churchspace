import { NextRequest, NextResponse } from "next/server";
import { finalizeListingPaymentFromPaystack } from "@/lib/payments";

function getRedirectBase(request: NextRequest) {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    request.nextUrl.origin;

  return configuredBaseUrl.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const redirectBase = getRedirectBase(request);
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${redirectBase}/dashboard/payments?payment=failed`);
  }

  try {
    await finalizeListingPaymentFromPaystack(reference);
    return NextResponse.redirect(`${redirectBase}/dashboard/payments?payment=success&reference=${encodeURIComponent(reference)}`);
  } catch (error) {
    console.error("[paystack/callback] failed to finalize payment", { reference, error });
    return NextResponse.redirect(`${redirectBase}/dashboard/payments?payment=failed&reference=${encodeURIComponent(reference)}`);
  }
}