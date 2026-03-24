import { ListingStatus } from "@prisma/client";
import { sendListingRecommendationsEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const MIN_RECOMMENDATION_INTERVAL_HOURS = 24;

type RunRecommendationsCronOptions = {
  ignoreInterval?: boolean;
  includeExistingListings?: boolean;
  debug?: boolean;
};

export async function runRecommendationsCron(
  source: "scheduled" | "manual-admin",
  options: RunRecommendationsCronOptions = {},
) {
  const { ignoreInterval = false, includeExistingListings = false, debug = false } = options;
  const now = new Date();
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
          OR: ignoreInterval
            ? undefined
            : [
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
  let matchedPreferences = 0;

  for (const preference of preferences) {
    const baseline = preference.lastRecommendationSentAt ?? preference.lastSearchedAt ?? new Date(0);

    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        paymentStatus: "PAID",
        paymentExpiresAt: { gte: now },
        isTaken: false,
        createdAt: includeExistingListings ? undefined : { gt: baseline },
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

    if (debug) {
      console.info("[cron/recommendations] preference evaluated", {
        source,
        preferenceId: preference.id,
        userId: preference.userId,
        userEmail: preference.user.email,
        baseline: baseline.toISOString(),
        includeExistingListings,
        query: preference.query,
        city: preference.city,
        suburb: preference.suburb,
        propertyType: preference.propertyType,
        listingType: preference.listingType,
        matchedListings: listings.length,
      });
    }

    if (listings.length === 0) {
      continue;
    }

    matchedPreferences += 1;

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
    source,
    ignoreInterval,
    includeExistingListings,
    debug,
    processed: preferences.length,
    matchedPreferences,
    emailsSent,
  });

  return { processed: preferences.length, matchedPreferences, emailsSent };
}