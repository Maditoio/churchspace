import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_CONTENT_TYPES = ["image/*", "application/octet-stream"];

export const runtime = "nodejs";

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
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();

        if (!session?.user?.id) {
          throw new Error("Unauthorized upload request");
        }

        if (!pathname.startsWith("listings/") && !pathname.startsWith("avatars/")) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: session.user.id,
        };
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