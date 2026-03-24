import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { hasSearchPreferenceCriteria, normalizeSearchPreferenceInput } from "@/lib/search-preferences";
import { searchPreferenceSchema } from "@/lib/validations";

const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 24;

function parsePageSizeParam(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_PAGE_SIZE);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageSize = parsePageSizeParam(request.nextUrl.searchParams.get("pageSize"));
  const totalItems = await prisma.userSearchPreference.count({ where: { userId: session.user.id } });
  const pagination = getPaginationMeta(totalItems, parsePageParam(request.nextUrl.searchParams.get("page")), pageSize);

  const preferences = await prisma.userSearchPreference.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      createdAt: true,
      query: true,
      city: true,
      suburb: true,
      propertyType: true,
      listingType: true,
      lastSearchedAt: true,
      lastRecommendationSentAt: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    skip: pagination.skip,
    take: pageSize,
  });

  return NextResponse.json({
    pagination,
    preference: preferences[0] ?? null,
    preferences,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = searchPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search preference." }, { status: 400 });
  }

  const normalized = normalizeSearchPreferenceInput(parsed.data);

  if (!hasSearchPreferenceCriteria(normalized)) {
    return NextResponse.json({ error: "Add at least one alert filter." }, { status: 400 });
  }

  const preference = await prisma.userSearchPreference.upsert({
    where: {
      userId_fingerprint: {
        userId: session.user.id,
        fingerprint: normalized.fingerprint,
      },
    },
    create: {
      userId: session.user.id,
      fingerprint: normalized.fingerprint,
      query: normalized.query,
      city: normalized.city,
      suburb: normalized.suburb,
      propertyType: normalized.propertyType,
      listingType: normalized.listingType,
      lastSearchedAt: new Date(),
    },
    update: {
      query: normalized.query,
      city: normalized.city,
      suburb: normalized.suburb,
      propertyType: normalized.propertyType,
      listingType: normalized.listingType,
      lastSearchedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, preference });
}
