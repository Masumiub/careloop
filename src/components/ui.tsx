"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "white";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-pine-800 text-cream-50 shadow-soft hover:bg-pine-700 active:bg-pine-900 disabled:bg-pine-300",
  secondary:
    "bg-transparent text-pine-800 ring-1 ring-inset ring-pine-300 hover:bg-pine-50 hover:ring-pine-400 disabled:text-ink-300 disabled:ring-ink-200",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 disabled:text-ink-300",
  danger:
    "bg-coral-600 text-cream-50 shadow-soft hover:bg-coral-500 active:bg-coral-700 disabled:bg-coral-200",
  gold: "bg-wattle-400 text-pine-950 shadow-soft hover:bg-wattle-300 active:bg-wattle-500 disabled:bg-wattle-200",
  white:
    "bg-white text-pine-900 shadow-soft ring-1 ring-inset ring-ink-100 hover:bg-cream-50 disabled:text-ink-300",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-xl px-3.5 text-sm",
  md: "h-11 gap-2 rounded-xl px-5 text-sm",
  lg: "h-13 gap-2.5 rounded-2xl px-7 text-base",
  icon: "h-9 w-9 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

/* ----------------------------------- Field --------------------------------- */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="text-coral-600" aria-hidden>
            *
          </span>
        ) : null}
        {hint ? <span className="text-xs font-normal text-ink-400">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-sm font-medium text-coral-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-300 shadow-[0_1px_2px_rgb(18_53_40/0.05)] transition focus:border-pine-500 focus:outline-none focus:ring-4 focus:ring-wattle-200/70 disabled:cursor-not-allowed disabled:bg-ink-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputBase, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(inputBase, "resize-y", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(inputBase, "cursor-pointer appearance-none bg-[right_0.75rem_center] pr-9", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23547065' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
        }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

/* ---------------------------------- Avatar --------------------------------- */

const avatarColors: Record<string, string> = {
  pine: "bg-pine-700 text-cream-50",
  wattle: "bg-wattle-400 text-pine-950",
  coral: "bg-coral-500 text-cream-50",
  sky: "bg-sky-600 text-white",
  violet: "bg-violet-600 text-white",
  leaf: "bg-emerald-700 text-cream-50",
};

export function Avatar({
  name,
  color = "pine",
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-[13px]",
    lg: "h-14 w-14 text-lg",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide",
        avatarColors[color] ?? avatarColors.pine,
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* --------------------------------- Spinner --------------------------------- */

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-ink-500", className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

/* --------------------------------- Section --------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-pine-600">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
