import { NextResponse } from "next/server";
import { appendBookingRow, createCalendarEvent } from "@/lib/google";
import type { Booking, BookingResponse } from "@/lib/types";
import { TIME_WINDOWS } from "@/lib/types";

export const runtime = "nodejs";

function isBooking(b: unknown): b is Booking {
  if (!b || typeof b !== "object") return false;
  const x = b as Record<string, unknown>;
  return (
    Array.isArray(x.services) &&
    typeof x.address === "string" &&
    typeof x.city === "string" &&
    typeof x.county === "string" &&
    (x.propertyType === "residential" || x.propertyType === "commercial") &&
    typeof x.notes === "string" &&
    typeof x.date === "string" &&
    typeof x.timeWindow === "string" &&
    x.timeWindow in TIME_WINDOWS &&
    typeof x.name === "string" &&
    typeof x.phone === "string" &&
    typeof x.email === "string" &&
    (x.contactMethod === "phone" ||
      x.contactMethod === "email" ||
      x.contactMethod === "text")
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<BookingResponse>(
      {
        ok: false,
        sheetWritten: false,
        calendarCreated: false,
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  if (!isBooking(body)) {
    return NextResponse.json<BookingResponse>(
      {
        ok: false,
        sheetWritten: false,
        calendarCreated: false,
        message: "Booking payload missing required fields.",
      },
      { status: 400 },
    );
  }

  const booking = body;
  if (booking.services.length === 0) {
    return NextResponse.json<BookingResponse>(
      {
        ok: false,
        sheetWritten: false,
        calendarCreated: false,
        message: "Pick at least one service.",
      },
      { status: 400 },
    );
  }

  // Run both in parallel — we want to record the booking even if one of them fails.
  const [sheetResult, calendarResult] = await Promise.allSettled([
    appendBookingRow(booking),
    createCalendarEvent(booking),
  ]);

  const sheetWritten = sheetResult.status === "fulfilled";
  const calendarCreated = calendarResult.status === "fulfilled";

  if (!sheetWritten) {
    console.error("[book] sheet append failed:", sheetResult.reason);
  }
  if (!calendarCreated) {
    console.error("[book] calendar create failed:", calendarResult.reason);
  }

  // Succeed if at least one half worked. We'd rather keep the lead than reject the user.
  if (!sheetWritten && !calendarCreated) {
    return NextResponse.json<BookingResponse>(
      {
        ok: false,
        sheetWritten,
        calendarCreated,
        message:
          "We couldn't save your booking right now. Please call us or try again in a moment.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json<BookingResponse>({
    ok: true,
    sheetWritten,
    calendarCreated,
  });
}
