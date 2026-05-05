export type TimeWindow = "morning" | "afternoon" | "evening";

export type ContactMethod = "phone" | "email" | "text";

export type PropertyType = "residential" | "commercial";

export interface Booking {
  services: string[];
  address: string;
  city: string;
  /** Service-area slug — e.g. "wadsworth" | "akron" | "cleveland" | "other" */
  area: string;
  propertyType: PropertyType;
  notes: string;
  date: string; // ISO YYYY-MM-DD
  timeWindow: TimeWindow;
  name: string;
  phone: string;
  email: string;
  contactMethod: ContactMethod;
}

export interface BookingResponse {
  ok: boolean;
  sheetWritten: boolean;
  calendarCreated: boolean;
  message?: string;
}

/**
 * A free-quote request. Customer fills in address + which services they want.
 * Square-footage is optional — if blank, OTR measures from satellite imagery
 * on Google Earth and emails a quote. If filled in, the page shows a live
 * estimate (sqft × pricePerSqft, floored by minCharge).
 */
export interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  /** Service names selected — same names as the booking flow. */
  services: string[];
  /** Per-service sqft input keyed by service slug. May be empty. */
  sqftBySlug: Record<string, number | null>;
  /** Customer's running total estimate — for the operator's reference only. */
  customerEstimate: number | null;
  notes: string;
}

export interface QuoteResponse {
  ok: boolean;
  sheetWritten: boolean;
  message?: string;
}

export const TIME_WINDOWS: Record<
  TimeWindow,
  { label: string; startHour: number; endHour: number }
> = {
  morning: { label: "Morning (8am – 12pm)", startHour: 8, endHour: 12 },
  afternoon: { label: "Afternoon (12pm – 4pm)", startHour: 12, endHour: 16 },
  evening: { label: "Evening (4pm – 7pm)", startHour: 16, endHour: 19 },
};
