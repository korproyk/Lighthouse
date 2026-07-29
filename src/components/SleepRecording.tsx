import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Check, ArrowLeft, ChevronRight, ArrowRight } from 'lucide-react';
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

function SleepingFireguy() {
  return (
    <div className="relative mx-auto w-[9.5rem] h-[5.75rem]">
      {/* Pillow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-2 w-[5.5rem] h-7 rounded-[1.1rem]"
        style={{
          background: 'linear-gradient(180deg, #FFF9F3 0%, #F3E7DA 100%)',
          boxShadow: 'inset 0 -2px 0 rgba(14,11,8,0.04)',
        }}
      />
      {/* Blanket */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[8.25rem] h-[3.1rem] rounded-t-[1.35rem] rounded-b-[1.1rem]"
        style={{
          background: 'linear-gradient(180deg, #FFFDFB 0%, #F7EEE6 100%)',
          boxShadow: '0 8px 18px rgba(14,11,8,0.06)',
        }}
      />
      {/* Fireguy peeking from covers */}
      <img
        src="/images/character-2.png"
        alt=""
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[4.4rem] h-[4.4rem] object-contain pointer-events-none select-none"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(255,122,69,0.28))' }}
        draggable={false}
      />
      {/* Soft cover over lower half */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[0.55rem] w-[6.4rem] h-[1.55rem] rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,253,251,0.95), #F3E7DA)',
        }}
      />
      {/* zzz */}
      <motion.span
        className="absolute right-3 top-0 font-display font-bold text-[11px] text-lighthouse-500/80"
        animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        z
      </motion.span>
      <motion.span
        className="absolute right-1.5 top-2.5 font-display font-bold text-[13px] text-lighthouse-500/70"
        animate={{ y: [0, -5, 0], opacity: [0.35, 0.95, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
      >
        z
      </motion.span>
      <motion.span
        className="absolute -right-0.5 top-5 font-display font-bold text-[15px] text-coral-500/65"
        animate={{ y: [0, -6, 0], opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      >
        z
      </motion.span>
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
  const [minus20, setMinus20] = useState(true);
  const [bedTap, setBedTap] = useState(0);
  const [wakeTap, setWakeTap] = useState(0);
  const bedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleeping = Boolean(sleepSession);

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
  }, [isOpen, sleeping]);

  const elapsedMs = sleepSession ? now - sleepSession.startedAt : 0;
  const goalMs = SLEEP_GOAL_HOURS * 3_600_000;
  const timerCovered = sleeping && elapsedMs < goalMs;
  const goalReached = sleeping && elapsedMs >= goalMs;

  const confirmBedtime = () => {
    startSleepSession();
    setNow(Date.now());
    setBedTap(0);
  };

  const confirmWake = () => {
    const adjustMs = minus20 ? 20 * 60 * 1000 : 0;
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
              className="relative flex-1 min-h-0 flex flex-col screen-scroll px-6"
              style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-micro uppercase tracking-[0.18em] text-coral-500 font-bold mb-1">
                    Required · Sleep
                  </p>
                  <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
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

              <p className="mt-2 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
                Double-tap bedtime when you put the phone down.
                <br />
                Double-tap wakeup when you get up.
              </p>

              {/* Sleep goal card */}
              <motion.div
                className="relative mt-5 overflow-hidden rounded-hero glass-strong px-5 pt-5 pb-4 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="absolute -top-16 -right-10 w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.42), transparent 70%)', filter: 'blur(26px)' }}
                />
                <div
                  className="absolute -bottom-20 -left-12 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,181,71,0.28), transparent 70%)', filter: 'blur(26px)' }}
                />

                <div className="relative z-[1]">
                  <SleepingFireguy />

                  <AnimatePresence mode="wait" initial={false}>
                    {goalReached ? (
                      <motion.div
                        key="goal-reached"
                        className="mt-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-micro uppercase tracking-[0.16em] font-bold text-ink-300">
                          Goal reached
                        </p>
                        <p className="mt-1 font-display font-bold text-[2.35rem] leading-none tracking-tight text-lighthouse-600 dark:text-lighthouse-300 tabular-nums">
                          {formatElapsed(elapsedMs)}
                        </p>
                      </motion.div>
                    ) : timerCovered ? (
                      <motion.div
                        key="rest-easy"
                        className="mt-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                          Rest easy
                        </p>
                        <p className="mt-1 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
                          Timer stays covered until you hit {SLEEP_GOAL_HOURS} hours.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sleep-goal"
                        className="mt-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-micro uppercase tracking-[0.16em] font-bold text-ink-300">
                          Sleep goal
                        </p>
                        <p className="mt-1 font-display font-bold text-[2.35rem] leading-none tracking-tight text-lighthouse-600 dark:text-lighthouse-300">
                          {SLEEP_GOAL_HOURS} hours
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 pt-3.5 border-t border-ink-100/80 dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full hero-glow shadow-soft flex items-center justify-center shrink-0">
                        <Moon size={13} className="text-white" />
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                          Bedtime
                        </p>
                        <p className="mt-0.5 text-caption font-bold text-ink-900 dark:text-ink-100 tabular-nums truncate">
                          {sleeping && sleepSession
                            ? new Date(sleepSession.startedAt).toLocaleTimeString(undefined, {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : DEFAULT_BEDTIME}
                        </p>
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-lighthouse-500 shrink-0" strokeWidth={2.5} />

                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="w-7 h-7 rounded-full bg-[#FFB547] shadow-soft flex items-center justify-center shrink-0">
                        <Sun size={13} className="text-white" />
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                          Wake up
                        </p>
                        <p className="mt-0.5 text-caption font-bold text-ink-900 dark:text-ink-100 tabular-nums truncate">
                          {DEFAULT_WAKE}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bedtime / Wake — size swap kept */}
              <div className="mt-4 flex gap-3 items-stretch min-h-[5.75rem]">
                <motion.button
                  type="button"
                  layout
                  transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={handleBedtimeTap}
                  disabled={sleeping}
                  className={`relative overflow-hidden rounded-[1.35rem] text-left ${
                    sleeping
                      ? 'w-[30%] glass opacity-55'
                      : 'flex-1 glass-tint-warm'
                  }`}
                  whileTap={sleeping ? undefined : { scale: 0.98 }}
                >
                  <div
                    className={`relative h-full flex ${
                      sleeping
                        ? 'flex-col items-center justify-center px-2 py-3'
                        : 'items-center gap-3 px-3.5 py-3.5'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center shrink-0 ${
                        sleeping
                          ? 'w-9 h-9 bg-ink-100 dark:bg-night-700'
                          : 'w-11 h-11 hero-glow shadow-soft'
                      }`}
                    >
                      <Moon
                        size={sleeping ? 15 : 18}
                        className={sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'}
                      />
                    </div>

                    {sleeping ? (
                      <p className="mt-1.5 text-[10px] font-bold text-center text-ink-600 dark:text-ink-300 leading-tight">
                        Start Bedtime
                      </p>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100 leading-tight">
                            Start Bedtime
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink-600 dark:text-ink-300">
                            {bedTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                          </p>
                          <div className="mt-1.5 flex gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${bedTap >= 1 ? 'hero-glow' : 'bg-ink-200 dark:bg-night-500'}`} />
                            <span
                              className={`w-1.5 h-1.5 rounded-full border ${
                                bedTap >= 2 ? 'border-lighthouse-500 bg-lighthouse-500' : 'border-lighthouse-400'
                              }`}
                            />
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-ink-300 shrink-0" />
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
                  className={`relative overflow-hidden rounded-[1.35rem] text-left ${
                    !sleeping
                      ? 'w-[30%] glass opacity-55'
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
                  whileTap={!sleeping ? undefined : { scale: 0.98 }}
                >
                  <div
                    className={`relative h-full flex ${
                      !sleeping
                        ? 'flex-col items-center justify-center px-2 py-3'
                        : 'items-center gap-3 px-3.5 py-3.5'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center shrink-0 ${
                        !sleeping
                          ? 'w-9 h-9 bg-ink-100 dark:bg-night-700'
                          : 'w-11 h-11 bg-[#FFB547] shadow-soft'
                      }`}
                    >
                      <Sun
                        size={!sleeping ? 15 : 18}
                        className={!sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'}
                      />
                    </div>

                    {!sleeping ? (
                      <p className="mt-1.5 text-[10px] font-bold text-center text-ink-600 dark:text-ink-300 leading-tight">
                        Are U Awake?
                      </p>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100 leading-tight">
                            Are U Awake?
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink-600 dark:text-ink-300">
                            {wakeTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                          </p>
                          <div className="mt-1.5 flex gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${wakeTap >= 1 ? 'bg-[#FFB547]' : 'bg-ink-200 dark:bg-night-500'}`} />
                            <span
                              className={`w-1.5 h-1.5 rounded-full border ${
                                wakeTap >= 2 ? 'border-[#FFB547] bg-[#FFB547]' : 'border-[#FFB547]'
                              }`}
                            />
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-ink-300 shrink-0" />
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* −20 min */}
              <button
                type="button"
                className="mt-4 flex items-center gap-3 px-3.5 py-3 rounded-card glass text-left"
                onClick={() => setMinus20((v) => !v)}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    minus20 ? 'hero-glow' : 'bg-ink-100 dark:bg-night-700'
                  }`}
                >
                  {minus20 && <Check size={13} className="text-white" strokeWidth={3} />}
                </span>
                <span className="text-caption text-ink-600 dark:text-ink-300 leading-snug">
                  Minus 20 minutes for a more accurate result
                </span>
              </button>

              <div className="mt-3 mb-6 px-1 text-[11px] text-ink-300 leading-relaxed">
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
