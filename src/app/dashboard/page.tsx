import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingStatus } from "@prisma/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const isAdmin = session?.user?.role === "SUPER_ADMIN";
  const agentId = session.user.id;
  const now = new Date();

  const listingScope = isAdmin ? {} : { agentId };

  const [totalListings, activeListings, totalEnquiries, savedByOthers, viewAggregate, listings] = await Promise.all([
    prisma.listing.count({ where: listingScope }),
    prisma.listing.count({
      where: {
        ...listingScope,
        status: ListingStatus.ACTIVE,
        paymentStatus: "PAID",
        paymentExpiresAt: { gte: now },
        isTaken: false,
      },
    }),
    prisma.enquiry.count({
      where: isAdmin
        ? {}
        : {
            listing: { agentId },
          },
    }),
    prisma.savedListing.count({ where: isAdmin ? {} : { listing: { agentId } } }),
    prisma.listing.aggregate({ where: listingScope, _sum: { viewCount: true } }),
    prisma.listing.findMany({
      where: listingScope,
      include: { images: true, agent: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const recentEnquiries = await prisma.enquiry.findMany({
    where: isAdmin
      ? {}
      : {
          listing: { agentId },
        },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Agent Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label={isAdmin ? "Active Listings (All)" : "My Active Listings"} value={activeListings} />
        <StatsCard label={isAdmin ? "Total Views (All)" : "My Total Views"} value={viewAggregate._sum.viewCount ?? 0} />
        <StatsCard label={isAdmin ? "Enquiries (All)" : "My Enquiries"} value={totalEnquiries} />
        <StatsCard label={isAdmin ? "Saved Listings (All)" : "Saved by Others"} value={savedByOthers} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/listings/new"><Button variant="accent">+ New Listing</Button></Link>
        <Link href="/dashboard/listings"><Button variant="secondary">View My Listings</Button></Link>
        <Link href="/dashboard/enquiries"><Button variant="secondary">View Enquiries</Button></Link>
      </div>

      <section>
        <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">{isAdmin ? "Recent Enquiries (All)" : "Recent Enquiries"}</h2>
        <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-raised)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3">Property</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((item) => (
                <tr key={item.id} className={`border-t border-[var(--border-subtle)] ${item.isRead ? "" : "bg-[var(--accent-light)]/40"}`}>
                  <td className="px-4 py-3">{item.listing.title}</td>
                  <td className="px-4 py-3">{item.senderName}</td>
                  <td className="px-4 py-3">{item.createdAt.toDateString()}</td>
                  <td className="px-4 py-3">{item.isRead ? "Read" : "Unread"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">{isAdmin ? "Latest Listings (All)" : "My Listings"}</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id}>
              <PropertyCard listing={mapListingToCard(listing)} />
              <div className="mt-2"><ListingStatusBadge status={listing.status} /></div>
            </div>
          ))}
        </div>
      </section>

      <p className="hidden">{totalListings}</p>
    </div>
  );
}
