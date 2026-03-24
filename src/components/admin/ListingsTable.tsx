import Link from "next/link";
import { ListingStatus } from "@prisma/client";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { ListingPaymentBadge } from "@/components/listings/ListingPaymentBadge";

type Row = {
  id: string;
  title: string;
  city: string;
  status: ListingStatus;
  paymentStatus: "UNPAID" | "PAID" | "EXPIRED";
  paymentExpiresAt: Date | null;
  isTaken: boolean;
  createdAt: Date;
  agent: { name: string | null };
};

export function ListingsTable({ listings, listingFeeLabel }: { listings: Row[]; listingFeeLabel: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--surface-raised)] text-[var(--text-secondary)]">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Agent</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Valid Til</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-[var(--text-secondary)]" colSpan={6}>
                No listings found.
              </td>
            </tr>
          ) : (
            listings.map((listing) => (
              <tr key={listing.id} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-3">{listing.title}</td>
                <td className="px-4 py-3">{listing.agent.name ?? "-"}</td>
                <td className="px-4 py-3">{listing.city}</td>
                <td className="px-4 py-3"><ListingStatusBadge status={listing.status} /></td>
                <td className="px-4 py-3">
                  <ListingPaymentBadge
                    paymentStatus={listing.paymentStatus}
                    paymentExpiresAt={listing.paymentExpiresAt}
                    isTaken={listing.isTaken}
                    paymentRequiredLabel={`Payment Required (${listingFeeLabel})`}
                  />
                </td>
                <td className="px-4 py-3"><Link href={`/admin/listings/${listing.id}`} className="text-[var(--primary)]">View</Link></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
