import { google } from "googleapis";
import type { Booking } from "./types";
import { TIME_WINDOWS } from "./types";

function getJwtAuth(scopes: string[]) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars",
    );
  }
  // Vercel stores the key with literal \n sequences — convert back to newlines.
  const key = rawKey.replace(/\\n/g, "\n");
  return new google.auth.JWT({ email, key, scopes });
}

export async function appendBookingRow(booking: Booking): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID env var");

  const auth = getJwtAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    new Date().toISOString(),
    booking.name,
    booking.email,
    booking.phone,
    booking.services.join(", "),
    booking.address,
    booking.city,
    booking.county,
    booking.date,
    TIME_WINDOWS[booking.timeWindow].label,
    booking.notes,
    booking.contactMethod,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:L",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function createCalendarEvent(booking: Booking): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error("Missing GOOGLE_CALENDAR_ID env var");

  const auth = getJwtAuth(["https://www.googleapis.com/auth/calendar"]);
  const calendar = google.calendar({ version: "v3", auth });

  const window = TIME_WINDOWS[booking.timeWindow];
  // Build local-time ISO strings without timezone offset; Google interprets per the timeZone field.
  const pad = (n: number) => n.toString().padStart(2, "0");
  const startISO = `${booking.date}T${pad(window.startHour)}:00:00`;
  const endISO = `${booking.date}T${pad(window.endHour)}:00:00`;

  const description = [
    `Customer: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Preferred contact: ${booking.contactMethod}`,
    "",
    `Property type: ${booking.propertyType}`,
    `Services: ${booking.services.join(", ")}`,
    "",
    `Address: ${booking.address}`,
    `City: ${booking.city}`,
    `County: ${booking.county}`,
    "",
    `Notes: ${booking.notes || "(none)"}`,
  ].join("\n");

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${booking.services.join(", ")} — ${booking.name}`,
      description,
      location: `${booking.address}, ${booking.city}`,
      start: { dateTime: startISO, timeZone: "America/New_York" },
      end: { dateTime: endISO, timeZone: "America/New_York" },
    },
  });
}
