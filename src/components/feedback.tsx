"use client";

import { motion } from "framer-motion";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink-200 bg-cream-50 text-center",
        compact ? "px-6 py-10" : "px-6 py-16 sm:py-20",
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pine-100 text-pine-600">
        <Icon className="h-8 w-8" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold text-ink-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-100", className)} />;
}

export function RequestCardSkeleton() {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <Bone className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-2/3" />
          <Bone className="h-3 w-1/3" />
        </div>
        <Bone className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
      </div>
      <div className="mt-5 flex gap-2">
        <Bone className="h-8 w-24 rounded-xl" />
        <Bone className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
      <Bone className="h-3 w-24" />
      <Bone className="mt-3 h-8 w-16" />
      <Bone className="mt-2 h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-ink-100 px-4 py-4">
      <Bone className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-1/2" />
        <Bone className="h-3 w-1/4" />
      </div>
      <Bone className="h-6 w-24 rounded-full" />
      <Bone className="h-8 w-8 rounded-lg" />
    </div>
  );
}
