import Link from "next/link";
import { Facebook, Twitter } from "lucide-react";
import { getFeaturedCountriesFromListings } from "@/lib/locations";
import { slugify } from "@/lib/utils";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M14.2 3c.3 1.8 1.4 3.2 3.4 3.9v2.5a7 7 0 0 1-3.4-1V14a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v2.9a2.8 2.8 0 1 0 1.6 2.6V3h3z" />
    </svg>
  );
}

export async function Footer() {
  const featuredCountries = await getFeaturedCountriesFromListings(6);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5 md:px-8">
        <div>
          <h3 className="font-display text-3xl text-[var(--primary)]">ChurchSpaces</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Premium marketplace for trusted church spaces across Africa.</p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.tiktok.com/@churchspaces"
              target="_blank"
              rel="noreferrer"
              aria-label="ChurchSpaces on TikTok"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://twitter.com/churchspaces"
              target="_blank"
              rel="noreferrer"
              aria-label="ChurchSpaces on Twitter"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61577117912533"
              target="_blank"
              rel="noreferrer"
              aria-label="ChurchSpaces on Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Explore</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/listings">Listings</Link></li>
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/bond-calculator">Bond Calculator</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Platform</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/admin">Admin</Link></li>
            <li><Link href="/signup">Create Account</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Locations</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {featuredCountries.map((country) => (
              <li key={country}>
                <Link href={`/locations/${slugify(country)}`} className="hover:text-[var(--text-primary)]">{country}</Link>
              </li>
            ))}
            <li><Link href="/locations" className="font-medium text-[var(--accent)] hover:underline">All Countries →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Legal</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/user-policy">User Policy</Link></li>
            <li><Link href="/refund-policy">Refund Policy</Link></li>
            <li><Link href="/disclaimer">Disclaimer</Link></li>
            <li><Link href="/disputes">File a Dispute</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
