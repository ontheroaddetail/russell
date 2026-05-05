import type { Booking, QuoteRequest } from "./types";
import { TIME_WINDOWS } from "./types";
import { findServiceArea } from "./site-config";

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

export async function sendQuote(quote: QuoteRequest): Promise<void> {
  const url = resolveQuoteUrl();
  const sqftPairs = Object.entries(quote.sqftBySlug)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .map(([slug, v]) => `${slug}: ${v}`);

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
    sqftBySlug: sqftPairs.join("; "),
    customerEstimate: quote.customerEstimate
      ? `$${quote.customerEstimate.toFixed(2)}`
      : "",
    notes: quote.notes,
    status: "new",
  });
}
