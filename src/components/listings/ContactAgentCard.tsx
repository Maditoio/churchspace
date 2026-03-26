import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

type Props = {
  listing: { id: string; title: string; slug: string; suburb: string; city: string };
  agent: { name: string | null; churchName?: string | null; denomination?: string | null; email: string; whatsapp?: string | null; avatar?: string | null };
};

export function ContactAgentCard({ listing, agent }: Props) {
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://churchspaces.co.za").replace(/\/$/, "");
  const normalizedPhone = agent.whatsapp
    ? (() => {
        const digits = agent.whatsapp.replace(/\D/g, "");
        if (!digits) return null;
        if (digits.startsWith("27")) return digits;
        if (digits.startsWith("0")) return `27${digits.slice(1)}`;
        return digits;
      })()
    : null;

  const whatsappMessage = encodeURIComponent(
    `Hi ${agent.name}, I found your listing *"${listing.title}"* on ChurchSpaces and I'm interested. Could you please provide more details? \n\n🏛️ Property: ${listing.title}\n📍 Location: ${listing.suburb}, ${listing.city}\n\nView listing: ${appBaseUrl}/listings/${listing.slug}`,
  );

  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${whatsappMessage}`
    : null;

  return (
    <div className="sticky top-24 space-y-4 rounded-(--radius) border border-(--border) bg-white p-5 shadow-(--shadow-lg)">
      <div className="flex items-center gap-3">
        <Avatar src={agent.avatar} name={agent.name} size={44} />
        <div>
          <p className="font-medium text-foreground">{agent.name ?? "Agent"}</p>
          <p className="text-sm text-(--text-secondary)">{agent.churchName ?? "Church community"}</p>
          <p className="text-xs text-(--text-muted)">{agent.denomination ?? "Faith community"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`mailto:${agent.email}`}><Button className="w-full">Send Email</Button></Link>

        {whatsappUrl ? (
          <Link href={whatsappUrl} target="_blank">
            <Button className="w-full bg-[#25D366] text-white hover:opacity-90">Chat on WhatsApp</Button>
          </Link>
        ) : null}
      </div>

      <div className="border-t border-(--border) pt-3">
        <p className="mb-2 text-sm font-medium text-foreground">Request Viewing</p>
        <EnquiryForm listingId={listing.id} />
      </div>
    </div>
  );
}
