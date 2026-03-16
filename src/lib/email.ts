import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const brandStyles = `
  font-family: 'DM Sans', Arial, sans-serif;
  color: #1A1A2E;
`;

function wrapTemplate(title: string, body: string, ctaHref?: string, ctaLabel?: string) {
  return `
    <div style="background:#FAFAF8;padding:32px;${brandStyles}">
      <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E6E0;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:28px;">Church<span style="color:#C9A96E">Space</span></h1>
        <h2 style="margin:0 0 12px;font-size:22px;color:#1A1A2E;">${title}</h2>
        <div style="font-size:15px;line-height:1.6;color:#5C5C6E;">${body}</div>
        ${
          ctaHref && ctaLabel
            ? `<a href="${ctaHref}" style="display:inline-block;margin-top:20px;background:#C9A96E;color:#1A1A2E;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">${ctaLabel}</a>`
            : ""
        }
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  return sendEmail(
    to,
    "Welcome to ChurchSpace",
    wrapTemplate(
      "Welcome to ChurchSpace",
      `<p>Hi ${name ?? "there"}, welcome to ChurchSpace. You can now list, discover, and connect with trusted church spaces across South Africa.</p>`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      "Go to Dashboard",
    ),
  );
}

export async function sendListingStatusEmail(args: { to: string; status: "approved" | "rejected" | "submitted"; title: string; reason?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://churchspace.co.za";
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
    wrapTemplate(selected.title, selected.body, `${baseUrl}/dashboard/listings`, "View My Listings"),
  );
}

export async function sendEnquiryEmails(args: {
  agentEmail: string;
  senderEmail: string;
  senderName: string;
  listingTitle: string;
  message: string;
}) {
  const baseBody = `<p><strong>Listing:</strong> ${args.listingTitle}</p><p><strong>From:</strong> ${args.senderName} (${args.senderEmail})</p><p>${args.message}</p>`;

  await sendEmail(
    args.agentEmail,
    `New Enquiry for ${args.listingTitle}`,
    wrapTemplate("New Enquiry Received", baseBody),
  );

  await sendEmail(
    args.senderEmail,
    `We sent your enquiry for ${args.listingTitle}`,
    wrapTemplate("Enquiry Confirmation", `<p>Thanks ${args.senderName}, your enquiry has been sent to the listing agent.</p>${baseBody}`),
  );
}
