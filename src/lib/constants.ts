export const SERVICE_TYPES = [
  {
    id: "personal-care",
    label: "Personal Care",
    blurb: "Showering, dressing, grooming and daily hygiene support, delivered with dignity.",
    icon: "HandHeart",
    tint: "rose",
  },
  {
    id: "domestic-assistance",
    label: "Domestic Assistance",
    blurb: "Cleaning, laundry, dishes and keeping your home comfortable and safe.",
    icon: "Sparkles",
    tint: "sky",
  },
  {
    id: "meal-preparation",
    label: "Meal Preparation",
    blurb: "Meal planning, cooking support and groceries tailored to your tastes and needs.",
    icon: "ChefHat",
    tint: "amber",
  },
  {
    id: "transport",
    label: "Transport & Travel",
    blurb: "Accessible, reliable transport to appointments, work, study and social outings.",
    icon: "Bus",
    tint: "violet",
  },
  {
    id: "community-access",
    label: "Community Access",
    blurb: "Companionship and support to join sport, arts, events and local community life.",
    icon: "Users",
    tint: "leaf",
  },
  {
    id: "allied-health",
    label: "Allied Health Support",
    blurb: "Help with physio, OT and therapy programs, plus mobility equipment guidance.",
    icon: "Activity",
    tint: "teal",
  },
  {
    id: "respite-care",
    label: "Respite Care",
    blurb: "Flexible short-term support so participants and carers can both recharge.",
    icon: "Armchair",
    tint: "indigo",
  },
  {
    id: "home-garden",
    label: "Home & Garden Maintenance",
    blurb: "Lawn mowing, garden tidy-ups, minor repairs and home safety modifications.",
    icon: "Wrench",
    tint: "orange",
  },
  {
    id: "tech-assistance",
    label: "Tech & Digital Help",
    blurb: "Assistive technology, device setup, and staying connected with family online.",
    icon: "MonitorSmartphone",
    tint: "cyan",
  },
] as const;

export type ServiceTypeId = (typeof SERVICE_TYPES)[number]["id"];

export const STATUSES = [
  { id: "pending", label: "Pending", hint: "Waiting to be picked up" },
  { id: "in_progress", label: "In Progress", hint: "A team member is on it" },
  { id: "completed", label: "Completed", hint: "Service delivered" },
  { id: "cancelled", label: "Cancelled", hint: "No longer needed" },
] as const;

export type StatusId = (typeof STATUSES)[number]["id"];

export const OPEN_STATUSES: StatusId[] = ["pending", "in_progress"];

export const PRIORITIES = [
  { id: "low", label: "Low", hint: "Sometime in the next fortnight" },
  { id: "medium", label: "Standard", hint: "Within the next week" },
  { id: "high", label: "High", hint: "In the next day or two" },
  { id: "urgent", label: "Urgent", hint: "As soon as possible" },
] as const;

export type PriorityId = (typeof PRIORITIES)[number]["id"];

export const TIMES_OF_DAY = [
  "Morning (7am – 12pm)",
  "Afternoon (12pm – 5pm)",
  "Evening (5pm – 9pm)",
  "Flexible",
] as const;

export const AU_STATES = [
  { id: "NSW", label: "New South Wales" },
  { id: "VIC", label: "Victoria" },
  { id: "QLD", label: "Queensland" },
  { id: "WA", label: "Western Australia" },
  { id: "SA", label: "South Australia" },
  { id: "TAS", label: "Tasmania" },
  { id: "ACT", label: "Australian Capital Territory" },
  { id: "NT", label: "Northern Territory" },
] as const;

export const STAFF_ROLES = [
  "Support Coordinator",
  "Support Worker",
  "Community Access Worker",
  "Allied Health Assistant",
  "Team Lead",
  "Administrator",
] as const;

export const AVATAR_COLORS = [
  "pine",
  "wattle",
  "coral",
  "sky",
  "violet",
  "leaf",
] as const;

export function serviceLabel(id: string): string {
  return SERVICE_TYPES.find((s) => s.id === id)?.label ?? id;
}

export function statusLabel(id: string): string {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}

export function priorityLabel(id: string): string {
  return PRIORITIES.find((p) => p.id === id)?.label ?? id;
}
