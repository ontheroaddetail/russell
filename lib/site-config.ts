export const SITE = {
  name: "OTR Exterior Care",
  shortName: "OTR",
  acronymExpanded: "On the Road",
  tagline: "Exterior Care That Goes The Extra Mile",
  phone: "(330) 696-3422",
  phoneHref: "tel:+13306963422",
  email: "PureLightEXT.LLC@gmail.com",
  emailHref: "mailto:PureLightEXT.LLC@gmail.com",
  // Bookings flow to this Google account's Drive (sheet "OTR EXT scheduling") + calendar.
  schedulingEmail: "onthewvroaddetail@gmail.com",
  schedulingEmailHref: "mailto:onthewvroaddetail@gmail.com",
  hours: [
    { day: "Mon – Fri", time: "7:00 AM – 7:00 PM" },
    { day: "Saturday", time: "8:00 AM – 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  social: {
    instagram: "",
    facebook: "",
  },
};

export interface ServiceArea {
  slug: string;
  city: string;
  state: string;
  county: string;
  zip: string;
  blurb: string;
  covers: string[];
  bookInAdvance?: boolean;
  travelNote?: string;
  /**
   * Multiplier applied to every service's base price/rate for jobs in this
   * area — covers extra travel time. 1.0 = no surcharge. Tweak as you feel out
   * the market. Per-service overrides live on the Service object itself.
   */
  priceMultiplier: number;
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "wadsworth",
    city: "Wadsworth",
    state: "OH",
    county: "Medina County",
    zip: "44281",
    blurb:
      "Home base. We're based out of Wadsworth, so this is where we run the tightest schedule and the fastest response — most jobs in town go on the calendar same week.",
    covers: ["Medina", "Brunswick", "Seville", "Rittman", "Doylestown", "Norton"],
    priceMultiplier: 1.0,
  },
  {
    slug: "akron",
    city: "Akron",
    state: "OH",
    county: "Summit County",
    zip: "44308",
    blurb:
      "About 25 minutes from us. Easy run down the highway — we're in Akron multiple times a week and book the surrounding suburbs without a travel surcharge.",
    covers: ["Cuyahoga Falls", "Stow", "Hudson", "Tallmadge", "Fairlawn", "Copley"],
    travelNote: "~25 min from Wadsworth",
    priceMultiplier: 1.0,
  },
  {
    slug: "cleveland",
    city: "Cleveland",
    state: "OH",
    county: "Cuyahoga County",
    zip: "44114",
    blurb:
      "Yes, it's a haul — but we make the drive. Cleveland and the inner-ring suburbs are on our route weekly. Please book a few days in advance so we can group routes efficiently.",
    covers: [
      "Lakewood",
      "Strongsville",
      "Parma",
      "Westlake",
      "Brecksville",
      "Independence",
    ],
    bookInAdvance: true,
    priceMultiplier: 1.15,
  },
];

export function findServiceArea(slug: string): ServiceArea | undefined {
  return SERVICE_AREAS.find((a) => a.slug === slug);
}

