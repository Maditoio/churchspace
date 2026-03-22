"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
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
            <span className="font-display text-3xl text-(--primary)">ChurchSpace</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">Property Marketplace</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 rounded-full border border-(--border) bg-white/70 p-2 shadow-(--shadow-sm) md:flex">
          <Link href="/listings" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Listings</Link>
          <Link href="/bond-calculator" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Bond Calculator</Link>
          <Link href="/about" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">About</Link>
          <Link href="/contact" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Contact</Link>
          <Link href="/test-upload" className="rounded-full px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)">Test Upload</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard/listings/new"><Button variant="outlineAccent">List a Space</Button></Link>
          {session ? (
            <div className="flex items-center gap-2 rounded-full border border-(--border) bg-white/72 p-1.5 shadow-(--shadow-sm)">
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 rounded-full px-2 py-1 text-sm text-(--text-secondary) hover:text-(--primary)">
                <Avatar src={session.user?.image} name={session.user?.name} size={32} />
                <span className="max-w-28 truncate">{session.user?.name ?? "Dashboard"}</span>
              </Link>
              <button
                aria-label="Sign out"
                className="rounded-full p-2 text-(--text-secondary) hover:bg-(--surface-raised) hover:text-(--primary)"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
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
            <Link href="/test-upload" onClick={() => setOpen(false)}>Test Upload</Link>
            <Link href="/dashboard/listings/new" onClick={() => setOpen(false)}>
              <Button variant="accent" className="w-full">List a Space</Button>
            </Link>
            {session ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> {isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
                <button
                  className="flex items-center gap-2 text-sm text-(--destructive)"
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
