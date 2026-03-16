import { SignUpForm } from "@/components/forms/AuthForms";

export default function SignUpPage() {
  return (
    <div className="mx-auto grid min-h-[80vh] max-w-[1200px] px-4 py-12 md:grid-cols-2 md:px-8">
      <div className="hidden rounded-l-[var(--radius-lg)] bg-[linear-gradient(145deg,#1A1A2E,#16213E)] p-10 text-white md:block">
        <h2 className="font-display text-6xl">&ldquo;Build, gather, and grow in sacred spaces.&rdquo;</h2>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 md:rounded-l-none">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Create Account</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Join ChurchSpace and list your facilities with confidence.</p>
        <div className="mt-6"><SignUpForm /></div>
      </div>
    </div>
  );
}
