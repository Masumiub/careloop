"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock, Filter, MapPin, Pencil, Plus, Trash2, UserRound, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { EmptyState, RequestCardSkeleton } from "@/components/feedback";
import { ConfirmDialog, Modal } from "@/components/modal";
import { ParticipantFormModal } from "@/components/participant-form";
import { ServiceIcon } from "@/components/service-icon";
import { useToast } from "@/components/toast";
import { Avatar, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { PRIORITIES, SERVICE_TYPES, STATUSES, TIMES_OF_DAY } from "@/lib/constants";
import type { ParticipantDTO, RequestDTO } from "@/lib/types";
import { useMe } from "@/lib/use-me";
import { cn, formatDate, timeAgo, todayInputValue } from "@/lib/utils";

export function MyRequestsClient() {
  const toast = useToast();
  const { me, setMe } = useMe();

  const [participants, setParticipants] = useState<ParticipantDTO[] | null>(null);
  const [requests, setRequests] = useState<RequestDTO[] | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [participantModal, setParticipantModal] = useState(false);
  const [editing, setEditing] = useState<RequestDTO | null>(null);
  const [cancelling, setCancelling] = useState<RequestDTO | null>(null);
  const [deleting, setDeleting] = useState<RequestDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api<{ participants: ParticipantDTO[] }>("/api/participants")
      .then((data) => {
        setParticipants(data.participants);
        const remembered = data.participants.find((p) => p.id === me);
        const fallback = remembered ?? data.participants[0] ?? null;
        if (fallback) setMe(fallback.id);
      })
      .catch(() => toast.error("Couldn't load participants", "Please refresh to try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeParticipant = useMemo(
    () => participants?.find((p) => p.id === me) ?? null,
    [participants, me],
  );

  const loadRequests = useCallback(
    async (participantId: string) => {
      setRequestsLoading(true);
      try {
        const data = await api<{ requests: RequestDTO[] }>(
          `/api/requests?participantId=${participantId}`,
        );
        setRequests(data.requests);
      } catch {
        toast.error("Couldn't load requests", "Please refresh to try again.");
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (me) loadRequests(me);
  }, [me, loadRequests]);

  /* ------------------------- optimistic updates ------------------------- */

  async function patchRequest(id: string, updates: Partial<RequestDTO>, successMsg: string) {
    if (!requests) return false;
    const previous = requests;
    setRequests((prev) => prev!.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    try {
      const { request } = await api<{ request: RequestDTO }>(`/api/requests/${id}`, {
        method: "PATCH",
        body: updates,
      });
      setRequests((prev) => prev!.map((r) => (r.id === id ? request : r)));
      toast.success(successMsg);
      return true;
    } catch {
      setRequests(previous);
      toast.error("That didn't save", "We've restored the previous version. Please try again.");
      return false;
    }
  }

  async function confirmCancel() {
    if (!cancelling) return;
    setActionLoading(true);
    try {
      await patchRequest(cancelling.id, { status: "cancelled" }, "Request cancelled");
    } finally {
      setActionLoading(false);
      setCancelling(null);
    }
  }

  async function confirmDelete() {
    if (!deleting || !requests) return;
    setActionLoading(true);
    const previous = requests;
    setRequests((prev) => prev!.filter((r) => r.id !== deleting.id));
    try {
      await api(`/api/requests/${deleting.id}`, { method: "DELETE" });
      toast.success("Request removed", "It's gone for good.");
    } catch {
      setRequests(previous);
      toast.error("Couldn't delete that request", "Please try again.");
    } finally {
      setActionLoading(false);
      setDeleting(null);
    }
  }

  /* ------------------------------ derived ------------------------------ */

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: requests?.length ?? 0 };
    for (const s of STATUSES) base[s.id] = 0;
    for (const r of requests ?? []) base[r.status] = (base[r.status] ?? 0) + 1;
    return base;
  }, [requests]);

  const visible = useMemo(() => {
    if (!requests) return null;
    return filter === "all" ? requests : requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  /* -------------------------------- render ------------------------------ */

  if (participants === null) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <>
        <EmptyState
          icon={UserRound}
          title="No participants registered yet"
          message="Register yourself or someone you care for to start requesting support."
          action={
            <Button onClick={() => setParticipantModal(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Register a participant
            </Button>
          }
        />
        <ParticipantFormModal
          open={participantModal}
          onClose={() => setParticipantModal(false)}
          onSaved={(participant) => {
            setParticipants([participant]);
            setMe(participant.id);
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Participant switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft sm:px-5">
        <div className="flex items-center gap-3">
          {activeParticipant ? (
            <>
              <Avatar name={activeParticipant.name} color={activeParticipant.color} />
              <div>
                <p className="text-sm font-bold text-ink-900">
                  {activeParticipant.preferredName
                    ? `G'day, ${activeParticipant.preferredName}!`
                    : `G'day, ${activeParticipant.name.split(" ")[0]}!`}
                </p>
                <p className="text-xs text-ink-500">
                  {activeParticipant.suburb}, {activeParticipant.state} · These are your support requests
                </p>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Switch participant"
            value={activeParticipant?.id ?? ""}
            onChange={(e) => setMe(e.target.value)}
            className="w-56"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Button variant="secondary" size="sm" onClick={() => setParticipantModal(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">New participant</span>
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter requests">
        <Filter className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
        {[{ id: "all", label: "All" }, ...STATUSES].map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={filter === s.id}
            onClick={() => setFilter(s.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset transition",
              filter === s.id
                ? "bg-pine-800 text-cream-50 ring-pine-800"
                : "bg-white text-ink-500 ring-ink-200 hover:ring-pine-400",
            )}
          >
            {s.label}
            <span className={cn("ml-2 rounded-full px-1.5 text-xs", filter === s.id ? "bg-pine-700" : "bg-ink-100 text-ink-500")}>
              {counts[s.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {requestsLoading || requests === null ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      ) : visible && visible.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((request) => (
              <motion.article
                key={request.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="group flex flex-col rounded-3xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-lift sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ServiceIcon
                      icon={SERVICE_TYPES.find((s) => s.id === request.serviceType)?.icon ?? "HelpCircle"}
                      tint={SERVICE_TYPES.find((s) => s.id === request.serviceType)?.tint}
                    />
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight text-ink-900">
                        {request.title}
                      </h3>
                      <p className="text-xs text-ink-400">Requested {timeAgo(request.createdAt)}</p>
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">{request.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
                    {formatDate(request.preferredDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-ink-400" aria-hidden />
                    {request.preferredTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
                    {request.suburb}
                  </span>
                  <PriorityBadge priority={request.priority} />
                </div>

                {request.staffName ? (
                  <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-pine-50 p-3 text-sm">
                    <Avatar name={request.staffName} color={request.staffColor ?? "pine"} size="sm" />
                    <div>
                      <p className="font-bold text-ink-800">{request.staffName}</p>
                      <p className="text-xs text-ink-500">{request.staffRole ?? "Support team"}</p>
                    </div>
                  </div>
                ) : null}

                {request.staffNotes && request.status !== "pending" ? (
                  <p className="mt-3 rounded-2xl bg-wattle-100/70 p-3 text-sm leading-relaxed text-ink-700">
                    <span className="font-bold">Note from our team:</span> {request.staffNotes}
                  </p>
                ) : null}

                {request.status === "pending" || request.status === "in_progress" ? (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(request)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelling(request)}>
                      <XCircle className="h-3.5 w-3.5" aria-hidden /> Cancel request
                    </Button>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(request)} className="text-coral-600 hover:bg-coral-50">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove from history
                    </Button>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : filter === "all" ? (
        <EmptyState
          icon={CalendarDays}
          title="No requests yet"
          message="When you ask for a hand with something, it'll show up here so you can follow along."
          action={
            <Link href="/request">
              <Button>
                <Plus className="h-4 w-4" aria-hidden /> Make your first request
              </Button>
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={Filter}
          title={`Nothing ${STATUSES.find((s) => s.id === filter)?.label.toLowerCase() ?? ""} right now`}
          message="Try a different filter, or make a new request if something comes up."
          compact
          action={
            <Button variant="secondary" onClick={() => setFilter("all")}>
              Show everything
            </Button>
          }
        />
      )}

      <ParticipantFormModal
        open={participantModal}
        onClose={() => setParticipantModal(false)}
        onSaved={(participant) => {
          setParticipants((prev) => [...(prev ?? []), participant]);
          setMe(participant.id);
        }}
      />

      <EditRequestModal
        request={editing}
        onClose={() => setEditing(null)}
        onSaved={async (id, updates) => {
          const ok = await patchRequest(id, updates, "Request updated");
          if (ok) setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={confirmCancel}
        title="Cancel this request?"
        message={`“${cancelling?.title ?? ""}” will be marked as cancelled. You can always make a new request later.`}
        confirmLabel="Yes, cancel it"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove from history?"
        message={`“${deleting?.title ?? ""}” will be permanently removed from your history. This can't be undone.`}
        confirmLabel="Yes, remove it"
        loading={actionLoading}
      />
    </div>
  );
}

/* ------------------------------ edit modal ------------------------------ */

function EditRequestModal({
  request,
  onClose,
  onSaved,
}: {
  request: RequestDTO | null;
  onClose: () => void;
  onSaved: (id: string, updates: Partial<RequestDTO>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [suburb, setSuburb] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<string>(TIMES_OF_DAY[0]);
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!request) return;
    setTitle(request.title);
    setDescription(request.description);
    setSuburb(request.suburb);
    setServiceType(request.serviceType);
    setPreferredDate(request.preferredDate ?? "");
    setPreferredTime(request.preferredTime);
    setPriority(request.priority);
  }, [request]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setSaving(true);
    try {
      await onSaved(request.id, {
        title,
        description,
        suburb,
        serviceType,
        preferredDate: preferredDate || null,
        preferredTime,
        priority,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={Boolean(request)} onClose={onClose} title="Edit request" description="Update the details and we'll adjust the match." wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Service type" required>
          <Select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={4} />
        </Field>
        <Field label="Details" required>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required minLength={10} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Suburb" required>
            <Input value={suburb} onChange={(e) => setSuburb(e.target.value)} required />
          </Field>
          <Field label="Preferred date" hint="optional">
            <Input type="date" value={preferredDate} min={todayInputValue()} onChange={(e) => setPreferredDate(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time of day">
            <Select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
              {TIMES_OF_DAY.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
