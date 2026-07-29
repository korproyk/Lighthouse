import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useId, useMemo } from 'react';

/** Ring fills completely at this score. */
export const SCORE_RING_FULL = 100;

/** Soft edge flames kick in above this Life Balance score. */
export const SCORE_RING_BURN_AT = 85;

const FLAME_COUNT = 16;

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
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

  const flames = useMemo(
    () =>
      Array.from({ length: FLAME_COUNT }, (_, i) => {
        const angle = (i / FLAME_COUNT) * 360;
        // Alternate tall / soft tips so the rim feels alive, not uniform.
        const tall = i % 2 === 0;
        return {
          angle,
          delay: (i * 0.11) % 1.4,
          height: tall ? 11 : 7.5,
          width: tall ? 5.5 : 4.2,
        };
      }),
    []
  );

  return (
    <div
      className={`relative ${burning ? 'score-ring-burning' : ''}`}
      style={{ width: size, height: size }}
      aria-label={`Life Balance score: ${Math.round(score)}`}
    >
      {burning && (
        <div
          className="score-ring-ember pointer-events-none absolute inset-[-6px] rounded-full"
          aria-hidden
        />
      )}

      <svg width={size} height={size} className="relative z-[1] overflow-visible" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`scoreGradient-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB547" />
            <stop offset="55%" stopColor="#FF6B7A" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <radialGradient id={`flameGrad-${gradId}`} cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFB547" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF6B7A" stopOpacity="0" />
          </radialGradient>
          <filter id={`flameBlur-${gradId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" />
          </filter>
        </defs>

        {/* Track + progress (rotated so fill starts at 12 o'clock) */}
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

        {/* Soft dancing flame tips along the outer rim */}
        {burning && (
          <g aria-hidden filter={`url(#flameBlur-${gradId})`}>
            {flames.map((f, i) => (
              <g
                key={i}
                transform={`rotate(${f.angle} ${cx} ${cy}) translate(${cx}, ${cy - radius - strokeWidth * 0.15})`}
              >
                <ellipse
                  className="score-flame-tip"
                  cx={0}
                  cy={-f.height * 0.35}
                  rx={f.width / 2}
                  ry={f.height / 2}
                  fill={`url(#flameGrad-${gradId})`}
                  style={{ animationDelay: `${f.delay}s` }}
                />
              </g>
            ))}
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
