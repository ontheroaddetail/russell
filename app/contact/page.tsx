import Link from "next/link";
import { Phone, Mail, Clock, ArrowRight } from "lucide-react";
import LandscapeBg from "@/components/LandscapeBg";
import ServiceAreas from "@/components/ServiceAreas";
import { SITE } from "@/lib/site-config";

export const metadata = {
  title: "Contact — OTR Exterior Care",
  description:
    "Phone, email, hours, and service area for OTR Exterior Care. Bookings replied to within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16">
        <LandscapeBg />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/40 via-transparent to-otr-black" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Contact
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-otr-stone sm:text-5xl md:text-6xl">
            Reach out — we'll respond fast.
          </h1>
          <p className="mt-5 max-w-2xl text-otr-stone/70">
            For the quickest path to a confirmed visit, use the booking page —
            it sends straight to our schedule. For everything else, here's how
            to find us.
          </p>
        </div>
      </section>

      <section className="bg-otr-black pb-16">
        <div className="mx-auto grid max-w-5xl gap-5 px-6 md:grid-cols-2">
          <a
            href={SITE.phoneHref}
            className="group rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all hover:border-otr-blue/40 hover:bg-otr-slate sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-otr-slate">
              <Phone size={20} className="text-otr-sky" />
            </div>
            <div className="mt-5 text-xs uppercase tracking-wider text-otr-stone/50">
              Phone
            </div>
            <div className="mt-1 break-all font-display text-xl font-semibold text-otr-stone sm:text-2xl">
              {SITE.phone}
            </div>
            <p className="mt-2 text-sm text-otr-stone/55">
              Tap to call. We pick up during business hours.
            </p>
          </a>

          <a
            href={SITE.emailHref}
            className="group rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all hover:border-otr-blue/40 hover:bg-otr-slate sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-otr-slate">
              <Mail size={20} className="text-otr-sky" />
            </div>
            <div className="mt-5 text-xs uppercase tracking-wider text-otr-stone/50">
              Email
            </div>
            <div className="mt-1 break-all font-display text-lg font-semibold text-otr-stone sm:text-xl">
              {SITE.email}
            </div>
            <p className="mt-2 text-sm text-otr-stone/55">
              Photos welcome — they help us quote faster.
            </p>
          </a>

          <a
            href={SITE.schedulingEmailHref}
            className="group rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all hover:border-otr-blue/40 hover:bg-otr-slate sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-otr-slate">
              <Mail size={20} className="text-otr-sky" />
            </div>
            <div className="mt-5 text-xs uppercase tracking-wider text-otr-stone/50">
              Bookings inbox
            </div>
            <div className="mt-1 break-all font-display text-lg font-semibold text-otr-stone sm:text-xl">
              {SITE.schedulingEmail}
            </div>
            <p className="mt-2 text-sm text-otr-stone/55">
              Bookings from the form land here automatically.
            </p>
          </a>

          <div className="rounded-2xl border border-white/5 bg-otr-ink p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-otr-slate">
              <Clock size={20} className="text-otr-sky" />
            </div>
            <div className="mt-5 text-xs uppercase tracking-wider text-otr-stone/50">
              Hours
            </div>
            <div className="mt-3 space-y-2 text-sm text-otr-stone/75">
              {SITE.hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-6">
                  <span className="text-otr-stone/55">{h.day}</span>
                  <span className="font-medium">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServiceAreas />

      <section className="bg-otr-black py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold text-otr-stone md:text-4xl">
            Ready to book?
          </h2>
          <p className="mt-3 text-otr-stone/65">
            Skip the back-and-forth — book online and we'll confirm within 24
            hours.
          </p>
          <Link
            href="/booking"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-otr-blue px-7 py-3.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
          >
            Book a service
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
