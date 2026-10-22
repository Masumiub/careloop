"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Mail, MapPin, PauseCircle, Pencil, Phone, PlayCircle, Plus, Search, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pill } from "@/components/badges";
import { EmptyState, RequestCardSkeleton } from "@/components/feedback";
import { ConfirmDialog } from "@/components/modal";
import { StaffFormModal } from "@/components/staff-form";
import { useToast } from "@/components/toast";
import { Avatar, Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import type { RequestDTO, StaffDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamClient() {
  const toast = useToast();
  const [staff, setStaff] = useState<StaffDTO[] | null>(null);
  const [requests, setRequests] = useState<RequestDTO[] | null>(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffDTO | null>(null);
  const [deleting, setDeleting] = useState<StaffDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        api<{ staff: StaffDTO[] }>("/api/staff"),
        api<{ requests: RequestDTO[] }>("/api/requests"),
      ]);
      setStaff(s.staff);
      setRequests(r.requests);
    } catch {
      toast.error("Couldn't load the team", "Please refresh to try again.");
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const workload = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests ?? []) {
      if (r.assignedStaffId && (r.status === "pending" || r.status === "in_progress")) {
        map.set(r.assignedStaffId, (map.get(r.assignedStaffId) ?? 0) + 1);
      }
    }
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    if (!staff) return null;
    const needle = q.trim().toLowerCase();
    if (!needle) return staff;
    return staff.filter((m) =>
      `${m.name} ${m.role} ${m.region} ${m.email}`.toLowerCase().includes(needle),
    );
  }, [staff, q]);

  async function toggleActive(member: StaffDTO) {
    if (!staff) return;
    const previous = staff;
    setStaff((prev) => prev!.map((m) => (m.id === member.id ? { ...m, active: !m.active } : m)));
    try {
      const { staff: updated } = await api<{ staff: StaffDTO }>(`/api/staff/${member.id}`, {
        method: "PATCH",
        body: { active: !member.active },
      });
      setStaff((prev) => prev!.map((m) => (m.id === member.id ? updated : m)));
      toast.success(updated.active ? `${updated.name} is active again` : `${updated.name} set to unavailable`);
    } catch {
      setStaff(previous);
      toast.error("Couldn't update availability", "Please try again.");
    }
  }

  async function confirmDelete() {
    if (!deleting || !staff) return;
    setActionLoading(true);
    const previous = staff;
    setStaff((prev) => prev!.filter((m) => m.id !== deleting.id));
    try {
      await api(`/api/staff/${deleting.id}`, { method: "DELETE" });
      toast.success("Team member removed", "Their assignments were released.");
      setRequests((prev) => prev?.map((r) => (r.assignedStaffId === deleting.id ? { ...r, assignedStaffId: null, staffName: null } : r)) ?? prev);
    } catch {
      setStaff(previous);
      toast.error("Couldn't remove team member", "Please try again.");
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
            placeholder="Search name, role, region…"
            className="pl-10"
            aria-label="Search team members"
          />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" aria-hidden /> Add team member
        </Button>
      </div>

      {staff === null ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((member) => (
              <motion.article
                key={member.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className={cn(
                  "flex flex-col rounded-3xl border bg-white p-5 shadow-soft transition hover:shadow-lift",
                  member.active ? "border-ink-100" : "border-ink-200 opacity-75",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} color={member.color} size="lg" />
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight text-ink-900">{member.name}</h3>
                      <p className="text-xs font-semibold text-pine-600">{member.role}</p>
                    </div>
                  </div>
                  {member.active ? (
                    <Pill className="bg-pine-100 text-pine-700 ring-pine-200">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Active
                    </Pill>
                  ) : (
                    <Pill className="bg-ink-100 text-ink-500 ring-ink-200">Unavailable</Pill>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-ink-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {member.region}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {member.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {member.phone}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream-100 px-3.5 py-2.5 text-sm">
                  <span className="font-semibold text-ink-600">Open assignments</span>
                  <span className="font-display text-xl font-black text-pine-800">{workload.get(member.id) ?? 0}</span>
                </div>

                {member.specialities.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.specialities.slice(0, 3).map((speciality) => (
                      <span key={speciality} className="rounded-full bg-wattle-100/80 px-2.5 py-1 text-[11px] font-bold text-wattle-600 ring-1 ring-inset ring-wattle-200">
                        {speciality}
                      </span>
                    ))}
                    {member.specialities.length > 3 ? (
                      <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-500">
                        +{member.specialities.length - 3}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  <Button variant="secondary" size="sm" onClick={() => { setEditing(member); setFormOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(member)}>
                    {member.active ? (
                      <>
                        <PauseCircle className="h-3.5 w-3.5" aria-hidden /> Set unavailable
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3.5 w-3.5" aria-hidden /> Set active
                      </>
                    )}
                  </Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No team members yet"
          message="Add your first coordinator or support worker to start assigning requests."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" aria-hidden /> Add team member
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No one matches that search"
          message="Try a different name, role or region."
          compact
          action={<Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>}
        />
      )}

      <StaffFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        member={editing}
        onSaved={(saved) => {
          setStaff((prev) => {
            const exists = prev?.some((m) => m.id === saved.id);
            return exists
              ? prev!.map((m) => (m.id === saved.id ? saved : m))
              : [...(prev ?? []), saved];
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove team member?"
        message={`${deleting?.name ?? "This team member"} will be removed and their open assignments released back to the queue. Consider setting them "unavailable" instead to keep history tidy.`}
        confirmLabel="Remove permanently"
        loading={actionLoading}
      />
    </div>
  );
}
