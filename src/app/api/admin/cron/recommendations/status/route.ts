import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_KEYS = [
  "cron.recommendations.lastRunAt",
  "cron.recommendations.lastRunSource",
  "cron.recommendations.lastRunStatus",
  "cron.recommendations.lastRunProcessed",
  "cron.recommendations.lastRunMatchedPreferences",
  "cron.recommendations.lastRunEmailsSent",
  "cron.recommendations.lastRunError",
] as const;

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.siteSettings.findMany({
    where: {
      key: { in: [...STATUS_KEYS] },
    },
  });

  const map = new Map(settings.map((item) => [item.key, item.value]));
  const lastRunAt = map.get("cron.recommendations.lastRunAt") ?? null;
  const lastRunStatus = map.get("cron.recommendations.lastRunStatus") ?? null;
  const stale =
    !lastRunAt ||
    Number.isNaN(new Date(lastRunAt).getTime()) ||
    Date.now() - new Date(lastRunAt).getTime() > 26 * 60 * 60 * 1000;

  const shouldAllowManualRun = stale || lastRunStatus !== "ok";

  return NextResponse.json({
    lastRunAt,
    lastRunSource: map.get("cron.recommendations.lastRunSource") ?? null,
    lastRunStatus,
    lastRunProcessed: Number(map.get("cron.recommendations.lastRunProcessed") ?? "0"),
    lastRunMatchedPreferences: Number(map.get("cron.recommendations.lastRunMatchedPreferences") ?? "0"),
    lastRunEmailsSent: Number(map.get("cron.recommendations.lastRunEmailsSent") ?? "0"),
    lastRunError: map.get("cron.recommendations.lastRunError") ?? null,
    shouldAllowManualRun,
  });
}