"use client";

import { LayoutList, UsersRound, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Requests", icon: LayoutList },
  { href: "/dashboard/participants", label: "Participants", icon: UserRound },
  { href: "/dashboard/team", label: "Team", icon: UsersRound },
];

export function DashboardTabs() {
  const pathname = usePathname();
  return (
    <div className="mt-6 inline-flex flex-wrap gap-1 rounded-2xl border border-ink-100 bg-white p-1.5 shadow-soft" role="tablist" aria-label="Dashboard sections">
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              active ? "bg-pine-800 text-cream-50 shadow" : "text-ink-500 hover:bg-cream-100 hover:text-ink-900",
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
