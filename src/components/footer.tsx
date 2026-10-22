import { HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-pine-800 bg-pine-950 text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-wattle-400 text-pine-950">
                <HeartHandshake className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-xl font-black tracking-tight">
                Care<span className="text-wattle-300">Loop</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/70">
              Disability support services built around the person, not the paperwork.
              Serving communities across Australia.
            </p>
            <p className="mt-6 text-xs leading-relaxed text-cream-100/50">
              CareLoop acknowledges the Traditional Owners of Country throughout Australia
              and recognises their continuing connection to land, waters and culture.
              We pay our respects to Elders past and present.
            </p>
          </div>

          <nav aria-label="Services" className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-widest text-wattle-300">Support</p>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/services">
              All services
            </Link>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/request">
              Request help
            </Link>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/my-requests">
              Track my requests
            </Link>
          </nav>

          <nav aria-label="Organisation" className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-widest text-wattle-300">Team</p>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/dashboard">
              Staff dashboard
            </Link>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/dashboard/participants">
              Participants
            </Link>
            <Link className="block text-cream-100/75 transition hover:text-wattle-300" href="/dashboard/team">
              Our team
            </Link>
          </nav>

          <div className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-widest text-wattle-300">Talk to us</p>
            <p className="flex items-center gap-2 text-cream-100/75">
              <Phone className="h-4 w-4 text-wattle-300" aria-hidden /> 1800 CARE LOOP (1800 227 356)
            </p>
            <p className="flex items-center gap-2 text-cream-100/75">
              <Mail className="h-4 w-4 text-wattle-300" aria-hidden /> hello@careloop.au
            </p>
            <p className="flex items-start gap-2 text-cream-100/75">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-wattle-300" aria-hidden />
              Level 2, 14 Eucalyptus Lane,
              <br />
              Melbourne VIC 3000
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream-100/15 pt-6 text-xs text-cream-100/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CareLoop Community Services Ltd. ABN 12 345 678 901. Registered NDIS provider.</p>
          <p>This is a demo experience with sample data — no real participant information is used.</p>
        </div>
      </div>
    </footer>
  );
}
