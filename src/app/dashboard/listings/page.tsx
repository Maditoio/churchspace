import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { ListingPaymentBadge } from "@/components/listings/ListingPaymentBadge";
import { ListingPaymentActions } from "@/components/dashboard/ListingPaymentActions";

export default async function DashboardListingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings");
  }

  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  const listings = await prisma.listing.findMany({
    where: isAdmin ? {} : { agentId: session.user.id },
    include: { agent: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">{isAdmin ? "All Listings" : "My Listings"}</h1>
        <Link href="/dashboard/listings/new" className="rounded-[10px] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--primary)]">New Listing</Link>
      </div>
      {!isAdmin ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Listing fee is <strong>$14.99 per listing</strong>. Payment keeps the listing live for 1 year. Marking a listing as taken unlists it; relisting requires a new payment.
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-raised)]"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Valid Til</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-3">{listing.title}</td>
                <td className="px-4 py-3">{listing.city}</td>
                <td className="px-4 py-3"><ListingStatusBadge status={listing.status} /></td>
                <td className="px-4 py-3">
                  <ListingPaymentBadge
                    paymentStatus={listing.paymentStatus}
                    paymentExpiresAt={listing.paymentExpiresAt}
                    isTaken={listing.isTaken}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-[var(--primary)]">Edit</Link>
                    <Link href={`/dashboard/listings/${listing.id}/photos`} className="text-[var(--primary)]">Photos</Link>
                    <ListingPaymentActions
                      listingId={listing.id}
                      isTaken={listing.isTaken}
                      paymentStatus={listing.paymentStatus}
                      paymentExpiresAt={listing.paymentExpiresAt}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
