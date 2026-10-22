import { ArrowRight, CheckCircle2, ShieldCheck, UserCheck, Wallet } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { Counter, Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { SERVICE_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore CareLoop's disability support services — personal care, transport, meals, community access, respite and more, available across Australia.",
};

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Screened & trained workers",
    body: "Every worker holds a current NDIS worker screening check, first aid certificate and reference checks.",
  },
  {
    icon: UserCheck,
    title: "You choose who comes",
    body: "We match by skills, interests and personality — and you can always ask for the same familiar faces.",
  },
  {
    icon: Wallet,
    title: "NDIS-friendly billing",
    body: "Plan-managed, self-managed or NDIA-managed — we handle the paperwork so you don't have to.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral-600">Services</p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-pine-950 sm:text-5xl">
          Nine ways we can lend a hand
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-500">
          From the everyday essentials to the adventures that make life good. Every
          request is read by a real coordinator — usually within the hour.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_TYPES.map((service, i) => (
          <Reveal key={service.id} delay={(i % 3) * 0.07}>
            <div className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <ServiceIcon icon={service.icon} tint={service.tint} size="lg" />
              <h2 className="mt-5 font-display text-xl font-bold text-ink-900">{service.label}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{service.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-600">
                {serviceExamples(service.id).map((example) => (
                  <li key={example} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pine-500" aria-hidden />
                    {example}
                  </li>
                ))}
              </ul>
              <Link
                href={`/request?service=${service.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 transition group-hover:gap-2.5"
              >
                Request {service.label.toLowerCase()}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {PROMISES.map((promise, i) => (
          <Reveal key={promise.title} delay={i * 0.08}>
            <div className="h-full rounded-3xl bg-pine-800 p-7 text-cream-50 shadow-soft">
              <promise.icon className="h-8 w-8 text-wattle-300" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-bold">{promise.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/75">{promise.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <div className="dot-grid rounded-[2.5rem] border-2 border-pine-200 bg-white px-6 py-14 text-center">
          <p className="font-display text-5xl font-black text-pine-800">
            <Counter value={97} suffix="%" />
          </p>
          <p className="mt-2 text-ink-500">of requests are matched within the week — most within the hour.</p>
          <Link
            href="/request"
            className="mt-7 inline-flex h-13 items-center gap-2 rounded-2xl bg-pine-800 px-8 py-3.5 text-base font-bold text-cream-50 shadow-lift transition hover:-translate-y-0.5 hover:bg-pine-700"
          >
            Make your first request
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function serviceExamples(id: string): string[] {
  const examples: Record<string, string[]> = {
    "personal-care": ["Showering & dressing", "Toileting support", "Grooming & hygiene"],
    "domestic-assistance": ["Cleaning & vacuuming", "Laundry & linen", "Dishwashing & tidying"],
    "meal-preparation": ["Weekly meal planning", "Batch cooking", "Special dietary needs"],
    transport: ["Medical appointments", "Work & study commutes", "Social outings & events"],
    "community-access": ["Sport & recreation", "Arts, classes & hobbies", "Local events & groups"],
    "allied-health": ["Physio & OT programs", "Hydrotherapy support", "Mobility equipment"],
    "respite-care": ["In-home respite", "Overnight support", "Carer breaks & getaways"],
    "home-garden": ["Lawn & garden care", "Minor home repairs", "Safety modifications"],
    "tech-assistance": ["Device setup & training", "Video calls with family", "Accessible tech advice"],
  };
  return examples[id] ?? [];
}
