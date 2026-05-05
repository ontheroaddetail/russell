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

## Google integration setup (Apps Script — ~5 min)

Bookings and quotes go through Google Apps Script web apps that you deploy from each spreadsheet. No service-account / OAuth / API-key setup required.

The two sheets already live in your **OTR EXT** Drive folder:

| Sheet | Drive ID |
|---|---|
| `OTR EXT Bookings` | `1MFIR5i2uqiFqKfRzCVCbY55witUzRuumdEVmFazFlKg` |
| `OTR EXT Quotes` | `1pz1m0Qi15zBMC9DzPzySdEn_HFWynRrAXabEkVyQUMs` |

Both have copies of the matching `.gs` script alongside them in the OTR EXT folder. You can also find the source under `apps-script/` in this repo.

### 1. Deploy the booking webhook

1. Open **OTR EXT Bookings** → **Extensions → Apps Script**.
2. Replace the default `Code.gs` with the contents of `apps-script/booking.gs`.
3. (Optional) Edit `CALENDAR_ID` near the top — leave `'primary'` to use the main calendar of the account that owns the script (i.e. `onthewvroaddetail@gmail.com`).
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Description: `OTR EXT booking webhook`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and authorize when prompted (you'll see a Google warning — review and continue).
6. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfy.../exec`).

### 2. Deploy the quote webhook

Same flow on **OTR EXT Quotes** → use `apps-script/quote.gs`. Copy that web app URL too.

### 3. Set environment variables

Locally, create `.env.local` next to `package.json` with:

```bash
GOOGLE_BOOKING_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
GOOGLE_QUOTE_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
```

On **Vercel**: Project → Settings → Environment Variables → add both, scoped to Production + Preview.

### 4. Test the integration

1. `npm run dev`
2. Visit each web app URL in a browser — you should see `{"ok":true,"hint":"..."}` confirming the deployment.
3. http://localhost:3000/booking — pick an area and complete a test booking. A row should land in **OTR EXT Bookings** and an event on the calendar.
4. http://localhost:3000/quote — submit a test quote. A row should land in **OTR EXT Quotes**.
5. Server-side errors log to the Next.js console — check there if either side is missing.

---

## Customizing the site

- **Phone, email, hours, social, business name** → `lib/site-config.ts`
- **Service-area boxes** (Wadsworth / Akron / Cleveland — county, ZIP, blurb, towns covered) → `SERVICE_AREAS` in `lib/site-config.ts`
- **Services** (name, description, icon, "starting at" price) → `lib/services.ts`
- **About story copy** → `app/about/page.tsx`
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
