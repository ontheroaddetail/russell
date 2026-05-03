"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SERVICES } from "@/lib/services";
import { COUNTIES } from "@/lib/site-config";
import type {
  Booking,
  BookingResponse,
  ContactMethod,
  PropertyType,
  TimeWindow,
} from "@/lib/types";
import { TIME_WINDOWS } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

const STEPS = ["Services", "Property", "Date & Time", "Contact"] as const;

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const initialBooking: Booking = {
  services: [],
  address: "",
  city: "",
  county: "",
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
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const minDate = useMemo(tomorrowISO, []);

  function update<K extends keyof Booking>(key: K, value: Booking[K]) {
    setBooking((b) => ({ ...b, [key]: value }));
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
      if (booking.services.length === 0) return "Pick at least one service.";
    }
    if (step === 1) {
      if (!booking.address.trim()) return "Address is required.";
      if (!booking.city.trim()) return "City is required.";
      if (!booking.county) return "Pick the county.";
    }
    if (step === 2) {
      if (!booking.date) return "Pick a date.";
      if (booking.date < minDate) return "Pick a date that's at least tomorrow.";
    }
    if (step === 3) {
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
    <div className="rounded-3xl border border-white/10 bg-otr-ink/80 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
      <ProgressBar step={step} />

      <div className="mt-8">
        {step === 0 && (
          <ServicesStep
            selected={booking.services}
            onToggle={toggleService}
          />
        )}
        {step === 1 && (
          <PropertyStep booking={booking} update={update} />
        )}
        {step === 2 && (
          <DateTimeStep booking={booking} update={update} minDate={minDate} />
        )}
        {step === 3 && <ContactStep booking={booking} update={update} />}
      </div>

      {touched && error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-otr-stone/80 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="group inline-flex items-center gap-2 rounded-full bg-otr-blue px-7 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright"
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
            className="inline-flex items-center gap-2 rounded-full bg-otr-blue px-7 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright disabled:opacity-60"
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

function ServicesStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        What can we help with?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        Pick everything you'd like a quote on. You can adjust later.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const isSelected = selected.includes(s.name);
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
                className={`rounded-lg p-2 transition-colors ${
                  isSelected ? "bg-otr-blue/30" : "bg-otr-ink"
                }`}
              >
                <Icon size={18} className="text-otr-sky" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-otr-stone">
                  {s.name}
                </div>
                <div className="text-xs text-otr-stone/55">{s.startingAt}</div>
              </div>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
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
        We service homes and commercial properties across the region.
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
        <Field label="City">
          <input
            value={booking.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="County">
          <select
            value={booking.county}
            onChange={(e) => update("county", e.target.value)}
            className={inputCls}
          >
            <option value="">Select county…</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-otr-stone">
        When works for you?
      </h3>
      <p className="mt-1 text-sm text-otr-stone/60">
        We'll confirm the exact arrival window the day before.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Preferred date">
          <input
            type="date"
            min={minDate}
            value={booking.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputCls}
          />
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
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${
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
    <div className="rounded-3xl border border-otr-moss/30 bg-gradient-to-b from-otr-ink to-otr-slate/40 p-10 text-center shadow-2xl shadow-black/40">
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
        <div>
          <span className="text-otr-stone/40">Services:</span>{" "}
          {booking.services.join(", ")}
        </div>
        <div>
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
    <label className={`block ${className}`}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-otr-stone/55">
        {label}
      </div>
      {children}
      {hint && <div className="mt-1 text-xs text-otr-stone/40">{hint}</div>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-otr-slate/40 px-4 py-3 text-sm text-otr-stone placeholder:text-otr-stone/30 outline-none transition-all focus:border-otr-blue-bright focus:bg-otr-slate focus:ring-2 focus:ring-otr-blue/30";
