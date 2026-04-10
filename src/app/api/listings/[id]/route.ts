import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true, agent: true } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = existing.agentId === session.user.id;
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = listingSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { images, videoUrl, ...data } = parsed.data;
  void images;

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...data,
      ...(videoUrl !== undefined && {
        videoUrl: videoUrl?.trim() ? videoUrl.trim() : null,
      }),
      ...(data.availableFrom !== undefined && {
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
      }),
      ...(data.availableTo !== undefined && {
        availableTo: data.availableTo ? new Date(data.availableTo) : null,
      }),
    },
  });
  return NextResponse.json({ listing });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = existing.agentId === session.user.id;
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Enquiry has no onDelete cascade — must be deleted manually before deleting the listing
  await prisma.enquiry.deleteMany({ where: { listingId: id } });
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
