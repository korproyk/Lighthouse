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

export default function SleepRecording({ isOpen, onClose, onCompleted }: SleepRecordingProps) {
  const {
    user,
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
              {/* Header — same language as other Lighthouse screens */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
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
                Double-tap bedtime when you put the phone down. Double-tap wakeup when you get up. Hi, {user.name || 'there'}.
              </p>

              {/* Timer card */}
              <motion.div
                className="relative mt-5 overflow-hidden rounded-hero glass-strong p-6 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.5), transparent 70%)', filter: 'blur(28px)' }}
                />
                <div
                  className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.28), transparent 70%)', filter: 'blur(28px)' }}
                />
                <p className="relative text-micro uppercase tracking-[0.16em] font-bold text-ink-300 mb-2">
                  {sleeping ? 'Sleeping' : 'Ready'}
                </p>
                <p className="relative font-display font-bold text-[2.75rem] leading-none tracking-tight text-ink-900 dark:text-ink-100 tabular-nums">
                  {formatElapsed(elapsedMs)}
                </p>
                <p className="relative mt-2 text-caption text-ink-300">
                  Goal {SLEEP_GOAL_HOURS}h
                </p>
              </motion.div>

              {/* Bedtime / Wake */}
              <div className="mt-4 flex gap-3 items-stretch min-h-[11rem]">
                <motion.button
                  type="button"
                  onClick={handleBedtimeTap}
                  disabled={sleeping}
                  className={`relative overflow-hidden rounded-hero text-left ${
                    sleeping ? 'w-[32%] glass opacity-60' : 'flex-1 glass-tint-warm'
                  }`}
                  whileTap={sleeping ? undefined : { scale: 0.98 }}
                >
                  <div className={`relative h-full p-4 flex flex-col ${sleeping ? 'items-center justify-center' : ''}`}>
                    <div className={`rounded-full flex items-center justify-center ${
                      sleeping ? 'w-9 h-9 bg-ink-100 dark:bg-night-700' : 'w-11 h-11 hero-glow shadow-soft'
                    }`}>
                      <Moon size={sleeping ? 16 : 20} className={sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'} />
                    </div>
                    <p className={`font-display font-bold text-ink-900 dark:text-ink-100 ${
                      sleeping ? 'text-[11px] text-center mt-2' : 'text-title mt-3'
                    }`}>
                      Start Bedtime
                    </p>
                    {!sleeping && (
                      <>
                        <div className="mt-3 flex gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${bedTap >= 1 ? 'hero-glow' : 'bg-ink-200 dark:bg-night-500'}`} />
                          <span className={`w-2 h-2 rounded-full border-2 ${
                            bedTap >= 2 ? 'border-lighthouse-500 bg-lighthouse-500' : 'border-lighthouse-400'
                          }`} />
                        </div>
                        <p className="mt-auto pt-3 text-[11px] text-ink-300">
                          {bedTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                      </>
                    )}
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleWakeTap}
                  disabled={!sleeping}
                  className={`relative overflow-hidden rounded-hero text-left ${
                    !sleeping ? 'w-[32%] glass opacity-60' : 'flex-1 glass-strong'
                  }`}
                  style={
                    sleeping
                      ? { boxShadow: 'inset 0 0 0 2px rgba(255,181,71,0.55)' }
                      : undefined
                  }
                  whileTap={!sleeping ? undefined : { scale: 0.98 }}
                >
                  <div className={`relative h-full p-4 flex flex-col ${!sleeping ? 'items-center justify-center' : ''}`}>
                    <div className={`rounded-full flex items-center justify-center ${
                      !sleeping
                        ? 'w-9 h-9 bg-ink-100 dark:bg-night-700'
                        : 'w-11 h-11 bg-[#FFB547] shadow-soft'
                    }`}>
                      <Sun size={!sleeping ? 16 : 20} className={!sleeping ? 'text-ink-600 dark:text-ink-300' : 'text-white'} />
                    </div>
                    <p className={`font-display font-bold ${
                      !sleeping
                        ? 'text-[11px] text-center mt-2 text-ink-600 dark:text-ink-300'
                        : 'text-title mt-3 text-ink-900 dark:text-ink-100'
                    }`}>
                      Are U Awoke?
                    </p>
                    {sleeping && (
                      <>
                        <div className="mt-3 flex gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${wakeTap >= 1 ? 'bg-[#FFB547]' : 'bg-ink-200 dark:bg-night-500'}`} />
                          <span className={`w-2 h-2 rounded-full border-2 ${
                            wakeTap >= 2 ? 'border-[#FFB547] bg-[#FFB547]' : 'border-[#FFB547]'
                          }`} />
                        </div>
                        <p className="mt-auto pt-3 text-[11px] text-ink-300">
                          {wakeTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* −20 min */}
              <button
                type="button"
                className="mt-4 flex items-center gap-3 p-3.5 rounded-card glass text-left"
                onClick={() => setMinus20((v) => !v)}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    minus20 ? 'hero-glow' : 'bg-ink-100 dark:bg-night-700'
                  }`}
                >
                  {minus20 && <Check size={13} className="text-white" strokeWidth={3} />}
                </span>
                <span className="text-caption font-semibold text-ink-900 dark:text-ink-100 leading-snug">
                  Minus 20 minutes for a more accurate result
                </span>
              </button>

              <div className="mt-4 mb-6 p-4 rounded-card glass text-[11px] text-ink-300 leading-relaxed">
                {sleeping && sleepSession ? (
                  <p>
                    Bedtime started: {formatStamp(sleepSession.startedAt)}. Keeps running while locked. Press wakeup when you are done.
                  </p>
                ) : lastSleep ? (
                  <p>
                    Recent sleep: {formatElapsed(lastSleep.hours * 3_600_000)} · recorded {formatStamp(lastSleep.endedAt)}
                  </p>
                ) : (
                  <p>Recent sleep: 00:00:00 — no night recorded yet.</p>
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
