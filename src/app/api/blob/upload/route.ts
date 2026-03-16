import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
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

    return NextResponse.json({ error: message }, { status });
  }
}