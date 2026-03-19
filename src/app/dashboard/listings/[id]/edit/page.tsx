import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditListingForm } from "@/components/forms/listing/EditListingForm";
import { ListingImageManager } from "@/components/listings/ListingImageManager";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings");
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  const isAdmin = session.user.role === "SUPER_ADMIN";
  const isOwner = listing.agentId === session.user.id;
  if (!isAdmin && !isOwner) {
    redirect("/dashboard/listings");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">Edit Listing</h1>
      <EditListingForm listing={listing} />
      <section className="rounded-xl border border-(--border) bg-white p-6 shadow-(--shadow-sm)">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Listing Photos</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Add, remove, reorder, and choose a cover image here.
              {listing.status === "PENDING_REVIEW"
                ? " Photo editing is disabled while the listing is in review."
                : ""}
            </p>
          </div>
          <ListingImageManager listingId={listing.id} listingStatus={listing.status} />
        </div>
      </section>
    </div>
  );
}
