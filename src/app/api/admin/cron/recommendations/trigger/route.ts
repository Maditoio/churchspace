import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runRecommendationsCron } from "@/lib/recommendations-cron";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const troubleshoot = url.searchParams.get("troubleshoot") === "1";

  console.info("[admin/cron/recommendations] manual trigger requested", {
    at: new Date().toISOString(),
    userId: session.user?.id,
    email: session.user?.email,
    troubleshoot,
  });

  const result = await runRecommendationsCron("manual-admin", {
    ignoreInterval: troubleshoot,
    includeExistingListings: troubleshoot,
    debug: troubleshoot,
  });
  return NextResponse.json({ ok: true, ...result });
}