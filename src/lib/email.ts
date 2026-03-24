import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const configuredBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  "https://churchspace.co.za";
const appBaseUrl = configuredBaseUrl.replace(/\/$/, "");

const brandStyles = `
  font-family: 'DM Sans', Arial, sans-serif;
  color: #1A1A2E;
`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function standardEmailTemplate(args: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
  eyebrow?: string;
}) {
  return `
    <div style="background:#FAFAF8;padding:32px;${brandStyles}">
      <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E6E0;border-radius:12px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#8C7A5B;">${args.eyebrow ?? "ChurchSpace Notification"}</p>
        <h1 style="margin:0 0 16px;font-size:28px;">Church<span style="color:#C9A96E">Space</span></h1>
        <h2 style="margin:0 0 12px;font-size:22px;color:#1A1A2E;">${args.title}</h2>
        <div style="font-size:15px;line-height:1.6;color:#5C5C6E;">${args.body}</div>
        ${
          args.ctaHref && args.ctaLabel
            ? `<a href="${args.ctaHref}" style="display:inline-block;margin-top:20px;background:#C9A96E;color:#1A1A2E;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">${args.ctaLabel}</a>`
            : ""
        }
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #E8E6E0;font-size:13px;line-height:1.6;color:#7A7A8C;">
          <p style="margin:0;">ChurchSpace helps ministries discover, list, and manage trusted church spaces across South Africa.</p>
        </div>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    console.warn("[email] skipped send: RESEND_API_KEY or RESEND_FROM_EMAIL missing");
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
    replyTo,
  });
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  return sendEmail(
    to,
    "Welcome to ChurchSpace",
    standardEmailTemplate({
      title: "Welcome to ChurchSpace",
      body: `<p>Hi ${name ?? "there"}, welcome to ChurchSpace. You can now list, discover, and connect with trusted church spaces across South Africa.</p>`,
      ctaHref: `${appBaseUrl}/dashboard`,
      ctaLabel: "Go to Dashboard",
      eyebrow: "Welcome",
    }),
  );
}

export async function sendPasswordResetEmail(args: { to: string; name?: string | null; token: string; email: string }) {
  const resetUrl = `${appBaseUrl}/reset-password?token=${encodeURIComponent(args.token)}&email=${encodeURIComponent(args.email)}`;

  return sendEmail(
    args.to,
    "Reset your ChurchSpace password",
    standardEmailTemplate({
      title: "Reset Your Password",
      body: `<p>Hi ${args.name ?? "there"}, we received a request to reset your password.</p><p>If this was you, click the button below. This link expires in 30 minutes.</p>`,
      ctaHref: resetUrl,
      ctaLabel: "Reset Password",
      eyebrow: "Security",
    }),
  );
}

export async function sendListingStatusEmail(args: { to: string; status: "approved" | "rejected" | "submitted"; title: string; reason?: string }) {
  const contentByStatus = {
    submitted: {
      subject: "Listing Submitted for Review",
      title: "Listing Submitted",
      body: `<p>Your listing <strong>${args.title}</strong> has been submitted and is now pending review.</p>`,
    },
    approved: {
      subject: "Listing Approved",
      title: "Listing Approved",
      body: `<p>Great news. Your listing <strong>${args.title}</strong> is now live on ChurchSpace.</p>`,
    },
    rejected: {
      subject: "Listing Review Update",
      title: "Listing Needs Changes",
      body: `<p>Your listing <strong>${args.title}</strong> needs updates before approval.</p><p>Reason: ${args.reason ?? "Not specified"}</p>`,
    },
  } as const;

  const selected = contentByStatus[args.status];
  return sendEmail(
    args.to,
    selected.subject,
    standardEmailTemplate({
      title: selected.title,
      body: selected.body,
      ctaHref: `${appBaseUrl}/dashboard/listings`,
      ctaLabel: "View My Listings",
      eyebrow: "Listing Update",
    }),
  );
}

export async function sendEnquiryEmails(args: {
  agentEmail: string;
  senderEmail: string;
  senderName: string;
  senderPhone?: string | null;
  listingTitle: string;
  listingSlug: string;
  listingCity: string;
  listingSuburb: string;
  message: string;
}) {
  const listingUrl = `${appBaseUrl}/listings/${args.listingSlug}`;
  const safeTitle = escapeHtml(args.listingTitle);
  const safeSenderName = escapeHtml(args.senderName);
  const safeSenderEmail = escapeHtml(args.senderEmail);
  const safeSenderPhone = args.senderPhone ? escapeHtml(args.senderPhone) : null;
  const safeMessage = escapeHtml(args.message).replace(/\n/g, "<br />");
  const detailsBlock = `
    <div style="margin:18px 0;padding:16px;border:1px solid #E8E6E0;border-radius:10px;background:#FCFBF8;">
      <p style="margin:0 0 8px;"><strong>Listing:</strong> ${safeTitle}</p>
      <p style="margin:0 0 8px;"><strong>Location:</strong> ${escapeHtml(args.listingSuburb)}, ${escapeHtml(args.listingCity)}</p>
      <p style="margin:0 0 8px;"><strong>Requester:</strong> ${safeSenderName}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${safeSenderEmail}</p>
      ${safeSenderPhone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${safeSenderPhone}</p>` : ""}
      <p style="margin:0;"><strong>Message:</strong><br />${safeMessage}</p>
    </div>
  `;

  await sendEmail(
    args.agentEmail,
    `New Viewing Request for ${args.listingTitle}`,
    standardEmailTemplate({
      title: "New Viewing Request",
      body: `<p>You have received a new viewing request for <strong>${safeTitle}</strong>.</p>${detailsBlock}<p>You can reply directly to this email to continue the conversation.</p>`,
      ctaHref: listingUrl,
      ctaLabel: "View Listing",
      eyebrow: "Viewing Request",
    }),
    args.senderEmail,
  );

  await sendEmail(
    args.senderEmail,
    `Your Viewing Request for ${args.listingTitle}`,
    standardEmailTemplate({
      title: "Viewing Request Sent",
      body: `<p>Thanks ${safeSenderName}, your viewing request has been sent to the listing owner for <strong>${safeTitle}</strong>.</p>${detailsBlock}<p>The owner can respond directly to your email address.</p>`,
      ctaHref: listingUrl,
      ctaLabel: "View Listing",
      eyebrow: "Confirmation",
    }),
  );
}

export async function sendListingRecommendationsEmail(args: {
  to: string;
  name?: string | null;
  filters: { city?: string | null; suburb?: string | null; query?: string | null; type?: string | null; purpose?: string | null };
  listings: Array<{ title: string; city: string; suburb: string; slug: string; imageUrl?: string | null; priceLabel?: string | null }>;
}) {
  const filterChips = [
    args.filters.suburb ? `<li><strong>Area/Suburb:</strong> ${args.filters.suburb}</li>` : "",
    args.filters.city ? `<li><strong>City:</strong> ${args.filters.city}</li>` : "",
    args.filters.query ? `<li><strong>Keyword:</strong> ${args.filters.query}</li>` : "",
    args.filters.type ? `<li><strong>Property Type:</strong> ${args.filters.type.replace(/_/g, " ")}</li>` : "",
    args.filters.purpose ? `<li><strong>Listing Type:</strong> ${args.filters.purpose}</li>` : "",
  ].filter(Boolean).join("");

  const listingItems = args.listings
    .map(
      (listing) => {
        const listingUrl = `${appBaseUrl}/listings/${listing.slug}`;
        const safeTitle = escapeHtml(listing.title);
        const safeLocation = escapeHtml(`${listing.suburb}, ${listing.city}`);
        const safePriceLabel = listing.priceLabel ? escapeHtml(listing.priceLabel) : null;
        const imageBlock = listing.imageUrl
          ? `<img src="${escapeHtml(listing.imageUrl)}" alt="${safeTitle}" style="display:block;width:100%;max-width:520px;height:auto;border-radius:10px;border:1px solid #E8E6E0;margin-bottom:10px;"/>`
          : "";

        return `<li style="list-style:none;margin:0 0 16px;padding:0;">
          <div style="border:1px solid #E8E6E0;border-radius:12px;padding:12px;">
            ${imageBlock}
            <a href="${listingUrl}" style="color:#1A1A2E;text-decoration:none;font-weight:700;font-size:16px;">${safeTitle}</a>
            <div style="font-size:13px;color:#5C5C6E;margin-top:6px;">${safeLocation}</div>
            ${safePriceLabel ? `<div style="font-size:13px;color:#1A1A2E;margin-top:4px;"><strong>Price:</strong> ${safePriceLabel}</div>` : ""}
            <a href="${listingUrl}" style="display:inline-block;margin-top:10px;background:#1A1A2E;color:#FFFFFF;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">View Property</a>
          </div>
        </li>`;
      },
    )
    .join("");

  return sendEmail(
    args.to,
    "New ChurchSpace listings that match your search",
    standardEmailTemplate({
      title: "New Listings You Might Like",
      body: `<p>Hi ${args.name ?? "there"}, new listings were added that match your recent search preferences.</p>
       <ul>${filterChips}</ul>
       <ul style="padding:0;margin:16px 0;">${listingItems}</ul>`,
      ctaHref: `${appBaseUrl}/listings`,
      ctaLabel: "View Matching Properties",
      eyebrow: "Recommendations",
    }),
  );
}
