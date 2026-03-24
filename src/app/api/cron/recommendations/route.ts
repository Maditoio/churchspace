import { NextRequest, NextResponse } from "next/server";
import { markRecommendationsCronFailure, runRecommendationsCron } from "@/lib/recommendations-cron";

function getAuthorizationResult(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false as const, reason: "missing-cron-secret" };
  }

  const bearer = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const hasValidSecret = headerSecret === secret || bearer === `Bearer ${secret}`;

  if (!hasValidSecret) {
    return { ok: false as const, reason: "invalid-secret" };
  }

  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  // Log scheduler hits before auth checks so failed invocations are visible in logs.
  console.info("[cron/recommendations] invoked", {
    at: new Date().toISOString(),
    hasAuthorization: Boolean(request.headers.get("authorization")),
    hasXCronSecret: Boolean(request.headers.get("x-cron-secret")),
    userAgent: request.headers.get("user-agent") ?? "",
  });

  const auth = getAuthorizationResult(request);
  if (!auth.ok) {
    console.warn("[cron/recommendations] unauthorized request", {
      reason: auth.reason,
      hasAuthorization: Boolean(request.headers.get("authorization")),
      hasXCronSecret: Boolean(request.headers.get("x-cron-secret")),
      userAgent: request.headers.get("user-agent") ?? "",
    });

    if (auth.reason === "missing-cron-secret") {
      return NextResponse.json({ error: "Misconfigured: CRON_SECRET missing" }, { status: 500 });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.info("[cron/recommendations] run started", {
    at: new Date().toISOString(),
    hasAuthorization: Boolean(request.headers.get("authorization")),
    hasXCronSecret: Boolean(request.headers.get("x-cron-secret")),
    userAgent: request.headers.get("user-agent") ?? "",
  });

  try {
    const result = await runRecommendationsCron("scheduled");
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await markRecommendationsCronFailure("scheduled", message);
    console.error("[cron/recommendations] run failed", { message });
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
