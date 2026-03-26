import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ChurchSpaces",
  description:
    "Read how ChurchSpaces collects, uses, stores, and protects personal information across accounts, listings, enquiries, saved searches, payments, uploads, and support requests.",
};

const sections = [
  {
    title: "1. Scope of This Policy",
    body: [
      "This Privacy Policy explains how ChurchSpaces collects, uses, stores, shares, and protects information when you browse the site, create an account, publish or manage listings, contact a property owner, save listings, save search alerts, receive notifications, pay listing fees, upload images, or contact support.",
      "This policy applies to information processed through our website, authenticated dashboard, public listing pages, administrative review workflows, email notifications, and support interactions. It covers both information you provide directly and information generated through your use of the platform.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "We collect account and profile information such as your name, email address, password, phone number, WhatsApp number, church name, denomination, role on the platform, avatar image, and profile thumbnail where provided.",
      "For listings, we collect and store the information you submit about a property or venue, including listing title, description, property type, listing type, address, suburb, city, province, country, optional map coordinates, congregation size, area, parking capacity, pricing information, deposit amounts, availability details, equipment, features, schedules, listing images, status history, and related moderation notes.",
      "For enquiries and communications, we collect sender name, sender email, optional sender phone number, message content, listing reference, delivery-related metadata, and the record of whether an enquiry has been read or responded to through the platform workflow.",
      "For saved experiences, we collect saved listings, saved search preferences, search alert filters, and notification records so that we can deliver relevant listing updates and make dashboard features function correctly.",
      "For payments, we collect limited payment-related information such as the listing being paid for, the account making payment, payment amount, currency, payment reference, provider name, status, paid date, and listing payment expiry details. Payment card information is typically handled by a third-party payment processor and not stored directly by ChurchSpaces unless specifically stated at the point of payment.",
      "We also collect technical and usage information that may include session identifiers, sign-in state, device or browser details, IP-derived location signals, referral information, and interaction data such as page visits, listing views, and platform usage patterns needed for security, fraud prevention, troubleshooting, analytics, and product improvement.",
    ],
  },
  {
    title: "3. How We Collect Information",
    body: [
      "We collect information directly from you when you register, sign in, edit your profile, upload an avatar, create or update a listing, upload listing photos, pay for a listing, save a listing, save alert criteria, submit an enquiry, or contact support.",
      "We collect information automatically when you use the site, including through cookies, authentication sessions, server logs, security systems, and application events that allow features such as notifications, listing review, dashboard access, and search recommendations to operate.",
      "We may also receive information from connected services or providers involved in authentication, email delivery, payment processing, media storage, hosting, or fraud detection, but only to the extent needed to operate the platform.",
    ],
  },
  {
    title: "4. Why We Use Personal Information",
    body: [
      "We use information to create and secure accounts, authenticate users, personalise dashboards, manage roles and permissions, and allow users to publish, edit, review, pay for, and remove listings.",
      "We use contact and listing information to process enquiries, deliver transactional emails, send password reset links, notify users about listing approvals or review decisions, and send saved-search recommendation emails when relevant listings become available.",
      "We use payment records to confirm listing activation periods, administer listing fees, investigate failed or disputed payments, reconcile platform records, and prevent abuse of paid features.",
      "We use uploads, profile data, listing images, and content metadata to display listings properly, optimise the browsing experience, support moderation, and maintain quality standards across public search results.",
      "We use technical information and platform activity for service security, debugging, access control, spam prevention, fraud prevention, performance monitoring, service improvement, and compliance with legal obligations.",
    ],
  },
  {
    title: "5. Lawful Bases and Consent",
    body: [
      "Where applicable, we process information because it is necessary to provide the services you request, to operate the platform, to take steps before entering into a service relationship, to comply with legal obligations, or to pursue legitimate interests such as platform safety, fraud prevention, communications, and service improvement.",
      "Where we rely on consent, such as for optional profile fields, saved searches, certain marketing-style communications, or non-essential contact preferences, you may withdraw that consent by changing your settings, deleting the relevant information, or contacting us.",
    ],
  },
  {
    title: "6. How Information Appears Publicly",
    body: [
      "Listings are intended to be publicly discoverable once approved and activated. Listing titles, descriptions, location information, features, images, pricing details, and other listing content you submit may appear in public search results, location pages, featured sections, social previews, structured metadata, and search engine indexes.",
      "Profile information that is not required for public display is generally kept within your account, internal workflows, or communications context. However, details you voluntarily include in public listing content may become visible to site visitors and search engines.",
    ],
  },
  {
    title: "7. Sharing of Information",
    body: [
      "We share information internally with authorised administrators or reviewers when needed to verify listings, handle disputes, investigate abuse, approve or reject content, maintain support operations, and administer the platform.",
      "We may share information with service providers that support hosting, infrastructure, authentication, email delivery, payment processing, media storage, monitoring, and security. These providers may process information on our behalf subject to contractual or technical controls appropriate to the service they provide.",
      "Enquiry details are shared with the relevant listing owner or representative so the requested communication can take place. Likewise, your saved search preferences may be used internally to deliver automated recommendation emails.",
      "We may disclose information where required by law, lawful request, court order, or regulatory process, or where necessary to protect rights, property, safety, users, the public, or the integrity of the platform.",
    ],
  },
  {
    title: "8. Payments",
    body: [
      "Listing payments are used to activate or maintain certain listing benefits and statuses on ChurchSpaces. Payment details stored by us generally include amount, currency, provider reference, status, and relevant listing association.",
      "Third-party payment providers may separately collect and process billing information, banking details, payment tokens, fraud checks, and compliance-related information under their own privacy terms. You should review the payment provider's terms when completing a transaction.",
      "We do not claim to store full payment card details unless explicitly indicated in a secure payment interface operated by us. In most cases, payment-sensitive information is processed outside our application environment by the payment provider.",
    ],
  },
  {
    title: "9. Cookies, Sessions, and Similar Technologies",
    body: [
      "We use cookies, session technologies, and similar mechanisms to keep you signed in, protect accounts, remember user state, support navigation, improve performance, and understand how features are being used.",
      "Some of these technologies are necessary for authentication, role-based access, form continuity, security, and dashboard functionality. Others may support measurement, diagnostics, or service improvement. If you disable cookies, parts of the site may not function correctly.",
    ],
  },
  {
    title: "10. Data Retention",
    body: [
      "We retain personal information for as long as reasonably necessary to provide services, maintain active accounts, support listings, process payments, enforce our terms, resolve disputes, comply with legal obligations, and protect the platform.",
      "Retention periods may differ depending on the type of information. For example, active listings, payment records, moderation history, support records, and security logs may be retained for different periods based on operational, legal, or compliance requirements.",
      "Where information is no longer needed, we may delete, anonymise, aggregate, or securely archive it, subject to applicable legal and technical constraints.",
    ],
  },
  {
    title: "11. Security",
    body: [
      "We use reasonable administrative, technical, and organisational safeguards designed to protect information against unauthorised access, alteration, disclosure, or destruction. These measures may include authentication controls, role restrictions, secure hosting practices, password protections, access logging, and provider-level security controls.",
      "No online service can guarantee absolute security. You are responsible for maintaining the confidentiality of your credentials, using strong passwords, and notifying us promptly if you believe your account or information has been compromised.",
    ],
  },
  {
    title: "12. Your Choices and Rights",
    body: [
      "Depending on your location and applicable law, you may have rights to access, correct, update, delete, restrict, object to, or request portability of certain personal information. You may also have the right to withdraw consent where processing is based on consent.",
      "You can update some information directly through your profile or dashboard, including profile details, listings, saved alerts, saved items, and account-related content. For requests that cannot be completed in self-service tools, contact us using the details below.",
    ],
  },
  {
    title: "13. Children's Privacy",
    body: [
      "ChurchSpaces is intended for use by adults and organisations managing property-related decisions. The platform is not intended for children to independently create accounts or transact on the service. If you believe a child has provided personal information improperly, contact us so we can review and take appropriate action.",
    ],
  },
  {
    title: "14. International Processing",
    body: [
      "Our service providers, infrastructure partners, or technical systems may operate in multiple jurisdictions. As a result, information may be processed or stored outside your province or country, subject to applicable law and the safeguards available through the relevant provider relationship.",
    ],
  },
  {
    title: "15. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in the platform, features, legal requirements, operational processes, or service providers. The updated version will apply from the date it is posted unless otherwise stated.",
    ],
  },
  {
    title: "16. Contact Us",
    body: [
      "If you have questions about this Privacy Policy, your information, or your privacy rights, contact ChurchSpaces via our support channels or email us at hello@churchspaces.church. Our office address is Johannesburg, Craddock Square Rosebank, 169 Oxford Road, Rosebank, Craddock Square, Johannesburg, 2196.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[var(--background)] py-16 md:py-20">
      <section className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Privacy Policy</p>
          <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)] md:text-5xl">How ChurchSpaces handles personal information</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
            This policy is designed for the way ChurchSpaces actually works: account creation, public property listings, search alerts,
            saved listings, listing enquiries, listing payments, uploaded media, notifications, support requests, and admin review.
          </p>
          <div className="mt-6 rounded-[24px] bg-[var(--surface-raised)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Last updated:</strong> 25 March 2026</p>
            <p className="mt-2"><strong className="text-[var(--text-primary)]">Summary:</strong> We collect the information needed to run the marketplace, authenticate users, manage listings, process enquiries, confirm listing payments, send relevant emails, and keep the platform safe.</p>
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
            <Link href="/user-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read User Policy
            </Link>
            <Link href="/support" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}