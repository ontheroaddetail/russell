import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { SERVICES } from "@/lib/services";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-otr-black">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-2xl font-bold text-otr-stone">
              OTR
            </div>
            <div className="mt-1 text-[11px] tracking-[0.25em] text-otr-sky/80">
              EXTERIOR CARE
            </div>
            <p className="mt-4 max-w-xs text-sm text-otr-stone/60">
              Trusted local crew based in Wadsworth, OH — On the Road across
              Akron, Cleveland, and the towns in between. Booking that takes 60
              seconds.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-otr-stone">
              Services
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-otr-stone/65">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link href="/services" className="hover:text-otr-stone">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-otr-stone">
              More Services
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-otr-stone/65">
              {SERVICES.slice(6).map((s) => (
                <li key={s.slug}>
                  <Link href="/services" className="hover:text-otr-stone">
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/booking" className="text-otr-blue-bright hover:text-otr-sky">
                  Book Online →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-otr-stone">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-otr-stone/70">
              <li>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center gap-2 hover:text-otr-stone"
                >
                  <Phone size={14} /> {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={SITE.emailHref}
                  className="inline-flex items-center gap-2 hover:text-otr-stone"
                >
                  <Mail size={14} /> {SITE.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 space-y-1 text-xs text-otr-stone/55">
              {SITE.hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/5 pt-6 text-xs text-otr-stone/40 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. On the road, on the job.
          </p>
          <p>Built with care. Bookings replied to within 24 hours.</p>
        </div>
      </div>
    </footer>
  );
}
