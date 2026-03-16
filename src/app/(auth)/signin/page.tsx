import Link from "next/link";
import { SignInForm } from "@/components/forms/AuthForms";

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-md)]">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Welcome Back</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to manage your church listings.</p>
        <div className="mt-6"><SignInForm /></div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-[var(--primary)]">Forgot password?</Link>
          <Link href="/signup" className="text-[var(--primary)]">Create one</Link>
        </div>
      </div>
    </div>
  );
}
