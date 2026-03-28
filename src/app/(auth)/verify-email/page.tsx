import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Verify Email | ChurchSpaces",
  robots: { index: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl">✓</div>
        <h1 className="mt-6 font-display text-4xl text-foreground">Email Verified</h1>
        <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
          Your email address has been verified and your account is now active. A welcome email is on its way. You can sign in below.
        </p>
        <Link href="/signin" className="mt-8 inline-block">
          <Button variant="accent">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (error === "expired") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl">⏱</div>
        <h1 className="mt-6 font-display text-4xl text-foreground">Link Expired</h1>
        <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
          Your verification link has expired. Please register again or contact{" "}
          <a href="mailto:support@churchspaces.church" className="text-(--primary) hover:underline">
            support@churchspaces.church
          </a>
          .
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button variant="outlineAccent">Register Again</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl">✕</div>
        <h1 className="mt-6 font-display text-4xl text-foreground">Invalid Link</h1>
        <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
          This verification link is invalid or has already been used. Please try signing in or contact{" "}
          <a href="mailto:support@churchspaces.church" className="text-(--primary) hover:underline">
            support@churchspaces.church
          </a>
          .
        </p>
        <Link href="/signin" className="mt-8 inline-block">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Default: just registered — awaiting verification
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-5xl">✉</div>
      <h1 className="mt-6 font-display text-4xl text-foreground">Check Your Email</h1>
      <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
        We sent a verification link to your email address. Click the link to activate your account. The link expires in 24 hours.
      </p>
      <p className="mt-4 text-sm text-(--text-muted)">
        Didn&apos;t receive it? Check your spam folder or contact{" "}
        <a href="mailto:support@churchspaces.church" className="text-(--primary) hover:underline">
          support@churchspaces.church
        </a>
        .
      </p>
    </div>
  );
}
