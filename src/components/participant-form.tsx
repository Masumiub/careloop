"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import { AU_STATES, AVATAR_COLORS } from "@/lib/constants";
import type { ParticipantDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUPPORT_NEEDS = [
  "Mobility support",
  "Personal care",
  "Vision impairment",
  "Hearing impairment",
  "Intellectual disability",
  "Autism spectrum",
  "Psychosocial disability",
  "Acquired brain injury",
  "Neurological condition",
  "Meal support",
  "Transport",
  "Community access",
];

const SWATCHES: Record<string, string> = {
  pine: "bg-pine-700",
  wattle: "bg-wattle-400",
  coral: "bg-coral-500",
  sky: "bg-sky-600",
  violet: "bg-violet-600",
  leaf: "bg-emerald-700",
};

interface FormState {
  name: string;
  preferredName: string;
  email: string;
  phone: string;
  suburb: string;
  state: string;
  postcode: string;
  ndisNumber: string;
  supportNeeds: string[];
  accessibilityNotes: string;
  color: string;
}

const EMPTY: FormState = {
  name: "",
  preferredName: "",
  email: "",
  phone: "",
  suburb: "",
  state: "VIC",
  postcode: "",
  ndisNumber: "",
  supportNeeds: [],
  accessibilityNotes: "",
  color: "pine",
};

export function ParticipantFormModal({
  open,
  onClose,
  onSaved,
  participant,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (participant: ParticipantDTO) => void;
  participant?: ParticipantDTO | null;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(participant);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (participant) {
      setForm({
        name: participant.name,
        preferredName: participant.preferredName ?? "",
        email: participant.email,
        phone: participant.phone,
        suburb: participant.suburb,
        state: participant.state,
        postcode: participant.postcode,
        ndisNumber: participant.ndisNumber ?? "",
        supportNeeds: participant.supportNeeds ?? [],
        accessibilityNotes: participant.accessibilityNotes ?? "",
        color: participant.color,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, participant]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleNeed(need: string) {
    setForm((prev) => ({
      ...prev,
      supportNeeds: prev.supportNeeds.includes(need)
        ? prev.supportNeeds.filter((n) => n !== need)
        : [...prev.supportNeeds, need],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        preferredName: form.preferredName || null,
        ndisNumber: form.ndisNumber || null,
        accessibilityNotes: form.accessibilityNotes || null,
      };
      const result = editing
        ? await api<{ participant: ParticipantDTO }>(`/api/participants/${participant!.id}`, {
            method: "PATCH",
            body: payload,
          })
        : await api<{ participant: ParticipantDTO }>("/api/participants", {
            method: "POST",
            body: payload,
          });
      toast.success(
        editing ? "Participant updated" : "Welcome aboard!",
        editing
          ? `${result.participant.name}'s details have been saved.`
          : `${result.participant.name} is registered and ready to request support.`,
      );
      onSaved(result.participant);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save participant");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit participant" : "Register a participant"}
      description={
        editing
          ? "Update contact and accessibility details."
          : "A few details so we can match the right support."
      }
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Alex Nguyen"
              required
              autoFocus
            />
          </Field>
          <Field label="Preferred name" hint="optional">
            <Input
              value={form.preferredName}
              onChange={(e) => set("preferredName", e.target.value)}
              placeholder="What should we call them?"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com.au"
              required
            />
          </Field>
          <Field label="Phone" required>
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="04xx xxx xxx"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_0.8fr]">
          <Field label="Suburb" required>
            <Input
              value={form.suburb}
              onChange={(e) => set("suburb", e.target.value)}
              placeholder="e.g. Carlton"
              required
            />
          </Field>
          <Field label="State" required>
            <Select value={form.state} onChange={(e) => set("state", e.target.value)}>
              {AU_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Postcode" required>
            <Input
              value={form.postcode}
              onChange={(e) => set("postcode", e.target.value)}
              placeholder="3000"
              inputMode="numeric"
              maxLength={4}
              required
            />
          </Field>
        </div>

        <Field label="NDIS number" hint="optional">
          <Input
            value={form.ndisNumber}
            onChange={(e) => set("ndisNumber", e.target.value)}
            placeholder="000 000 000"
            inputMode="numeric"
          />
        </Field>

        <Field label="Support needs" hint="choose all that apply">
          <div className="flex flex-wrap gap-2 rounded-xl border border-ink-200 bg-white p-3">
            {SUPPORT_NEEDS.map((need) => {
              const active = form.supportNeeds.includes(need);
              return (
                <button
                  key={need}
                  type="button"
                  onClick={() => toggleNeed(need)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition",
                    active
                      ? "bg-pine-800 text-cream-50 ring-pine-800"
                      : "bg-cream-100 text-ink-600 ring-ink-200 hover:ring-pine-400",
                  )}
                >
                  {need}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Accessibility notes" hint="optional">
          <Textarea
            value={form.accessibilityNotes}
            onChange={(e) => set("accessibilityNotes", e.target.value)}
            placeholder="Anything workers should know — mobility, communication preferences, access at home…"
            rows={3}
          />
        </Field>

        <Field label="Profile colour">
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set("color", color)}
                aria-label={`Choose ${color} colour`}
                aria-pressed={form.color === color}
                className={cn(
                  "h-9 w-9 rounded-full transition ring-offset-2 ring-offset-cream-50",
                  SWATCHES[color],
                  form.color === color ? "ring-[3px] ring-pine-800" : "opacity-60 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </Field>

        {error ? (
          <p role="alert" className="rounded-xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {editing ? "Save changes" : "Register participant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
