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
            { suburb: { not: null } },
            { city: { not: null } },
            { propertyType: { not: null } },
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
    const preferenceSuburb = preference.suburb?.trim() ?? null;
    const preferenceCity = preference.city?.trim() ?? null;
    const preferencePropertyType = preference.propertyType?.toString().trim().toLowerCase() ?? null;

    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        paymentStatus: "PAID",
        paymentExpiresAt: { gte: now },
        isTaken: false,
        createdAt: includeExistingListings ? undefined : { gt: baseline },
        suburb: preferenceSuburb ? { contains: preferenceSuburb, mode: "insensitive" } : undefined,
        city: preferenceCity ? { contains: preferenceCity, mode: "insensitive" } : undefined,
      },
      select: {
        title: true,
        city: true,
        suburb: true,
        slug: true,
        propertyType: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const filteredListings = preferencePropertyType
      ? listings.filter((listing) => listing.propertyType.toString().trim().toLowerCase() === preferencePropertyType)
      : listings;

    if (debug) {
      console.info("[cron/recommendations] preference evaluated", {
        source,
        preferenceId: preference.id,
        userId: preference.userId,
        userEmail: preference.user.email,
        baseline: baseline.toISOString(),
        includeExistingListings,
        city: preference.city,
        suburb: preference.suburb,
        propertyType: preference.propertyType,
        matchedListings: filteredListings.length,
      });
    }

    if (filteredListings.length === 0) {
      continue;
    }

    matchedPreferences += 1;

    await sendListingRecommendationsEmail({
      to: preference.user.email,
      name: preference.user.name,
      filters: {
        suburb: preference.suburb,
        city: preference.city,
        type: preference.propertyType,
      },
      listings: filteredListings,
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