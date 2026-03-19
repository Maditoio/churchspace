import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { sendListingStatusEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const now = new Date();

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
    },
    include: { images: true, agent: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const nextCursor = listings.length === 12 ? listings[listings.length - 1]?.id : null;
  return NextResponse.json({ listings, nextCursor });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slugBase = slugify(parsed.data.title);
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

  const { images, ...listingData } = parsed.data;

  const created = await prisma.listing.create({
    data: {
      ...listingData,
      slug,
      status: ListingStatus.PENDING_REVIEW,
      availableFrom: listingData.availableFrom ? new Date(listingData.availableFrom) : undefined,
      availableTo: listingData.availableTo ? new Date(listingData.availableTo) : undefined,
      agentId: session.user.id,
      ...(images.length > 0 && {
        images: {
          create: images.map((img) => ({
            url: img.url,
            alt: img.alt ?? listingData.title,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
      }),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user) {
    await sendListingStatusEmail({
      to: user.email,
      status: "submitted",
      title: created.title,
    });
  }

  return NextResponse.json({ listing: created }, { status: 201 });
}
