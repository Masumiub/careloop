import { NextResponse } from "next/server";
import { PRIORITIES, SERVICE_TYPES, STATUSES, TIMES_OF_DAY } from "@/lib/constants";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const SERVICE_IDS = SERVICE_TYPES.map((s) => s.id) as string[];
export const STATUS_IDS = STATUSES.map((s) => s.id) as string[];
export const PRIORITY_IDS = PRIORITIES.map((p) => p.id) as string[];
export const TIME_IDS = [...TIMES_OF_DAY] as string[];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateInput(value: unknown): value is string {
  return typeof value === "string" && DATE_RE.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function handleUnexpected(err: unknown) {
  console.error(err);
  const message = err instanceof Error ? err.message : "Unexpected server error";
  return jsonError(message, 500);
}
