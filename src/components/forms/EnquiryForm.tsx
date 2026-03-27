"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type EnquiryFormProps = { listingId: string };

const defaultMessage = "Hello, I am interested in this property and would like to arrange a viewing. Please let me know the next available time and any details I should prepare.";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  message: defaultMessage,
};

export function EnquiryForm({ listingId }: EnquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(initialFormState);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | null>(null);

  const updateField = (field: keyof typeof initialFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
      if (feedbackMessage) {
        setFeedbackMessage(null);
        setFeedbackTone(null);
      }
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          senderName: formValues.name,
          senderEmail: formValues.email,
          senderPhone: formValues.phone,
          message: formValues.message,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; emailDispatch?: { senderConfirmationSent?: boolean } } | null;

      setLoading(false);
      if (!response.ok) {
        const errorMessage = payload?.error ?? "Could not send enquiry";
        setFeedbackMessage(errorMessage);
        setFeedbackTone("error");
        toast.error(errorMessage);
        return;
      }

      setFormValues(initialFormState);
      setFeedbackMessage(
        payload?.emailDispatch?.senderConfirmationSent === false
          ? "Your enquiry was sent to the listing owner. If the confirmation email does not arrive, please check your spam folder."
          : "Your enquiry was sent to the listing owner. A confirmation email is on its way."
      );
      setFeedbackTone("success");
      toast.success("Enquiry sent successfully");
    } catch {
      setLoading(false);
      setFeedbackMessage("Could not send enquiry");
      setFeedbackTone("error");
      toast.error("Could not send enquiry");
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input name="name" placeholder="Your name" required value={formValues.name} onChange={updateField("name")} />
      <Input name="email" type="email" placeholder="Email" required value={formValues.email} onChange={updateField("email")} />
      <Input name="phone" placeholder="Phone (optional)" value={formValues.phone} onChange={updateField("phone")} />
      <textarea
        name="message"
        required
        rows={5}
        value={formValues.message}
        onChange={updateField("message")}
        className="min-h-32 w-full rounded-lg border border-(--border) bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent)"
      />
      {feedbackMessage ? (
        <p className={feedbackTone === "error" ? "text-sm text-red-600" : "text-sm text-green-700"}>{feedbackMessage}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Request Viewing"}</Button>
    </form>
  );
}
