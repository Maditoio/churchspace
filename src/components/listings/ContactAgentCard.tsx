import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

type Props = {
  listing: { id: string; title: string; slug: string; suburb: string; city: string };
  agent: { name: string | null; churchName?: string | null; denomination?: string | null; email: string; whatsapp?: string | null; avatar?: string | null };
};

export function ContactAgentCard({ listing, agent }: Props) {
  const whatsappMessage = encodeURIComponent(
    `Hi ${agent.name}, I found your listing *"${listing.title}"* on ChurchSpace and I'm interested. Could you please provide more details? \n\n🏛️ Property: ${listing.title}\n📍 Location: ${listing.suburb}, ${listing.city}\n\nView listing: https://churchspace.co.za/listings/${listing.slug}`,
  );

  const whatsappUrl = agent.whatsapp
    ? `https://wa.me/${agent.whatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <div className="sticky top-24 space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-3">
        <Avatar src={agent.avatar} name={agent.name} size={44} />
        <div>
          <p className="font-medium text-[var(--text-primary)]">{agent.name ?? "Agent"}</p>
          <p className="text-sm text-[var(--text-secondary)]">{agent.churchName ?? "Church community"}</p>
          <p className="text-xs text-[var(--text-muted)]">{agent.denomination ?? "Faith community"}</p>
        </div>
      </div>

      <Link href={`mailto:${agent.email}`}><Button className="w-full">Send Email</Button></Link>

      {whatsappUrl ? (
        <Link href={whatsappUrl} target="_blank">
          <Button className="w-full bg-[#25D366] text-white hover:opacity-90">Chat on WhatsApp</Button>
        </Link>
      ) : null}

      <div className="border-t border-[var(--border)] pt-3">
        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Request Viewing</p>
        <EnquiryForm listingId={listing.id} />
      </div>
    </div>
  );
}
