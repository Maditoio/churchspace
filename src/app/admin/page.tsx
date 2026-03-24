import { ListingStatus } from "@prisma/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { CronRecommendationsStatus } from "@/components/admin/CronRecommendationsStatus";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [users, listings, pending, monthlyEnquiries] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
    prisma.enquiry.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  const pendingListings = await prisma.listing.findMany({
    where: { status: ListingStatus.PENDING_REVIEW },
    include: { agent: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="Total Users" value={users} />
        <StatsCard label="Total Listings" value={listings} />
        <StatsCard label="Pending Review" value={pending} />
        <StatsCard label="Monthly Enquiries" value={monthlyEnquiries} />
      </div>
      <CronRecommendationsStatus />
      <section>
        <h2 className="mb-4 font-display text-3xl text-[var(--text-primary)]">Pending Listings Queue</h2>
        <ApprovalQueue listings={pendingListings.map((item) => ({ id: item.id, title: item.title, createdAt: item.createdAt, agent: { name: item.agent.name }, listingType: item.listingType as string[] }))} />
      </section>
    </div>
  );
}
