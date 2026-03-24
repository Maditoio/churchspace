import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runRecommendationsCron } from "@/lib/recommendations-cron";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.info("[admin/cron/recommendations] manual trigger requested", {
    at: new Date().toISOString(),
    userId: session.user?.id,
    email: session.user?.email,
  });

  const result = await runRecommendationsCron("manual-admin");
  return NextResponse.json({ ok: true, ...result });
}