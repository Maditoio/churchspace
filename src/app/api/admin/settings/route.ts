import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const entries = Array.isArray(body?.settings) ? body.settings : [];

  const validEntries = entries
    .map((entry: { key?: unknown; value?: unknown }) => ({
      key: typeof entry?.key === "string" ? entry.key.trim() : "",
      value: typeof entry?.value === "string" ? entry.value : "",
    }))
    .filter((entry: { key: string; value: string }) => entry.key.length > 0);

  if (validEntries.length === 0) {
    return NextResponse.json({ error: "No valid settings supplied" }, { status: 400 });
  }

  await prisma.$transaction(
    validEntries.map((entry: { key: string; value: string }) =>
      prisma.siteSettings.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      }),
    ),
  );

  const settings = await prisma.siteSettings.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ settings });
}