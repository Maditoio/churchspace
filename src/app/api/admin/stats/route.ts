import { NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalListings, pendingReview, monthlyEnquiries] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
    prisma.enquiry.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  return NextResponse.json({ totalUsers, totalListings, pendingReview, monthlyEnquiries });
}
