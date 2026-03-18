import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const rawBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const trimmedBlobToken = rawBlobToken?.trim();
  const blobTokenHasWrappingQuotes = !!(
    trimmedBlobToken
    && ((trimmedBlobToken.startsWith('"') && trimmedBlobToken.endsWith('"'))
      || (trimmedBlobToken.startsWith("'") && trimmedBlobToken.endsWith("'")))
  );

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      blobTokenExists: !!rawBlobToken,
      blobTokenLength: rawBlobToken?.length ?? 0,
      blobTokenHasWrappingQuotes,
      nextAuthUrlExists: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    },
    auth: {} as { userId?: string; error?: string },
  };

  try {
    const session = await auth();
    if (session?.user?.id) {
      diagnostics.auth = { userId: session.user.id };
    } else {
      diagnostics.auth = { error: "Not authenticated" };
    }
  } catch (error) {
    diagnostics.auth = { error: String(error) };
  }

  return NextResponse.json(diagnostics);
}
