# OTR Exterior Care

Marketing + booking website for OTR Exterior Care ("On The Road"). Bookings flow straight to a Google Sheet and a Google Calendar event — no manual steps.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- googleapis (Sheets + Calendar)
- lucide-react icons
- Deploys to Vercel

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values (see below)
npm run dev
```

Open http://localhost:3000.

`npm run build` should succeed without errors before deploying.

---

## Google integration setup

The booking form posts to `/api/book`, which writes a row to a Google Sheet and creates a Google Calendar event using a **service account** (no OAuth, no human login required at runtime).

Follow these steps once:

### 1. Create a Google Cloud project

1. Go to https://console.cloud.google.com/
2. Click the project dropdown → **New Project**
3. Name it something like `otr-bookings` and click **Create**

### 2. Enable the APIs

1. In the project, open **APIs & Services → Library**
2. Search for **Google Sheets API** → click **Enable**
3. Search for **Google Calendar API** → click **Enable**

### 3. Create a service account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service account**
3. Give it a name (e.g. `otr-booking-writer`), click **Create and continue**
4. Skip the "Grant access" step (Continue → Done)
5. On the credentials page, click the new service account → **Keys** tab
6. **Add Key → Create new key → JSON** → downloads a JSON file. Keep it safe.

The JSON file contains:
- `client_email` → use as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key`  → use as `GOOGLE_PRIVATE_KEY` (keep the `\n` sequences as-is, wrap the whole value in double quotes)

### 4. Create the booking Google Sheet

1. Go to https://sheets.google.com → blank sheet → name it `OTR Bookings`
2. In row 1, paste these column headers (one per cell, A → L):

   | A | B | C | D | E | F | G | H | I | J | K | L |
   |---|---|---|---|---|---|---|---|---|---|---|---|
   | Timestamp | Name | Email | Phone | Services | Address | City | County | Date | Time Window | Notes | Contact Method |

3. Click **Share** (top right). Paste the service account email (`...iam.gserviceaccount.com`). Set permission to **Editor**. Uncheck "Notify people". Share.
4. Copy the sheet ID from the URL — it's the long string between `/d/` and `/edit`. That's your `GOOGLE_SHEET_ID`.

### 5. Create / find the Google Calendar

1. Go to https://calendar.google.com
2. Left sidebar → **Other calendars** → **+** → **Create new calendar**
3. Name it `OTR Bookings`, click **Create calendar**
4. Once created, find it under **Settings and sharing** (hover the calendar name → ⋮ → Settings and sharing)
5. Under **Share with specific people or groups**, click **Add people** → paste the service account email → permission **Make changes to events** → Send.
6. Scroll down to **Integrate calendar**. Copy the **Calendar ID** (looks like `abc123...@group.calendar.google.com`). That's your `GOOGLE_CALENDAR_ID`.

> If you'd rather use your personal/main Google Calendar, share *that* calendar with the service account using the same "Make changes to events" permission, and use its Calendar ID (your own email address for personal calendars).

### 6. Set environment variables

**Locally** — copy `.env.local.example` to `.env.local` and fill in:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=otr-booking-writer@otr-bookings.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1abc...XYZ
GOOGLE_CALENDAR_ID=abc...@group.calendar.google.com
```

**Important:** keep the literal `\n` sequences inside the quoted private key string — `lib/google.ts` converts them back to newlines at runtime. Wrap the whole key in double quotes.

**On Vercel** — Project → Settings → Environment Variables. Add all four. Tip: when pasting `GOOGLE_PRIVATE_KEY` into Vercel, paste the **multiline original** from the JSON file (not the `\n`-escaped version) — Vercel preserves newlines, and the same `replace(/\\n/g, "\n")` call is a safe no-op when there are no `\n` sequences.

### 7. Test the integration

1. `npm run dev`
2. Go to http://localhost:3000/booking
3. Submit a test booking
4. Confirm:
   - A new row appears in the Google Sheet
   - An event appears on the Google Calendar
5. Server-side errors are logged to the Next.js console — check there if either side is missing.

---

## Customizing the site

- **Phone, email, hours, social, business name** → `lib/site-config.ts`
- **County list** (used in the footer, contact page, and booking form dropdown) → `COUNTIES` in `lib/site-config.ts`
- **Services** (name, description, icon, "starting at" price) → `lib/services.ts`
- **About story copy** → `app/about/page.tsx` (search for `TODO`)
- **Hero copy** → `components/Hero.tsx`
- **Logo** — currently a text wordmark in `components/Navbar.tsx` and `components/Footer.tsx`. Swap in an `<Image>` when you have one.
- **Photo placeholders** — `app/about/page.tsx` has `[Crew photo placeholder]` divs you can replace with `<Image>` blocks.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. Framework preset is auto-detected as **Next.js**. Leave defaults.
4. Before the first deploy, expand **Environment Variables** and add all four `GOOGLE_*` vars (Production + Preview).
5. Click **Deploy**.

### Custom domain

1. In Vercel → Project → **Settings → Domains** → **Add**
2. Enter your domain (e.g. `otrexteriorcare.com`)
3. Vercel shows the DNS records to add at your registrar:
   - **A record** for the apex (`@`) pointing to `76.76.21.21`
   - **CNAME** for `www` pointing to `cname.vercel-dns.com`
4. Add those records at your registrar. Propagation usually takes a few minutes; SSL is provisioned automatically.

## Project structure

```
otr-exterior-care/
├── app/
│   ├── layout.tsx          root layout, fonts, metadata
│   ├── page.tsx            homepage
│   ├── globals.css         tailwind + custom scrollbar + animations
│   ├── services/page.tsx
│   ├── about/page.tsx
│   ├── booking/page.tsx
│   ├── contact/page.tsx
│   └── api/book/route.ts   POST → Google Sheets + Calendar
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ServicesGrid.tsx
│   ├── BookingForm.tsx
│   └── LandscapeBg.tsx
├── lib/
│   ├── google.ts           Sheets + Calendar helpers
│   ├── services.ts         services array
│   ├── site-config.ts      phone, email, hours, counties — edit this
│   └── types.ts            Booking type, time windows
├── public/
└── README.md
```

## Booking flow (mental model)

1. User fills 4-step form in `components/BookingForm.tsx` (client component).
2. On submit, it POSTs JSON to `/api/book/route.ts`.
3. Route validates the payload, then calls `appendBookingRow` and `createCalendarEvent` in parallel via `Promise.allSettled`.
4. If **either** succeeds, the user gets a success response. Both halves' errors are logged server-side.
5. If both fail, the user gets a 502 with a "please try again or call" message.

This is intentional: we'd rather keep the lead and reconcile later than reject a customer because the calendar API hiccuped.
