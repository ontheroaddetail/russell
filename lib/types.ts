export type TimeWindow = "morning" | "afternoon" | "evening";

export type ContactMethod = "phone" | "email" | "text";

export type PropertyType = "residential" | "commercial";

export interface Booking {
  services: string[];
  address: string;
  city: string;
  county: string;
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

export const TIME_WINDOWS: Record<
  TimeWindow,
  { label: string; startHour: number; endHour: number }
> = {
  morning: { label: "Morning (8am – 12pm)", startHour: 8, endHour: 12 },
  afternoon: { label: "Afternoon (12pm – 4pm)", startHour: 12, endHour: 16 },
  evening: { label: "Evening (4pm – 7pm)", startHour: 16, endHour: 19 },
};
