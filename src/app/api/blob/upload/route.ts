import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Missing BLOB_READ_WRITE_TOKEN environment variable." },
        { status: 500 },
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const session = await auth();

        if (!session?.user?.id) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: ["image/*"],
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: session.user.id,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload initialization failed";
    const status = message === "Unauthorized" ? 401 : 400;

    console.error("Blob upload setup failed", error);

    return NextResponse.json({ error: message }, { status });
  }
}