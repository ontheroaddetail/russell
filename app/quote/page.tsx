import { Suspense } from "react";
import LandscapeBg from "@/components/LandscapeBg";
import QuoteForm from "@/components/QuoteForm";

export const metadata = {
  title: "Get a Quote — OTR Exterior Care",
  description:
    "Tell us your address and what you'd like done. We measure from satellite imagery and email a fixed quote within 24 hours.",
};

function Fallback() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-3xl bg-otr-ink/80" />
      <div className="h-48 animate-pulse rounded-3xl bg-otr-ink/80" />
    </div>
  );
}

export default function QuotePage() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <LandscapeBg />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/50 via-otr-black/70 to-otr-black" />

      <div className="relative mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Free quote
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-otr-stone md:text-5xl">
            Quote from your address.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-otr-stone/65">
            Skip the on-site visit. We measure from satellite imagery and email
            you a fixed quote within 24 hours.
          </p>
        </div>

        <Suspense fallback={<Fallback />}>
          <QuoteForm />
        </Suspense>
      </div>
    </section>
  );
}
