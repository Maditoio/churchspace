import { NextRequest, NextResponse } from "next/server";
import { ListingStatus, ListingType, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") as PropertyType | null;
  const purpose = searchParams.get("purpose") as ListingType | null;
  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 999999999);
  const now = new Date();

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
      city: city ? { contains: city, mode: "insensitive" } : undefined,
      propertyType: type ?? undefined,
      listingType: purpose ? { has: purpose } : undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { suburb: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
      AND: [
        {
          OR: [
            { rentPricePerHour: { gte: minPrice, lte: maxPrice } },
            { rentPricePerDay: { gte: minPrice, lte: maxPrice } },
            { salePrice: { gte: minPrice, lte: maxPrice } },
          ],
        },
      ],
    },
    include: { images: true, agent: true },
    take: 40,
  });

  return NextResponse.json({ listings });
}
