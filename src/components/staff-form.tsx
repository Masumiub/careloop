"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import { AVATAR_COLORS, STAFF_ROLES } from "@/lib/constants";
import type { StaffDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const SPECIALITIES = [
  "Personal care",
  "Domestic assistance",
  "Community access",
  "Transport",
  "Meal preparation",
  "Allied health",
  "Respite care",
  "Auslan (basic)",
  "Manual handling",
  "Assistive technology",
  "Travel training",
  "Complex care",
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
  email: string;
  phone: string;
  role: string;
  region: string;
  specialities: string[];
  color: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  role: STAFF_ROLES[1],
  region: "",
  specialities: [],
  color: "pine",
};

export function StaffFormModal({
  open,
  onClose,
  onSaved,
  member,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (member: StaffDTO) => void;
  member?: StaffDTO | null;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(member);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        region: member.region,
        specialities: member.specialities ?? [],
        color: member.color,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, member]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSpeciality(speciality: string) {
    setForm((prev) => ({
      ...prev,
      specialities: prev.specialities.includes(speciality)
        ? prev.specialities.filter((s) => s !== speciality)
        : [...prev.specialities, speciality],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = editing
        ? await api<{ staff: StaffDTO }>(`/api/staff/${member!.id}`, { method: "PATCH", body: form })
        : await api<{ staff: StaffDTO }>("/api/staff", { method: "POST", body: form });
      toast.success(editing ? "Team member updated" : "Welcome to the team", `${result.staff.name} has been ${editing ? "updated" : "added"}.`);
      onSaved(result.staff);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save team member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit team member" : "Add a team member"}
      description={editing ? "Update role, region and skills." : "They'll appear in assignment lists right away."}
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jordan Lee" required autoFocus />
          </Field>
          <Field label="Role" required>
            <Select value={form.role} onChange={(e) => set("role", e.target.value)}>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work email" required>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@careloop.au" required />
          </Field>
          <Field label="Phone" required>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03 9000 0000" required />
          </Field>
        </div>

        <Field label="Region" required>
          <Input value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="e.g. Melbourne Metro" required />
        </Field>

        <Field label="Specialities" hint="choose all that apply">
          <div className="flex flex-wrap gap-2 rounded-xl border border-ink-200 bg-white p-3">
            {SPECIALITIES.map((speciality) => {
              const active = form.specialities.includes(speciality);
              return (
                <button
                  key={speciality}
                  type="button"
                  onClick={() => toggleSpeciality(speciality)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition",
                    active
                      ? "bg-pine-800 text-cream-50 ring-pine-800"
                      : "bg-cream-100 text-ink-600 ring-ink-200 hover:ring-pine-400",
                  )}
                >
                  {speciality}
                </button>
              );
            })}
          </div>
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
            {editing ? "Save changes" : "Add team member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
