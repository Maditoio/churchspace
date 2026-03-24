import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markRecommendationsCronFailure, runRecommendationsCron } from "@/lib/recommendations-cron";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.info("[admin/cron/recommendations] manual run requested", {
    at: new Date().toISOString(),
    userId: session.user?.id,
    email: session.user?.email,
  });

  try {
    const result = await runRecommendationsCron("manual-admin", {
      ignoreInterval: true,
      includeExistingListings: true,
      debug: true,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await markRecommendationsCronFailure("manual-admin", message);
    return NextResponse.json({ error: "Failed to run recommendations cron" }, { status: 500 });
  }
}