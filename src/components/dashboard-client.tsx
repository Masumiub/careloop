"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Search,
  SearchX,
  StickyNote,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pill, PriorityBadge, StatusBadge } from "@/components/badges";
import { BarRows, StatusDonut, WeekBars } from "@/components/charts";
import { EmptyState, StatSkeleton, TableRowSkeleton } from "@/components/feedback";
import { ConfirmDialog, Modal } from "@/components/modal";
import { ServiceIcon } from "@/components/service-icon";
import { useToast } from "@/components/toast";
import { Avatar, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { PRIORITIES, SERVICE_TYPES, serviceLabel, STATUSES, statusLabel } from "@/lib/constants";
import type { RequestDTO, StaffDTO } from "@/lib/types";
import { cn, formatDate, formatDateLong, timeAgo } from "@/lib/utils";

export function DashboardClient() {
  const toast = useToast();
  const [requests, setRequests] = useState<RequestDTO[] | null>(null);
  const [staffList, setStaffList] = useState<StaffDTO[] | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");

  const [selected, setSelected] = useState<RequestDTO | null>(null);
  const [deleting, setDeleting] = useState<RequestDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ requests: RequestDTO[] }>("/api/requests"),
      api<{ staff: StaffDTO[] }>("/api/staff"),
    ])
      .then(([r, s]) => {
        setRequests(r.requests);
        setStaffList(s.staff.filter((member) => member.active));
      })
      .catch(() => toast.error("Couldn't load the dashboard", "Please refresh to try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------- optimistic edit ---------------------------- */

  const patchRequest = useCallback(
    async (id: string, updates: Partial<RequestDTO>, successMsg: string) => {
      setRequests((prev) => prev?.map((r) => (r.id === id ? { ...r, ...updates } : r)) ?? prev);
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
      try {
        const { request } = await api<{ request: RequestDTO }>(`/api/requests/${id}`, {
          method: "PATCH",
          body: updates,
        });
        setRequests((prev) => prev?.map((r) => (r.id === id ? request : r)) ?? prev);
        setSelected((prev) => (prev && prev.id === id ? request : prev));
        toast.success(successMsg);
        return true;
      } catch {
        toast.error("That didn't save", "Refreshing the latest data…");
        const data = await api<{ requests: RequestDTO[] }>("/api/requests").catch(() => null);
        if (data) setRequests(data.requests);
        return false;
      }
    },
    [toast],
  );

  async function confirmDelete() {
    if (!deleting || !requests) return;
    setActionLoading(true);
    const previous = requests;
    setRequests((prev) => prev!.filter((r) => r.id !== deleting.id));
    try {
      await api(`/api/requests/${deleting.id}`, { method: "DELETE" });
      toast.success("Request deleted");
    } catch {
      setRequests(previous);
      toast.error("Couldn't delete", "Please try again.");
    } finally {
      setActionLoading(false);
      setDeleting(null);
    }
  }

  /* -------------------------------- derived ------------------------------- */

  const stats = useMemo(() => {
    const all = requests ?? [];
    const pending = all.filter((r) => r.status === "pending");
    const inProgress = all.filter((r) => r.status === "in_progress");
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const completedThisWeek = all.filter(
      (r) => r.status === "completed" && new Date(r.updatedAt).getTime() >= weekAgo,
    );
    const urgentOpen = all.filter(
      (r) => (r.status === "pending" || r.status === "in_progress") && (r.priority === "urgent" || r.priority === "high"),
    );
    return [
      { label: "Awaiting match", value: pending.length, sub: `${pending.filter((r) => !r.assignedStaffId).length} unassigned`, accent: "text-wattle-600" },
      { label: "In progress", value: inProgress.length, sub: "workers currently booked", accent: "text-sky-600" },
      { label: "Urgent & high priority", value: urgentOpen.length, sub: "open requests needing attention", accent: "text-coral-600" },
      { label: "Completed this week", value: completedThisWeek.length, sub: "services wrapped up", accent: "text-pine-600" },
    ];
  }, [requests]);

  const donutData = useMemo(
    () =>
      STATUSES.map((s) => ({
        id: s.id,
        label: s.label,
        value: (requests ?? []).filter((r) => r.status === s.id).length,
      })),
    [requests],
  );

  const serviceBars = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of requests ?? []) counts.set(r.serviceType, (counts.get(r.serviceType) ?? 0) + 1);
    return [...counts.entries()]
      .map(([id, value]) => ({ label: serviceLabel(id), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [requests]);

  const weekBars = useMemo(() => {
    const days: { day: string; value: number; today?: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push({
        day: i === 0 ? "Today" : d.toLocaleDateString("en-AU", { weekday: "short" }),
        value: (requests ?? []).filter((r) => r.createdAt.slice(0, 10) === key).length,
        today: i === 0,
      });
    }
    return days;
  }, [requests]);

  const filtered = useMemo(() => {
    if (!requests) return null;
    const needle = q.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (serviceFilter !== "all" && r.serviceType !== serviceFilter) return false;
      if (staffFilter === "unassigned" && r.assignedStaffId) return false;
      if (staffFilter !== "all" && staffFilter !== "unassigned" && r.assignedStaffId !== staffFilter) return false;
      if (needle) {
        const hay = `${r.title} ${r.description} ${r.suburb} ${r.participantName ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [requests, q, statusFilter, serviceFilter, staffFilter]);

  const loading = requests === null || staffList === null;

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">{stat.label}</p>
                <p className={cn("mt-2 font-display text-4xl font-black tabular-nums", stat.accent)}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-ink-500">{stat.sub}</p>
              </motion.div>
            ))}
      </div>

      {/* Charts */}
      {!loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Status mix</h2>
            <p className="text-xs text-ink-400">All requests, right now</p>
            <StatusDonut data={donutData} className="mt-5" />
          </div>
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Top services</h2>
            <p className="text-xs text-ink-400">By number of requests</p>
            <BarRows data={serviceBars} className="mt-5" />
          </div>
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">New requests</h2>
            <p className="text-xs text-ink-400">Last 7 days</p>
            <WeekBars data={weekBars} className="mt-6 h-40" />
          </div>
        </div>
      ) : null}

      {/* Request manager */}
      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
        <div className="border-b border-ink-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink-900">
              Request queue{" "}
              <span className="ml-1 rounded-full bg-pine-100 px-2.5 py-0.5 text-sm font-bold text-pine-700">
                {filtered?.length ?? 0}
              </span>
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, participant, suburb…"
                className="pl-10"
                aria-label="Search requests"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[{ id: "all", label: "All" }, ...STATUSES].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                aria-pressed={statusFilter === s.id}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ring-inset transition",
                  statusFilter === s.id
                    ? "bg-pine-800 text-cream-50 ring-pine-800"
                    : "bg-cream-100 text-ink-500 ring-ink-200 hover:ring-pine-400",
                )}
              >
                {s.label}
              </button>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-ink-200 sm:block" aria-hidden />
            <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="w-auto py-1.5 text-xs font-semibold" aria-label="Filter by service">
              <option value="all">All services</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className="w-auto py-1.5 text-xs font-semibold" aria-label="Filter by staff member">
              <option value="all">All workers</option>
              <option value="unassigned">Unassigned</option>
              {(staffList ?? []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <ul className="divide-y divide-ink-100">
            <AnimatePresence mode="popLayout">
              {filtered.map((request) => (
                <motion.li
                  key={request.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer p-4 transition hover:bg-cream-100/70 sm:px-5"
                  onClick={() => setSelected(request)}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:basis-64">
                      <Avatar name={request.participantName ?? "?"} color={request.participantColor ?? "pine"} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{request.title}</p>
                        <p className="truncate text-xs text-ink-500">
                          {request.participantName} · {formatDate(request.preferredDate)} · {request.suburb}
                        </p>
                      </div>
                    </div>

                    <div className="hidden w-36 items-center gap-2 md:flex">
                      <ServiceIcon
                        icon={SERVICE_TYPES.find((s) => s.id === request.serviceType)?.icon ?? "HelpCircle"}
                        tint={SERVICE_TYPES.find((s) => s.id === request.serviceType)?.tint}
                        size="sm"
                      />
                      <span className="text-xs font-semibold leading-tight text-ink-600">
                        {serviceLabel(request.serviceType)}
                      </span>
                    </div>

                    <PriorityBadge priority={request.priority} className="hidden sm:inline-flex" />
                    <StatusBadge status={request.status} />

                    <div
                      className="ml-auto flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={request.assignedStaffId ?? ""}
                        onChange={(e) =>
                          patchRequest(
                            request.id,
                            { assignedStaffId: e.target.value || null } as Partial<RequestDTO>,
                            e.target.value ? "Worker assigned" : "Assignment cleared",
                          )
                        }
                        aria-label="Assign staff member"
                        className="w-40 py-2 text-xs font-semibold"
                      >
                        <option value="">Unassigned</option>
                        {(staffList ?? []).map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                      <Button variant="white" size="icon" onClick={() => setSelected(request)} aria-label={`Open details for ${request.title}`}>
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No requests match those filters"
            message="Try widening the filters or clearing your search."
            compact
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setStatusFilter("all");
                  setServiceFilter("all");
                  setStaffFilter("all");
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </section>

      <RequestDetailModal
        request={selected}
        staffList={staffList ?? []}
        onClose={() => setSelected(null)}
        onPatch={patchRequest}
        onDelete={(request) => {
          setSelected(null);
          setDeleting(request);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete this request?"
        message={`“${deleting?.title ?? ""}” for ${deleting?.participantName ?? "this participant"} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete permanently"
        loading={actionLoading}
      />
    </div>
  );
}

/* ----------------------------- detail modal ----------------------------- */

function RequestDetailModal({
  request,
  staffList,
  onClose,
  onPatch,
  onDelete,
}: {
  request: RequestDTO | null;
  staffList: StaffDTO[];
  onClose: () => void;
  onPatch: (id: string, updates: Partial<RequestDTO>, msg: string) => Promise<boolean>;
  onDelete: (request: RequestDTO) => void;
}) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(request?.staffNotes ?? "");
  }, [request]);

  if (!request) {
    return <Modal open={false} onClose={onClose} title="Request details">{null}</Modal>;
  }

  const service = SERVICE_TYPES.find((s) => s.id === request.serviceType);
  const notesDirty = notes !== (request.staffNotes ?? "");

  return (
    <Modal open onClose={onClose} title="Request details" description={`Created ${timeAgo(request.createdAt)} · updated ${timeAgo(request.updatedAt)}`} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start gap-3">
          {service ? <ServiceIcon icon={service.icon} tint={service.tint} size="lg" /> : null}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl font-bold leading-tight text-ink-900">{request.title}</h3>
            <p className="mt-1 text-sm text-ink-500">{service?.label ?? request.serviceType}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <p className="rounded-2xl bg-cream-100 p-4 text-[15px] leading-relaxed text-ink-700">
          {request.description}
        </p>

        <dl className="grid gap-3 rounded-2xl border border-ink-100 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Avatar name={request.participantName ?? "?"} color={request.participantColor ?? "pine"} size="sm" />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">Participant</dt>
              <dd className="font-semibold text-ink-800">{request.participantName}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">Location</dt>
              <dd className="font-semibold text-ink-800">
                {request.suburb}, {request.participantState}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">Date</dt>
              <dd className="font-semibold text-ink-800">{formatDateLong(request.preferredDate)}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink-400" aria-hidden />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">Time</dt>
              <dd className="font-semibold text-ink-800">{request.preferredTime}</dd>
            </div>
          </div>
        </dl>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <Select
              value={request.status}
              onChange={(e) => onPatch(request.id, { status: e.target.value }, `Marked as ${statusLabel(e.target.value).toLowerCase()}`)}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select
              value={request.priority}
              onChange={(e) => onPatch(request.id, { priority: e.target.value }, "Priority updated")}
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assigned worker">
            <Select
              value={request.assignedStaffId ?? ""}
              onChange={(e) =>
                onPatch(request.id, { assignedStaffId: e.target.value || null } as Partial<RequestDTO>, e.target.value ? "Worker assigned" : "Assignment cleared")
              }
            >
              <option value="">Unassigned</option>
              {staffList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Staff notes" hint="visible to the participant once work begins">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Worker booked for Thursday 9am. Confirmed access via front ramp."
          />
        </Field>

        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:items-center">
          <Button variant="ghost" onClick={() => onDelete(request)} className="text-coral-600 hover:bg-coral-50 sm:mr-auto">
            <Trash2 className="h-4 w-4" aria-hidden /> Delete request
          </Button>
          <div className="flex gap-2">
            {request.priority === "urgent" && request.status === "pending" ? (
              <Pill className="bg-coral-100 text-coral-600 ring-coral-200">Needs urgent triage</Pill>
            ) : null}
            <Button
              disabled={!notesDirty}
              loading={savingNotes}
              onClick={async () => {
                setSavingNotes(true);
                await onPatch(request.id, { staffNotes: notes }, "Notes saved");
                setSavingNotes(false);
              }}
            >
              <StickyNote className="h-4 w-4" aria-hidden />
              {notesDirty ? "Save notes" : "Notes saved"}
            </Button>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          <UserRoundPlus className="h-3.5 w-3.5" aria-hidden />
          Assigning a worker automatically moves a pending request to “in progress”.
        </p>
      </div>
    </Modal>
  );
}
