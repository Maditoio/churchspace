import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendListingStatusEmail } from "@/lib/email";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, rejectionReason } = body as { action: "approve" | "reject"; rejectionReason?: string };

  const listing = await prisma.listing.findUnique({ where: { id }, include: { agent: true } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    await prisma.listing.update({ where: { id }, data: { status: ListingStatus.ACTIVE, rejectionReason: null } });
    await sendListingStatusEmail({ to: listing.agent.email, status: "approved", title: listing.title });
  } else if (action === "reject") {
    await prisma.listing.update({ where: { id }, data: { status: ListingStatus.SUSPENDED, rejectionReason: rejectionReason ?? "" } });
    await sendListingStatusEmail({ to: listing.agent.email, status: "rejected", title: listing.title, reason: rejectionReason });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.listing.findUnique({ where: { id } });
  return NextResponse.json({ listing: updated });
}
