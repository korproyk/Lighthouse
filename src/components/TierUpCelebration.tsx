import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import Lumi from './Lumi';
import type { TierDef } from '../lib/tiers';

export interface TierUpPayload {
  from: TierDef;
  to: TierDef;
}

interface Props {
  celebration: TierUpPayload | null;
  onClose: () => void;
}

export default function TierUpCelebration({ celebration, onClose }: Props) {
  useEffect(() => {
    if (!celebration) return;
    const t = window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.45 },
        colors: ['#FFB547', '#FF6B7A', '#34D399', '#A78BFA', '#FFB27A'],
      });
    }, 280);
    return () => clearTimeout(t);
  }, [celebration]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Blurry dimmed backdrop — tap to dismiss */}
          <motion.button
            type="button"
            className="absolute inset-0 bg-night-900/55 backdrop-blur-md"
            aria-label="Dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tier-up-title"
            className="relative z-[1] w-full max-w-[320px] flex flex-col items-center text-center"
            initial={{ scale: 0.86, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div
              className={`relative w-[7.5rem] h-[7.5rem] rounded-full bg-gradient-to-br ${celebration.to.color} flex items-center justify-center shadow-floating`}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-110 pointer-events-none" />
              <Lumi pose="cheering" size={84} animate />
            </div>

            <motion.p
              className="mt-5 text-micro uppercase tracking-[0.18em] font-bold text-white/70"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Tier up
            </motion.p>

            {/* From → To */}
            <motion.div
              className="mt-3 flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <span className="px-3 py-1.5 rounded-capsule bg-white/10 text-white/55 font-display font-bold text-caption line-through decoration-white/30">
                {celebration.from.name}
              </span>
              <motion.span
                initial={{ x: -6, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <ArrowRight size={16} className="text-lighthouse-300" strokeWidth={2.75} />
              </motion.span>
              <motion.span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-capsule hero-glow text-white font-display font-bold text-caption shadow-soft"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.42, type: 'spring', stiffness: 320, damping: 16 }}
              >
                <Flame size={13} className="text-white" fill="white" />
                {celebration.to.name}
              </motion.span>
            </motion.div>

            <motion.h2
              id="tier-up-title"
              className="mt-5 font-display font-bold text-[1.65rem] leading-tight text-white tracking-tight"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              You&apos;re a {celebration.to.name} now
            </motion.h2>
            <motion.p
              className="mt-2 text-caption text-white/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
            >
              Keep going — tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
