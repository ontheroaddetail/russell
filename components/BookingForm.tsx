"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { SERVICES, priceForArea } from "@/lib/services";
import { SERVICE_AREAS, findServiceArea } from "@/lib/site-config";
import type {
  Booking,
  BookingResponse,
  ContactMethod,
  PropertyType,
  TimeWindow,
} from "@/lib/types";
import { TIME_WINDOWS } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

const STEPS = ["Area", "Services", "Property", "Date & Time", "Contact"] as const;

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const initialBooking: Booking = {
  services: [],
  address: "",
  city: "",
  area: "",
  propertyType: "residential",
  notes: "",
  date: "",
  timeWindow: "morning",
  name: "",
  phone: "",
  email: "",
  contactMethod: "phone",
};

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const minDate = useMemo(tomorrowISO, []);
  const area = findServiceArea(booking.area);

  // Prefill area from ?area=… on the city CTA buttons. Auto-advance past step 0.
  useEffect(() => {
    const areaParam = searchParams.get("area");
    if (!areaParam) return;
    const match = SERVICE_AREAS.find((a) => a.slug === areaParam);
    if (!match) return;
    setBooking((b) => ({
      ...b,
      area: match.slug,
      city: b.city || match.city,
    }));
    setStep((s) => (s === 0 ? 1 : s));
  }, [searchParams]);

  function update<K extends keyof Booking>(key: K, value: Booking[K]) {
    setBooking((b) => ({ ...b, [key]: value }));
  }

  function pickArea(slug: string) {
    const match = findServiceArea(slug);
    setBooking((b) => ({
      ...b,
      area: slug,
      city: b.city || match?.city || "",
    }));
  }

  function toggleService(name: string) {
    setBooking((b) => ({
      ...b,
      services: b.services.includes(name)
        ? b.services.filter((s) => s !== name)
        : [...b.services, name],
    }));
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!booking.area) return "Pick a service area to start.";
    }
    if (step === 1) {
      if (booking.services.length === 0) return "Pick at least one service.";
    }
    if (step === 2) {
      if (!booking.address.trim()) return "Address is required.";
      if (!booking.city.trim()) return "City is required.";
    }
    if (step === 3) {
      if (!booking.date) return "Pick a date.";
      if (booking.date < minDate)
        return "Pick a date that's at least tomorrow.";
    }
    if (step === 4) {
      if (!booking.name.trim()) return "Name is required.";
      if (!booking.phone.trim()) return "Phone is required.";
      if (!booking.email.trim() || !booking.email.includes("@"))
        return "A valid email is required.";
    }
    return null;
  }

  function next() {
    setTouched(true);
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setTouched(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setTouched(true);
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      const data = (await res.json()) as BookingResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return <SuccessPanel booking={booking} />;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-otr-ink/80 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-6 md:p-10">
      <ProgressBar step={step} />

      <div className="mt-8">
        {step === 0 && (
          <AreaStep selectedSlug={booking.area} onPick={pickArea} />
        )}
        {step === 1 && (
          <ServicesStep
            selected={booking.services}
            onToggle={toggleService}
            areaSlug={booking.area}
          />
        )}
        {step === 2 && <PropertyStep booking={booking} update={update} />}
        {step === 3 && (
          <DateTimeStep booking={booking} update={update} minDate={minDate} />
        )}
        {step === 4 && <ContactStep booking={booking} update={update} />}
      </div>

      {touched && error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-otr-stone/80 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="group inline-flex items-center gap-2 rounded-full bg-otr-blue px-6 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright sm:px-7"
          >
            Next
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "submitting"}
            className="inline-flex items-center gap-2 rounded-full bg-otr-blue px-6 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright disabled:opacity-60 sm:px-7"
          >
            {status === "submitting" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                Confirm Booking <Check size={14} />
              </>
            )}
          </button>
        )}
      </div>

      {area && step > 0 && (
        <div className="mt-5 rounded-xl border border-white/5 bg-otr-slate/40 p-3 text-xs text-otr-stone/65">
          <span className="text-otr-stone/40">Booking in</span>{" "}
          <span className="font-semibold text-otr-stone">
            {area.city}, {area.state}
          </span>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="ml-2 text-otr-blue-bright hover:text-otr-sky"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 text-center ${
              i <= step ? "text-otr-sky" : "text-otr-stone/35"
            }`}
          >
            <span className="hidden sm:inline">
              {i + 1}. {label}
            </span>
            <span className="sm:hidden">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-otr-blue to-otr-blue-bright transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AreaStep({
  selectedSlug,
  onPick,
}: {
  selectedSlug: string;
  onPick: (slug: string) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        Where's the property?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        Pick the closest of our three home cities. Pricing is tuned per area.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {SERVICE_AREAS.map((a) => {
          const isSelected = selectedSlug === a.slug;
          return (
            <button
              key={a.slug}
              type="button"
              onClick={() => onPick(a.slug)}
              className={`group flex flex-col rounded-2xl border p-5 text-left transition-all ${
                isSelected
                  ? "border-otr-blue bg-otr-blue/15 shadow-lg shadow-otr-blue-deep/30"
                  : "border-white/10 bg-otr-slate/40 hover:border-white/20 hover:bg-otr-slate"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`rounded-xl border p-2 ${
                      isSelected
                        ? "border-otr-blue/40 bg-otr-blue/20"
                        : "border-white/10 bg-otr-ink"
                    }`}
                  >
                    <MapPin size={16} className="text-otr-sky" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold text-otr-stone">
                      {a.city}, {a.state}
                    </div>
                    <div className="text-xs text-otr-stone/55">
                      {a.county} · {a.zip}
                    </div>
                  </div>
                </div>
                {a.travelNote && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-otr-stone/65">
                    <Clock size={10} /> {a.travelNote}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-otr-stone/65">
                {a.blurb}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {a.covers.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-white/5 bg-otr-ink/70 px-1.5 py-0.5 text-[10px] text-otr-stone/70"
                  >
                    {c}
                  </span>
                ))}
                {a.covers.length > 4 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] text-otr-stone/45">
                    +{a.covers.length - 4} more
                  </span>
                )}
              </div>

              {a.bookInAdvance && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-otr-blue/30 bg-otr-blue/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-otr-sky">
                  Book in advance
                </div>
              )}

              {a.priceMultiplier !== 1 && (
                <div className="mt-3 text-[11px] font-medium text-otr-stone/55">
                  Pricing: +{Math.round((a.priceMultiplier - 1) * 100)}% travel
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServicesStep({
  selected,
  onToggle,
  areaSlug,
}: {
  selected: string[];
  onToggle: (name: string) => void;
  areaSlug: string;
}) {
  const area = findServiceArea(areaSlug);
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        What can we help with?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        Pricing shown is tuned for {area?.city ?? "your area"}. Pick everything
        you'd like a quote on.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const isSelected = selected.includes(s.name);
          const price = priceForArea(s, area);
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => onToggle(s.name)}
              className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                isSelected
                  ? "border-otr-blue bg-otr-blue/15 shadow-lg shadow-otr-blue-deep/20"
                  : "border-white/10 bg-otr-slate/40 hover:border-white/20 hover:bg-otr-slate"
              }`}
            >
              <div
                className={`shrink-0 rounded-lg p-2 transition-colors ${
                  isSelected ? "bg-otr-blue/30" : "bg-otr-ink"
                }`}
              >
                <Icon size={18} className="text-otr-sky" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-otr-stone">
                  {s.name}
                </div>
                <div className="truncate text-xs text-otr-stone/55">
                  Starting at {price.startingAt}
                </div>
              </div>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isSelected
                    ? "border-otr-blue-bright bg-otr-blue-bright text-otr-black"
                    : "border-white/20"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PropertyStep({
  booking,
  update,
}: {
  booking: Booking;
  update: <K extends keyof Booking>(key: K, value: Booking[K]) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        Where are we headed?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        We service homes and commercial properties across Northeast Ohio.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Street address" className="md:col-span-2">
          <input
            value={booking.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Pine Ridge Rd"
            className={inputCls}
          />
        </Field>
        <Field label="City" className="md:col-span-2">
          <input
            value={booking.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Wadsworth"
            className={inputCls}
          />
        </Field>

        <Field label="Property type" className="md:col-span-2">
          <div className="flex gap-3">
            {(["residential", "commercial"] as PropertyType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("propertyType", t)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${
                  booking.propertyType === t
                    ? "border-otr-blue bg-otr-blue/15 text-otr-stone"
                    : "border-white/10 bg-otr-slate/40 text-otr-stone/70 hover:bg-otr-slate"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Access notes"
          hint="Gate codes, dogs, parking — anything we should know."
          className="md:col-span-2"
        >
          <textarea
            value={booking.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Side gate is unlocked. Big friendly lab in the backyard."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>
    </div>
  );
}

function DateTimeStep({
  booking,
  update,
  minDate,
}: {
  booking: Booking;
  update: <K extends keyof Booking>(key: K, value: Booking[K]) => void;
  minDate: string;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  function openDatePicker() {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        // some browsers throw if not in a user gesture — fall through to focus
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        When works for you?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        We'll confirm the exact arrival window the day before.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Preferred date"
          hint="Tap the field to open the calendar picker."
        >
          <button
            type="button"
            onClick={openDatePicker}
            className={`group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-otr-slate/40 px-4 py-3 text-left text-sm transition-all hover:border-white/20 hover:bg-otr-slate focus-within:border-otr-blue-bright focus-within:bg-otr-slate focus-within:ring-2 focus-within:ring-otr-blue/30`}
          >
            <span
              className={
                booking.date ? "text-otr-stone" : "text-otr-stone/40"
              }
            >
              {booking.date || "Pick a date…"}
            </span>
            <Calendar
              size={16}
              className="shrink-0 text-otr-sky"
              aria-hidden="true"
            />
            <input
              ref={dateInputRef}
              type="date"
              min={minDate}
              value={booking.date}
              onChange={(e) => update("date", e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Preferred date"
            />
          </button>
        </Field>
        <Field label="Time window">
          <select
            value={booking.timeWindow}
            onChange={(e) =>
              update("timeWindow", e.target.value as TimeWindow)
            }
            className={inputCls}
          >
            {(Object.keys(TIME_WINDOWS) as TimeWindow[]).map((tw) => (
              <option key={tw} value={tw}>
                {TIME_WINDOWS[tw].label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function ContactStep({
  booking,
  update,
}: {
  booking: Booking;
  update: <K extends keyof Booking>(key: K, value: Booking[K]) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        How can we reach you?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        We'll confirm and follow up. No spam, promise.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full name" className="md:col-span-2">
          <input
            value={booking.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={booking.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 555-1234"
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={booking.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="Preferred contact method" className="md:col-span-2">
          <div className="flex gap-3">
            {(["phone", "text", "email"] as ContactMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update("contactMethod", m)}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition-all sm:px-4 ${
                  booking.contactMethod === m
                    ? "border-otr-blue bg-otr-blue/15 text-otr-stone"
                    : "border-white/10 bg-otr-slate/40 text-otr-stone/70 hover:bg-otr-slate"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function SuccessPanel({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-3xl border border-otr-moss/30 bg-gradient-to-b from-otr-ink to-otr-slate/40 p-6 text-center shadow-2xl shadow-black/40 sm:p-10">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-otr-moss/15 text-otr-moss">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="font-display text-3xl font-semibold text-otr-stone">
        Booking received.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-otr-stone/65">
        Thanks, {booking.name.split(" ")[0] || "friend"}. We'll review your
        request and reach out within 24 hours to confirm the visit on{" "}
        <span className="font-semibold text-otr-stone">{booking.date}</span>.
      </p>
      <div className="mx-auto mt-6 max-w-md rounded-xl border border-white/5 bg-otr-black/40 p-4 text-left text-xs text-otr-stone/65">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-otr-stone/40">
          Summary
        </div>
        <div className="break-words">
          <span className="text-otr-stone/40">Services:</span>{" "}
          {booking.services.join(", ")}
        </div>
        <div className="break-words">
          <span className="text-otr-stone/40">Where:</span> {booking.address},{" "}
          {booking.city}
        </div>
        <div>
          <span className="text-otr-stone/40">When:</span> {booking.date},{" "}
          {TIME_WINDOWS[booking.timeWindow].label}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-otr-stone/55">
        {label}
      </div>
      {children}
      {hint && <div className="mt-1 text-xs text-otr-stone/40">{hint}</div>}
    </label>
  );
}

const inputCls =
  "block w-full min-w-0 rounded-xl border border-white/10 bg-otr-slate/40 px-4 py-3 text-base text-otr-stone placeholder:text-otr-stone/30 outline-none transition-all focus:border-otr-blue-bright focus:bg-otr-slate focus:ring-2 focus:ring-otr-blue/30 sm:text-sm";
