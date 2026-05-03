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
}

export const SERVICES: Service[] = [
  {
    slug: "pressure-washing",
    name: "Pressure Washing",
    short:
      "Soft and high-pressure cleaning for siding, concrete, decks, and driveways.",
    long: "Restore curb appeal in an afternoon. We dial pressure and detergent to the surface — soft wash for siding and roofs, deep clean for concrete, gentle for decks and fences.",
    icon: Droplets,
    startingAt: "$TBD",
  },
  {
    slug: "bush-shrub-trimming",
    name: "Bush & Shrub Trimming",
    short:
      "Clean shapes, healthy growth, no overgrowth crowding your windows.",
    long: "Sharp shears, sharp lines. We trim to encourage healthy regrowth and keep beds looking maintained — not just cut back.",
    icon: Scissors,
    startingAt: "$TBD",
  },
  {
    slug: "mulch-bed-edging",
    name: "Mulch Bed Edging",
    short:
      "Crisp, hand-cut edges that frame every bed and tree ring.",
    long: "A fresh edge is the single biggest visual upgrade for a yard. Hand-cut, clean trench between turf and bed — built to last the season.",
    icon: Shovel,
    startingAt: "$TBD",
  },
  {
    slug: "mulch-installation",
    name: "Mulch Installation",
    short:
      "Premium mulch delivered, spread, and finished — all in one visit.",
    long: "We source premium hardwood, dyed, or natural mulch and install it at the right depth — too thick smothers, too thin invites weeds. We get it right.",
    icon: Trees,
    startingAt: "$TBD",
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter Cleaning",
    short:
      "Hand-cleared gutters and flushed downspouts — no clogs, no overflow.",
    long: "Clogged gutters cause foundation problems. We clear by hand, flush downspouts, and check for separation or pitch issues while we're up there.",
    icon: CloudRain,
    startingAt: "$TBD",
  },
  {
    slug: "window-cleaning",
    name: "Window Cleaning",
    short:
      "Streak-free interior and exterior, screens included.",
    long: "Pure water rinse, microfiber finish, screens cleaned and re-seated. Inside, outside, or both — your call.",
    icon: Sparkles,
    startingAt: "$TBD",
  },
  {
    slug: "holiday-landscape-lighting",
    name: "Holiday & Landscape Lighting",
    short:
      "Install, take-down, and storage. We hang it, you enjoy it.",
    long: "Pro-grade lights, custom-cut to your roofline. Landscape lighting designed for year-round use. Full install, take-down, and off-season storage available.",
    icon: Lightbulb,
    startingAt: "$TBD",
  },
  {
    slug: "trash-can-cleaning",
    name: "Trash Can Cleaning",
    short:
      "Hot-water sanitized, deodorized, returned curbside.",
    long: "Recurring or one-time. We sanitize, deodorize, and return cans curbside the same day. Great for HOA-driven streets and anyone tired of the smell.",
    icon: Trash2,
    startingAt: "$TBD",
  },
  {
    slug: "leaf-removal",
    name: "Leaf Removal",
    short:
      "Full-property cleanup — lawns, beds, and gutters.",
    long: "Lawn, beds, gutters, and corners — we don't just blow leaves around. Hauled off-site, not left at the curb. Seasonal: autumn only.",
    icon: Leaf,
    startingAt: "$TBD",
    seasonal: true,
  },
  {
    slug: "snow-removal",
    name: "Snow Removal",
    short:
      "Drives, walks, and steps cleared before you need them.",
    long: "Per-event or seasonal contracts. Driveways, walkways, and steps cleared and salted. Priority routing for seasonal customers.",
    icon: Snowflake,
    startingAt: "$TBD",
    seasonal: true,
  },
];

export function getServiceByName(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name);
}
