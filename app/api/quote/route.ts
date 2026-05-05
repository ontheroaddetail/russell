import { NextResponse } from "next/server";
import { sendQuote } from "@/lib/google";
import type { QuoteRequest, QuoteResponse } from "@/lib/types";

export const runtime = "nodejs";

function isQuoteRequest(b: unknown): b is QuoteRequest {
  if (!b || typeof b !== "object") return false;
  const x = b as Record<string, unknown>;
  return (
    typeof x.name === "string" &&
    typeof x.email === "string" &&
    typeof x.phone === "string" &&
    typeof x.address === "string" &&
    typeof x.city === "string" &&
    typeof x.area === "string" &&
    Array.isArray(x.services) &&
    typeof x.sqftBySlug === "object" &&
    x.sqftBySlug !== null &&
    (x.customerEstimate === null || typeof x.customerEstimate === "number") &&
    typeof x.notes === "string"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<QuoteResponse>(
      { ok: false, sheetWritten: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!isQuoteRequest(body)) {
    return NextResponse.json<QuoteResponse>(
      {
        ok: false,
        sheetWritten: false,
        message: "Quote request missing required fields.",
      },
      { status: 400 },
    );
  }

  if (!body.name.trim() || !body.email.includes("@") || !body.address.trim()) {
    return NextResponse.json<QuoteResponse>(
      {
        ok: false,
        sheetWritten: false,
        message: "Name, valid email, and address are required.",
      },
      { status: 400 },
    );
  }

  if (body.services.length === 0) {
    return NextResponse.json<QuoteResponse>(
      {
        ok: false,
        sheetWritten: false,
        message: "Pick at least one service to quote.",
      },
      { status: 400 },
    );
  }

  try {
    await sendQuote(body);
  } catch (e) {
    console.error("[quote] webhook failed:", e);
    return NextResponse.json<QuoteResponse>(
      {
        ok: false,
        sheetWritten: false,
        message:
          "We couldn't save your quote request right now. Please call us or try again in a moment.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json<QuoteResponse>({ ok: true, sheetWritten: true });
}
