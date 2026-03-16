import Link from "next/link";
import { FEATURED_COUNTRIES } from "@/lib/locations";
import { slugify } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-5 md:px-8">
        <div>
          <h3 className="font-display text-3xl text-[var(--primary)]">ChurchSpace</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Premium marketplace for trusted church spaces across Africa.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Explore</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/listings">Listings</Link></li>
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Platform</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/admin">Admin</Link></li>
            <li><Link href="/signup">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Locations</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {FEATURED_COUNTRIES.slice(0, 6).map((country) => (
              <li key={country}>
                <Link href={`/locations/${slugify(country)}`} className="hover:text-[var(--text-primary)]">{country}</Link>
              </li>
            ))}
            <li><Link href="/locations" className="font-medium text-[var(--accent)] hover:underline">All Countries →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Contact</h4>
          <p className="text-sm text-[var(--text-secondary)]">hello@churchspace.co.za</p>
          <p className="text-sm text-[var(--text-secondary)]">+27 10 000 0000</p>
        </div>
      </div>
    </footer>
  );
}
