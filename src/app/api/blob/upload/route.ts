import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_CONTENT_TYPES = ["image/*", "application/octet-stream"];

export const runtime = "nodejs";

type UploadClientPayload = {
  listingId: string;
  order: number;
  alt?: string;
};

type UploadTokenPayload = UploadClientPayload & {
  userId: string;
};

function resolveBlobToken() {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  if (!raw) return null;

  const trimmed = raw.trim();
  // Some dashboards/env files may accidentally include wrapping quotes.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseUploadClientPayload(payload: string | null): UploadClientPayload | null {
  if (!payload) return null;

  try {
    const parsed = JSON.parse(payload) as Partial<UploadClientPayload>;
    if (!parsed.listingId || typeof parsed.listingId !== "string") return null;
    if (typeof parsed.order !== "number") return null;

    return {
      listingId: parsed.listingId,
      order: parsed.order,
      alt: typeof parsed.alt === "string" ? parsed.alt : undefined,
    };
  } catch {
    return null;
  }
}

function parseUploadTokenPayload(payload: string | null | undefined): UploadTokenPayload | null {
  if (!payload) return null;

  try {
    const parsed = JSON.parse(payload) as Partial<UploadTokenPayload>;
    if (!parsed.userId || typeof parsed.userId !== "string") return null;
    if (!parsed.listingId || typeof parsed.listingId !== "string") return null;
    if (typeof parsed.order !== "number") return null;

    return {
      userId: parsed.userId,
      listingId: parsed.listingId,
      order: parsed.order,
      alt: typeof parsed.alt === "string" ? parsed.alt : undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const token = resolveBlobToken();
    if (!token) {
      return NextResponse.json(
        { error: "Missing BLOB_READ_WRITE_TOKEN environment variable." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();

        if (!session?.user?.id) {
          throw new Error("Unauthorized upload request");
        }

        if (!pathname.startsWith("listings/")) {
          throw new Error("Invalid upload path");
        }

        const uploadPayload = parseUploadClientPayload(clientPayload);
        if (!uploadPayload) {
          throw new Error("Invalid upload metadata");
        }

        const listing = await prisma.listing.findFirst({
          where: {
            id: uploadPayload.listingId,
            agentId: session.user.id,
          },
          select: { id: true },
        });

        if (!listing) {
          throw new Error("Listing not found for upload");
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            listingId: uploadPayload.listingId,
            order: uploadPayload.order,
            alt: uploadPayload.alt,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseUploadTokenPayload(tokenPayload);
        if (!payload) {
          throw new Error("Invalid upload completion payload");
        }

        const listing = await prisma.listing.findFirst({
          where: {
            id: payload.listingId,
            agentId: payload.userId,
          },
          select: { id: true },
        });

        if (!listing) {
          throw new Error("Listing not found during upload completion");
        }

        const existing = await prisma.listingImage.findFirst({
          where: {
            listingId: payload.listingId,
            url: blob.url,
          },
          select: { id: true },
        });

        if (existing) {
          return;
        }

        await prisma.listingImage.create({
          data: {
            listingId: payload.listingId,
            url: blob.url,
            alt: payload.alt,
            isPrimary: payload.order === 0,
            order: payload.order,
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload initialization failed";
    const status = /unauthorized/i.test(message) ? 401 : 400;

    console.error("Blob upload setup failed", error);

    return NextResponse.json({ error: message }, { status });
  }
}