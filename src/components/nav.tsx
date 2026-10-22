"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Our Services" },
  { href: "/request", label: "Request Help" },
  { href: "/my-requests", label: "My Requests" },
  { href: "/dashboard", label: "Staff Dashboard" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-ink-100 bg-cream-100/90 shadow-soft backdrop-blur-xl"
          : "border-transparent bg-cream-100",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="CareLoop home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-800 text-wattle-300 shadow-soft">
            <HeartHandshake className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-black tracking-tight text-pine-900">
            Care<span className="text-coral-600">Loop</span>
          </span>
          <span className="hidden rounded-full bg-pine-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pine-700 sm:inline">
            AU
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "text-pine-900"
                  : "text-ink-500 hover:bg-white/70 hover:text-ink-900",
              )}
            >
              {isActive(link.href) ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-white shadow-soft ring-1 ring-ink-100"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/request"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-pine-800 px-5 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-pine-700"
          >
            Get support today
          </Link>
        </div>

        <button
          className="rounded-xl p-2 text-ink-700 hover:bg-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-ink-100 bg-cream-100 lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold transition",
                    isActive(link.href)
                      ? "bg-pine-800 text-cream-50"
                      : "text-ink-700 hover:bg-white",
                  )}
                >
                  {link.label}
                  {link.href === "/dashboard" ? <LayoutDashboard className="h-4 w-4" aria-hidden /> : null}
                </Link>
              ))}
              <Link
                href="/request"
                className="mt-2 flex h-12 items-center justify-center rounded-xl bg-wattle-400 text-[15px] font-bold text-pine-950"
              >
                Get support today
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
