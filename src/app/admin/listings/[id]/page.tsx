import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { AdminListingActions } from "@/components/admin/AdminListingActions";

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { agent: true, images: true } });
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Listing Detail</h1>
        <Link href="/admin/listings" className="text-sm text-[var(--primary)] underline">Back to all listings</Link>
      </div>

      <div className="rounded-(--radius) border border-(--border) bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{listing.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{listing.city}, {listing.suburb}</p>
          </div>
          <ListingStatusBadge status={listing.status} />
        </div>

        {listing.images[0] && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" />
          </div>
        )}

        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{listing.description}</p>

        <div className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="font-medium">Type:</span> {listing.propertyType.replace(/_/g, " ")}</p>
          <p><span className="font-medium">Agent:</span> {listing.agent.name} ({listing.agent.email})</p>
          <p><span className="font-medium">Capacity:</span> {listing.congregationSize ?? "-"}</p>
          <p><span className="font-medium">Area:</span> {listing.areaSquareMeters ? `${listing.areaSquareMeters} m²` : "-"}</p>
        </div>

        {listing.rejectionReason && (
          <p className="rounded-lg bg-[var(--destructive-light)] p-3 text-sm text-[var(--destructive)]"><strong>Rejection reason:</strong> {listing.rejectionReason}</p>
        )}

        <AdminListingActions listingId={listing.id} currentStatus={listing.status as string} />
      </div>
    </div>
  );
}
