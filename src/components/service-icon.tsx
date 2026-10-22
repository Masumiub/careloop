"use client";

import {
  Activity,
  Armchair,
  Bus,
  ChefHat,
  HandHeart,
  HelpCircle,
  MonitorSmartphone,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  HandHeart,
  Sparkles,
  ChefHat,
  Bus,
  Users,
  Activity,
  Armchair,
  Wrench,
  MonitorSmartphone,
};

const TINTS: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  leaf: "bg-emerald-100 text-emerald-700",
  teal: "bg-teal-100 text-teal-700",
  indigo: "bg-indigo-100 text-indigo-700",
  orange: "bg-orange-100 text-orange-700",
  cyan: "bg-cyan-100 text-cyan-700",
};

export function ServiceIcon({
  icon,
  tint,
  size = "md",
  className,
}: {
  icon: string;
  tint?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = ICONS[icon] ?? HelpCircle;
  const sizes = {
    sm: "h-9 w-9 rounded-xl [&_svg]:h-4.5 [&_svg]:w-4.5",
    md: "h-11 w-11 rounded-2xl [&_svg]:h-5.5 [&_svg]:w-5.5",
    lg: "h-14 w-14 rounded-2xl [&_svg]:h-7 [&_svg]:w-7",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        TINTS[tint ?? "teal"] ?? TINTS.teal,
        sizes[size],
        className,
      )}
    >
      <Icon aria-hidden />
    </span>
  );
}
