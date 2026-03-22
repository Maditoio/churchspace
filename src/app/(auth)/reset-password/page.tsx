"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const hasResetToken = useMemo(() => token.length > 0, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasResetToken) {
      toast.error("Reset token is missing. Please use the email link.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Could not reset password.");
        return;
      }

      toast.success("Password reset successful. Please sign in.");
      router.push("/signin");
    } catch {
      toast.error("Could not reset password right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-(--radius) border border-(--border) bg-white p-6">
        <h1 className="font-display text-4xl text-foreground">Set New Password</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">Create a new password for your ChurchSpace account.</p>

        {!hasResetToken ? (
          <div className="mt-6 space-y-3 text-sm text-(--text-secondary)">
            <p>Reset token missing or invalid. Please request a new password reset link.</p>
            <Link href="/forgot-password" className="text-(--primary)">Go to Forgot Password</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <Input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />
            <Input
              type="password"
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
            />
            <Input
              type="password"
              value={confirmPassword}
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
