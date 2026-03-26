import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPaymentDisputeAdminEmail, sendPaymentDisputeFiledEmail } from "@/lib/email";
import { activePaymentDisputeStatuses } from "@/lib/payment-disputes";
import { prisma } from "@/lib/prisma";
import { paymentDisputeCreateSchema } from "@/lib/validations";

export async function POST(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = paymentDisputeCreateSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Please provide a valid dispute summary and explanation." }, { status: 400 });
  }

  const { paymentId } = await params;
  const payment = await prisma.listingPayment.findUnique({
    where: { id: paymentId },
    include: {
      listing: { select: { id: true, title: true } },
      user: { select: { id: true, email: true, name: true } },
      disputes: {
        where: { status: { in: activePaymentDisputeStatuses } },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payment.disputes.length > 0) {
    return NextResponse.json({ error: "There is already an active dispute for this payment." }, { status: 409 });
  }

  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN", isActive: true },
    select: { id: true, email: true, name: true },
  });

  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.paymentDispute.create({
      data: {
        paymentId: payment.id,
        userId: session.user.id,
        subject: payload.data.subject,
        details: payload.data.details,
      },
    });

    await tx.notification.create({
      data: {
        userId: session.user.id,
        listingId: payment.listingId,
        title: "Payment Dispute Logged",
        message: `Your dispute for payment ${payment.reference} has been logged and is now awaiting review.`,
        reason: payload.data.subject,
      },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          listingId: payment.listingId,
          title: "New Payment Dispute",
          message: `${payment.user.name ?? payment.user.email} filed a dispute for payment ${payment.reference}.`,
          reason: payload.data.subject,
        })),
      });
    }

    return created;
  });

  await sendPaymentDisputeFiledEmail({
    to: payment.user.email,
    name: payment.user.name,
    paymentReference: payment.reference,
    listingTitle: payment.listing.title,
    subject: payload.data.subject,
  });

  await Promise.all(
    admins
      .filter((admin) => !!admin.email)
      .map((admin) =>
        sendPaymentDisputeAdminEmail({
          to: admin.email,
          reporterName: payment.user.name,
          reporterEmail: payment.user.email,
          paymentReference: payment.reference,
          listingTitle: payment.listing.title,
          subject: payload.data.subject,
        }),
      ),
  );

  return NextResponse.json({ dispute }, { status: 201 });
}