import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
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

/** Full center sequence before taps can dismiss. */
const LOCK_MS = 3200;

export default function TierUpCelebration({ celebration, onClose }: Props) {
  const [canDismiss, setCanDismiss] = useState(false);
  const [phase, setPhase] = useState<'from' | 'burst' | 'to'>('from');

  useEffect(() => {
    if (!celebration) {
      setCanDismiss(false);
      setPhase('from');
      return;
    }

    setCanDismiss(false);
    setPhase('from');

    const burst = window.setTimeout(() => setPhase('burst'), 900);
    const to = window.setTimeout(() => setPhase('to'), 1400);
    const unlock = window.setTimeout(() => setCanDismiss(true), LOCK_MS);

    // Confetti when the new tier lands in the center
    const confettiMain = window.setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 78,
        startVelocity: 38,
        origin: { y: 0.42 },
        colors: ['#FFB547', '#FF6B7A', '#34D399', '#A78BFA', '#FFB27A', '#FF7A45'],
      });
    }, 1450);
    const confettiSide = window.setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.12, y: 0.55 },
        colors: ['#FFB547', '#FF6B7A', '#FFB27A'],
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.88, y: 0.55 },
        colors: ['#34D399', '#A78BFA', '#FF7A45'],
      });
    }, 1650);

    return () => {
      clearTimeout(burst);
      clearTimeout(to);
      clearTimeout(unlock);
      clearTimeout(confettiMain);
      clearTimeout(confettiSide);
    };
  }, [celebration]);

  const handleDismiss = () => {
    if (!canDismiss) return;
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {/* Blurry backdrop — ignores taps until the sequence finishes */}
          <motion.div
            className="absolute inset-0 bg-night-900/60 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tier-up-title"
            className="relative z-[1] w-full max-w-[340px] flex flex-col items-center text-center select-none"
            onClick={handleDismiss}
          >
            {/* Expanding ring burst behind the badge */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <AnimatePresence>
                {phase !== 'from' && (
                  <motion.div
                    key="ring"
                    className="absolute inset-0 rounded-full border-2 border-lighthouse-300/50"
                    initial={{ scale: 0.35, opacity: 0.9 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {phase !== 'from' && (
                  <motion.div
                    key="glow"
                    className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${celebration.to.color} blur-2xl`}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 0.55, scale: 1.15 }}
                    transition={{ duration: 0.7 }}
                  />
                )}
              </AnimatePresence>

              {/* Stage 1: old tier */}
              <AnimatePresence mode="wait">
                {phase === 'from' && (
                  <motion.div
                    key="from-badge"
                    className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${celebration.from.color} flex flex-col items-center justify-center shadow-floating`}
                    initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.55, opacity: 0, rotate: 8, filter: 'blur(6px)' }}
                    transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                  >
                    <Flame size={28} className="text-white mb-1" fill="white" />
                    <p className="font-display font-bold text-white text-title leading-none px-2">
                      {celebration.from.name}
                    </p>
                  </motion.div>
                )}

                {phase === 'burst' && (
                  <motion.div
                    key="burst"
                    className="relative w-20 h-20 rounded-full hero-glow shadow-floating"
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 1.35, 1], opacity: [0, 1, 1] }}
                    exit={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  />
                )}

                {phase === 'to' && (
                  <motion.div
                    key="to-badge"
                    className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${celebration.to.color} flex items-center justify-center shadow-floating`}
                    initial={{ scale: 0.2, opacity: 0, y: 24 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                      boxShadow: [
                        '0 20px 50px rgba(255,122,69,0.35)',
                        '0 20px 70px rgba(255,122,69,0.55)',
                        '0 20px 50px rgba(255,122,69,0.35)',
                      ],
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 16,
                      boxShadow: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-white/15 blur-md pointer-events-none" />
                    <Lumi pose="cheering" size={96} animate />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Copy — only after the new tier lands */}
            <AnimatePresence>
              {phase === 'to' && (
                <motion.div
                  key="copy"
                  className="mt-2 flex flex-col items-center"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <p className="text-micro uppercase tracking-[0.18em] font-bold text-white/65">
                    Tier up
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-capsule bg-white/10 text-white/45 font-display font-bold text-[12px] line-through decoration-white/25">
                      {celebration.from.name}
                    </span>
                    <motion.span
                      className="text-lighthouse-300 font-bold text-caption"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      →
                    </motion.span>
                    <motion.span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-capsule hero-glow text-white font-display font-bold text-[12px] shadow-soft"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.32, type: 'spring', stiffness: 300, damping: 14 }}
                    >
                      <Flame size={12} className="text-white" fill="white" />
                      {celebration.to.name}
                    </motion.span>
                  </div>

                  <h2
                    id="tier-up-title"
                    className="mt-4 font-display font-bold text-[1.75rem] leading-tight text-white tracking-tight"
                  >
                    You&apos;re a {celebration.to.name} now
                  </h2>

                  <motion.p
                    className="mt-3 text-caption text-white/60 min-h-[1.25rem]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: canDismiss ? 1 : 0.35 }}
                    transition={{ duration: 0.25 }}
                  >
                    {canDismiss ? 'Tap anywhere to continue' : '…'}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
