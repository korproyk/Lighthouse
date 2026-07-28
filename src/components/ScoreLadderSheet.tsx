import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import {
  SCORE_LADDER,
  SCORE_RING_FULL,
  getScoreLadderTier,
  scoreRingColor,
} from './ScoreRing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

export default function ScoreLadderSheet({ isOpen, onClose, score }: Props) {
  const current = getScoreLadderTier(score);
  const accent = scoreRingColor(score);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Life Balance Ladder" snapPoints={[0.55, 0.92]}>
      <div className="pb-2">
        {/* Current rank banner — LoL rank feel */}
        <div
          className="relative overflow-hidden rounded-hero p-4 mb-5"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}14)`,
            boxShadow: `inset 0 0 0 1px ${accent}55`,
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: accent, opacity: 0.25, filter: 'blur(28px)' }}
          />
          <p className="relative text-micro uppercase tracking-[0.16em] font-bold" style={{ color: accent }}>
            Your tier
          </p>
          <div className="relative mt-1 flex items-end justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
                {current.name}
              </h3>
              <p className="mt-0.5 text-caption text-ink-600 dark:text-ink-300">
                {current.blurb}
              </p>
            </div>
            <p
              className="font-display font-bold text-[2rem] leading-none tabular-nums"
              style={{ color: accent }}
            >
              {Math.round(score)}
            </p>
          </div>
        </div>

        <p className="text-caption text-ink-600 dark:text-ink-300 mb-3 leading-relaxed">
          The ring fills at {SCORE_RING_FULL}. Keep earning points to climb — colors change as you pass each threshold.
        </p>

        <div className="space-y-2">
          {SCORE_LADDER.map((tier, i) => {
            const isCurrent = tier.id === current.id;
            const unlocked = score > tier.above || tier.id === 'balance';
            return (
              <motion.div
                key={tier.id}
                className={`relative flex items-center gap-3 p-3 rounded-card overflow-hidden ${
                  isCurrent ? 'glass-strong' : 'glass'
                }`}
                style={
                  isCurrent
                    ? { boxShadow: `inset 0 0 0 2px ${tier.color}` }
                    : undefined
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-soft"
                  style={{
                    background: unlocked
                      ? `linear-gradient(145deg, ${tier.color}, ${tier.color}cc)`
                      : 'rgba(14,11,8,0.08)',
                    opacity: unlocked ? 1 : 0.45,
                  }}
                >
                  <span
                    className="font-display font-bold text-caption"
                    style={{ color: unlocked ? '#fff' : undefined }}
                  >
                    {SCORE_LADDER.length - i}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-display font-bold text-title truncate ${
                        unlocked
                          ? 'text-ink-900 dark:text-ink-100'
                          : 'text-ink-600 dark:text-ink-300'
                      }`}
                    >
                      {tier.name}
                    </p>
                    {isCurrent && (
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-capsule text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ background: tier.color }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-300 mt-0.5">{tier.blurb}</p>
                </div>
                <p
                  className="shrink-0 font-display font-bold text-caption tabular-nums"
                  style={{ color: unlocked ? tier.color : undefined }}
                >
                  {tier.id === 'balance' ? `≤${SCORE_RING_FULL}` : `>${tier.above}`}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
