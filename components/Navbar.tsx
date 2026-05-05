"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-otr-black/85 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-2xl font-bold text-otr-stone">
            OTR
          </span>
          <span className="mt-0.5 text-[10px] font-medium tracking-[0.25em] text-otr-sky/80">
            EXTERIOR CARE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-otr-stone/80 transition-colors hover:text-otr-stone"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="group relative inline-flex items-center overflow-hidden rounded-full bg-otr-blue px-5 py-2 text-sm font-semibold text-otr-stone shadow-lg shadow-otr-blue-deep/40 transition-all hover:bg-otr-blue-bright"
          >
            <span className="relative z-10">Book Now</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden text-otr-stone p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-otr-black/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-otr-stone/85 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-otr-blue px-5 py-3 text-sm font-semibold text-otr-stone"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
