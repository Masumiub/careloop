"use client";

import { AlertOctagon, ArrowDown, ArrowRight, ArrowUp, CheckCircle2, CircleDashed, Loader, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { priorityLabel, statusLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { classes: string; icon: typeof CircleDashed }> = {
  pending: { classes: "bg-wattle-100 text-wattle-600 ring-wattle-200", icon: CircleDashed },
  in_progress: { classes: "bg-sky-100 text-sky-700 ring-sky-200", icon: Loader },
  completed: { classes: "bg-pine-100 text-pine-700 ring-pine-200", icon: CheckCircle2 },
  cancelled: { classes: "bg-ink-100 text-ink-500 ring-ink-200", icon: XCircle },
};

const priorityStyles: Record<string, { classes: string; icon: typeof ArrowRight }> = {
  low: { classes: "bg-ink-100 text-ink-500 ring-ink-200", icon: ArrowDown },
  medium: { classes: "bg-sky-100 text-sky-700 ring-sky-200", icon: ArrowRight },
  high: { classes: "bg-orange-100 text-orange-700 ring-orange-200", icon: ArrowUp },
  urgent: { classes: "bg-coral-100 text-coral-600 ring-coral-200", icon: AlertOctagon },
};

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusStyles[status] ?? statusStyles.pending;
  const Icon = meta.icon;
  return (
    <Pill className={cn(meta.classes, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {statusLabel(status)}
    </Pill>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const meta = priorityStyles[priority] ?? priorityStyles.medium;
  const Icon = meta.icon;
  return (
    <Pill className={cn(meta.classes, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {priorityLabel(priority)}
    </Pill>
  );
}
