import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validations";
import { sendEnquiryEmails } from "@/lib/email";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "SUPER_ADMIN";
  const where = isAdmin ? {} : { listing: { agentId: session.user.id } };
  const requestedPage = parsePageParam(request.nextUrl.searchParams.get("page"));
  const totalEnquiries = await prisma.enquiry.count({ where });
  const pagination = getPaginationMeta(totalEnquiries, requestedPage, PAGE_SIZE);
  const enquiries = await prisma.enquiry.findMany({
    where,
    include: { listing: true },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  return NextResponse.json({ enquiries, pagination });
}

export async function POST(request: NextRequest) {
  try {
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

    const emailDispatch = await sendEnquiryEmails({
      agentEmail: listing.agent.email,
      senderEmail: parsed.data.senderEmail,
      senderName: parsed.data.senderName,
      senderPhone: parsed.data.senderPhone,
      listingTitle: listing.title,
      listingSlug: listing.slug,
      listingCity: listing.city,
      listingSuburb: listing.suburb,
      message: parsed.data.message,
    });

    if (!emailDispatch.agentNotificationSent || !emailDispatch.senderConfirmationSent) {
      console.error("[enquiries] email delivery incomplete", {
        enquiryId: enquiry.id,
        listingId: listing.id,
        emailDispatch,
      });
    }

    return NextResponse.json({ enquiry, emailDispatch }, { status: 201 });
  } catch (error) {
    console.error("[enquiries] failed to create enquiry", error);
    return NextResponse.json({ error: "Could not send enquiry" }, { status: 500 });
  }
}
