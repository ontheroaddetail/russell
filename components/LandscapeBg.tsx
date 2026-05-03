interface LandscapeBgProps {
  className?: string;
}

export default function LandscapeBg({ className = "" }: LandscapeBgProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A0E14" />
            <stop offset="45%" stopColor="#0D2447" />
            <stop offset="80%" stopColor="#0D3B7A" />
            <stop offset="100%" stopColor="#1B2733" />
          </linearGradient>
          <linearGradient id="distant" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2733" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#111821" />
          </linearGradient>
          <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111821" />
            <stop offset="100%" stopColor="#0A0E14" />
          </linearGradient>
          <radialGradient id="moon" cx="0.82" cy="0.18" r="0.08">
            <stop offset="0%" stopColor="#E8EDF2" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8EDF2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect width="1440" height="900" fill="url(#sky)" />
        <rect width="1440" height="900" fill="url(#moon)" />

        {/* stars */}
        <g fill="#E8EDF2" opacity="0.5">
          <circle cx="120" cy="80" r="0.8" />
          <circle cx="240" cy="140" r="0.6" />
          <circle cx="380" cy="60" r="1" />
          <circle cx="520" cy="110" r="0.7" />
          <circle cx="700" cy="50" r="0.9" />
          <circle cx="860" cy="170" r="0.6" />
          <circle cx="1040" cy="90" r="0.8" />
          <circle cx="1220" cy="60" r="0.7" />
          <circle cx="1320" cy="180" r="0.5" />
          <circle cx="60" cy="220" r="0.5" />
          <circle cx="900" cy="280" r="0.4" />
          <circle cx="1180" cy="240" r="0.6" />
        </g>

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
          fill="#0A0E14"
        />

        {/* tree silhouettes */}
        <g fill="#4A6B3A" opacity="0.7">
          {/* foreground tree cluster left */}
          <path d="M120 760 L130 720 L140 760 Z" />
          <path d="M150 765 L162 715 L174 765 Z" />
          <path d="M180 762 L190 730 L200 762 Z" />
          {/* center cluster */}
          <path d="M620 745 L632 700 L644 745 Z" />
          <path d="M650 748 L660 720 L670 748 Z" />
          {/* right cluster */}
          <path d="M1080 752 L1092 705 L1104 752 Z" />
          <path d="M1110 754 L1120 725 L1130 754 Z" />
          <path d="M1140 756 L1150 730 L1160 756 Z" />
        </g>

        {/* horizon haze */}
        <rect x="0" y="540" width="1440" height="40" fill="#1E5FB8" opacity="0.05" />
      </svg>

      {/* Noise grain */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07] mix-blend-overlay"
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
