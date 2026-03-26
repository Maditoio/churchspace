import type { MetadataRoute } from "next";
import { AFRICA_LOCATIONS } from "@/lib/locations";
import { slugify } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspaces.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/locations`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${siteUrl}/disputes`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${siteUrl}/user-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${siteUrl}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${siteUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const countryPages: MetadataRoute.Sitemap = Object.keys(AFRICA_LOCATIONS).map((country) => ({
    url: `${siteUrl}/locations/${slugify(country)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const cityPages: MetadataRoute.Sitemap = Object.entries(AFRICA_LOCATIONS).flatMap(([country, cities]) =>
    cities.map((city) => ({
      url: `${siteUrl}/locations/${slugify(country)}/${slugify(city)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  return [...staticPages, ...countryPages, ...cityPages];
}
