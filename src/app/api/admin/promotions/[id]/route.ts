import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePromotionCode } from "@/lib/promotions";
import { promotionUpsertSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const normalizedName = normalizePromotionCode(payload.data.name);

  const promotion = await prisma.promotion.update({
    where: { id },
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

  return NextResponse.json({ promotion });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
