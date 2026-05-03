import Link from "next/link";
import { ArrowRight, ShieldCheck, Map, Clock, Phone } from "lucide-react";
import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import { COUNTIES, COUNTIES_LABEL, SITE } from "@/lib/site-config";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Insured & accountable",
    body: "Fully insured, locally owned. If we say we'll be there, we will.",
  },
  {
    icon: Map,
    title: "Multi-county service",
    body: `${COUNTIES_LABEL} — we go where the work is and treat every property like it's the only one on the schedule.`,
  },
  {
    icon: Clock,
    title: "Same-week availability",
    body: "Most jobs booked within the week. Confirmations within 24 hours of your request.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />

      {/* Why choose us */}
      <section className="relative overflow-hidden bg-otr-ink py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,125,210,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
                Why OTR
              </div>
              <h2 className="mt-3 font-display text-4xl font-semibold text-otr-stone md:text-5xl">
                The crew you'd recommend to your neighbor.
              </h2>
              <p className="mt-4 text-otr-stone/65">
                We started OTR because the exterior services market is full of
                no-shows and one-truck operators. We're building something
                steadier — same crew, same standards, same number to call.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="group inline-flex items-center gap-2 rounded-full bg-otr-blue px-6 py-3 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
                >
                  Book a service
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-otr-stone/85 transition-all hover:bg-white/10"
                >
                  Our story
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {REASONS.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-otr-slate/40 p-5 transition-all hover:border-otr-blue/30 hover:bg-otr-slate"
                  >
                    <div className="rounded-xl border border-white/5 bg-otr-ink p-3">
                      <Icon size={20} className="text-otr-sky" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-otr-stone">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm text-otr-stone/65">{r.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Service area strip */}
      <section className="border-y border-white/5 bg-otr-black py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Service area
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-otr-stone">
            On the road across the region.
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-otr-stone/70">
            {COUNTIES.map((c, i) => (
              <span key={c} className="inline-flex items-center gap-6">
                {c}
                {i < COUNTIES.length - 1 && (
                  <span className="hidden h-1 w-1 rounded-full bg-otr-stone/30 md:inline-block" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-otr-black via-otr-blue-deep/30 to-otr-black py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(127,183,232,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-semibold text-otr-stone md:text-6xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-otr-stone/70">
            Tell us about the property, pick a window, and we'll be in touch
            within 24 hours. No pressure, no upsells.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/booking"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-otr-blue px-8 py-4 text-base font-semibold text-otr-stone shadow-2xl shadow-otr-blue-deep/40 transition-all hover:scale-[1.02] hover:bg-otr-blue-bright"
            >
              <span className="relative z-10">Book online</span>
              <ArrowRight
                size={16}
                className="relative z-10 transition-transform group-hover:translate-x-1"
              />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-otr-stone backdrop-blur transition-all hover:bg-white/10"
            >
              <Phone size={16} />
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
