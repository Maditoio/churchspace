import { NextRequest, NextResponse } from "next/server";
import { finalizeListingPaymentFromPaystack, isValidPaystackWebhookSignature } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } };
  if (payload.event !== "charge.success" || !payload.data?.reference) {
    return NextResponse.json({ ok: true });
  }

  try {
    await finalizeListingPaymentFromPaystack(payload.data.reference);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[paystack/webhook] failed to finalize payment", {
      reference: payload.data.reference,
      error,
    });
    return NextResponse.json({ error: "Failed to finalize payment" }, { status: 500 });
  }
}