import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePromotionCode } from "@/lib/promotions";
import { promotionUpsertSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const promotions = await prisma.promotion.findMany({
    include: {
      _count: {
        select: {
          usages: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ promotions });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = promotionUpsertSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid promotion payload" }, { status: 400 });
  }

  const validFrom = new Date(payload.data.validFrom);
  const validUntil = new Date(payload.data.validUntil);
  if (validUntil <= validFrom) {
    return NextResponse.json({ error: "validUntil must be after validFrom" }, { status: 400 });
  }

  const normalizedName = normalizePromotionCode(payload.data.name);

  const promotion = await prisma.promotion.create({
    data: {
      name: normalizedName,
      codeNormalized: normalizedName,
      description: payload.data.description?.trim() || null,
      type: payload.data.type,
      discountValue: payload.data.discountValue,
      maxUses: payload.data.maxUses ?? null,
      maxFreeListings: payload.data.maxFreeListings ?? null,
      maxUsesPerUser: payload.data.maxUsesPerUser ?? null,
      validFrom,
      validUntil,
      isActive: payload.data.isActive ?? true,
    },
  });

  return NextResponse.json({ promotion }, { status: 201 });
}
