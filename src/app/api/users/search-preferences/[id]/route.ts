import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await prisma.userSearchPreference.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Alert not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
