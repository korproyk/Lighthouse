import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, X, Check } from 'lucide-react';
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

  // Reset double-tap state whenever the page opens or sleep state flips
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
        colors: ['#FFB547', '#FF6B7A', '#34D399', '#A78BFA'],
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
          className="fixed inset-0 z-[60] flex items-stretch justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Night sky — warm Lighthouse coral night, not purple */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, #3A2A3A 0%, #1A1520 45%, #0E0C12 100%)',
            }}
          />
          <div className="sleep-stars absolute inset-0 pointer-events-none" aria-hidden />
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,122,69,0.22), transparent 68%)',
              filter: 'blur(40px)',
            }}
          />

          <motion.div
            className="relative w-full max-w-[430px] mx-auto h-full flex flex-col px-5 pb-6"
            style={{ paddingTop: 'calc(14px + env(safe-area-inset-top))' }}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-capsule text-caption font-semibold text-white/85 border border-white/25 bg-white/5">
                {user.name || 'Guest'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-caption font-semibold text-white/70 hover:text-white transition-colors"
                aria-label="Close sleep recording"
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col rounded-[28px] border border-white/12 bg-black/35 backdrop-blur-xl px-5 pt-6 pb-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] overflow-y-auto">
              <h1 className="font-display font-bold text-[1.65rem] text-white tracking-tight">
                Sleep Data Collection
              </h1>
              <p className="mt-1.5 text-caption text-white/55 leading-relaxed">
                Use bedtime / wakeup below. Both stay available. The timer keeps running if you lock the phone.
              </p>

              <p className="mt-7 text-center font-display font-bold text-[2.75rem] leading-none tracking-tight text-white tabular-nums">
                {formatElapsed(elapsedMs)}
              </p>

              {/* Action cards */}
              <div className="mt-6 flex gap-3 items-stretch min-h-[11.5rem]">
                {/* Bedtime */}
                <motion.button
                  type="button"
                  onClick={handleBedtimeTap}
                  disabled={sleeping}
                  className={`relative overflow-hidden rounded-[22px] text-left transition-opacity ${
                    sleeping
                      ? 'w-[30%] opacity-45 border border-white/15 bg-white/5'
                      : 'flex-1 border border-lighthouse-500/40'
                  }`}
                  style={
                    sleeping
                      ? undefined
                      : {
                          background:
                            'linear-gradient(160deg, rgba(255,122,69,0.45) 0%, rgba(255,77,106,0.28) 100%)',
                        }
                  }
                  whileTap={sleeping ? undefined : { scale: 0.98 }}
                >
                  <div className={`p-4 h-full flex flex-col ${sleeping ? 'items-center justify-center gap-2' : ''}`}>
                    <Moon
                      size={sleeping ? 22 : 34}
                      className={sleeping ? 'text-white/70' : 'text-lighthouse-300'}
                      fill={sleeping ? 'none' : 'currentColor'}
                    />
                    <p className={`font-display font-bold text-white ${sleeping ? 'text-[11px] text-center mt-1' : 'text-title mt-3'}`}>
                      Start Bedtime
                    </p>
                    {!sleeping && (
                      <>
                        <div className="mt-3 flex gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${bedTap >= 1 ? 'bg-lighthouse-300' : 'bg-white/25'}`} />
                          <span className={`w-2 h-2 rounded-full border ${bedTap >= 2 ? 'bg-lighthouse-300 border-lighthouse-300' : 'border-lighthouse-300/70'}`} />
                        </div>
                        <p className="mt-auto pt-4 text-[11px] text-white/55">
                          {bedTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Wake */}
                <motion.button
                  type="button"
                  onClick={handleWakeTap}
                  disabled={!sleeping}
                  className={`relative overflow-hidden rounded-[22px] text-left transition-opacity ${
                    !sleeping
                      ? 'w-[30%] opacity-45 border border-white/15 bg-white/5'
                      : 'flex-1 border border-[#FFB547]/55 bg-[#FFB547]/12'
                  }`}
                  whileTap={!sleeping ? undefined : { scale: 0.98 }}
                >
                  <div className={`p-4 h-full flex flex-col ${!sleeping ? 'items-center justify-center gap-2' : ''}`}>
                    <Sun
                      size={!sleeping ? 22 : 34}
                      className={!sleeping ? 'text-[#FFB547]/70' : 'text-[#FFB547]'}
                      fill={!sleeping ? 'none' : 'currentColor'}
                    />
                    <p className={`font-display font-bold ${!sleeping ? 'text-[11px] text-center mt-1 text-white/70' : 'text-title mt-3 text-white'}`}>
                      Are U Awoke?
                    </p>
                    {sleeping && (
                      <>
                        <div className="mt-3 flex gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${wakeTap >= 1 ? 'bg-[#FFB547]' : 'bg-white/25'}`} />
                          <span className={`w-2 h-2 rounded-full border ${wakeTap >= 2 ? 'bg-[#FFB547] border-[#FFB547]' : 'border-[#FFB547]/70'}`} />
                        </div>
                        <p className="mt-auto pt-4 text-[11px] text-white/55">
                          {wakeTap === 1 ? 'Tap again to confirm' : 'Click twice to confirm'}
                        </p>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Minus 20 */}
              <button
                type="button"
                className="mt-5 flex items-start gap-2.5 text-left"
                onClick={() => setMinus20((v) => !v)}
              >
                <span
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    minus20 ? 'bg-mint-500' : 'border border-white/35'
                  }`}
                >
                  {minus20 && <Check size={12} className="text-white" strokeWidth={3} />}
                </span>
                <span className="text-caption text-white/85 leading-snug">
                  minus 20 minutes for more accurate result?
                </span>
              </button>

              <p className="mt-4 text-[11px] text-white/45 leading-relaxed">
                During your first week, feedback may be less accurate because baseline data is still being collected.
              </p>

              <div className="mt-auto pt-5 text-[11px] text-white/50 leading-relaxed">
                {sleeping && sleepSession ? (
                  <p>
                    Bedtime started: {formatStamp(sleepSession.startedAt)} · Keeps running while locked or after you turn the device off. Press wakeup when you are done.
                  </p>
                ) : lastSleep ? (
                  <p>
                    Recent sleep: {formatElapsed(lastSleep.hours * 3_600_000)} (recorded at {formatStamp(lastSleep.endedAt)})
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
