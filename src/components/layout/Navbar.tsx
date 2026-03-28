"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Menu, X, LogOut, Bell, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export function Navbar({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

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
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/listings" className="text-sm font-medium text-(--text-secondary) hover:text-(--primary)">Listings</Link>
          <Link href="/bond-calculator" className="text-sm font-medium text-(--text-secondary) hover:text-(--primary)">Bond Calculator</Link>
          <Link href="/about" className="text-sm font-medium text-(--text-secondary) hover:text-(--primary)">About</Link>
          <Link href="/contact" className="text-sm font-medium text-(--text-secondary) hover:text-(--primary)">Contact</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/dashboard/listings/new"><Button variant="outlineAccent">List a Space</Button></Link>
          {session ? (
            <div className="flex items-center gap-3">
              {/* Notifications icon */}
              <Link
                href="/dashboard/notifications"
                aria-label="Notifications"
                className="rounded-full border border-(--border) bg-white/70 p-2.5 transition-all hover:bg-(--primary-soft) hover:text-(--primary) shadow-(--shadow-sm)"
              >
                <Bell className="h-5 w-5 text-(--text-secondary)" />
              </Link>

              {/* Avatar dropdown trigger */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-(--border) bg-white/78 p-1.5 transition-all hover:bg-(--primary-soft) shadow-(--shadow-sm)"
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size={34} />
                  <ChevronDown className="h-4 w-4 text-(--text-secondary)" />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-[20px] border border-(--border) bg-white shadow-(--shadow-lg) z-50">
                    <nav className="flex flex-col">
                      <Link
                        href={isAdmin ? "/admin" : "/dashboard"}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary) first:rounded-t-[20px]"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary)"
                      >
                        Notifications
                      </Link>
                      <Link
                        href="/dashboard/listings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary)"
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary)"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary)"
                      >
                        Support
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-(--primary-soft) hover:text-(--primary) last:rounded-b-[20px]"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </nav>
                  </div>
                )}
              </div>
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
                <div className="rounded-3xl border border-(--border) bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,239,230,0.96))] p-4 shadow-(--shadow-sm)">
                  <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <Avatar src={session.user?.image} name={session.user?.name} size={40} />
                    <span className="font-semibold text-foreground">{session.user?.name ?? (isAdmin ? "Admin Panel" : "Dashboard")}</span>
                  </Link>
                </div>
                <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>Notifications</Link>
                <Link href="/dashboard/listings" onClick={() => setOpen(false)}>My Listings</Link>
                <Link href="/dashboard/alerts" onClick={() => setOpen(false)}>Listing Alerts</Link>
                <Link href="/dashboard/profile" onClick={() => setOpen(false)}>Profile</Link>
                <Link href="/support" onClick={() => setOpen(false)}>Support</Link>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(123,84,42,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,235,0.96))] px-4 py-3 text-sm font-semibold text-foreground shadow-(--shadow-sm)"
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
            <div className="mt-2 border-t border-(--border) pt-4 text-sm text-(--text-secondary)">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy-policy" onClick={() => setOpen(false)} className="hover:text-(--primary)">Privacy Policy</Link>
                <Link href="/user-policy" onClick={() => setOpen(false)} className="hover:text-(--primary)">User Policy</Link>
                <Link href="/refund-policy" onClick={() => setOpen(false)} className="hover:text-(--primary)">Refund Policy</Link>
                <Link href="/disclaimer" onClick={() => setOpen(false)} className="hover:text-(--primary)">Disclaimer</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
