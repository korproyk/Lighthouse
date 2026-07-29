import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useId, useMemo } from 'react';

/** Ring fills completely at this score. */
export const SCORE_RING_FULL = 100;

/** Soft edge flames kick in above this Life Balance score. */
export const SCORE_RING_BURN_AT = 85;

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

/** Classic upright flame silhouette (base at 0,0 — tip toward -Y / front-view up). */
function FlamePath({
  className,
  fill,
  delay,
  scale = 1,
  lean = 0,
}: {
  className?: string;
  fill: string;
  delay: number;
  scale?: number;
  lean?: number;
}) {
  return (
    <g transform={`rotate(${lean}) scale(${scale})`}>
      <path
        className={className}
        fill={fill}
        d="M0 0
           C -2.2 -2.8 -3.6 -6.2 -2.4 -9.4
           C -1.4 -11.6 -0.6 -13.2 0 -15.2
           C 0.6 -13.2 1.4 -11.6 2.4 -9.4
           C 3.6 -6.2 2.2 -2.8 0 0 Z"
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

export default function ScoreRing({ score, size = 180, strokeWidth = 10 }: ScoreRingProps) {
  const gradId = useId().replace(/:/g, '');
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillScore = Math.min(Math.max(0, score), SCORE_RING_FULL);
  const burning = score > SCORE_RING_BURN_AT;

  const motionProgress = useMotionValue(0);
  const strokeDashoffset = useTransform(
    motionProgress,
    [0, SCORE_RING_FULL],
    [circumference, 0]
  );

  useEffect(() => {
    const controls = animate(motionProgress, fillScore, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [fillScore, motionProgress]);

  // Front-view burn: flames sit on the rim but always rise UP (not outward).
  // Heavier / taller along the bottom & lower sides — how a hoop looks from the front.
  const flames = useMemo(() => {
    const spots: { deg: number; scale: number; lean: number; delay: number; layer: 'back' | 'front' }[] = [];
    // deg: 0 = top, clockwise
    const layout = [
      { deg: 0, scale: 0.55, lean: -4 },
      { deg: 18, scale: 0.5, lean: 6 },
      { deg: 342, scale: 0.5, lean: -6 },
      { deg: 40, scale: 0.72, lean: 8 },
      { deg: 320, scale: 0.72, lean: -8 },
      { deg: 62, scale: 0.9, lean: 10 },
      { deg: 298, scale: 0.9, lean: -10 },
      { deg: 85, scale: 1.05, lean: 6 },
      { deg: 275, scale: 1.05, lean: -6 },
      { deg: 110, scale: 1.2, lean: 4 },
      { deg: 250, scale: 1.2, lean: -4 },
      { deg: 135, scale: 1.35, lean: 2 },
      { deg: 225, scale: 1.35, lean: -2 },
      { deg: 160, scale: 1.45, lean: -3 },
      { deg: 200, scale: 1.45, lean: 3 },
      { deg: 180, scale: 1.55, lean: 0 },
      // second layer — softer inner flickers near the base
      { deg: 150, scale: 0.85, lean: 8, layer: 'front' as const },
      { deg: 180, scale: 0.95, lean: -5, layer: 'front' as const },
      { deg: 210, scale: 0.85, lean: -8, layer: 'front' as const },
      { deg: 100, scale: 0.7, lean: 12, layer: 'front' as const },
      { deg: 260, scale: 0.7, lean: -12, layer: 'front' as const },
    ];

    layout.forEach((s, i) => {
      spots.push({
        deg: s.deg,
        scale: s.scale * (size / 140),
        lean: s.lean,
        delay: (i * 0.09) % 1.5,
        layer: s.layer ?? 'back',
      });
    });
    return spots;
  }, [size]);

  const placeFlame = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    // Sit just outside the stroke so tips rise off the rim.
    const r = radius + strokeWidth * 0.2;
    return {
      x: cx + Math.sin(rad) * r,
      y: cy - Math.cos(rad) * r,
    };
  };

  return (
    <div
      className={`relative ${burning ? 'score-ring-burning' : ''}`}
      style={{ width: size, height: size }}
      aria-label={`Life Balance score: ${Math.round(score)}`}
    >
      {burning && (
        <div
          className="score-ring-ember pointer-events-none absolute inset-[-8px] rounded-full"
          aria-hidden
        />
      )}

      <svg
        width={size}
        height={size}
        className="relative z-[1]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`scoreGradient-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB547" />
            <stop offset="55%" stopColor="#FF6B7A" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id={`flameGrad-${gradId}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF6B7A" stopOpacity="0.15" />
            <stop offset="35%" stopColor="#FFB547" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#FFE08A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFF6D6" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`flameCore-${gradId}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#FFE8A3" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
          </linearGradient>
          <filter id={`flameBlur-${gradId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.85" />
          </filter>
        </defs>

        {/* Back-layer flames (behind the ring stroke) */}
        {burning && (
          <g aria-hidden filter={`url(#flameBlur-${gradId})`} opacity={0.9}>
            {flames
              .filter((f) => f.layer === 'back')
              .map((f, i) => {
                const { x, y } = placeFlame(f.deg);
                return (
                  <g key={`b-${i}`} transform={`translate(${x} ${y})`}>
                    <FlamePath
                      className="score-flame-tip"
                      fill={`url(#flameGrad-${gradId})`}
                      delay={f.delay}
                      scale={f.scale}
                      lean={f.lean}
                    />
                  </g>
                );
              })}
          </g>
        )}

        {/* Track + progress */}
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            className="score-ring-bg"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#scoreGradient-${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            className={burning ? 'score-ring-hot' : undefined}
          />
        </g>

        {/* Front-layer wisps rising off the lower rim */}
        {burning && (
          <g aria-hidden filter={`url(#flameBlur-${gradId})`}>
            {flames
              .filter((f) => f.layer === 'front')
              .map((f, i) => {
                const { x, y } = placeFlame(f.deg);
                return (
                  <g key={`f-${i}`} transform={`translate(${x} ${y})`}>
                    <FlamePath
                      className="score-flame-tip score-flame-tip--core"
                      fill={`url(#flameCore-${gradId})`}
                      delay={f.delay + 0.2}
                      scale={f.scale * 0.75}
                      lean={f.lean}
                    />
                  </g>
                );
              })}
          </g>
        )}
      </svg>

      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[2.5rem] leading-none tabular-nums text-ink-900 dark:text-ink-100">
          {Math.round(score)}
        </span>
        <span className="text-micro uppercase text-ink-300 mt-1 tracking-wider">
          Score
        </span>
      </div>
    </div>
  );
}
