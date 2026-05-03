import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandscapeBg from "@/components/LandscapeBg";

export const metadata = {
  title: "About — OTR Exterior Care",
  description:
    "On The Road. Locally owned exterior services across the region — same crew, same standards, same number to call.",
};

const VALUES = [
  {
    title: "Show up",
    body: "We confirm the day before, arrive in the window, and finish what we start. No three-day disappearing acts.",
  },
  {
    title: "Do the job right",
    body: "Right pressure for the surface. Right depth for the mulch. Right pitch on the gutters. We don't fake care.",
  },
  {
    title: "Leave it cleaner than we found it",
    body: "Cleanup is part of the job, not an extra. You shouldn't be sweeping after we leave.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-20">
        <LandscapeBg />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/40 via-transparent to-otr-black" />

        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Our story
          </div>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-otr-stone md:text-6xl">
            On The Road. <br />
            <span className="text-otr-sky">For your home.</span>
          </h1>

          {/* TODO: Rewrite this story with real founder voice & history. */}
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-otr-stone/75">
            <p>
              OTR stands for <strong className="text-otr-stone">On The Road</strong>.
              That's the whole idea — we come to you. Whether you're a few
              minutes from our shop or out at the edge of the next county, the
              truck's already pointed your way.
            </p>
            <p>
              We started OTR Exterior Care because the local market was full of
              one-truck operators who'd ghost halfway through a job. We wanted
              to build something steadier — a small, family-style crew that
              treats every property like it's the only one on the schedule.
              Same faces, same standards, same number to call when something
              comes up.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-otr-black py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            How we work
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold text-otr-stone md:text-5xl">
            Three things, every time.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl border border-white/5 bg-otr-ink p-6 transition-all hover:border-otr-blue/30 hover:bg-otr-slate"
              >
                <div className="font-display text-5xl font-semibold text-otr-blue-bright/30">
                  0{i + 1}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-otr-stone">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-otr-stone/65">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo placeholder block */}
      <section className="bg-otr-ink py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl border border-white/5 bg-otr-slate flex items-center justify-center text-xs uppercase tracking-wider text-otr-stone/40">
              [Crew photo placeholder]
            </div>
            <div className="aspect-video rounded-xl border border-white/5 bg-otr-slate flex items-center justify-center text-xs uppercase tracking-wider text-otr-stone/40">
              [Before & after placeholder]
            </div>
            <div className="aspect-video rounded-xl border border-white/5 bg-otr-slate flex items-center justify-center text-xs uppercase tracking-wider text-otr-stone/40">
              [Truck on the road placeholder]
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-otr-black py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-semibold text-otr-stone md:text-5xl">
            Let's get on the road.
          </h2>
          <Link
            href="/booking"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-otr-blue px-7 py-3.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
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
