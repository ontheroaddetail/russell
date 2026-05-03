import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import LandscapeBg from "@/components/LandscapeBg";
import { SERVICES } from "@/lib/services";

export const metadata = {
  title: "Services — OTR Exterior Care",
  description:
    "Pressure washing, landscaping, gutters, holiday lights, and more. Detailed service breakdowns from OTR Exterior Care.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16">
        <LandscapeBg />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/40 via-transparent to-otr-black" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Services
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight text-otr-stone md:text-6xl">
            Everything your property needs, from one crew.
          </h1>
          <p className="mt-5 max-w-2xl text-otr-stone/70">
            Pricing depends on property size, condition, and access. Tell us
            what you need and we'll give you a fixed quote within 24 hours.
          </p>
        </div>
      </section>

      <section className="bg-otr-black py-14">
        <div className="mx-auto max-w-5xl space-y-6 px-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.slug}
                id={service.slug}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-otr-ink p-8 transition-all hover:border-otr-blue/30 md:p-10"
              >
                <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-otr-slate">
                    <Icon size={26} className="text-otr-sky" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-2xl font-semibold text-otr-stone md:text-3xl">
                        {service.name}
                      </h2>
                      {service.seasonal && (
                        <span className="rounded-full border border-otr-moss/40 bg-otr-moss/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-otr-moss">
                          Seasonal
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-otr-stone/70">
                      {service.long}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-otr-stone/65">
                      <li className="inline-flex items-center gap-2">
                        <Check size={14} className="text-otr-blue-bright" />
                        Free written quote
                      </li>
                      <li className="inline-flex items-center gap-2">
                        <Check size={14} className="text-otr-blue-bright" />
                        Fully insured
                      </li>
                      <li className="inline-flex items-center gap-2">
                        <Check size={14} className="text-otr-blue-bright" />
                        Cleanup included
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-4">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-otr-stone/40">
                        Starting at
                      </div>
                      <div className="font-display text-2xl font-semibold text-otr-stone">
                        {service.startingAt}
                      </div>
                    </div>
                    <Link
                      href="/booking"
                      className="inline-flex items-center gap-2 rounded-full bg-otr-blue px-5 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
                    >
                      Book
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
