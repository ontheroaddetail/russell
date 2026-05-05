"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Ruler,
  Send,
} from "lucide-react";
import { SERVICES, priceForArea, type Service } from "@/lib/services";
import { SERVICE_AREAS, findServiceArea } from "@/lib/site-config";
import type { QuoteRequest, QuoteResponse } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

interface MeasuredPolygon {
  id: number;
  label: string;
  serviceSlug: string;
  sqft: number;
}

// PropertyMeasure pulls in Leaflet which has no SSR support.
const PropertyMeasure = dynamic(() => import("./PropertyMeasure"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-2xl border border-white/10 bg-otr-slate/40 text-xs text-otr-stone/55">
      <Loader2 size={14} className="mr-2 animate-spin" />
      Loading satellite map…
    </div>
  ),
});

const initial: QuoteRequest = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  area: "",
  services: [],
  sqftBySlug: {},
  customerEstimate: null,
  notes: "",
};

export default function QuoteForm() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<QuoteRequest>(initial);
  const [polys, setPolys] = useState<MeasuredPolygon[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const areaParam = searchParams.get("area");
    const serviceParam = searchParams.get("service");
    setData((d) => {
      let next = d;
      if (areaParam) {
        const match = SERVICE_AREAS.find((a) => a.slug === areaParam);
        if (match) {
          next = { ...next, area: match.slug, city: next.city || match.city };
        }
      }
      if (serviceParam) {
        const svc = SERVICES.find((s) => s.slug === serviceParam);
        if (svc && !next.services.includes(svc.name)) {
          next = { ...next, services: [...next.services, svc.name] };
        }
      }
      return next;
    });
  }, [searchParams]);

  function update<K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleService(svc: Service) {
    setData((d) => {
      const has = d.services.includes(svc.name);
      const services = has
        ? d.services.filter((s) => s !== svc.name)
        : [...d.services, svc.name];
      return { ...d, services };
    });
  }

  const area = findServiceArea(data.area);

  // Roll polygon-derived sqft per service into the request's sqftBySlug,
  // and compute the live total estimate using priceForArea (area-adjusted).
  const sqftBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of polys) {
      if (!p.serviceSlug || p.sqft <= 0) continue;
      map[p.serviceSlug] = (map[p.serviceSlug] ?? 0) + p.sqft;
    }
    return map;
  }, [polys]);

  const estimate = useMemo(() => {
    let total = 0;
    let any = false;
    for (const svc of SERVICES) {
      if (!data.services.includes(svc.name)) continue;
      const price = priceForArea(svc, area);
      const sqft = sqftBySlug[svc.slug];
      if (price.pricePerSqft && sqft && sqft > 0) {
        total += Math.max(sqft * price.pricePerSqft, price.minCharge ?? 0);
        any = true;
      }
    }
    return any ? total : null;
  }, [data.services, sqftBySlug, area]);

  // Mirror sqft + estimate into the request payload.
  useEffect(() => {
    setData((d) => ({
      ...d,
      sqftBySlug: Object.fromEntries(
        Object.entries(sqftBySlug).map(([k, v]) => [k, Math.round(v)]),
      ),
      customerEstimate: estimate,
    }));
  }, [sqftBySlug, estimate]);

  const selectedServices = useMemo(
    () => SERVICES.filter((s) => data.services.includes(s.name)),
    [data.services],
  );

  const measurableSelected = selectedServices.filter((s) => s.pricePerSqft);

  function validate(): string | null {
    if (data.services.length === 0) return "Pick at least one service.";
    if (!data.address.trim()) return "Address is required.";
    if (!data.city.trim()) return "City is required.";
    if (!data.area) return "Pick the closest service area.";
    if (!data.name.trim()) return "Name is required.";
    if (!data.email.includes("@")) return "A valid email is required.";
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as QuoteResponse;
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Something went wrong.");
      }
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return <SuccessPanel data={data} estimate={estimate} />;
  }

  return (
    <div className="space-y-6">
      {/* Step 1: pick services */}
      <Card title="What do you want quoted?" subtitle="Pick everything you'd like a number on.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const isSelected = data.services.includes(s.name);
            const price = priceForArea(s, area);
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleService(s)}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
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
                    {price.startingAt}
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
      </Card>

      {/* Step 2: address + contact */}
      <Card
        title="Where and who?"
        subtitle="We use the address to pull up satellite imagery so you (or we) can measure."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Street address" className="md:col-span-2">
            <input
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Pine Ridge Rd"
              className={inputCls}
            />
          </Field>
          <Field label="City">
            <input
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Wadsworth"
              className={inputCls}
            />
          </Field>
          <Field label="Closest service area">
            <select
              value={data.area}
              onChange={(e) => update("area", e.target.value)}
              className={inputCls}
            >
              <option value="">Select area…</option>
              {SERVICE_AREAS.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.city}, {a.state}
                </option>
              ))}
              <option value="other">Somewhere else nearby</option>
            </select>
          </Field>
          <Field label="Full name">
            <input
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="Phone" className="md:col-span-2">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 555-1234"
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      {/* Step 3: satellite measurement */}
      {measurableSelected.length > 0 && (
        <Card
          title="Measure it from satellite"
          subtitle="Type your address above, click 'Show my address', then trace polygons over what you want serviced. We compute square footage automatically."
        >
          <div className="rounded-xl border border-otr-blue/20 bg-otr-blue/5 p-4 text-sm text-otr-sky">
            <div className="flex items-start gap-2">
              <Ruler size={14} className="mt-0.5 shrink-0" />
              <div>
                Don't want to draw? Skip this — we'll measure on our end in
                Google Earth and email a fixed quote within 24 hours.
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PropertyMeasure
              address={data.address}
              city={data.city}
              serviceOptions={measurableSelected.map((s) => ({
                slug: s.slug,
                name: s.name,
              }))}
              onPolygonsChange={setPolys}
            />
          </div>

          {Object.keys(sqftBySlug).length > 0 && (
            <div className="mt-5 space-y-2">
              {measurableSelected.map((s) => {
                const sqft = sqftBySlug[s.slug];
                const price = priceForArea(s, area);
                if (!sqft) return null;
                const sub =
                  price.pricePerSqft && sqft > 0
                    ? `~$${Math.max(
                        sqft * price.pricePerSqft,
                        price.minCharge ?? 0,
                      ).toFixed(0)}`
                    : "";
                return (
                  <div
                    key={s.slug}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-otr-slate/40 p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-otr-stone">
                        {s.name}
                      </div>
                      <div className="text-xs text-otr-stone/55">
                        {Math.round(sqft).toLocaleString()} sqft measured
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-otr-sky">
                      {sub}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {estimate !== null && (
            <div className="mt-5 rounded-xl border border-otr-moss/30 bg-otr-moss/10 p-4">
              <div className="text-[10px] uppercase tracking-wider text-otr-stone/50">
                Live estimate
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-otr-stone">
                ~${estimate.toFixed(0)}
              </div>
              <div className="mt-1 text-xs text-otr-stone/55">
                Ballpark from your traced areas{area ? ` in ${area.city}` : ""}.
                Final fixed quote comes back within 24 hours.
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Notes + submit */}
      <Card title="Anything else we should know?">
        <textarea
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          placeholder="Long driveway, two-story siding, mulch beds in front and around the deck."
          className={`${inputCls} resize-none`}
        />
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-otr-blue px-7 py-3.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Request my quote <Send size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessPanel({
  data,
  estimate,
}: {
  data: QuoteRequest;
  estimate: number | null;
}) {
  return (
    <div className="rounded-3xl border border-otr-moss/30 bg-gradient-to-b from-otr-ink to-otr-slate/40 p-6 text-center shadow-2xl shadow-black/40 sm:p-10">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-otr-moss/15 text-otr-moss">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="font-display text-3xl font-semibold text-otr-stone">
        Quote request received.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-otr-stone/65">
        Thanks, {data.name.split(" ")[0] || "friend"}. We'll review{" "}
        <span className="font-semibold text-otr-stone">{data.address}</span> and
        email you a fixed quote within 24 hours.
      </p>
      {estimate !== null && (
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-otr-moss/40 bg-otr-moss/10 px-4 py-2 text-sm">
          <span className="text-otr-stone/55">Your ballpark estimate:</span>
          <span className="font-semibold text-otr-stone">
            ~${estimate.toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-otr-ink/80 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-6 md:p-8">
      <h3 className="font-display text-xl font-semibold text-otr-stone sm:text-2xl">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-sm text-otr-stone/60">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
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
