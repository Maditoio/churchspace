import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchPreferenceSchema } from "@/lib/validations";

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

  const query = parsed.data.query?.trim() || null;
  const city = parsed.data.city?.trim() || null;
  const suburb = parsed.data.suburb?.trim() || parsed.data.area?.trim() || null;
  const propertyType = parsed.data.type ?? null;
  const listingType = parsed.data.purpose ?? null;

  await prisma.userSearchPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      query,
      city,
      suburb,
      propertyType,
      listingType,
      lastSearchedAt: new Date(),
    },
    update: {
      query,
      city,
      suburb,
      propertyType,
      listingType,
      lastSearchedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
