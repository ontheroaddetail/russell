import Link from "next/link";
import { ArrowRight, MapPin, Clock, AlertCircle } from "lucide-react";
import { SERVICE_AREAS } from "@/lib/site-config";

export default function ServiceAreas() {
  return (
    <section className="relative bg-otr-black py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Service area
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-otr-stone md:text-4xl">
            On the road across Northeast Ohio.
          </h2>
          <p className="mt-3 text-otr-stone/65">
            Three primary cities. Plenty of stops in between.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICE_AREAS.map((area) => (
            <article
              key={area.slug}
              className="group flex flex-col rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all hover:-translate-y-1 hover:border-otr-blue/40 hover:bg-otr-slate md:p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl border border-white/5 bg-otr-slate p-2.5">
                    <MapPin size={18} className="text-otr-sky" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-otr-stone">
                      {area.city}, {area.state}
                    </h3>
                    <div className="text-xs text-otr-stone/55">
                      {area.county} · {area.zip}
                    </div>
                  </div>
                </div>
                {area.travelNote && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-otr-stone/65">
                    <Clock size={10} /> {area.travelNote}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-otr-stone/70">
                {area.blurb}
              </p>

              <div className="mt-5 border-t border-white/5 pt-4">
                <div className="text-[10px] uppercase tracking-wider text-otr-stone/45">
                  Also covers
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {area.covers.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-white/5 bg-otr-slate/60 px-2 py-0.5 text-[11px] text-otr-stone/75"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {area.bookInAdvance && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-otr-blue/30 bg-otr-blue/10 p-3 text-xs text-otr-sky">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>Please book a few days in advance.</span>
                </div>
              )}

              <div className="mt-auto space-y-2 pt-5">
                <Link
                  href={`/booking?area=${area.slug}`}
                  className="group/cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-otr-blue px-5 py-3 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
                >
                  Book in {area.city}
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover/cta:translate-x-1"
                  />
                </Link>
                <Link
                  href={`/quote?area=${area.slug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-otr-stone/85 transition-all hover:bg-white/10"
                >
                  Or get a free quote first
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
