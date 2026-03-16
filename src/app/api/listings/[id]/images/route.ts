import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const images = Array.isArray(body.images) ? body.images : [];

  const created = await prisma.$transaction(
    images.map((image: { url: string; alt?: string; isPrimary?: boolean; order?: number }) =>
      prisma.listingImage.create({
        data: {
          listingId: id,
          url: image.url,
          alt: image.alt,
          isPrimary: image.isPrimary ?? false,
          order: image.order ?? 0,
        },
      }),
    ),
  );

  return NextResponse.json({ images: created }, { status: 201 });
}
