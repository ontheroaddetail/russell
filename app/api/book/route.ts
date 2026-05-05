import { NextResponse } from "next/server";
import { sendBooking } from "@/lib/google";
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
    typeof x.area === "string" &&
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

  if (body.services.length === 0) {
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

  try {
    await sendBooking(body);
  } catch (e) {
    console.error("[book] webhook failed:", e);
    return NextResponse.json<BookingResponse>(
      {
        ok: false,
        sheetWritten: false,
        calendarCreated: false,
        message:
          "We couldn't save your booking right now. Please call us or try again in a moment.",
      },
      { status: 502 },
    );
  }

  // The Apps Script handles both the sheet append and calendar event in one shot.
  return NextResponse.json<BookingResponse>({
    ok: true,
    sheetWritten: true,
    calendarCreated: true,
  });
}
