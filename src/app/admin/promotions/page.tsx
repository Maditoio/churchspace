import { prisma } from "@/lib/prisma";
import { AdminPromotionsManager } from "@/components/admin/AdminPromotionsManager";

export default async function AdminPromotionsPage() {
  const [promotions, recentUsages] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.promotionUsage.findMany({
      include: {
        promotion: { select: { name: true } },
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const normalizedPromotions = promotions.map((promotion) => ({
    id: promotion.id,
    name: promotion.name,
    description: promotion.description,
    type: promotion.type,
    discountValue: Number(promotion.discountValue),
    maxUses: promotion.maxUses,
    usedCount: promotion.usedCount,
    maxFreeListings: promotion.maxFreeListings,
    freeListingsUsed: promotion.freeListingsUsed,
    maxUsesPerUser: promotion.maxUsesPerUser,
    validFrom: promotion.validFrom.toISOString(),
    validUntil: promotion.validUntil.toISOString(),
    isActive: promotion.isActive,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">Promotions</h1>
      <p className="text-sm text-(--text-secondary)">
        Create voucher campaigns, limit usage, and control free listing allocations.
      </p>
      <AdminPromotionsManager initialPromotions={normalizedPromotions} />
      <section className="space-y-4 rounded-(--radius) border border-(--border) bg-white p-6">
        <div>
          <h2 className="font-display text-3xl text-foreground">Recent Usage</h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Audit discounts, free listings, and partially paid checkouts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-(--surface-raised) text-(--text-secondary)">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Promotion</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Original</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Final</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsages.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={8}>
                    No promotion usage recorded yet.
                  </td>
                </tr>
              ) : (
                recentUsages.map((usage) => (
                  <tr key={usage.id} className="border-t border-(--border-subtle)">
                    <td className="px-4 py-3 text-(--text-secondary)">{usage.createdAt.toLocaleString("en-ZA")}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{usage.promotion.name}</td>
                    <td className="px-4 py-3 text-(--text-secondary)">
                      {usage.user.name ?? "Unknown"}
                      <div className="text-xs text-(--text-muted)">{usage.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-(--text-secondary)">{usage.listing.title}</td>
                    <td className="px-4 py-3">{Number(usage.originalPrice).toFixed(2)} ZAR</td>
                    <td className="px-4 py-3">{Number(usage.discountApplied).toFixed(2)} ZAR</td>
                    <td className="px-4 py-3">{Number(usage.finalPrice).toFixed(2)} ZAR</td>
                    <td className="px-4 py-3 text-(--text-secondary)">{usage.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
