import { Prisma, PromotionType, PromotionUsagePaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TWO_DECIMALS = 100;

export class PromotionValidationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "PromotionValidationError";
  }
}

export function normalizePromotionCode(code: string) {
  return code.trim().toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * TWO_DECIMALS) / TWO_DECIMALS;
}

function computeDiscount(args: { type: PromotionType; discountValue: Prisma.Decimal; originalPrice: number }) {
  const discountValue = Number(args.discountValue);
  if (!Number.isFinite(discountValue) || discountValue < 0) {
    return 0;
  }

  if (args.type === PromotionType.FREE_LISTING) {
    return args.originalPrice;
  }

  if (args.type === PromotionType.PERCENTAGE) {
    return (Math.min(discountValue, 100) / 100) * args.originalPrice;
  }

  return discountValue;
}

export async function hasActivePromotions(now = new Date()) {
  const count = await prisma.promotion.count({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validUntil: { gte: now },
    },
  });

  return count > 0;
}

type ReservePromotionUsageArgs = {
  code: string;
  userId: string;
  listingId: string;
  originalPrice: number;
  paymentReference?: string;
};

export async function reservePromotionUsageForListing(args: ReservePromotionUsageArgs) {
  const normalizedCode = normalizePromotionCode(args.code);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const promotion = await tx.promotion.findUnique({ where: { codeNormalized: normalizedCode } });
    if (!promotion) {
      throw new PromotionValidationError("Promotion code not found.");
    }

    await tx.$queryRaw`SELECT id FROM "Promotion" WHERE id = ${promotion.id} FOR UPDATE`;

    const lockedPromotion = await tx.promotion.findUnique({ where: { id: promotion.id } });
    if (!lockedPromotion) {
      throw new PromotionValidationError("Promotion not available.");
    }

    if (!lockedPromotion.isActive) {
      throw new PromotionValidationError("Promotion is not active.");
    }

    if (lockedPromotion.validFrom > now || lockedPromotion.validUntil < now) {
      throw new PromotionValidationError("Promotion is outside its validity period.");
    }

    if (lockedPromotion.maxUses !== null && lockedPromotion.usedCount >= lockedPromotion.maxUses) {
      throw new PromotionValidationError("Promotion usage limit has been reached.");
    }

    if (lockedPromotion.maxUsesPerUser !== null) {
      const userUsageCount = await tx.promotionUsage.count({
        where: {
          promotionId: lockedPromotion.id,
          userId: args.userId,
        },
      });

      if (userUsageCount >= lockedPromotion.maxUsesPerUser) {
        throw new PromotionValidationError("You have reached the maximum uses for this promotion.");
      }
    }

    const rawDiscount = computeDiscount({
      type: lockedPromotion.type,
      discountValue: lockedPromotion.discountValue,
      originalPrice: args.originalPrice,
    });

    const discountApplied = Math.min(roundCurrency(Math.max(0, rawDiscount)), args.originalPrice);
    const finalPrice = roundCurrency(Math.max(0, args.originalPrice - discountApplied));
    const isFree = finalPrice <= 0;

    if (isFree && lockedPromotion.maxFreeListings !== null && lockedPromotion.freeListingsUsed >= lockedPromotion.maxFreeListings) {
      throw new PromotionValidationError("No free listings remain for this promotion.");
    }

    const paymentStatus = isFree
      ? PromotionUsagePaymentStatus.FREE_VIA_PROMO
      : discountApplied > 0
        ? PromotionUsagePaymentStatus.PARTIAL_PAID
        : PromotionUsagePaymentStatus.PAID;

    await tx.promotion.update({
      where: { id: lockedPromotion.id },
      data: {
        usedCount: { increment: 1 },
        freeListingsUsed: isFree ? { increment: 1 } : undefined,
      },
    });

    const usage = await tx.promotionUsage.create({
      data: {
        promotionId: lockedPromotion.id,
        userId: args.userId,
        listingId: args.listingId,
        paymentReference: args.paymentReference,
        originalPrice: args.originalPrice,
        discountApplied,
        finalPrice,
        paymentStatus,
      },
      include: {
        promotion: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      usage,
      originalPrice: args.originalPrice,
      discountApplied,
      finalPrice,
      isFree,
    };
  });
}

export async function releasePromotionUsageReservation(usageId: string) {
  await prisma.$transaction(async (tx) => {
    const usage = await tx.promotionUsage.findUnique({ where: { id: usageId } });
    if (!usage) {
      return;
    }

    const promotion = await tx.promotion.findUnique({ where: { id: usage.promotionId } });
    if (!promotion) {
      await tx.promotionUsage.delete({ where: { id: usageId } });
      return;
    }

    await tx.$queryRaw`SELECT id FROM "Promotion" WHERE id = ${promotion.id} FOR UPDATE`;

    const nextUsedCount = Math.max(0, promotion.usedCount - 1);
    const shouldDecrementFree = Number(usage.finalPrice) <= 0;
    const nextFreeListingsUsed = shouldDecrementFree ? Math.max(0, promotion.freeListingsUsed - 1) : promotion.freeListingsUsed;

    await tx.promotion.update({
      where: { id: promotion.id },
      data: {
        usedCount: nextUsedCount,
        freeListingsUsed: nextFreeListingsUsed,
      },
    });

    await tx.promotionUsage.delete({ where: { id: usageId } });
  });
}
