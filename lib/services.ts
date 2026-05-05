import {
  Droplets,
  Scissors,
  Shovel,
  Trees,
  CloudRain,
  Sparkles,
  Lightbulb,
  Trash2,
  Leaf,
  Snowflake,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  slug: string;
  name: string;
  short: string;
  long: string;
  icon: LucideIcon;
  startingAt: string;
  seasonal?: boolean;
  /**
   * If set, the customer can self-estimate by entering square footage on the
   * /quote page. We multiply sqft × pricePerSqft and add a minimum charge floor.
   * Services without this can still be quoted — we just measure on our end.
   */
  pricePerSqft?: number;
  /** Floor used when pricePerSqft × sqft would land below it. */
  minCharge?: number;
  /** Short hint shown on the quote page describing what we measure. */
  sqftHint?: string;
  /**
   * Per-area price overrides keyed by ServiceArea.slug. If present, replaces the
   * area's default priceMultiplier for THIS service only. Use when a service
   * has a different cost structure in one city.
   */
  areaOverrides?: Record<
    string,
    { startingAt?: string; pricePerSqft?: number; minCharge?: number }
  >;
}

export const SERVICES: Service[] = [
  {
    slug: "pressure-washing",
    name: "Pressure Washing",
    short:
      "Soft and high-pressure cleaning for siding, concrete, decks, and driveways.",
    long: "Restore curb appeal in an afternoon. We dial pressure and detergent to the surface — soft wash for siding and roofs, deep clean for concrete, gentle for decks and fences.",
    icon: Droplets,
    startingAt: "$0.18 / sqft",
    pricePerSqft: 0.18,
    minCharge: 189,
    sqftHint: "Approx sqft of siding / concrete / deck to wash.",
  },
  {
    slug: "bush-shrub-trimming",
    name: "Bush & Shrub Trimming",
    short:
      "Clean shapes, healthy growth, no overgrowth crowding your windows.",
    long: "Sharp shears, sharp lines. We trim to encourage healthy regrowth and keep beds looking maintained — not just cut back.",
    icon: Scissors,
    startingAt: "$110",
  },
  {
    slug: "mulch-bed-edging",
    name: "Mulch Bed Edging",
    short: "Crisp, hand-cut edges that frame every bed and tree ring.",
    long: "A fresh edge is the single biggest visual upgrade for a yard. Hand-cut, clean trench between turf and bed — built to last the season.",
    icon: Shovel,
    startingAt: "$1.40 / linear ft",
    pricePerSqft: 1.4,
    minCharge: 150,
    sqftHint: "Linear feet of bed edge to cut. Roughly the perimeter of all your beds.",
  },
  {
    slug: "mulch-installation",
    name: "Mulch Installation",
    short: "Premium mulch delivered, spread, and finished — all in one visit.",
    long: "We source premium hardwood, dyed, or natural mulch and install it at the right depth — too thick smothers, too thin invites weeds. We get it right.",
    icon: Trees,
    startingAt: "$0.55 / sqft of bed",
    pricePerSqft: 0.55,
    minCharge: 175,
    sqftHint: "Total square footage of bed area to mulch (3\" depth).",
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter Cleaning",
    short:
      "Hand-cleared gutters and flushed downspouts — no clogs, no overflow.",
    long: "Clogged gutters cause foundation problems. We clear by hand, flush downspouts, and check for separation or pitch issues while we're up there.",
    icon: CloudRain,
    startingAt: "$1.00 / linear ft",
    pricePerSqft: 1.0,
    minCharge: 100,
    sqftHint: "Linear feet of gutters. Roughly the perimeter of your roofline.",
  },
  {
    slug: "window-cleaning",
    name: "Window Cleaning",
    short: "Streak-free interior and exterior, screens included.",
    long: "Pure water rinse, microfiber finish, screens cleaned and re-seated. Inside, outside, or both — your call.",
    icon: Sparkles,
    startingAt: "$150",
  },
  {
    slug: "holiday-landscape-lighting",
    name: "Holiday & Landscape Lighting",
    short: "Install, take-down, and storage. We hang it, you enjoy it.",
    long: "Pro-grade lights, custom-cut to your roofline. Landscape lighting designed for year-round use. Full install, take-down, and off-season storage available.",
    icon: Lightbulb,
    startingAt: "$220",
  },
  {
    slug: "trash-can-cleaning",
    name: "Trash Can Cleaning",
    short: "Hot-water sanitized, deodorized, returned curbside.",
    long: "Recurring or one-time. We sanitize, deodorize, and return cans curbside the same day. Great for HOA-driven streets and anyone tired of the smell.",
    icon: Trash2,
    startingAt: "$20 / can",
  },
  {
    slug: "leaf-removal",
    name: "Leaf Removal",
    short: "Full-property cleanup — lawns, beds, and gutters.",
    long: "Lawn, beds, gutters, and corners — we don't just blow leaves around. Hauled off-site, not left at the curb. Seasonal: autumn only.",
    icon: Leaf,
    startingAt: "$0.04 / sqft of lawn",
    pricePerSqft: 0.04,
    minCharge: 150,
    sqftHint: "Total lawn square footage. We handle beds and gutters at the same visit.",
    seasonal: true,
  },
  {
    slug: "snow-removal",
    name: "Snow Removal",
    short: "Drives, walks, and steps cleared before you need them.",
    long: "Per-event or seasonal contracts. Driveways, walkways, and steps cleared and salted. Priority routing for seasonal customers.",
    icon: Snowflake,
    startingAt: "$45 / visit",
    seasonal: true,
  },
];

export function getServiceByName(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name);
}

import type { ServiceArea } from "./site-config";

/**
 * Resolve the price label and per-sqft rate for a service in a given area.
 * Per-service overrides win over the area-level priceMultiplier.
 */
export function priceForArea(
  service: Service,
  area: ServiceArea | undefined,
): { startingAt: string; pricePerSqft?: number; minCharge?: number } {
  const override = area && service.areaOverrides?.[area.slug];
  if (override) {
    return {
      startingAt: override.startingAt ?? service.startingAt,
      pricePerSqft: override.pricePerSqft ?? service.pricePerSqft,
      minCharge: override.minCharge ?? service.minCharge,
    };
  }
  const m = area?.priceMultiplier ?? 1;
  if (m === 1) {
    return {
      startingAt: service.startingAt,
      pricePerSqft: service.pricePerSqft,
      minCharge: service.minCharge,
    };
  }
  return {
    startingAt: bumpPriceLabel(service.startingAt, m),
    pricePerSqft:
      service.pricePerSqft !== undefined
        ? +(service.pricePerSqft * m).toFixed(3)
        : undefined,
    minCharge:
      service.minCharge !== undefined
        ? Math.round(service.minCharge * m)
        : undefined,
  };
}

/** Multiply the leading dollar value in a label like "$0.18 / sqft" by m. */
function bumpPriceLabel(label: string, m: number): string {
  return label.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (_, num) => {
    const n = Number(num);
    if (Number.isNaN(n)) return `$${num}`;
    const bumped = n * m;
    // Preserve "0.18" vs "189" formatting: keep 2 decimals only if input had a decimal.
    const hadDecimal = num.includes(".");
    return `$${hadDecimal ? bumped.toFixed(2) : Math.round(bumped)}`;
  });
}
