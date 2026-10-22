import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarClock, ClipboardList, MapPin, MessageCircleHeart, HeartHandshake, PhoneCall, Search } from "lucide-react";
import Link from "next/link";
import { Counter, Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { SERVICE_TYPES } from "@/lib/constants";

const HERO_IMG =
  "https://images.pexels.com/photos/8415847/pexels-photo-8415847.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=880";
const HERO_SMALL =
  "https://images.pexels.com/photos/6647126/pexels-photo-6647126.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=520&w=680";
const STORY_IMG =
  "https://images.pexels.com/photos/7699083/pexels-photo-7699083.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200";

const STEPS = [
  {
    icon: MessageCircleHeart,
    title: "Tell us what you need",
    body: "Pick a service, choose a time that suits, and share any details — big print, plain English, no jargon.",
  },
  {
    icon: Search,
    title: "We find your match",
    body: "Our coordinators pair you with a support worker who fits your needs, your suburb and your vibe.",
  },
  {
    icon: HeartHandshake,
    title: "Support arrives, your way",
    body: "Track every request live, chat with your team, and keep your routine exactly how you like it.",
  },
];

const STATS = [
  { value: 1248, suffix: "", label: "services delivered this month" },
  { value: 97, suffix: "%", label: "of requests filled within the week" },
  { value: 320, suffix: "+", label: "verified support workers, Australia-wide" },
  { value: 9, suffix: "", label: "kinds of everyday support, one simple request" },
];

export default function HomePage() {
  return (
    <div>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pb-24 lg:pt-20 lg:px-8">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-wattle-300">
                <BadgeCheck className="h-4 w-4" aria-hidden />
                Registered NDIS provider · Australia-wide
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[2.9rem] font-black leading-[1.02] tracking-tight text-pine-950 sm:text-6xl lg:text-[4.4rem]">
                Support that fits around{" "}
                <em className="relative inline-block font-light italic text-coral-600">
                  your
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-wattle-400"
                    viewBox="0 0 120 12"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M2 9c26-5.5 66-6.5 116-3" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </em>{" "}
                life.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
                CareLoop helps Australians with disability request everyday support in
                minutes — personal care, transport, meals, community adventures and more.
                You ask, real people answer, and you can follow it every step of the way.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-pine-800 px-8 text-base font-bold text-cream-50 shadow-lift transition hover:-translate-y-0.5 hover:bg-pine-700"
                >
                  Request help now
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-base font-bold text-pine-900 shadow-soft ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:ring-pine-300"
                >
                  Explore services
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
                <span className="inline-flex items-center gap-2">
                  <span className="flex -space-x-2" aria-hidden>
                    {["bg-pine-700", "bg-wattle-400", "bg-coral-500", "bg-sky-600"].map((c, i) => (
                      <span key={i} className={`h-7 w-7 rounded-full ring-2 ring-cream-100 ${c}`} />
                    ))}
                  </span>
                  Trusted by 2,400+ participants & families
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-pine-600" aria-hidden />
                  Prefer to talk? 1800 227 356
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero visual cluster */}
          <Reveal delay={0.15} className="relative">
            <div className="relative mx-auto max-w-[520px]">
              <div
                className="absolute -inset-6 -rotate-2 rounded-[2.5rem] bg-gradient-to-br from-wattle-200 via-cream-200 to-pine-200"
                aria-hidden
              />
              <img
                src={HERO_IMG}
                alt="A young man using a wheelchair smiling outdoors in the sun"
                className="relative aspect-[4/5] w-full rotate-1 rounded-[2rem] object-cover shadow-lift"
              />
              <div className="absolute -left-6 bottom-10 hidden w-44 -rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-lift sm:block lg:-left-14">
                <img
                  src={HERO_SMALL}
                  alt="A support worker sharing a laugh with a man in a wheelchair"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute -right-3 top-8 flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-lift backdrop-blur sm:-right-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-700 text-cream-50">
                  <CalendarClock className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Next visit</p>
                  <p className="text-sm font-bold text-ink-900">Tomorrow, 9:00 am</p>
                </div>
              </div>
              <div className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-pine-900/95 p-3 pr-5 text-cream-50 shadow-lift backdrop-blur">
                <span className="relative flex h-3 w-3" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wattle-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-wattle-300" />
                </span>
                <p className="text-sm font-semibold">6 new requests being matched right now</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Marquee */}
        <div className="relative -rotate-1 border-y-4 border-wattle-300 bg-pine-900 py-3.5 text-cream-100">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap px-4" aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-8">
                {SERVICE_TYPES.map((s) => (
                  <span key={`${copy}-${s.id}`} className="flex items-center gap-8 text-sm font-bold uppercase tracking-[0.28em]">
                    {s.label}
                    <span className="h-1.5 w-1.5 rounded-full bg-wattle-400" />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className="sr-only">Our services include {SERVICE_TYPES.map((s) => s.label).join(", ")}.</span>
        </div>
      </section>

      {/* ----------------------------- SERVICES ----------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral-600">What we can help with</p>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-pine-950 sm:text-5xl">
            Everyday support, extraordinary people
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Nine kinds of help, one simple request. Every service is delivered by trained,
            screened workers who genuinely love what they do.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_TYPES.map((service, i) => (
            <Reveal key={service.id} delay={(i % 3) * 0.08}>
              <Link
                href={`/request?service=${service.id}`}
                className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-pine-200 hover:shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <ServiceIcon icon={service.icon} tint={service.tint} size="lg" />
                  <ArrowUpRight
                    className="h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pine-600"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900">{service.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{service.blurb}</p>
                <p className="mt-4 text-sm font-bold text-pine-700">
                  Request this <span className="transition group-hover:tracking-wide">→</span>
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------- HOW IT WORKS --------------------------- */}
      <section className="border-y border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral-600">How CareLoop works</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-pine-950">
              Three steps. Zero run-around.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative h-full rounded-3xl bg-cream-100 p-7 ring-1 ring-ink-100">
                  <span className="font-display text-6xl font-black text-pine-200" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <step.icon className="h-6 w-6 text-coral-600" aria-hidden />
                    <h3 className="font-display text-xl font-bold text-ink-900">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- STATS ------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.07}>
              <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-soft">
                <p className="font-display text-5xl font-black tracking-tight text-pine-800">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm leading-snug text-ink-500">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- STORY ------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-pine-900 text-cream-50 shadow-lift">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[280px]">
              <img
                src={STORY_IMG}
                alt="A support worker assisting a man using an electric wheelchair along a footpath"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pine-950/70 via-transparent" aria-hidden />
              <p className="absolute bottom-5 left-6 flex items-center gap-2 text-sm font-semibold text-cream-100/90">
                <MapPin className="h-4 w-4 text-wattle-300" aria-hidden />
                Surry Hills, NSW
              </p>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <Reveal>
                <ClipboardList className="h-8 w-8 text-wattle-300" aria-hidden />
                <blockquote className="mt-6 font-display text-2xl font-medium leading-snug sm:text-[1.8rem]">
                  “I put in a request on Tuesday night, and by Friday Omar was on the
                  train with me practising the trip to my brother's place. It's the
                  first time a service has felt like it actually runs on my clock.”
                </blockquote>
                <p className="mt-6 font-bold text-wattle-300">Cooper Wilson</p>
                <p className="text-sm text-cream-100/70">CareLoop participant since 2024 · Sydney</p>
                <Link
                  href="/my-requests"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-wattle-400 px-5 py-3 text-sm font-bold text-pine-950 transition hover:bg-wattle-300"
                >
                  See how requests work
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="dot-grid relative overflow-hidden rounded-[2.5rem] border-2 border-pine-200 bg-wattle-300 px-6 py-16 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-black tracking-tight text-pine-950 sm:text-5xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-pine-900/80">
              Tell us what would make tomorrow easier — a real coordinator reads every
              request, usually within the hour.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/request"
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-pine-900 px-8 text-base font-bold text-cream-50 shadow-lift transition hover:-translate-y-0.5"
              >
                Make a request
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white/80 px-8 text-base font-bold text-pine-900 ring-1 ring-pine-900/20 transition hover:-translate-y-0.5 hover:bg-white"
              >
                I'm a staff member
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
