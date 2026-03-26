import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPaymentDisputeStatusEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { paymentDisputeUpdateSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = paymentDisputeUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Please provide a valid dispute update." }, { status: 400 });
  }

  const normalizedAdminNotes = payload.data.adminNotes?.trim() || null;
  if (["WAITING_FOR_USER", "RESOLVED", "REJECTED"].includes(payload.data.status) && !normalizedAdminNotes) {
    return NextResponse.json({ error: "Admin notes are required for this dispute status." }, { status: 400 });
  }

  const { id } = await params;
  const existing = await prisma.paymentDispute.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      payment: { include: { listing: { select: { id: true, title: true } } } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  const now = new Date();
  const dispute = await prisma.$transaction(async (tx) => {
    const updated = await tx.paymentDispute.update({
      where: { id },
      data: {
        status: payload.data.status,
        adminNotes: normalizedAdminNotes,
        assigneeId: session.user.id,
        acknowledgedAt: payload.data.status === "OPEN" ? existing.acknowledgedAt : existing.acknowledgedAt ?? now,
        resolvedAt: ["RESOLVED", "REJECTED"].includes(payload.data.status) ? now : null,
      },
    });

    await tx.notification.create({
      data: {
        userId: existing.userId,
        listingId: existing.payment.listing.id,
        title: "Payment Dispute Updated",
        message: `Your dispute for payment ${existing.payment.reference} is now ${payload.data.status.replace(/_/g, " ").toLowerCase()}.`,
        reason: normalizedAdminNotes ?? existing.subject,
      },
    });

    return updated;
  });

  await sendPaymentDisputeStatusEmail({
    to: existing.user.email,
    name: existing.user.name,
    paymentReference: existing.payment.reference,
    status: payload.data.status,
    subject: existing.subject,
    adminNotes: normalizedAdminNotes,
  });

  return NextResponse.json({ dispute });
}