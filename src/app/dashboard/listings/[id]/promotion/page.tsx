import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPaymentCurrency, getListingPaymentAmount } from "@/lib/payments";
import { hasActivePromotions } from "@/lib/promotions";
import { PromotionCheckoutForm } from "@/components/payments/PromotionCheckoutForm";

export default async function ListingPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings");
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    redirect("/dashboard/listings");
  }

  const isOwner = listing.agentId === session.user.id;
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) {
    redirect("/dashboard/listings");
  }

  const [listingPaymentAmount, promotionsActive] = await Promise.all([
    getListingPaymentAmount(),
    hasActivePromotions(),
  ]);

  const listingFeeLabel = formatPaymentCurrency(listingPaymentAmount);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-5xl text-foreground">Checkout Promotion</h1>
        <p className="text-sm text-(--text-secondary)">
          Apply a voucher before paying for <strong>{listing.title}</strong>.
        </p>
      </div>

      {promotionsActive ? (
        <PromotionCheckoutForm listingId={listing.id} listingFeeLabel={listingFeeLabel} />
      ) : (
        <div className="rounded-(--radius) border border-(--border) bg-white p-6 text-sm text-(--text-secondary)">
          No active promotions are available right now. You can continue to payment.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/listings" className="inline-flex h-12 min-w-36 items-center justify-center rounded-full border border-(--border-strong) bg-white/88 px-5 text-sm font-semibold text-(--primary) shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--primary) hover:bg-(--primary-soft)">
          Back to Listings
        </Link>
      </div>
    </div>
  );
}
