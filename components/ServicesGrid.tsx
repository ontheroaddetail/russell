import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/services";

export default function ServicesGrid() {
  return (
    <section className="relative bg-otr-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            What we do
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold text-otr-stone md:text-5xl">
            Ten services. One trusted crew.
          </h2>
          <p className="mt-4 text-otr-stone/65">
            From spring cleanup to holiday lights and everything in between —
            one number, one schedule, one team that shows up.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={service.slug}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all duration-300 hover:-translate-y-1 hover:border-otr-blue/40 hover:bg-otr-slate"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-otr-blue/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex items-start justify-between">
                  <div className="rounded-xl border border-white/5 bg-otr-slate p-3">
                    <Icon size={22} className="text-otr-sky" />
                  </div>
                  {service.seasonal && (
                    <span className="rounded-full border border-otr-moss/40 bg-otr-moss/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-otr-moss">
                      Seasonal
                    </span>
                  )}
                </div>

                <h3 className="relative mt-5 font-display text-xl font-semibold text-otr-stone">
                  {service.name}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-otr-stone/65">
                  {service.short}
                </p>

                <div className="relative mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-otr-stone/50">
                    Starting at{" "}
                    <span className="font-semibold text-otr-stone/85">
                      {service.startingAt}
                    </span>
                  </div>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-otr-blue-bright transition-colors group-hover:text-otr-sky"
                  >
                    Book
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
