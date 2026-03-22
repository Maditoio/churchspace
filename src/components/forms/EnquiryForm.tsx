"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type EnquiryFormProps = { listingId: string };

export function EnquiryForm({ listingId }: EnquiryFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        senderName: formData.get("name"),
        senderEmail: formData.get("email"),
        senderPhone: formData.get("phone"),
        message: formData.get("message"),
      }),
    });

    setLoading(false);
    if (!response.ok) {
      toast.error("Could not send enquiry");
      return;
    }

    event.currentTarget.reset();
    toast.success("Enquiry sent successfully");
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input name="name" placeholder="Your name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="phone" placeholder="Phone (optional)" />
      <Input name="message" placeholder="Your message" required />
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Request Viewing"}</Button>
    </form>
  );
}
