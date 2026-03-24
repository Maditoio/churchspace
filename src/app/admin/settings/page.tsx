import { prisma } from "@/lib/prisma";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import {
  formatPaymentCurrency,
  getListingPaymentAmount,
  LISTING_PAYMENT_AMOUNT_SETTING_KEY,
  LISTING_PAYMENT_CURRENCY,
} from "@/lib/payments";

export default async function AdminSettingsPage() {
  const listingPaymentAmount = await getListingPaymentAmount();
  const settings = await prisma.siteSettings.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Site Settings</h1>
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-secondary)]">
        <p>
          Listing payments are charged in <strong>{LISTING_PAYMENT_CURRENCY}</strong>. To change the current fee of{" "}
          <strong>{formatPaymentCurrency(listingPaymentAmount)}</strong>, edit the <strong>{LISTING_PAYMENT_AMOUNT_SETTING_KEY}</strong> setting below.
        </p>
      </div>
      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
