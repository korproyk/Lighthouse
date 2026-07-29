import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useId, useMemo } from 'react';

/** Ring fills completely at this score. */
export const SCORE_RING_FULL = 100;

/** Soft rim burn kicks in at this Life Balance score — a Keep Going! reward. */
export const SCORE_RING_BURN_AT = 85;

/** Dense enough that tips read as one continuous rim, not candles. */
const RIM_FLAMES = 48;

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
  const burning = score >= SCORE_RING_BURN_AT;

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

  // Full-edge rim: tongues packed all the way around, pointing outward from the stroke.
  const rimFlames = useMemo(
    () =>
      Array.from({ length: RIM_FLAMES }, (_, i) => {
        const angle = (i / RIM_FLAMES) * 360;
        const jitter = (i * 37) % 10;
        return {
          angle,
          // Vary length slightly so the rim feels alive, still continuous.
          len: 9 + (jitter % 5),
          width: 4.2 + (jitter % 3) * 0.35,
          delay: (i * 0.045) % 1.2,
        };
      }),
    []
  );

  const burnSize = size * 1.48;
  const flameR = radius + strokeWidth * 0.15;

  return (
    <div
      className={`relative ${burning ? 'score-ring-burning' : ''}`}
      style={{ width: size, height: size }}
      aria-label={
        burning
          ? `Life Balance score: ${Math.round(score)}. Rim flame — keep going.`
          : `Life Balance score: ${Math.round(score)}`
      }
    >
      {burning && (
        <div className="score-burn-wrap pointer-events-none" aria-hidden>
          <div className="score-ring-ember" />
          {/* Continuous fire texture around the whole rim (mask drops the black plate) */}
          <div className="score-burn-spin score-burn-spin--slow">
            <div
              className="score-burn-mask score-burn-mask--a"
              style={{ width: burnSize, height: burnSize }}
            />
          </div>
          <div className="score-burn-spin score-burn-spin--fast">
            <div
              className="score-burn-mask score-burn-mask--b"
              style={{ width: burnSize * 1.06, height: burnSize * 1.06 }}
            />
          </div>
        </div>
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
          <linearGradient id={`flameBand-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB547" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FF8A3D" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF6B7A" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={`flameTip-${gradId}`} cx="50%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#FFB547" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF6B7A" stopOpacity="0" />
          </radialGradient>
          <filter id={`flameSoft-${gradId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" />
          </filter>
        </defs>

        {/* Continuous fire band hugging the full stroke */}
        {burning && (
          <g aria-hidden>
            <circle
              className="score-flame-band"
              cx={cx}
              cy={cy}
              r={flameR}
              fill="none"
              stroke={`url(#flameBand-${gradId})`}
              strokeWidth={strokeWidth + 10}
              strokeLinecap="round"
              opacity={0.45}
              filter={`url(#flameSoft-${gradId})`}
            />
            <circle
              className="score-flame-band score-flame-band--shimmer"
              cx={cx}
              cy={cy}
              r={flameR}
              fill="none"
              stroke={`url(#flameBand-${gradId})`}
              strokeWidth={strokeWidth + 4}
              strokeDasharray={`${circumference * 0.08} ${circumference * 0.05}`}
              opacity={0.55}
            />
          </g>
        )}

        {/* Packed outward tongues — full 360°, blurred into one rim */}
        {burning && (
          <g aria-hidden filter={`url(#flameSoft-${gradId})`}>
            {rimFlames.map((f, i) => (
              <g
                key={i}
                transform={`rotate(${f.angle} ${cx} ${cy}) translate(${cx}, ${cy - flameR})`}
              >
                <ellipse
                  className="score-rim-flame"
                  cx={0}
                  cy={-f.len * 0.45}
                  rx={f.width / 2}
                  ry={f.len / 2}
                  fill={`url(#flameTip-${gradId})`}
                  style={{ animationDelay: `${f.delay}s` }}
                />
              </g>
            ))}
          </g>
        )}

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
