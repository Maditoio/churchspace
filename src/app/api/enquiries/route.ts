import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validations";
import { sendEnquiryEmails } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "SUPER_ADMIN";
  const enquiries = await prisma.enquiry.findMany({
    where: isAdmin ? {} : { listing: { agentId: session.user.id } },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ enquiries });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId }, include: { agent: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const session = await auth();
  const enquiry = await prisma.enquiry.create({
    data: {
      ...parsed.data,
      senderId: session?.user?.id,
    },
  });

  await sendEnquiryEmails({
    agentEmail: listing.agent.email,
    senderEmail: parsed.data.senderEmail,
    senderName: parsed.data.senderName,
    listingTitle: listing.title,
    message: parsed.data.message,
  });

  return NextResponse.json({ enquiry }, { status: 201 });
}
