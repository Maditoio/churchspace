"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export function Navbar({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface-glass) backdrop-blur-xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--primary) text-lg text-white shadow-(--shadow-sm)">✝</span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-3xl text-(--primary)">ChurchSpaces</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">Property Marketplace</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 rounded-full border border-(--border) bg-white/70 p-2 shadow-(--shadow-sm) md:flex">
          <Link href="/listings" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Listings</Link>
          <Link href="/bond-calculator" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Bond Calculator</Link>
          <Link href="/about" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">About</Link>
          <Link href="/contact" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Contact</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard/listings/new"><Button variant="outlineAccent">List a Space</Button></Link>
          {session ? (
            <div className="flex items-center gap-2 rounded-full border border-(--border) bg-white/78 p-1.5 shadow-(--shadow-sm)">
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,239,230,0.95))] px-3 py-2 text-sm text-(--text-secondary) transition-transform hover:-translate-y-0.5 hover:text-(--primary)"
              >
                <Avatar src={session.user?.image} name={session.user?.name} size={34} />
                <span className="max-w-32 truncate font-semibold text-(--text-primary)">{session.user?.name ?? "Dashboard"}</span>
              </Link>
              <button
                aria-label="Sign out"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(123,84,42,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,235,0.96))] px-4 text-sm font-semibold text-(--text-primary) shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[rgba(123,84,42,0.28)] hover:text-(--primary)"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link href="/signin"><Button variant="ghost">Sign In</Button></Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button aria-label="Open menu" className="rounded-full border border-(--border) bg-white/80 p-2 shadow-(--shadow-sm) md:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-(--border) bg-white/95 p-6 backdrop-blur md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/listings" onClick={() => setOpen(false)}>Listings</Link>
            <Link href="/bond-calculator" onClick={() => setOpen(false)}>Bond Calculator</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            <Link href="/dashboard/listings/new" onClick={() => setOpen(false)}>
              <Button variant="accent" className="w-full">List a Space</Button>
            </Link>
            {session ? (
              <>
                <div className="rounded-[24px] border border-(--border) bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,239,230,0.96))] p-4 shadow-(--shadow-sm)">
                  <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <Avatar src={session.user?.image} name={session.user?.name} size={40} />
                    <span className="font-semibold text-(--text-primary)">{session.user?.name ?? (isAdmin ? "Admin Panel" : "Dashboard")}</span>
                  </Link>
                </div>
                <Link href="/dashboard/alerts" onClick={() => setOpen(false)}>Listing Alerts</Link>
                <Link href="/dashboard/profile" onClick={() => setOpen(false)}>Profile</Link>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(123,84,42,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,235,0.96))] px-4 py-3 text-sm font-semibold text-(--text-primary) shadow-(--shadow-sm)"
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
