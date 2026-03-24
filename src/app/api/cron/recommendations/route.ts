import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendListingRecommendationsEmail } from "@/lib/email";

const MIN_RECOMMENDATION_INTERVAL_HOURS = 24;

function getAuthorizationResult(request: NextRequest) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  if (isVercelCron) {
    return { ok: true as const };
  }
  

  return { ok: false as const, reason: "missing-cron-invalid-cron-source"};
}

export async function GET(request: NextRequest) {
  // Log invocation before auth so scheduler hits are always visible in logs.
  console.info("[cron/recommendations] invoked", {
    at: new Date().toISOString(),
    hasAuthorization: Boolean(request.headers.get("authorization")),
    hasXCronSecret: Boolean(request.headers.get("x-cron-secret")),
    userAgent: request.headers.get("user-agent") ?? "",
  });

  const auth = getAuthorizationResult(request);
  if (!auth.ok) {
    console.warn("[cron/recommendations] unauthorized request", {
      reason: auth.reason,
      hasAuthorization: Boolean(request.headers.get("authorization")),
      hasXCronSecret: Boolean(request.headers.get("x-cron-secret")),
      userAgent: request.headers.get("user-agent") ?? "",
    });
    if (auth.reason === "missing-cron-secret") {
      return NextResponse.json({ error: "Misconfigured: CRON_SECRET missing" }, { status: 500 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  console.info("[cron/recommendations] heartbeat", {
    at: now.toISOString(),
  });

  console.info("[cron/recommendations] run started", {
    hasAuthorization: Boolean(request.headers.get("authorization")),
    userAgent: request.headers.get("user-agent") ?? "",
  });

  const minLastSentAt = new Date(now.getTime() - MIN_RECOMMENDATION_INTERVAL_HOURS * 60 * 60 * 1000);

  const preferences = await prisma.userSearchPreference.findMany({
    where: {
      user: {
        isActive: true,
      },
      AND: [
        {
          OR: [
            { query: { not: null } },
            { suburb: { not: null } },
            { city: { not: null } },
            { propertyType: { not: null } },
            { listingType: { not: null } },
          ],
        },
        {
          OR: [
            { lastRecommendationSentAt: null },
            { lastRecommendationSentAt: { lt: minLastSentAt } },
          ],
        },
      ],
    },
    include: {
      user: true,
    },
    take: 150,
    orderBy: { lastSearchedAt: "desc" },
  });

  let emailsSent = 0;

  for (const preference of preferences) {
    const baseline = preference.lastRecommendationSentAt ?? preference.lastSearchedAt ?? new Date(0);

    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        paymentStatus: "PAID",
        paymentExpiresAt: { gte: now },
        isTaken: false,
        createdAt: { gt: baseline },
        suburb: preference.suburb ? { contains: preference.suburb, mode: "insensitive" } : undefined,
        city: preference.city ? { contains: preference.city, mode: "insensitive" } : undefined,
        propertyType: preference.propertyType ?? undefined,
        listingType: preference.listingType ? { has: preference.listingType } : undefined,
        OR: preference.query
          ? [
              { title: { contains: preference.query, mode: "insensitive" } },
              { description: { contains: preference.query, mode: "insensitive" } },
              { suburb: { contains: preference.query, mode: "insensitive" } },
              { city: { contains: preference.query, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: {
        title: true,
        city: true,
        suburb: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    if (listings.length === 0) {
      continue;
    }

    await sendListingRecommendationsEmail({
      to: preference.user.email,
      name: preference.user.name,
      filters: {
        suburb: preference.suburb,
        city: preference.city,
        query: preference.query,
        type: preference.propertyType,
        purpose: preference.listingType,
      },
      listings,
    });

    emailsSent += 1;

    await prisma.userSearchPreference.update({
      where: { id: preference.id },
      data: {
        lastRecommendationSentAt: now,
      },
    });
  }

  console.info("[cron/recommendations] run finished", {
    at: new Date().toISOString(),
    processed: preferences.length,
    emailsSent,
  });

  return NextResponse.json({ ok: true, processed: preferences.length, emailsSent });
}
