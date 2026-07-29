import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useId } from 'react';

/** Ring fills completely at this score. */
export const SCORE_RING_FULL = 100;

/** Soft edge flames kick in above this Life Balance score. */
export const SCORE_RING_BURN_AT = 85;

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

  const burnSize = size * 1.42;

  return (
    <div
      className={`relative ${burning ? 'score-ring-burning' : ''}`}
      style={{ width: size, height: size }}
      aria-label={`Life Balance score: ${Math.round(score)}`}
    >
      {burning && (
        <div className="score-burn-wrap pointer-events-none" aria-hidden>
          <div className="score-ring-ember" />
          {/* Outer ring-of-fire: gentle, continuously drifting */}
          <div className="score-burn-spin score-burn-spin--slow">
            <img
              src="/images/burning-ring.png"
              alt=""
              draggable={false}
              className="score-burn-ring score-burn-ring--soft"
              style={{ width: burnSize, height: burnSize }}
            />
          </div>
          {/* Second layer drifts the other way for living flicker */}
          <div className="score-burn-spin score-burn-spin--fast">
            <img
              src="/images/burning-ring.png"
              alt=""
              draggable={false}
              className="score-burn-ring score-burn-ring--mist"
              style={{ width: burnSize * 1.05, height: burnSize * 1.05 }}
            />
          </div>
        </div>
      )}

      <svg width={size} height={size} className="relative z-[1]">
        <defs>
          <linearGradient id={`scoreGradient-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB547" />
            <stop offset="55%" stopColor="#FF6B7A" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
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
