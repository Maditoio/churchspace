import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="font-display text-3xl text-[var(--primary)]">ChurchSpace</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Premium marketplace for trusted church spaces across South Africa.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Explore</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/listings">Listings</Link></li>
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
          <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Contact</h4>
          <p className="text-sm text-[var(--text-secondary)]">hello@churchspace.co.za</p>
          <p className="text-sm text-[var(--text-secondary)]">+27 10 000 0000</p>
        </div>
      </div>
    </footer>
  );
}
