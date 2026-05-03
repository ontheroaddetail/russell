import LandscapeBg from "@/components/LandscapeBg";
import BookingForm from "@/components/BookingForm";

export const metadata = {
  title: "Book Online — OTR Exterior Care",
  description:
    "Book pressure washing, landscaping, gutters, and more. 60-second online booking. Confirmation within 24 hours.",
};

export default function BookingPage() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <LandscapeBg />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-otr-black/50 via-otr-black/70 to-otr-black" />

      <div className="relative mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-otr-blue-bright">
            Online booking
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-otr-stone md:text-5xl">
            Book your visit.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-otr-stone/65">
            Four quick steps. We'll confirm within 24 hours.
          </p>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}
