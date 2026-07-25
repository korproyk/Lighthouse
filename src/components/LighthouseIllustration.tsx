interface LighthouseIllustrationProps {
  className?: string;
}

// Subtle background watermark for the setup screen — a small lighthouse on a
// hill with a couple of sparkles, echoing the app's brand mark at low opacity.
export default function LighthouseIllustration({ className = '' }: LighthouseIllustrationProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Sparkles */}
      <path d="M40 30 L43 38 L51 41 L43 44 L40 52 L37 44 L29 41 L37 38 Z" fill="#FF7A45" opacity="0.5" />
      <path d="M175 65 L177 71 L183 73 L177 75 L175 81 L173 75 L167 73 L173 71 Z" fill="#FF4D6A" opacity="0.45" />
      <path d="M150 25 L151.5 29 L155.5 30.5 L151.5 32 L150 36 L148.5 32 L144.5 30.5 L148.5 29 Z" fill="#FFB27A" opacity="0.4" />

      {/* Hill */}
      <ellipse cx="120" cy="205" rx="100" ry="26" fill="#FF7A45" opacity="0.14" />

      {/* Bushes */}
      <circle cx="182" cy="190" r="14" fill="#FF7A45" opacity="0.18" />
      <circle cx="196" cy="196" r="10" fill="#FF7A45" opacity="0.18" />

      {/* Tower */}
      <path d="M103 200 L109 90 L131 90 L137 200 Z" fill="#FF7A45" opacity="0.22" />
      {/* Stripe bands */}
      <rect x="105" y="120" width="30" height="12" fill="#FF7A45" opacity="0.16" />
      <rect x="106.5" y="155" width="27" height="12" fill="#FF7A45" opacity="0.16" />

      {/* Gallery/rail under the lamp */}
      <rect x="99" y="84" width="42" height="8" rx="3" fill="#FF7A45" opacity="0.26" />

      {/* Lamp housing */}
      <path d="M112 84 L112 62 L128 62 L128 84 Z" fill="#FF7A45" opacity="0.3" />
      <path d="M108 62 L120 44 L132 62 Z" fill="#FF4D6A" opacity="0.34" />

      {/* Light beam */}
      <path
        d="M120 62 L70 78 L120 70 L170 78 Z"
        fill="#FFB27A"
        opacity="0.22"
      />
    </svg>
  );
}
