import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingImageManager } from "@/components/listings/ListingImageManager";

export default async function ListingPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings");
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      agentId: true,
      images: { select: { id: true } },
    },
  });

  if (!listing) {
    notFound();
  }

  const isOwner = listing.agentId === session.user.id;
  if (!isOwner) {
    redirect("/dashboard/listings");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/listings" className="rounded-[10px] border border-(--border) px-4 py-3 text-sm font-medium text-(--text-secondary) hover:bg-(--surface-raised)">
          <ChevronLeft className="h-4 w-4 inline mr-1" />
          Back
        </Link>
        <div>
          <h1 className="font-display text-4xl text-foreground">{listing.title}</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">Manage photos and set cover image</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--border) bg-white p-6 shadow-(--shadow-sm)">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Photos</h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              {listing.status === "PENDING_REVIEW"
                ? "You cannot edit photos while your listing is under review."
                : "Drag to reorder, click the star to set as cover, or remove unwanted photos."}
            </p>
          </div>
          <ListingImageManager
            listingId={listing.id}
            listingStatus={listing.status}
          />
        </div>
      </div>
    </div>
  );
}
