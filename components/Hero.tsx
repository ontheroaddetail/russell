import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import LandscapeBg from "./LandscapeBg";
import { SITE } from "@/lib/site-config";

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <LandscapeBg />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/30 via-transparent to-otr-black" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-24 md:pt-40">
        <div className="max-w-3xl animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wider text-otr-sky backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-otr-sky" />
            OTR — ON THE ROAD · WADSWORTH · AKRON · CLEVELAND
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-otr-stone sm:text-6xl md:text-7xl">
            Exterior Care
            <br />
            <span className="text-otr-sky">That Goes</span>
            <br />
            The Extra Mile.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-otr-stone/75">
            Pressure washing, landscaping, gutters, and more — based in
            Wadsworth, on the road across Northeast Ohio. Book online in 60
            seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/booking"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-otr-blue px-7 py-3.5 text-sm font-semibold text-otr-stone shadow-xl shadow-otr-blue-deep/40 transition-all hover:scale-[1.02] hover:bg-otr-blue-bright"
            >
              <span className="relative z-10">Book a Service</span>
              <ArrowRight
                size={16}
                className="relative z-10 transition-transform group-hover:translate-x-1"
              />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-otr-stone backdrop-blur transition-all hover:bg-white/10"
            >
              <Phone size={16} />
              {SITE.phone}
            </a>
          </div>

          <div className="mt-14 flex items-center gap-6 text-xs uppercase tracking-widest text-otr-stone/40">
            <div>Insured</div>
            <div className="h-3 w-px bg-otr-stone/20" />
            <div>Local crew</div>
            <div className="h-3 w-px bg-otr-stone/20" />
            <div>Same-week service</div>
          </div>
        </div>
      </div>
    </section>
  );
}
