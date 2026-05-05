interface LandscapeBgProps {
  className?: string;
}

/**
 * Galaxy night sky over a silhouetted landscape:
 *  - layered cosmic gradients (deep navy → magenta → black)
 *  - a soft Milky Way arc
 *  - dense star field with a few bright accents
 *  - shooting star (subtle CSS animation)
 *  - distant + foreground hill silhouettes with tree clusters
 */
export default function LandscapeBg({ className = "" }: LandscapeBgProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-otr-black ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep galaxy sky */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05050E" />
            <stop offset="35%" stopColor="#0A0A2E" />
            <stop offset="70%" stopColor="#1A0B3E" />
            <stop offset="100%" stopColor="#0A0E14" />
          </linearGradient>

          {/* Soft purple/blue nebula bloom */}
          <radialGradient id="nebula1" cx="0.7" cy="0.3" r="0.55">
            <stop offset="0%" stopColor="#7B3FE4" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#3D1A7A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3D1A7A" stopOpacity="0" />
          </radialGradient>

          {/* Pink/magenta nebula accent */}
          <radialGradient id="nebula2" cx="0.18" cy="0.22" r="0.45">
            <stop offset="0%" stopColor="#E04D8B" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#7A1F4D" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7A1F4D" stopOpacity="0" />
          </radialGradient>

          {/* Cyan core nebula (subtle) */}
          <radialGradient id="nebula3" cx="0.45" cy="0.45" r="0.35">
            <stop offset="0%" stopColor="#3FCFE4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3FCFE4" stopOpacity="0" />
          </radialGradient>

          {/* Milky Way band */}
          <linearGradient
            id="milkyWay"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#E8EDF2" stopOpacity="0" />
            <stop offset="35%" stopColor="#C5B5F0" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#E8EDF2" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#C5B5F0" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#E8EDF2" stopOpacity="0" />
          </linearGradient>

          {/* Hill silhouettes — almost-black so the galaxy reads above */}
          <linearGradient id="distant" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E0E1F" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#06060D" />
          </linearGradient>
          <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06060D" />
            <stop offset="100%" stopColor="#03030A" />
          </linearGradient>

          {/* Star glow filter */}
          <filter id="starGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* base sky */}
        <rect width="1440" height="900" fill="url(#sky)" />

        {/* nebula layers */}
        <rect width="1440" height="900" fill="url(#nebula1)" />
        <rect width="1440" height="900" fill="url(#nebula2)" />
        <rect width="1440" height="900" fill="url(#nebula3)" />

        {/* Milky Way diagonal band */}
        <g transform="rotate(-22 720 350)">
          <ellipse cx="720" cy="350" rx="900" ry="120" fill="url(#milkyWay)" />
          <ellipse
            cx="720"
            cy="350"
            rx="700"
            ry="60"
            fill="url(#milkyWay)"
            opacity="0.5"
          />
        </g>

        {/* Dense distant star field */}
        <g fill="#E8EDF2">
          {STAR_FIELD.map((s, i) => (
            <circle
              key={`s-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              opacity={s.o}
            />
          ))}
        </g>

        {/* Bright accent stars w/ glow */}
        <g fill="#FFFFFF" filter="url(#starGlow)">
          <circle cx="220" cy="120" r="1.6" />
          <circle cx="540" cy="80" r="1.4" />
          <circle cx="880" cy="150" r="1.8" />
          <circle cx="1220" cy="100" r="1.3" />
          <circle cx="380" cy="260" r="1.5" />
          <circle cx="1080" cy="320" r="1.4" />
          <circle cx="700" cy="220" r="1.7" />
        </g>

        {/* Tinted accent stars (cool blue / warm) */}
        <g filter="url(#starGlow)">
          <circle cx="160" cy="320" r="1.2" fill="#7FB7E8" />
          <circle cx="980" cy="60" r="1.2" fill="#FFD8A8" />
          <circle cx="1320" cy="280" r="1.1" fill="#C5B5F0" />
          <circle cx="460" cy="420" r="1" fill="#7FB7E8" />
          <circle cx="820" cy="380" r="1.1" fill="#FFD8A8" />
        </g>

        {/* Shooting star */}
        <g className="otr-shooting-star">
          <line
            x1="1180"
            y1="160"
            x2="1080"
            y2="220"
            stroke="url(#milkyWay)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="1180" cy="160" r="1.6" fill="#FFFFFF" />
        </g>

        {/* horizon haze */}
        <rect
          x="0"
          y="540"
          width="1440"
          height="40"
          fill="#7B3FE4"
          opacity="0.06"
        />

        {/* distant hills */}
        <path
          d="M0 560 L120 520 L260 540 L380 500 L520 530 L660 490 L820 520 L980 480 L1140 510 L1280 470 L1440 500 L1440 900 L0 900 Z"
          fill="url(#distant)"
        />

        {/* mid hills */}
        <path
          d="M0 660 L160 610 L320 640 L480 600 L640 630 L800 590 L960 620 L1120 580 L1280 610 L1440 580 L1440 900 L0 900 Z"
          fill="url(#mid)"
        />

        {/* foreground hills */}
        <path
          d="M0 780 L180 720 L360 760 L540 710 L720 750 L900 710 L1080 750 L1260 720 L1440 760 L1440 900 L0 900 Z"
          fill="#03030A"
        />

        {/* tree silhouettes */}
        <g fill="#02020A" opacity="0.95">
          <path d="M120 760 L130 720 L140 760 Z" />
          <path d="M150 765 L162 715 L174 765 Z" />
          <path d="M180 762 L190 730 L200 762 Z" />
          <path d="M620 745 L632 700 L644 745 Z" />
          <path d="M650 748 L660 720 L670 748 Z" />
          <path d="M1080 752 L1092 705 L1104 752 Z" />
          <path d="M1110 754 L1120 725 L1130 754 Z" />
          <path d="M1140 756 L1150 730 L1160 756 Z" />
        </g>
      </svg>

      {/* Noise grain */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}

// Pseudo-random but stable star positions across renders.
const STAR_FIELD: { x: number; y: number; r: number; o: number }[] = (() => {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 1337;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.round(rng() * 1440),
      // bias toward the upper 60% of the canvas so they don't bleed into the hills
      y: Math.round(rng() * 540),
      r: rng() < 0.85 ? 0.5 + rng() * 0.6 : 0.9 + rng() * 0.5,
      o: 0.3 + rng() * 0.6,
    });
  }
  return stars;
})();
