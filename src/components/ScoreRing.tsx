import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

/** Ring fills completely at this score; colors escalate above it. */
export const SCORE_RING_FULL = 100;
export const SCORE_RING_PURPLE = 175;
export const SCORE_RING_RED = 235;
export const SCORE_RING_BRONZE = 300;
export const SCORE_RING_SILVER = 400;
export const SCORE_RING_GOLD = 550;

const GREEN = '#34D399';
const SKY = '#38BDF8';
const PURPLE = '#A78BFA';
const RED = '#FF4D6A';
const BRONZE = '#CD7F32';
const SILVER = '#C0C0C0';
const GOLD = '#FFD700';

/** LoL-style ladder — highest first. `above` means score must be greater than this. */
export const SCORE_LADDER = [
  { id: 'gold', name: 'Gold', above: SCORE_RING_GOLD, color: GOLD, blurb: 'Above 550 — legendary' },
  { id: 'silver', name: 'Silver', above: SCORE_RING_SILVER, color: SILVER, blurb: 'Above 400' },
  { id: 'bronze', name: 'Bronze', above: SCORE_RING_BRONZE, color: BRONZE, blurb: 'Above 300' },
  { id: 'crimson', name: 'Crimson', above: SCORE_RING_RED, color: RED, blurb: 'Above 235' },
  { id: 'violet', name: 'Violet', above: SCORE_RING_PURPLE, color: PURPLE, blurb: 'Above 175' },
  { id: 'sky', name: 'Sky', above: SCORE_RING_FULL, color: SKY, blurb: 'Above 100 — overdrive' },
  { id: 'balance', name: 'Balance', above: 0, color: GREEN, blurb: '0–100 fills the ring' },
] as const;

export type ScoreLadderTier = (typeof SCORE_LADDER)[number];

export function getScoreLadderTier(score: number): ScoreLadderTier {
  for (const tier of SCORE_LADDER) {
    if (tier.id === 'balance') return tier;
    if (score > tier.above) return tier;
  }
  return SCORE_LADDER[SCORE_LADDER.length - 1];
}

export function scoreRingColor(score: number): string {
  return getScoreLadderTier(score).color;
}

export function scoreRingLabel(score: number): string {
  const tier = getScoreLadderTier(score);
  return tier.id === 'balance' ? `/ ${SCORE_RING_FULL}` : tier.name;
}

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  onClick?: () => void;
}

export default function ScoreRing({ score, size = 180, strokeWidth = 10, onClick }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const overdrive = score > SCORE_RING_FULL;
  const fillScore = Math.min(Math.max(0, score), SCORE_RING_FULL);
  const stroke = scoreRingColor(score);
  const tier = getScoreLadderTier(score);

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

  return (
    <motion.button
      className="relative focus-ring rounded-full"
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={`Life Balance score: ${score}, tier ${tier.name}. Open ladder.`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="score-ring-bg"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          initial={false}
          animate={{ stroke }}
          transition={{ duration: 0.45 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display font-bold text-[2.5rem] leading-none tabular-nums ${
            overdrive ? '' : 'text-ink-900 dark:text-ink-100'
          }`}
          style={overdrive ? { color: stroke } : undefined}
        >
          {Math.round(score)}
        </span>
        <span className="text-micro uppercase text-ink-300 mt-1 tracking-wider">
          {scoreRingLabel(score)}
        </span>
      </div>
    </motion.button>
  );
}
