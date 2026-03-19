import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, images: { orderBy: { order: "asc" } } },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ images: listing.images });
  } catch (error) {
    console.error("Failed to get listing images:", error);
    return NextResponse.json(
      { error: "Failed to get listing images" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const images = Array.isArray(body.images) ? body.images : [];

    if (images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (listing.status === "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Cannot upload images while listing is under review" },
        { status: 400 },
      );
    }

    const existingCount = await prisma.listingImage.count({ where: { listingId: id } });

    const created = await prisma.$transaction(
      images.map((image: { url: string; alt?: string; isPrimary?: boolean; order?: number }, index: number) =>
        prisma.listingImage.create({
          data: {
            listingId: id,
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary ?? false,
            order: image.order ?? existingCount + index,
          },
        }),
      ),
    );

    const updatedImages = await prisma.listingImage.findMany({
      where: { listingId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images: updatedImages, created }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload listing images:", error);
    return NextResponse.json(
      { error: "Failed to upload listing images" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUpdates } = body as {
      imageUpdates: Array<{ id: string; order?: number; isPrimary?: boolean }>;
    };

    if (!imageUpdates || !Array.isArray(imageUpdates)) {
      return NextResponse.json({ error: "Invalid imageUpdates array" }, { status: 400 });
    }

    // Verify listing ownership and not in review
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent edits while in review
    if (listing.status === "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Cannot edit images while listing is under review" },
        { status: 400 }
      );
    }

    // Update images
    for (const update of imageUpdates) {
      await prisma.listingImage.update({
        where: { id: update.id },
        data: {
          ...(update.order !== undefined && { order: update.order }),
          ...(update.isPrimary !== undefined && { isPrimary: update.isPrimary }),
        },
      });
    }

    const updatedImages = await prisma.listingImage.findMany({
      where: { listingId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images: updatedImages });
  } catch (error) {
    console.error("Failed to update listing images:", error);
    return NextResponse.json(
      { error: "Failed to update listing images" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageId } = body as { imageId: string };

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    // Verify listing ownership and not in review
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent edits while in review
    if (listing.status === "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Cannot delete images while listing is under review" },
        { status: 400 }
      );
    }

    // Get the image to delete
    const imageToDelete = await prisma.listingImage.findUnique({
      where: { id: imageId },
      select: { isPrimary: true },
    });

    if (!imageToDelete) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete the image
    await prisma.listingImage.delete({
      where: { id: imageId },
    });

    // If deleted image was primary, make first remaining image primary
    if (imageToDelete.isPrimary) {
      const firstRemaining = await prisma.listingImage.findFirst({
        where: { listingId: id },
        orderBy: { order: "asc" },
      });

      if (firstRemaining) {
        await prisma.listingImage.update({
          where: { id: firstRemaining.id },
          data: { isPrimary: true },
        });
      }
    }

    const remainingImages = await prisma.listingImage.findMany({
      where: { listingId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images: remainingImages });
  } catch (error) {
    console.error("Failed to delete listing image:", error);
    return NextResponse.json(
      { error: "Failed to delete listing image" },
      { status: 500 }
    );
  }
}
