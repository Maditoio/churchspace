"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Trigger the Resend magic-link flow via NextAuth email provider
      const res = await signIn("resend", { email, redirect: false, callbackUrl: "/dashboard" });
      if (res?.error) throw new Error(res.error);
      setSent(true);
    } catch {
      toast.error("Could not send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-(--radius) border border-(--border) bg-white p-6">
        <h1 className="font-display text-4xl text-(--text-primary)">Reset Password</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">Enter your email to receive a sign-in link.</p>
        {sent ? (
          <div className="mt-6 rounded-(--radius) bg-(--accent-light) p-4 text-sm text-(--primary)">
            Check your inbox — a magic sign-in link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Send Sign-In Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
