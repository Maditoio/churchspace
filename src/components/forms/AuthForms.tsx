"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        callbackUrl,
        redirect: false,
      });

      setLoading(false);
      if (!result) {
        toast.error("Could not reach sign-in service. Please try again.");
        return;
      }

      if (!result.error) {
        router.replace(result.url ?? callbackUrl);
        router.refresh();
        return;
      }

      if (result.error === "CredentialsSignin") {
        toast.error("Invalid email or password.");
        return;
      }

      toast.error("Sign in failed. Please try again.");
    } catch {
      setLoading(false);
      toast.error("Sign in failed due to a network error.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        churchName: form.get("churchName"),
        denomination: form.get("denomination"),
        phone: form.get("phone"),
        whatsapp: form.get("whatsapp"),
      }),
    });

    setLoading(false);

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(result?.error ?? "Could not create account.");
      return;
    }

    toast.success("Account created. You can sign in now.");
    router.push("/signin");
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input name="name" placeholder="Full name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="churchName" placeholder="Church name" required />
      <Input name="denomination" placeholder="Denomination (optional)" />
      <Input name="phone" placeholder="Phone" required />
      <Input name="whatsapp" placeholder="WhatsApp (optional)" />
      <Input name="password" type="password" placeholder="Password" required />
      <label className="text-sm text-(--text-secondary)"><input type="checkbox" className="mr-2" required />I agree to the terms.</label>
      <Button variant="accent" className="w-full" type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
    </form>
  );
}
