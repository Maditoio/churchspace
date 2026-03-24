import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingStatus } from "@prisma/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { Button } from "@/components/ui/Button";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { mapListingToCard } from "@/lib/listings";

const NOTIFICATIONS_PAGE_SIZE = 4;
const ENQUIRIES_PAGE_SIZE = 5;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ enquiriesPage?: string; notificationsPage?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const isAdmin = session?.user?.role === "SUPER_ADMIN";
  const agentId = session.user.id;
  const now = new Date();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const listingScope = isAdmin ? {} : { agentId };
  const enquiriesScope = isAdmin ? {} : { listing: { agentId } };
  const notificationsScope = isAdmin ? { userId: session.user.id } : { userId: agentId };

  const [totalListings, activeListings, totalEnquiries, savedByOthers, viewAggregate, totalNotifications] = await Promise.all([
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
    prisma.enquiry.count({ where: enquiriesScope }),
    prisma.savedListing.count({ where: isAdmin ? {} : { listing: { agentId } } }),
    prisma.listing.aggregate({ where: listingScope, _sum: { viewCount: true } }),
    prisma.notification.count({ where: notificationsScope }),
  ]);

  const notificationsPagination = getPaginationMeta(
    totalNotifications,
    parsePageParam(resolvedSearchParams?.notificationsPage),
    NOTIFICATIONS_PAGE_SIZE,
  );
  const enquiriesPagination = getPaginationMeta(
    totalEnquiries,
    parsePageParam(resolvedSearchParams?.enquiriesPage),
    ENQUIRIES_PAGE_SIZE,
  );

  const [listings, notifications, recentEnquiries] = await Promise.all([
    prisma.listing.findMany({
      where: listingScope,
      include: { images: true, agent: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.notification.findMany({
      where: notificationsScope,
      orderBy: { createdAt: "desc" },
      skip: notificationsPagination.skip,
      take: NOTIFICATIONS_PAGE_SIZE,
    }),
    prisma.enquiry.findMany({
      where: enquiriesScope,
      include: { listing: true },
      orderBy: { createdAt: "desc" },
      skip: enquiriesPagination.skip,
      take: ENQUIRIES_PAGE_SIZE,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-5xl text-foreground">Agent Dashboard</h1>

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
        <h2 className="mb-3 font-display text-3xl text-foreground">Messages &amp; Notifications</h2>
        <div className="space-y-3">
          {notifications.length ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-(--radius) border p-4 ${notification.isRead ? "border-(--border) bg-white" : "border-(--accent)/50 bg-(--accent-light)/30"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{notification.title}</p>
                  <p className="text-xs text-(--text-secondary)">{notification.createdAt.toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-(--text-secondary)">{notification.message}</p>
                {notification.reason ? (
                  <p className="mt-2 text-sm text-foreground"><span className="font-semibold">Reason:</span> {notification.reason}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="rounded-(--radius) border border-(--border) bg-white p-4 text-sm text-(--text-secondary)">No notifications yet.</p>
          )}
        </div>
        <PaginationControls
          basePath="/dashboard"
          className="mt-4 rounded-(--radius) border border-(--border) bg-white"
          currentPage={notificationsPagination.currentPage}
          itemLabel="messages"
          pageParam="notificationsPage"
          pageSize={notificationsPagination.pageSize}
          query={{ enquiriesPage: resolvedSearchParams?.enquiriesPage }}
          totalItems={notificationsPagination.totalItems}
          totalPages={notificationsPagination.totalPages}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-3xl text-foreground">{isAdmin ? "Recent Enquiries (All)" : "Recent Enquiries"}</h2>
        <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-(--surface-raised) text-(--text-secondary)">
              <tr>
                <th className="px-4 py-3">Property</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((item) => (
                <tr key={item.id} className={`border-t border-(--border-subtle) ${item.isRead ? "" : "bg-(--accent-light)/40"}`}>
                  <td className="px-4 py-3">{item.listing.title}</td>
                  <td className="px-4 py-3">{item.senderName}</td>
                  <td className="px-4 py-3">{item.createdAt.toDateString()}</td>
                  <td className="px-4 py-3">{item.isRead ? "Read" : "Unread"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls
          basePath="/dashboard"
          className="mt-4 rounded-(--radius) border border-(--border) bg-white"
          currentPage={enquiriesPagination.currentPage}
          itemLabel="enquiries"
          pageParam="enquiriesPage"
          pageSize={enquiriesPagination.pageSize}
          query={{ notificationsPage: resolvedSearchParams?.notificationsPage }}
          totalItems={enquiriesPagination.totalItems}
          totalPages={enquiriesPagination.totalPages}
        />
      </section>

      <section>
        <h2 className="mb-3 font-display text-3xl text-foreground">{isAdmin ? "Latest Listings (All)" : "My Listings"}</h2>
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
