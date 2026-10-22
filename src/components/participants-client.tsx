"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, IdCard, MapPin, Pencil, Phone, Plus, Search, Trash2, UserRoundX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pill } from "@/components/badges";
import { EmptyState, RequestCardSkeleton } from "@/components/feedback";
import { ConfirmDialog } from "@/components/modal";
import { ParticipantFormModal } from "@/components/participant-form";
import { useToast } from "@/components/toast";
import { Avatar, Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import type { ParticipantDTO, RequestDTO } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function ParticipantsClient() {
  const toast = useToast();
  const [participants, setParticipants] = useState<ParticipantDTO[] | null>(null);
  const [requests, setRequests] = useState<RequestDTO[] | null>(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ParticipantDTO | null>(null);
  const [deleting, setDeleting] = useState<ParticipantDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([
        api<{ participants: ParticipantDTO[] }>("/api/participants"),
        api<{ requests: RequestDTO[] }>("/api/requests"),
      ]);
      setParticipants(p.participants);
      setRequests(r.requests);
    } catch {
      toast.error("Couldn't load participants", "Please refresh to try again.");
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCounts = useMemo(() => {
    const map = new Map<string, number>();
    const total = new Map<string, number>();
    for (const r of requests ?? []) {
      total.set(r.participantId, (total.get(r.participantId) ?? 0) + 1);
      if (r.status === "pending" || r.status === "in_progress") {
        map.set(r.participantId, (map.get(r.participantId) ?? 0) + 1);
      }
    }
    return { open: map, total };
  }, [requests]);

  const filtered = useMemo(() => {
    if (!participants) return null;
    const needle = q.trim().toLowerCase();
    if (!needle) return participants;
    return participants.filter((p) =>
      `${p.name} ${p.suburb} ${p.state} ${p.email} ${p.ndisNumber ?? ""}`.toLowerCase().includes(needle),
    );
  }, [participants, q]);

  async function confirmDelete() {
    if (!deleting || !participants) return;
    setActionLoading(true);
    const previous = participants;
    setParticipants((prev) => prev!.filter((p) => p.id !== deleting.id));
    try {
      await api(`/api/participants/${deleting.id}`, { method: "DELETE" });
      toast.success("Participant removed", "Their requests were removed too.");
      setRequests((prev) => prev?.filter((r) => r.participantId !== deleting.id) ?? prev);
    } catch {
      setParticipants(previous);
      toast.error("Couldn't remove participant", "Please try again.");
    } finally {
      setActionLoading(false);
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, suburb, NDIS number…"
            className="pl-10"
            aria-label="Search participants"
          />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" aria-hidden /> Add participant
        </Button>
      </div>

      {participants === null ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((participant) => (
              <motion.article
                key={participant.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="flex flex-col rounded-3xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={participant.name} color={participant.color} size="lg" />
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight text-ink-900">
                        {participant.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-ink-500">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {participant.suburb}, {participant.state} {participant.postcode}
                      </p>
                    </div>
                  </div>
                  {(openCounts.open.get(participant.id) ?? 0) > 0 ? (
                    <Pill className="bg-wattle-100 text-wattle-600 ring-wattle-200">
                      {openCounts.open.get(participant.id)} open
                    </Pill>
                  ) : null}
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-ink-600">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {participant.phone}
                  </p>
                  {participant.ndisNumber ? (
                    <p className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                      NDIS {participant.ndisNumber}
                    </p>
                  ) : null}
                  <p className="text-xs text-ink-400">
                    Joined {timeAgo(participant.createdAt)} · {openCounts.total.get(participant.id) ?? 0} total requests
                  </p>
                </div>

                {participant.supportNeeds.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {participant.supportNeeds.slice(0, 3).map((need) => (
                      <span key={need} className="rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700 ring-1 ring-inset ring-pine-100">
                        {need}
                      </span>
                    ))}
                    {participant.supportNeeds.length > 3 ? (
                      <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-500">
                        +{participant.supportNeeds.length - 3} more
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {participant.accessibilityNotes ? (
                  <p className="mt-3 line-clamp-2 rounded-2xl bg-cream-100 p-3 text-xs leading-relaxed text-ink-600">
                    <Accessibility className="mr-1.5 inline h-3.5 w-3.5 text-pine-600" aria-hidden />
                    {participant.accessibilityNotes}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setEditing(participant); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(participant)}
                    className="text-coral-600 hover:bg-coral-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                  </Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : participants.length === 0 ? (
        <EmptyState
          icon={UserRoundX}
          title="No participants yet"
          message="Register your first participant to start taking support requests."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" aria-hidden /> Add participant
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No participants match that search"
          message="Try a different name, suburb or NDIS number."
          compact
          action={<Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>}
        />
      )}

      <ParticipantFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        participant={editing}
        onSaved={(saved) => {
          setParticipants((prev) => {
            const exists = prev?.some((p) => p.id === saved.id);
            return exists
              ? prev!.map((p) => (p.id === saved.id ? saved : p))
              : [...(prev ?? []), saved];
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove participant?"
        message={`${deleting?.name ?? "This participant"} and all of their support requests will be permanently removed. This can't be undone.`}
        confirmLabel="Remove permanently"
        loading={actionLoading}
      />
    </div>
  );
}
