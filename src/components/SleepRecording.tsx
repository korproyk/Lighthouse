import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../lib/store';
import { SLEEP_GOAL_HOURS } from '../lib/mockData';

interface SleepRecordingProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (hours: number) => void;
}

const DEFAULT_BEDTIME = '10:30 PM';
const DEFAULT_WAKE = '6:30 AM';

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatStamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Two filled dots → first tap empties left → second empties right + fires. */
function ConfirmDots({
  taps,
  activeColor,
}: {
  taps: number;
  activeColor: string;
}) {
  const leftFilled = taps < 1;
  const rightFilled = taps < 2;
  return (
    <div className="mt-1.5 flex gap-1.5" aria-hidden>
      <span
        className="w-2 h-2 rounded-full border transition-colors"
        style={{
          background: leftFilled ? activeColor : 'transparent',
          borderColor: activeColor,
        }}
      />
      <span
        className="w-2 h-2 rounded-full border transition-colors"
        style={{
          background: rightFilled ? activeColor : 'transparent',
          borderColor: activeColor,
        }}
      />
    </div>
  );
}

export default function SleepRecording({ isOpen, onClose, onCompleted }: SleepRecordingProps) {
  const {
    sleepSession,
    lastSleep,
    startSleepSession,
    stopSleepSession,
  } = useStore();

  const [now, setNow] = useState(Date.now());
  /** Chosen before bedtime; locked once sleep starts (same check UI as before). */
  const [minus20, setMinus20] = useState(true);
  const [bedTap, setBedTap] = useState(0);
  const [wakeTap, setWakeTap] = useState(0);
  const bedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleeping = Boolean(sleepSession);
  const displayMinus20 = sleeping ? Boolean(sleepSession?.minus20) : minus20;

  useEffect(() => {
    if (!isOpen || !sleepSession) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen, sleepSession]);

  useEffect(() => () => {
    if (bedTimer.current) clearTimeout(bedTimer.current);
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setBedTap(0);
    setWakeTap(0);
    if (sleepSession) {
      setMinus20(Boolean(sleepSession.minus20));
    } else {
      setMinus20(true);
    }
  }, [isOpen, sleeping, sleepSession]);

  const elapsedMs = sleepSession ? now - sleepSession.startedAt : 0;
  const goalMs = SLEEP_GOAL_HOURS * 3_600_000;
  const timerCovered = sleeping && elapsedMs < goalMs;
  const goalReached = sleeping && elapsedMs >= goalMs;

  const confirmBedtime = () => {
    startSleepSession(minus20);
    setNow(Date.now());
    setBedTap(0);
  };

  const confirmWake = () => {
    const adjustMs = sleepSession?.minus20 ? 20 * 60 * 1000 : 0;
    const record = stopSleepSession(adjustMs);
    setWakeTap(0);
    if (!record) return;
    if (record.hours >= SLEEP_GOAL_HOURS) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#FFB547', '#FF6B7A', '#34D399', '#FFB27A'],
      });
    }
    onCompleted?.(record.hours);
    onClose();
  };

  const handleBedtimeTap = () => {
    if (sleeping) return;
    const next = bedTap + 1;
    setBedTap(next);
    setWakeTap(0);
    if (bedTimer.current) clearTimeout(bedTimer.current);
    if (next >= 2) {
      confirmBedtime();
      return;
    }
    bedTimer.current = setTimeout(() => setBedTap(0), 1600);
  };

  const handleWakeTap = () => {
    if (!sleeping) return;
    const next = wakeTap + 1;
    setWakeTap(next);
    setBedTap(0);
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
    if (next >= 2) {
      confirmWake();
      return;
    }
    wakeTimer.current = setTimeout(() => setWakeTap(0), 1600);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-stretch justify-center bg-cream dark:bg-night-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aurora-mesh" />
            <div className="noise-overlay" />

            <div
              className="relative flex-1 min-h-0 flex flex-col screen-scroll px-5"
              style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-micro uppercase tracking-[0.16em] text-coral-500 font-bold mb-1">
                    Required · Sleep
                  </p>
                  <h1 className="font-display font-bold text-[1.65rem] leading-tight text-ink-900 dark:text-ink-100 tracking-tight">
                    Sleep recording
                  </h1>
                </div>
                <motion.button
                  type="button"
                  className="shrink-0 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
                  whileTap={{ scale: 0.94 }}
                  onClick={onClose}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} className="text-ink-900 dark:text-ink-100" />
                </motion.button>
              </div>

              <p className="mt-2 text-[12px] text-ink-600 dark:text-ink-300 leading-snug">
                Double-tap bedtime when you put the phone down.
                <br />
                Double-tap wakeup when you get up.
              </p>

              {/* Sleep goal card */}
              <motion.div
                className="relative mt-4 overflow-hidden rounded-hero glass-strong px-4 pt-4 pb-3.5 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="absolute -top-16 -right-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.38), transparent 70%)', filter: 'blur(24px)' }}
                />

                <div className="relative z-[1]">
                  {/* Art already includes “Sleep goal / 8 hours” — keep native sharpness */}
                  <div className="flex w-full items-center justify-center">
                    <img
                      src="/images/sleeping-fireguy.png"
                      alt={`Sleep goal ${SLEEP_GOAL_HOURS} hours`}
                      width={390}
                      height={370}
                      className="h-auto w-auto max-w-full object-contain object-center pointer-events-none select-none"
                      style={{ maxWidth: 'min(100%, 195px)' }}
                      draggable={false}
                    />
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {goalReached ? (
                      <motion.div
                        key="goal-reached"
                        className="mt-2"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-ink-300">
                          Goal reached
                        </p>
                        <p className="mt-1 font-display font-bold text-[1.75rem] leading-none tracking-tight text-lighthouse-600 dark:text-lighthouse-300 tabular-nums">
                          {formatElapsed(elapsedMs)}
                        </p>
                      </motion.div>
                    ) : timerCovered ? (
                      <motion.div
                        key="rest-easy"
                        className="mt-2 px-1"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                          Rest easy
                        </p>
                        <p className="mt-1 text-[12px] text-ink-600 dark:text-ink-300 leading-snug">
                          Timer stays covered until {SLEEP_GOAL_HOURS} hours.
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="mt-3.5 pt-3 border-t border-ink-100/80 dark:border-white/10 flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-full hero-glow shadow-soft flex items-center justify-center shrink-0">
                        <Moon size={12} className="text-white" />
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                          Bedtime
                        </p>
                        <p className="mt-0.5 text-[12px] font-bold text-ink-900 dark:text-ink-100 tabular-nums truncate">
                          {sleeping && sleepSession
                            ? new Date(sleepSession.startedAt).toLocaleTimeString(undefined, {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : DEFAULT_BEDTIME}
                        </p>
                      </div>
                    </div>

                    <ArrowRight size={12} className="text-lighthouse-500 shrink-0" strokeWidth={2.5} />

                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className="w-6 h-6 rounded-full bg-[#FFB547] shadow-soft flex items-center justify-center shrink-0">
                        <Sun size={12} className="text-white" />
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                          Wake up
                        </p>
                        <p className="mt-0.5 text-[12px] font-bold text-ink-900 dark:text-ink-100 tabular-nums truncate">
                          {DEFAULT_WAKE}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* −20 min — same check UI; only lockable after bedtime starts */}
              <button
                type="button"
                disabled={sleeping}
                className={`mt-3.5 flex items-center gap-3 px-3.5 py-3 rounded-card glass text-left w-full ${
                  sleeping ? 'opacity-70' : ''
                }`}
                onClick={() => {
                  if (!sleeping) setMinus20((v) => !v);
                }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    displayMinus20 ? 'hero-glow' : 'bg-ink-100 dark:bg-night-700'
                  }`}
                >
                  {displayMinus20 && <Check size={13} className="text-white" strokeWidth={3} />}
                </span>
                <span className="text-caption text-ink-600 dark:text-ink-300 leading-snug">
                  Minus 20 minutes for a more accurate result
                </span>
              </button>

              {/* Bedtime / Wake — size swap kept; no chevrons */}
              <div className="mt-3.5 flex gap-2.5 items-stretch min-h-[5.5rem]">
                <motion.button
                  type="button"
                  layout
                  transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={handleBedtimeTap}
                  disabled={sleeping}
                  className={`relative overflow-hidden rounded-[1.25rem] text-left ${
                    sleeping
                      ? 'w-[28%] glass opacity-55'
                      : 'flex-1 glass-tint-warm'
                  }`}
                  whileTap={sleeping ? undefined : { scale: 0.98 }}
                >
                  <div
                    className={`relative h-full flex ${
                      sleeping
                        ? 'flex-col items-center justify-center px-1.5 py-2.5'
                        : 'flex-col justify-center px-3 py-3'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center shrink-0 ${
                        sleeping
                          ? 'w-8 h-8 bg-ink-100 dark:bg-night-700'
                          : 'w-9 h-9 hero-glow shadow-soft'
                      }`}
                    >
                      <Moon
                        size={sleeping ? 14 : 16}
                        className={sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'}
                      />
                    </div>

                    {sleeping ? (
                      <p className="mt-1 text-[10px] font-bold text-center text-ink-600 dark:text-ink-300 leading-tight">
                        Bedtime
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 font-display font-bold text-[13px] leading-tight text-ink-900 dark:text-ink-100">
                          Start Bedtime
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-600 dark:text-ink-300 leading-snug">
                          {bedTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                        <ConfirmDots taps={bedTap} activeColor="#FF7A45" />
                      </>
                    )}
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  layout
                  transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={handleWakeTap}
                  disabled={!sleeping}
                  className={`relative overflow-hidden rounded-[1.25rem] text-left ${
                    !sleeping
                      ? 'w-[28%] glass opacity-55'
                      : 'flex-1'
                  }`}
                  style={
                    sleeping
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(255,181,71,0.22), rgba(255,255,255,0.88) 55%)',
                          boxShadow:
                            'inset 0 0 0 1.5px rgba(255,181,71,0.45), 0 10px 28px rgba(14,11,8,0.06)',
                        }
                      : undefined
                  }
                  whileTap={sleeping ? { scale: 0.98 } : undefined}
                >
                  <div
                    className={`relative h-full flex ${
                      !sleeping
                        ? 'flex-col items-center justify-center px-1.5 py-2.5'
                        : 'flex-col justify-center px-3 py-3'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center shrink-0 ${
                        !sleeping
                          ? 'w-8 h-8 bg-ink-100 dark:bg-night-700'
                          : 'w-9 h-9 bg-[#FFB547] shadow-soft'
                      }`}
                    >
                      <Sun
                        size={!sleeping ? 14 : 16}
                        className={!sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'}
                      />
                    </div>

                    {!sleeping ? (
                      <p className="mt-1 text-[10px] font-bold text-center text-ink-600 dark:text-ink-300 leading-tight">
                        Awake?
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 font-display font-bold text-[13px] leading-tight text-ink-900 dark:text-ink-100">
                          Are U Awake?
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-600 dark:text-ink-300 leading-snug">
                          {wakeTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                        <ConfirmDots taps={wakeTap} activeColor="#FFB547" />
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              <div className="mt-3 mb-6 px-0.5 text-[11px] text-ink-300 leading-relaxed">
                {sleeping && sleepSession ? (
                  <p>
                    Bedtime started {formatStamp(sleepSession.startedAt)}. Keeps running while locked.
                  </p>
                ) : lastSleep ? (
                  <p>
                    Recent sleep: {formatElapsed(lastSleep.hours * 3_600_000)} · {formatStamp(lastSleep.endedAt)}
                  </p>
                ) : (
                  <p>No night recorded yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
