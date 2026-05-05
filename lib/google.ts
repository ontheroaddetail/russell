import type { Booking, QuoteRequest } from "./types";
import { TIME_WINDOWS } from "./types";
import { findServiceArea } from "./site-config";
import { SERVICES, priceForArea } from "./services";

function areaLabel(slug: string): string {
  if (!slug) return "";
  if (slug === "other") return "Other / nearby";
  return findServiceArea(slug)?.city ?? slug;
}

async function postJson(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "follow",
    // Apps Script web apps respond fast; abort if they hang.
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Webhook ${res.status}: ${text.slice(0, 200) || res.statusText}`,
    );
  }
}

/**
 * Booking writes a row to OTR EXT Bookings AND creates a calendar event,
 * both inside a single Apps Script web app deployed by the user. Setup is in
 * apps-script/booking.gs — see README.
 */
/**
 * Both booking and quote post to the same Apps Script web app — `type` field
 * tells the script which sheet to write to. GOOGLE_BOOKING_WEBHOOK_URL and
 * GOOGLE_QUOTE_WEBHOOK_URL can be the same URL (recommended) or split if you
 * deploy two scripts.
 */
function resolveBookingUrl(): string {
  const url =
    process.env.GOOGLE_BOOKING_WEBHOOK_URL ?? process.env.GOOGLE_WEBHOOK_URL;
  if (!url) throw new Error("Missing GOOGLE_BOOKING_WEBHOOK_URL env var");
  return url;
}

function resolveQuoteUrl(): string {
  const url =
    process.env.GOOGLE_QUOTE_WEBHOOK_URL ?? process.env.GOOGLE_WEBHOOK_URL;
  if (!url) throw new Error("Missing GOOGLE_QUOTE_WEBHOOK_URL env var");
  return url;
}

export async function sendBooking(booking: Booking): Promise<void> {
  const url = resolveBookingUrl();
  const window = TIME_WINDOWS[booking.timeWindow];
  await postJson(url, {
    type: "booking",
    timestamp: new Date().toISOString(),
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    services: booking.services.join(", "),
    address: booking.address,
    city: booking.city,
    serviceArea: areaLabel(booking.area),
    propertyType: booking.propertyType,
    date: booking.date,
    timeWindow: window.label,
    startHour: window.startHour,
    endHour: window.endHour,
    notes: booking.notes,
    contactMethod: booking.contactMethod,
  });
}

/**
 * Server-side calculation: builds (a) a clean per-service sqft summary using
 * service display names and (b) the total estimate. Always returns a price —
 * if the customer didn't enter sqft for a service, we use that service's
 * minCharge (or extract the number from `startingAt`) so the operator gets
 * a meaningful baseline number to start from.
 */
function priceQuoteServerSide(quote: QuoteRequest): {
  sqftSummary: string;
  estimate: number;
  breakdown: string;
} {
  const area = findServiceArea(quote.area);
  const lines: string[] = [];
  const breakdownLines: string[] = [];
  let total = 0;

  for (const svc of SERVICES) {
    if (!quote.services.includes(svc.name)) continue;
    const price = priceForArea(svc, area);
    const sqft = quote.sqftBySlug?.[svc.slug] ?? 0;

    if (price.pricePerSqft && sqft > 0) {
      const raw = sqft * price.pricePerSqft;
      const sub = Math.max(raw, price.minCharge ?? 0);
      total += sub;
      lines.push(`${svc.name}: ${sqft.toLocaleString()} sqft`);
      breakdownLines.push(`${svc.name}: ${sqft.toLocaleString()} sqft → $${sub.toFixed(0)}`);
    } else {
      // No sqft provided — fall back to the service's min/starting charge.
      const fallback = price.minCharge ?? extractDollarValue(price.startingAt) ?? 0;
      total += fallback;
      lines.push(`${svc.name}: (no sqft)`);
      breakdownLines.push(`${svc.name}: starting at $${fallback}`);
    }
  }

  return {
    sqftSummary: lines.join("; "),
    estimate: total,
    breakdown: breakdownLines.join(" | "),
  };
}

/** Pulls the first $NN(.NN) value out of a label like "$0.18 / sqft" or "$189". */
function extractDollarValue(label: string): number | null {
  const m = label.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export async function sendQuote(quote: QuoteRequest): Promise<void> {
  const url = resolveQuoteUrl();
  const { sqftSummary, estimate, breakdown } = priceQuoteServerSide(quote);

  await postJson(url, {
    type: "quote",
    timestamp: new Date().toISOString(),
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    address: quote.address,
    city: quote.city,
    serviceArea: areaLabel(quote.area),
    services: quote.services.join(", "),
    sqftBySlug: sqftSummary,
    customerEstimate: estimate > 0 ? `$${estimate.toFixed(0)} (${breakdown})` : "",
    notes: quote.notes,
    status: "new",
  });
}
