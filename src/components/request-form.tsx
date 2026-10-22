"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, Loader2, MapPin, PartyPopper, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PriorityBadge } from "@/components/badges";
import { ParticipantFormModal } from "@/components/participant-form";
import { ServiceIcon } from "@/components/service-icon";
import { useToast } from "@/components/toast";
import { Avatar, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { PRIORITIES, SERVICE_TYPES, serviceLabel, TIMES_OF_DAY } from "@/lib/constants";
import type { ParticipantDTO, RequestDTO } from "@/lib/types";
import { useMe } from "@/lib/use-me";
import { cn, formatDateLong, todayInputValue } from "@/lib/utils";

export function RequestForm({ initialService }: { initialService?: string }) {
  const router = useRouter();
  const toast = useToast();
  const { me, setMe } = useMe();

  const [participants, setParticipants] = useState<ParticipantDTO[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [participantModal, setParticipantModal] = useState(false);

  const [participantId, setParticipantId] = useState("");
  const [serviceType, setServiceType] = useState(initialService ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [suburb, setSuburb] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<string>(TIMES_OF_DAY[0]);
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RequestDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ participants: ParticipantDTO[] }>("/api/participants")
      .then((data) => {
        if (cancelled) return;
        setParticipants(data.participants);
        const remembered = data.participants.find((p) => p.id === me);
        const fallback = remembered ?? data.participants[0];
        if (fallback) {
          setParticipantId(fallback.id);
          setSuburb((prev) => prev || fallback.suburb);
        }
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedParticipant = useMemo(
    () => participants?.find((p) => p.id === participantId) ?? null,
    [participants, participantId],
  );
  const selectedService = useMemo(
    () => SERVICE_TYPES.find((s) => s.id === serviceType) ?? null,
    [serviceType],
  );

  function chooseParticipant(id: string) {
    setParticipantId(id);
    setMe(id);
    const found = participants?.find((p) => p.id === id);
    if (found && !suburb) setSuburb(found.suburb);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { request } = await api<{ request: RequestDTO }>("/api/requests", {
        method: "POST",
        body: {
          participantId,
          serviceType,
          title,
          description,
          suburb,
          preferredDate: preferredDate || null,
          preferredTime,
          priority,
        },
      });
      setDone(request);
      toast.success("Request sent!", "A coordinator will review it shortly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      toast.error("Couldn't send your request", "Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="mx-auto max-w-xl rounded-[2rem] border border-pine-200 bg-white p-8 text-center shadow-lift sm:p-12"
      >
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-wattle-300 text-pine-950">
          <PartyPopper className="h-10 w-10" aria-hidden />
        </span>
        <h2 className="mt-6 font-display text-3xl font-black text-pine-950">Beaut! Request received.</h2>
        <p className="mt-3 leading-relaxed text-ink-500">
          <strong className="text-ink-800">“{done.title}”</strong> is now with our coordinators.
          We'll match the right support worker and keep you posted — usually within the hour.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={() => router.push("/my-requests")} size="lg">
            Track my requests
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setDone(null);
              setTitle("");
              setDescription("");
            }}
          >
            Make another request
          </Button>
        </div>
      </motion.div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-coral-200 bg-white p-8 text-center shadow-soft">
        <p className="font-display text-xl font-bold text-ink-900">We couldn't load the form</p>
        <p className="mt-2 text-sm text-ink-500">Please refresh the page or call us on 1800 227 356.</p>
        <Button className="mt-6" variant="secondary" onClick={() => window.location.reload()}>
          Refresh page
        </Button>
      </div>
    );
  }

  if (participants === null) {
    return (
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-ink-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.45fr_1fr]">
      <form onSubmit={submit} className="space-y-6 rounded-[2rem] border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
        {/* Who */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <Field label="Who is this request for?" required className="flex-1">
              <Select value={participantId} onChange={(e) => chooseParticipant(e.target.value)}>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.suburb} {p.state}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <button
            type="button"
            onClick={() => setParticipantModal(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 transition hover:text-pine-600"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Not listed? Register a new participant
          </button>
        </div>

        {/* Service */}
        <Field label="What kind of support do you need?" required>
          <div role="radiogroup" aria-label="Service type" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SERVICE_TYPES.map((service) => {
              const active = serviceType === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setServiceType(service.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border p-3 text-left text-sm font-semibold transition",
                    active
                      ? "border-pine-600 bg-pine-50 text-pine-900 ring-2 ring-pine-200"
                      : "border-ink-200 bg-cream-50 text-ink-600 hover:border-pine-300 hover:bg-white",
                  )}
                >
                  <ServiceIcon icon={service.icon} tint={service.tint} size="sm" />
                  <span className="leading-tight">{service.label}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Give it a short title" required hint={`${title.length}/90`}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 90))}
            placeholder="e.g. Lift to physio on Thursday"
            required
            minLength={4}
          />
        </Field>

        <Field label="Tell us a bit more" required hint="the more detail, the better the match">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What would make this great? Any equipment, access needs, or preferences we should know about…"
            rows={5}
            required
            minLength={10}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Suburb" required>
            <Input
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="Where should we come?"
              required
            />
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
          <Field label="How soon do you need this?">
            <div role="radiogroup" aria-label="Priority" className="grid grid-cols-4 gap-1.5 rounded-xl border border-ink-200 bg-cream-100 p-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={priority === p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-bold transition",
                    priority === p.id
                      ? "bg-pine-800 text-cream-50 shadow"
                      : "text-ink-500 hover:bg-white",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl bg-coral-100 px-4 py-3 text-sm font-semibold text-coral-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" loading={submitting} disabled={!serviceType || !participantId} className="w-full">
          {submitting ? "Sending your request…" : "Send request"}
        </Button>
      </form>

      {/* Live summary */}
      <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Request summary">
        <div className="rounded-[2rem] border border-ink-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Your request so far</p>
          <div className="mt-4 flex items-center gap-3">
            {selectedService ? (
              <ServiceIcon icon={selectedService.icon} tint={selectedService.tint} />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-100 text-ink-300">
                ?
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold text-ink-900">
                {title || "Untitled request"}
              </p>
              <p className="text-sm text-ink-500">{selectedService ? serviceLabel(selectedService.id) : "Choose a service"}</p>
            </div>
          </div>
          {description ? (
            <p className="mt-4 line-clamp-3 rounded-xl bg-cream-100 p-3 text-sm leading-relaxed text-ink-600">
              {description}
            </p>
          ) : null}
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-ink-600">
              {selectedParticipant ? (
                <Avatar name={selectedParticipant.name} color={selectedParticipant.color} size="xs" />
              ) : (
                <span className="h-6 w-6 rounded-full bg-ink-100" />
              )}
              <span>{selectedParticipant?.name ?? "No participant selected"}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
              <span>{suburb || "Suburb TBC"}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
              <span>{preferredDate ? formatDateLong(preferredDate) : "Flexible date"}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <Clock className="h-4 w-4 text-ink-400" aria-hidden />
              <span>{preferredTime}</span>
            </div>
          </dl>
          <div className="mt-4">
            <PriorityBadge priority={priority} />
          </div>
        </div>

        <div className="rounded-[2rem] bg-pine-800 p-6 text-cream-50 shadow-soft">
          <ShieldCheck className="h-7 w-7 text-wattle-300" aria-hidden />
          <p className="mt-3 text-sm leading-relaxed text-cream-100/85">
            Every worker is NDIS-screened, first-aid trained and covered by our quality
            safeguards. You're always in control of who supports you.
          </p>
        </div>
      </aside>

      <ParticipantFormModal
        open={participantModal}
        onClose={() => setParticipantModal(false)}
        onSaved={(participant) => {
          setParticipants((prev) => [...(prev ?? []), participant]);
          chooseParticipant(participant.id);
          setSuburb(participant.suburb);
        }}
      />
    </div>
  );
}

export function RequestPageSkeleton() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-pine-600" aria-label="Loading" />
    </div>
  );
}
