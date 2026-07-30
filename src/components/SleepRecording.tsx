import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Check, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../lib/store';
import { SLEEP_GOAL_HOURS } from '../lib/mockData';

interface SleepRecordingProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (hours: number) => void;
}

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

/** Always 12-hour with Latin AM/PM so the period can sit smaller beside the time. */
function formatClockParts(ts: number): { time: string; period: string } {
  const raw = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ts));
  const match = raw.match(/^(.+?)\s*(AM|PM)$/i);
  if (match) return { time: match[1], period: match[2].toUpperCase() };
  return { time: raw, period: '' };
}

/** Two filled dots → first tap empties left → second empties right + fires. */
function ConfirmDots({
  taps,
  activeColor,
  className = 'mt-1.5',
}: {
  taps: number;
  activeColor: string;
  className?: string;
}) {
  const leftFilled = taps < 1;
  const rightFilled = taps < 2;
  return (
    <div className={`flex gap-1.5 ${className}`} aria-hidden>
      <span
        className="w-2 h-2 rounded-full border transition-colors shrink-0"
        style={{
          background: leftFilled ? activeColor : 'transparent',
          borderColor: activeColor,
        }}
      />
      <span
        className="w-2 h-2 rounded-full border transition-colors shrink-0"
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
  /** Local clock for NOW / wake-around; ticks every minute while open. */
  const [clock, setClock] = useState(Date.now());
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

  useEffect(() => {
    if (!isOpen) return;
    setClock(Date.now());
    const id = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [isOpen]);

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

  const nowParts = formatClockParts(clock);
  const wakeParts = formatClockParts(clock + SLEEP_GOAL_HOURS * 3_600_000);

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
                className="relative mt-4 rounded-hero glass-strong px-4 pt-5 pb-5 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="absolute inset-0 rounded-hero overflow-hidden pointer-events-none"
                  aria-hidden
                >
                  <div
                    className="absolute -top-16 -right-10 w-40 h-40 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.38), transparent 70%)', filter: 'blur(24px)' }}
                  />
                </div>

                <div className="relative z-[1]">
                  {/* Character only — crop baked-in SLEEP GOAL / 8 hours out of the PNG */}
                  <div className="relative flex w-full items-center justify-center py-1">
                    <div
                      className="absolute left-1/2 top-[42%] h-28 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(255,178,122,0.5) 0%, rgba(255,122,69,0.2) 42%, transparent 70%)',
                      }}
                      aria-hidden
                    />
                    <div
                      className="relative z-[1] overflow-hidden mx-auto"
                      style={{ width: 'min(100%, 195px)', height: 118 }}
                    >
                      <img
                        src="/images/sleeping-fireguy.png?v=5"
                        alt=""
                        width={390}
                        height={370}
                        className="absolute left-0 top-0 w-full h-auto pointer-events-none select-none mix-blend-multiply"
                        draggable={false}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {goalReached ? (
                      <motion.div
                        key="goal-reached"
                        className="mt-1"
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
                        className="mt-1 px-1"
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
                    ) : (
                      <motion.div
                        key="sleep-goal"
                        className="mt-1"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-ink-300">
                          Sleep goal
                        </p>
                        <p className="mt-1 font-display font-bold text-[2.15rem] leading-none tracking-tight text-lighthouse-600 dark:text-lighthouse-300">
                          {SLEEP_GOAL_HOURS} hours
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* NOW / recommended wake — equal columns, no arrow */}
                  <div className="mt-3.5 pt-3.5 pb-1 border-t border-ink-100/80 dark:border-white/10 flex items-start">
                    <div className="flex-1 min-w-0 flex flex-col items-center px-1">
                      <Moon size={15} className="text-[#8B7EF6]" strokeWidth={2.25} aria-hidden />
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                        Now
                      </p>
                      <p className="mt-1.5 font-display font-bold text-[1.15rem] leading-none tracking-tight text-ink-900 dark:text-ink-100 tabular-nums">
                        {nowParts.time}
                        {nowParts.period ? (
                          <span className="ml-1 text-[0.65em] font-semibold tracking-normal">
                            {nowParts.period}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col items-center px-1">
                      <Sun size={15} className="text-[#FFB547]" strokeWidth={2.25} aria-hidden />
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-ink-300 leading-none">
                        Wake up around
                      </p>
                      <p className="mt-1.5 font-display font-bold text-[1.3rem] leading-none tracking-tight text-lighthouse-600 dark:text-lighthouse-300 tabular-nums">
                        {wakeParts.time}
                        {wakeParts.period ? (
                          <span className="ml-1 text-[0.6em] font-semibold tracking-normal text-ink-900 dark:text-ink-100">
                            {wakeParts.period}
                          </span>
                        ) : null}
                      </p>
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

              {/* Bedtime / Wake — primary left-aligned & vertically centered; secondary centered */}
              <div className="mt-3.5 flex gap-2.5 items-stretch min-h-[5.5rem]">
                <motion.button
                  type="button"
                  layout
                  transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={handleBedtimeTap}
                  disabled={sleeping}
                  className={`relative overflow-hidden rounded-hero text-left ${
                    sleeping
                      ? 'w-[28%] glass opacity-60'
                      : 'flex-1 glass-tint-warm'
                  }`}
                  whileTap={sleeping ? undefined : { scale: 0.98 }}
                >
                  <div
                    className={`relative h-full box-border flex ${
                      sleeping
                        ? 'flex-col items-center justify-center px-2.5 py-3'
                        : 'flex-col items-start px-3.5 py-[7px]'
                    }`}
                  >
                    {sleeping ? (
                      <>
                        <div className="rounded-full flex items-center justify-center shrink-0 w-8 h-8 bg-ink-100 dark:bg-night-700">
                          <Moon size={14} className="text-ink-600 dark:text-ink-300" />
                        </div>
                        <p className="mt-1 text-[10px] font-bold text-center text-ink-600 dark:text-ink-300 leading-tight">
                          Bedtime
                        </p>
                      </>
                    ) : (
                      <div className="my-auto flex flex-col items-start min-w-0 w-full">
                        <div className="rounded-full flex items-center justify-center shrink-0 w-9 h-9 hero-glow shadow-soft">
                          <Moon size={16} className="text-white" />
                        </div>
                        <p className="mt-0.5 font-display font-bold text-[13px] leading-none text-ink-900 dark:text-ink-100">
                          Start Bedtime
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-600 dark:text-ink-300 leading-none">
                          {bedTap === 1 ? 'Tap again to confirm' : 'Double-tap to confirm'}
                        </p>
                        <ConfirmDots taps={bedTap} activeColor="#FF7A45" className="mt-0.5" />
                      </div>
                    )}
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  layout
                  transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={handleWakeTap}
                  disabled={!sleeping}
                  className={`relative overflow-hidden rounded-hero ${
                    !sleeping
                      ? 'w-[28%] glass opacity-60 text-center'
                      : 'flex-1 glass-strong text-left'
                  }`}
                  style={
                    sleeping
                      ? { boxShadow: 'inset 0 0 0 2px rgba(255,181,71,0.55)' }
                      : undefined
                  }
                  whileTap={sleeping ? { scale: 0.98 } : undefined}
                >
                  <div
                    className={`relative h-full box-border flex ${
                      !sleeping
                        ? 'flex-col items-center justify-center px-2.5 py-3'
                        : 'flex-col items-start justify-center px-3.5 py-3.5'
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
                          {wakeTap === 1 ? 'Tap again to confirm' : 'Double-tap to confirm'}
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
