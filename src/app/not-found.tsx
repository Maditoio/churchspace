import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[900px] flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-[var(--accent)]">404</p>
      <h1 className="font-display text-6xl text-[var(--text-primary)]">Sacred Space Not Found</h1>
      <p className="mt-3 max-w-xl text-[var(--text-secondary)]">The page you requested is unavailable. Return to listings to continue exploring trusted church spaces.</p>
      <Link href="/listings" className="mt-8"><Button variant="accent">Return to Listings</Button></Link>
    </div>
  );
}