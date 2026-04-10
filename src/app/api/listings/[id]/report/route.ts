import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendListingReportEmail } from "@/lib/email";

const ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? "hello@churchspaces.church";

const ALLOWED_REASONS = [
  "Incorrect information",
  "Spam or duplicate",
  "Offensive content",
  "Listing no longer available",
  "Other",
] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("reason" in body) ||
    typeof (body as Record<string, unknown>).reason !== "string" ||
    !ALLOWED_REASONS.includes(
      (body as Record<string, unknown>).reason as (typeof ALLOWED_REASONS)[number],
    )
  ) {
    return NextResponse.json({ error: "Invalid report reason" }, { status: 400 });
  }

  const { reason, details } = body as { reason: string; details?: string };

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://churchspaces.co.za";

  try {
    await sendListingReportEmail(
      ADMIN_EMAIL,
      { id: listing.id, title: listing.title, slug: listing.slug, siteUrl },
      { reason, details: details ?? "" },
    );
  } catch (err) {
    console.error("[report] failed to send report email:", err);
  }

  return NextResponse.json({ success: true });
}
