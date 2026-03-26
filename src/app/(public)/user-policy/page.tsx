import Link from "next/link";

export const metadata = {
  title: "User Policy | ChurchSpaces",
  description:
    "Read the ChurchSpaces user policy covering accounts, listings, content rules, enquiries, payments, moderation, acceptable use, and enforcement.",
};

const sections = [
  {
    title: "1. Purpose of This Policy",
    body: [
      "This User Policy sets out the rules, responsibilities, standards, and platform expectations that apply when you use ChurchSpaces. It is intended to protect users, improve listing quality, reduce abuse, support fair administration, and clarify what is and is not allowed on the platform.",
      "By creating an account, publishing a listing, saving content, sending an enquiry, paying for a listing feature, or using any dashboard or support function, you agree to follow this policy together with any other applicable terms, notices, and laws.",
    ],
  },
  {
    title: "2. Who May Use ChurchSpaces",
    body: [
      "You may use ChurchSpaces only if you can lawfully enter into binding obligations and provide truthful account information. If you are acting for a church, ministry, organisation, agent, or property owner, you must have authority to represent that person or entity in relation to the listing or enquiry activity you perform on the platform.",
      "You are responsible for keeping your account credentials secure and for all activity that occurs through your account unless you promptly report unauthorised use.",
    ],
  },
  {
    title: "3. Account Standards",
    body: [
      "You must provide accurate, current, and complete registration and profile information, including a valid email address. You may not impersonate another person, misrepresent your identity, create accounts for deceptive purposes, or use false ownership details in connection with a listing.",
      "You must keep your profile and contact details reasonably up to date so enquiries, review notices, payment confirmations, and support communications can reach you when needed.",
    ],
  },
  {
    title: "4. Listing Responsibilities",
    body: [
      "If you create a listing, you are responsible for ensuring the listing accurately describes the property, its condition, availability, pricing, location, photos, ownership or authority status, permitted uses, and any material restrictions or limitations.",
      "You may only list spaces you own, manage, represent, or are otherwise authorised to market. You must not publish misleading pricing, incorrect location details, manipulated images, fictitious availability, or claims you cannot substantiate.",
      "You are responsible for keeping listings updated when a space is no longer available, is taken, has changed price, or no longer matches the published description.",
    ],
  },
  {
    title: "5. Content Rules",
    body: [
      "All content submitted to ChurchSpaces, including listing descriptions, images, profile content, messages, support submissions, and public-facing metadata, must be lawful, accurate, respectful, and suitable for a professional property marketplace.",
      "You must not upload or submit content that is fraudulent, defamatory, abusive, hateful, discriminatory, sexually explicit, violent, invasive of privacy, misleading, infringing, spam-like, malicious, or otherwise unlawful.",
      "You must not upload images or information that you do not have the right to use, share, licence, or display. You remain responsible for the legality and accuracy of all content you provide.",
    ],
  },
  {
    title: "6. Enquiries and Communications",
    body: [
      "When you send an enquiry, you must provide genuine contact details and communicate in good faith. Enquiry tools may not be used for harassment, spam, data harvesting, scams, unrelated marketing, or repeated unwanted contact.",
      "If you receive an enquiry as a listing owner or representative, you must use the information responsibly and only for handling the property-related request that the user initiated, unless you have another lawful basis to contact them.",
    ],
  },
  {
    title: "7. Saved Listings, Alerts, and Notifications",
    body: [
      "Saved listings, saved search preferences, and notifications are intended to help users track relevant opportunities. You must not use these features in a way that interferes with the platform, creates abusive automation, or generates excessive or malicious system activity.",
      "We may limit, suspend, or adjust how these features work where necessary for performance, fraud prevention, security, or product changes.",
    ],
  },
  {
    title: "8. Payments and Paid Features",
    body: [
      "Where ChurchSpaces charges a listing fee or similar payment, you are responsible for ensuring that the payment information you provide is authorised and accurate. Paid features may be linked to listing activation, payment status, listing visibility periods, or related listing benefits.",
      "Payment does not guarantee permanent visibility, uninterrupted availability, approval of a listing, or immunity from moderation or enforcement. Listings may still be edited, suspended, rejected, removed, or investigated if they breach platform rules, legal requirements, or quality standards.",
      "You are responsible for reviewing the price, currency, renewal or expiry implications, and any relevant provider terms before completing payment.",
    ],
  },
  {
    title: "9. Prohibited Conduct",
    body: [
      "You may not use ChurchSpaces to scrape data, reverse engineer the service, bypass access restrictions, test vulnerabilities without permission, overload infrastructure, deploy bots in abusive ways, spread malware, manipulate ranking or engagement metrics, or interfere with other users' access to the platform.",
      "You may not use the service to facilitate fraud, impersonation, phishing, money laundering, property scams, misleading fundraising, or any other unlawful or deceptive conduct.",
      "You may not copy large parts of listing data, images, or platform design for competing services or unauthorised commercial reuse.",
    ],
  },
  {
    title: "10. Moderation and Enforcement",
    body: [
      "ChurchSpaces may review listings, messages, uploads, payment records, account activity, and related content to maintain trust, quality, legal compliance, and platform safety. We may request edits, additional verification, clarification, or supporting information where needed.",
      "We may refuse, unpublish, suspend, restrict, or remove listings or accounts, with or without prior notice where appropriate, if we reasonably believe there is a breach of this policy, a legal risk, a security concern, a fraud risk, or a risk of harm to the platform or other users.",
      "Enforcement decisions may include content removal, role restriction, account suspension, payment-related restrictions, limitation of feature access, or referral to legal or regulatory authorities where required.",
    ],
  },
  {
    title: "11. Intellectual Property and Content Permission",
    body: [
      "You retain ownership of the content you lawfully submit, but you grant ChurchSpaces the permission reasonably necessary to host, reproduce, process, adapt, format, display, promote, and distribute that content within the operation and marketing of the platform, including search previews, social sharing previews, listing pages, recommendation emails, and administrative review tools.",
      "This permission is limited to operating, improving, promoting, securing, and administering the service and continues only for as long as reasonably necessary in line with platform operations, legal obligations, and archival needs.",
    ],
  },
  {
    title: "12. Platform Availability and Disclaimer",
    body: [
      "ChurchSpaces provides a marketplace and workflow platform. We do not independently guarantee every statement made in a listing, every user's identity, every payment outcome, or the suitability of every property for a particular purpose. Users should perform their own due diligence before entering into off-platform agreements or making operational decisions based on listing content.",
      "We aim to keep the service available and accurate, but features may change, pause, or fail due to maintenance, third-party outages, technical issues, moderation actions, or legal obligations.",
    ],
  },
  {
    title: "13. Limitation of Responsibility",
    body: [
      "To the extent permitted by law, ChurchSpaces is not responsible for indirect, incidental, consequential, special, or business-interruption losses arising from platform use, listing inaccuracies, failed communications, user misconduct, third-party services, payment provider issues, or decisions made using information found on the platform.",
      "Nothing in this policy is intended to exclude liability that cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    title: "14. Reporting Problems",
    body: [
      "If you believe a listing is misleading, abusive, infringing, fraudulent, or otherwise problematic, or if you believe a user has breached this policy, contact support with enough information for us to investigate. We may request screenshots, links, supporting documents, or identity confirmation where needed.",
    ],
  },
  {
    title: "15. Changes to This Policy",
    body: [
      "We may update this User Policy as the platform evolves, including when features, moderation practices, payments, legal requirements, or operational processes change. Continued use of ChurchSpaces after an update takes effect means you accept the revised policy, subject to applicable law.",
    ],
  },
  {
    title: "16. Contact",
    body: [
      "For questions about this User Policy, reports, enforcement requests, or support matters, contact ChurchSpaces via the support page or email hello@churchspaces.church. Our office address is Johannesburg, Craddock Square Rosebank, 169 Oxford Road, Rosebank, Craddock Square, Johannesburg, 2196.",
    ],
  },
];

export default function UserPolicyPage() {
  return (
    <main className="bg-[var(--background)] py-16 md:py-20">
      <section className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">User Policy</p>
          <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Rules for using ChurchSpaces responsibly</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
            This policy covers how users should behave on ChurchSpaces, how listings should be managed, how enquiries and
            payments should be handled, and how moderation works when platform rules are broken.
          </p>
          <div className="mt-6 rounded-[24px] bg-[var(--surface-raised)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Last updated:</strong> 25 March 2026</p>
            <p className="mt-2"><strong className="text-[var(--text-primary)]">Summary:</strong> Be accurate, act in good faith, use listing and enquiry tools for legitimate property activity, and do not misuse platform content, payments, or other users&apos; information.</p>
          </div>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text-secondary)] md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-[var(--border)] pt-8">
            <Link href="/privacy-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read Privacy Policy
            </Link>
            <Link href="/support" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Get Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}