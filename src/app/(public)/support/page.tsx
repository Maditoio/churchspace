import { Mail, MessageCircle, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata = {
  title: "Support | ChurchSpaces",
  description: "Get help and support from ChurchSpaces. Contact us via chat, email, or phone.",
};

export default function SupportPage() {
  const supportChannels = [
    {
      id: "chat",
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: MessageCircle,
      action: "Start Chat",
      href: "#",
      comingSoon: true,
    },
    {
      id: "email",
      title: "Email Support",
      description: "Send us an email and we&apos;ll respond within 24 hours",
      icon: Mail,
      action: "Send Email",
      href: "mailto:support@churchspaces.co.za",
    },
    {
      id: "phone",
      title: "Phone Support",
      description: "Call us during business hours (Mon-Fri, 9am-5pm SAST)",
      icon: Phone,
      action: "Call Now",
      href: "tel:+27123456789",
      comingSoon: true,
    },
    {
      id: "faq",
      title: "FAQ & Documentation",
      description: "Browse our help center for common questions and guides",
      icon: FileText,
      action: "View FAQ",
      href: "/faq",
    },
  ];

  return (
    <main className="min-h-screen bg-(--surface-base) py-16">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-(--text-primary) mb-4">
          How can we help?
        </h1>
        <p className="text-lg text-(--text-secondary) max-w-2xl mx-auto">
          We&apos;re here to support you. Choose your preferred way to get in touch with our team.
        </p>
      </section>

      {/* Support Channels Grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div
                key={channel.id}
                className="rounded-[24px] border border-(--border) bg-white p-8 shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-soft)">
                    <Icon className="h-6 w-6 text-(--primary)" />
                  </div>
                  {channel.comingSoon && (
                    <span className="text-xs font-semibold text-(--accent-strong) bg-(--accent-soft) px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-(--text-primary) mb-2">
                  {channel.title}
                </h2>
                <p className="text-(--text-secondary) mb-6 text-sm leading-relaxed">
                  {channel.description}
                </p>

                {channel.comingSoon ? (
                  <button
                    disabled
                    className="w-full px-4 py-2.5 rounded-full border border-(--border) bg-(--surface-raised) text-sm font-medium text-(--text-tertiary) cursor-not-allowed opacity-60"
                  >
                    {channel.action}
                  </button>
                ) : (
                  <Link href={channel.href} className="w-full block">
                    <Button variant="primary" className="w-full">
                      {channel.action}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="rounded-[24px] border border-(--border) bg-white p-8 sm:p-12">
          <h2 className="text-2xl font-display font-bold text-(--text-primary) mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between py-4 px-0 border-b border-(--border) text-lg font-medium text-(--text-primary) hover:text-(--primary) transition-colors">
                <span>How do I list a property?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="pt-4 pb-4 text-(--text-secondary)">
                Visit your dashboard and click &quot;List a Space&quot;. Follow the wizard to add your property details, photos, and availability. Most listings take about 10 minutes to complete.
              </p>
            </details>
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between py-4 px-0 border-b border-(--border) text-lg font-medium text-(--text-primary) hover:text-(--primary) transition-colors">
                <span>What payment methods are accepted?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="pt-4 pb-4 text-(--text-secondary)">
                We accept online payments via Paystack in ZAR. The standard listing fee is 450 ZAR per property listing.
              </p>
            </details>
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between py-4 px-0 border-b border-(--border) text-lg font-medium text-(--text-primary) hover:text-(--primary) transition-colors">
                <span>How long does approval take?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="pt-4 pb-4 text-(--text-secondary)">
                Most listings are approved within 24-48 hours. Our admin team reviews each listing for accuracy and compliance with our community standards.
              </p>
            </details>
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between py-4 px-0 border-b border-(--border) text-lg font-medium text-(--text-primary) hover:text-(--primary) transition-colors">
                <span>Can I save searches or alerts?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="pt-4 pb-4 text-(--text-secondary)">
                Yes! You can save custom search filters in your dashboard. You&apos;ll receive email notifications whenever new listings match your saved searches.
              </p>
            </details>
          </div>
          <div className="mt-8 pt-8 border-t border-(--border)">
            <p className="text-(--text-secondary) mb-4">Still have questions?</p>
            <Link href="mailto:support@churchspaces.co.za">
              <Button variant="outlineAccent">Contact Support</Button>
            </Link>
            <div className="mt-6 rounded-[20px] bg-(--surface-raised) p-5 text-sm leading-6 text-(--text-secondary)">
              Before contacting support, you can also review our <Link href="/privacy-policy" className="font-medium text-(--primary) hover:underline">Privacy Policy</Link> and <Link href="/user-policy" className="font-medium text-(--primary) hover:underline">User Policy</Link> for details about how ChurchSpaces handles accounts, listings, enquiries, payments, and user responsibilities.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
