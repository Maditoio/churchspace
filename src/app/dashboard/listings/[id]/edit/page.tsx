import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditListingForm } from "@/components/forms/listing/EditListingForm";

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
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Edit Listing</h1>
      <EditListingForm listing={listing} />
    </div>
  );
}
