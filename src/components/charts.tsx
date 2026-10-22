"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "#e6ae38",
  in_progress: "#0284c7",
  completed: "#346b4e",
  cancelled: "#9fb1a8",
};

export function StatusDonut({
  data,
  className,
}: {
  data: { id: string; label: string; value: number }[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e4eae7" strokeWidth="14" />
          {total > 0
            ? data.map((d) => {
                const fraction = d.value / total;
                const dash = fraction * circumference;
                const el = (
                  <motion.circle
                    key={d.id}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={STATUS_COLORS[d.id] ?? "#9fb1a8"}
                    strokeWidth="14"
                    strokeLinecap="butt"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    strokeDashoffset={-offset}
                  />
                );
                offset += dash;
                return el;
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black text-ink-900">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400">total</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: STATUS_COLORS[d.id] ?? "#9fb1a8" }}
              aria-hidden
            />
            <span className="text-ink-600">{d.label}</span>
            <span className="font-bold text-ink-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarRows({
  data,
  className,
}: {
  data: { label: string; value: number; color?: string }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className={cn("space-y-3", className)}>
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink-600">{d.label}</span>
            <span className="font-bold text-ink-900">{d.value}</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: d.color ?? "#346b4e" }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WeekBars({
  data,
  className,
}: {
  data: { day: string; value: number; today?: boolean }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {data.map((d, i) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-bold text-ink-700">{d.value > 0 ? d.value : ""}</span>
          <motion.div
            className={cn("w-full rounded-t-lg", d.today ? "bg-wattle-400" : "bg-pine-600")}
            initial={{ height: 4 }}
            animate={{ height: `${Math.max(4, (d.value / max) * 96)}` }}
            transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            title={`${d.day}: ${d.value} request${d.value === 1 ? "" : "s"}`}
          />
          <span className={cn("text-[10px] font-bold uppercase tracking-wide", d.today ? "text-wattle-600" : "text-ink-400")}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}
