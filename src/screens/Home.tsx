import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame, Battery, Moon, Smartphone, TrendingUp, Sparkles,
  ArrowRight, ClipboardCheck, FlaskConical, Check, Camera, ImagePlus, X, Target,
  Lock, ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import ScoreRing from '../components/ScoreRing';
import DailyCheckIn from '../components/DailyCheckIn';
import CheckInSavedPopup from '../components/CheckInSavedPopup';
import WeeklyInsights from '../components/WeeklyInsights';
import BottomSheet from '../components/BottomSheet';
import Lumi from '../components/Lumi';
import { canUnlockWeeklyInsights } from '../lib/lifeBalance';
import {
  buildCurrentWeekProgress,
  localDateKey,
  WEEKDAY_LABELS,
} from '../lib/dates';
import { compressProofPhoto } from '../lib/proofPhoto';

const moodEmojis = ['\u{1F614}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}'];
const moodLabels = ['Sad', 'Meh', 'Okay', 'Good', 'Great'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.greeting.morning');
  if (h < 18) return t('home.greeting.afternoon');
  return t('home.greeting.evening');
}

function todayKey(): string {
  return localDateKey();
}

export default function Home() {
  const {
    user,
    checkIns,
    dailyTip,
    weeklyInsight,
    personalChallenge,
    ensureWeeklyInsight,
    ensurePersonalChallenge,
    completePersonalChallenge,
    hasAccount,
  } = useStore();

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [savedToastOpen, setSavedToastOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  // DEV-ONLY Demo Weekly Insights — remove with src/dev/demoWeeklyInsights.ts
  const [demoWeeklyOpen, setDemoWeeklyOpen] = useState(false);
  const [demoWeekly, setDemoWeekly] = useState<{
    checkIns: import('../lib/mockData').CheckIn[];
    insight: import('../lib/lifeBalance').WeeklyInsight;
  } | null>(null);
  const [balanceTipOpen, setBalanceTipOpen] = useState(false);
  const [tipDetailOpen, setTipDetailOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const balanceTipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWeekly = useRef(false);

  useEffect(() => {
    ensureWeeklyInsight();
    ensurePersonalChallenge();
  }, [ensureWeeklyInsight, ensurePersonalChallenge, checkIns]);

  useEffect(() => {
    return () => {
      if (balanceTipTimer.current) clearTimeout(balanceTipTimer.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  const showBalanceTip = () => {
    setBalanceTipOpen(true);
    if (balanceTipTimer.current) clearTimeout(balanceTipTimer.current);
    balanceTipTimer.current = setTimeout(() => setBalanceTipOpen(false), 3500);
  };

  const today = todayKey();
  const todayCheckIn = checkIns.find((c) => c.date === today);
  const checkedInToday = Boolean(todayCheckIn?.completed);
  const todayChallenge =
    personalChallenge?.date === today ? personalChallenge : null;

  const lifeScore = checkedInToday ? todayCheckIn!.score : 0;

  const tip =
    (checkedInToday
      ? dailyTip ?? todayCheckIn?.tip
      : 'Check in once a day — mood, sleep, screen, and social battery become your Life Balance score.') ??
    null;

  const weekSlots = buildCurrentWeekProgress(checkIns, user.memberSince);
  const maxWeekScore = Math.max(
    ...weekSlots.filter((s) => s.state === 'completed').map((s) => s.score),
    1
  );
  const todayWeekdayIndex = weekSlots.findIndex((s) => s.isToday);

  const weeklyUnlocked = canUnlockWeeklyInsights(checkIns);
  const isAuthenticated = hasAccount(user.name);

  const screenTimeColor =
    checkedInToday && todayCheckIn && todayCheckIn.screenTime <= 3
      ? 'text-mint-500'
      : checkedInToday && todayCheckIn && todayCheckIn.screenTime <= 5
        ? 'text-lighthouse-500'
        : 'text-coral-500';

  const closeChallengeSheet = () => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    setChallengeOpen(false);
    setShowComplete(false);
    setProofPreview(null);
    setProofError(null);
    setProofBusy(false);
  };

  const handleProofPicked = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProofError('Please choose a photo.');
      return;
    }
    setProofBusy(true);
    setProofError(null);
    try {
      const dataUrl = await compressProofPhoto(file);
      setProofPreview(dataUrl);
    } catch {
      setProofError('Could not read that photo. Try another.');
    } finally {
      setProofBusy(false);
      if (proofInputRef.current) proofInputRef.current.value = '';
    }
  };

  const handleCompletePersonal = () => {
    if (!proofPreview || !todayChallenge || todayChallenge.completed) {
      setProofError('Add a photo to prove you did it.');
      return;
    }
    const ok = completePersonalChallenge(proofPreview);
    if (!ok) {
      setProofError('Could not save this challenge.');
      return;
    }
    confetti({
      particleCount: 70,
      spread: 65,
      origin: { y: 0.55 },
      colors: ['#FFB547', '#FF6B7A', '#34D399', '#FFB27A'],
    });
    setShowComplete(true);
    completeTimeoutRef.current = setTimeout(() => {
      closeChallengeSheet();
    }, 1800);
  };

  const lifeBalanceCard = (
    <motion.div
      className="relative rounded-hero glass-strong p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 rounded-hero overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(30px)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.35), transparent 70%)', filter: 'blur(30px)' }}
        />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-lighthouse-300/30 blur-2xl scale-110 pointer-events-none" />
          <button
            type="button"
            className="relative focus-ring rounded-full"
            onClick={showBalanceTip}
            aria-label="What is Life Balance?"
          >
            <ScoreRing score={lifeScore} size={140} />
          </button>

          <AnimatePresence>
            {balanceTipOpen && (
              <motion.div
                className="absolute left-1/2 top-[calc(100%+10px)] z-20 w-56 -translate-x-1/2 pointer-events-none"
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                role="tooltip"
              >
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-night-800 border-l border-t border-black/10 dark:border-white/10"
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-white dark:bg-night-800 px-3.5 py-3 shadow-[0_10px_28px_rgba(14,11,8,0.18)] border border-black/10 dark:border-white/10">
                  <p className="font-display font-bold text-caption text-ink-900 dark:text-ink-100">
                    Life Balance
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-600 dark:text-ink-300">
                    Built from today&apos;s four check-in signals — not a mystery number.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <TrendingUp size={16} className="text-mint-500 shrink-0" strokeWidth={2.5} />
                <span className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                  {user.weeklyChange >= 0 ? '+' : ''}{user.weeklyChange}
                </span>
              </div>
              <p className="mt-0.5 text-caption text-ink-600 dark:text-ink-300">
                achieved!
              </p>
            </div>

            <motion.img
              src="/images/character-2.png"
              alt=""
              draggable={false}
              className="w-[58px] h-auto object-contain shrink-0 -mr-0.5 drop-shadow-[0_6px_14px_rgba(255,138,61,0.35)]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: [0, -3, 0] }}
              transition={{
                opacity: { duration: 0.35 },
                y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          </div>

          <div className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1 rounded-capsule bg-coral-500/10 border border-coral-500/20 whitespace-nowrap">
            <Flame size={12} className="text-coral-500 shrink-0" fill="currentColor" />
            <span className="text-caption font-bold text-coral-600 dark:text-coral-300 leading-none">
              {user.currentStreak}-day streak
            </span>
          </div>

          {checkedInToday && (
            <div className="mt-1 flex items-center justify-center gap-1">
              <span className="w-3 h-3 rounded-full border border-mint-500 flex items-center justify-center shrink-0">
                <Check size={7} className="text-mint-500" strokeWidth={3.5} />
              </span>
              <span className="text-micro text-ink-600 dark:text-ink-300 leading-none whitespace-nowrap">
                Updated today
              </span>
            </div>
          )}

          <div className="mt-2.5" role="list" aria-label="Weekly check-in progress">
            <div className="flex items-end gap-1.5 h-8">
              {weekSlots.map((slot, i) => {
                if (slot.state === 'before_start') {
                  return (
                    <div
                      key={slot.date}
                      role="listitem"
                      className="flex-1 h-full flex items-end justify-center pb-0.5"
                      title={slot.ariaLabel}
                      aria-label={slot.ariaLabel}
                    >
                      <span
                        className="text-[11px] leading-none text-ink-300/80 dark:text-ink-600 font-medium"
                        aria-hidden
                      >
                        –
                      </span>
                    </div>
                  );
                }

                const isTodayPending = slot.isToday && slot.state !== 'completed';
                const h =
                  slot.state === 'completed'
                    ? Math.max(28, (slot.score / maxWeekScore) * 78)
                    : 16;

                const background =
                  slot.state === 'completed'
                    ? 'linear-gradient(180deg, #34D399, #10B981)'
                    : slot.state === 'missed'
                      ? 'rgba(14,11,8,0.22)'
                      : 'rgba(14,11,8,0.08)';

                return (
                  <motion.div
                    key={slot.date}
                    role="listitem"
                    className={`flex-1 rounded-full ${
                      isTodayPending
                        ? 'ring-2 ring-lighthouse-500/80 shadow-[0_0_0_3px_rgba(255,178,122,0.35)]'
                        : ''
                    }`}
                    style={{ background }}
                    title={slot.ariaLabel}
                    aria-label={slot.ariaLabel}
                    initial={{ height: 6 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.12 + i * 0.04, type: 'spring', stiffness: 160, damping: 22 }}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex gap-1.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={`${weekSlots[i]?.date ?? label}-${i}`}
                  className={`flex-1 text-center text-micro font-normal tracking-normal leading-none ${
                    i === todayWeekdayIndex
                      ? 'text-lighthouse-500'
                      : weekSlots[i]?.state === 'before_start'
                        ? 'text-ink-300 dark:text-ink-600'
                        : 'text-ink-600 dark:text-ink-300'
                  }`}
                  aria-hidden
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {tip && (
        <motion.button
          type="button"
          className="relative mt-2.5 w-full text-left px-3.5 py-2.5 rounded-card bg-mint-500/10 border border-mint-500/20 focus-ring transition-colors hover:bg-mint-500/15 active:bg-mint-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTipDetailOpen(true)}
          aria-label="Open full tip"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <img
              src="/images/lumi.png"
              alt=""
              className="w-4 h-4 object-contain shrink-0"
              draggable={false}
            />
            <span className="text-micro uppercase tracking-[0.14em] font-bold text-mint-700 dark:text-mint-300">
              Tip
            </span>
            <ChevronRight
              size={14}
              className="ml-auto text-mint-700/70 dark:text-mint-300/70 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
          </div>
          <p className="text-caption text-ink-900 dark:text-ink-100 leading-snug font-medium whitespace-pre-line line-clamp-2">
            {tip}
          </p>
          {isAuthenticated && !weeklyUnlocked && (
            <>
              <div
                className="mt-2 mb-1.5 border-t border-ink-100/80 dark:border-white/10"
                aria-hidden
              />
              <div className="flex items-start gap-1 min-w-0">
                <Lock
                  size={10}
                  className="text-ink-600 dark:text-ink-300 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                  Complete 7 days of check-ins to unlock Weekly AI Insights.
                </span>
              </div>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      {/* Greeting */}
      <div
        className="relative px-6 pb-0"
        style={{ paddingTop: 'calc(10px + env(safe-area-inset-top))' }}
      >
        <div>
          <p
            className="uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-0.5 font-semibold leading-[1.3]"
            style={{ fontSize: 'calc(0.6875rem - 2pt)' }}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1
            className="font-display font-bold leading-[1.15] text-ink-900 dark:text-ink-100 tracking-tight break-words"
            style={{ fontSize: 'calc(1.5rem - 2pt)' }}
          >
            {getGreeting()},{' '}
            <span className="text-gradient-ember">{user.name}</span>
          </h1>
        </div>
      </div>

      {/* Before check-in: CTA. After: Life Balance rises into this space. */}
      {!checkedInToday ? (
        <div className="px-6 mt-3">
          <motion.button
            type="button"
            className="relative w-full overflow-hidden px-4 py-3.5 rounded-hero hero-glow text-left shadow-medium shine"
            whileTap={{ scale: 0.98 }}
            onClick={() => setCheckInOpen(true)}
          >
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.28), transparent 70%)', filter: 'blur(20px)' }}
            />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                <ClipboardCheck size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-title text-white leading-none">
                    Daily check-in
                  </p>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-capsule bg-white/25 text-[11px] font-semibold text-white leading-none whitespace-nowrap">
                    ~30 sec
                  </span>
                </div>
                <p className="text-[11px] text-white/90 mt-1.5 tracking-wide whitespace-nowrap">
                  Mood <span className="opacity-50">|</span> Sleep{' '}
                  <span className="opacity-50">|</span> Screen time{' '}
                  <span className="opacity-50">|</span> Social battery
                </p>
              </div>
              <ArrowRight size={18} className="text-white shrink-0" strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>
      ) : null}

      <div className="px-6 mt-3">
        {lifeBalanceCard}
      </div>

      {/* Personal challenge — only after today’s check-in */}
      {checkedInToday && todayChallenge && (
        <div className="px-6 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target size={15} className="text-lighthouse-600" strokeWidth={2.5} />
              <h2 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
                Today&apos;s Challenge
              </h2>
            </div>
            <span className="text-caption font-bold text-lighthouse-600">
              +{todayChallenge.points} XP
            </span>
          </div>

          <motion.button
            type="button"
            className={`relative w-full overflow-hidden rounded-hero text-left shadow-medium ${
              todayChallenge.completed ? 'glass-tint-warm' : 'hero-glow shine'
            }`}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (todayChallenge.completed) return;
              setChallengeOpen(true);
            }}
          >
            {!todayChallenge.completed && (
              <div
                className="absolute -top-14 -right-10 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.28), transparent 70%)', filter: 'blur(22px)' }}
              />
            )}
            <div className="relative p-4 flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                  todayChallenge.completed
                    ? 'bg-mint-500 shadow-soft'
                    : 'bg-white/25'
                }`}
              >
                {todayChallenge.completed ? (
                  <Check size={20} className="text-white" strokeWidth={3} />
                ) : (
                  <Sparkles size={18} className="text-white" strokeWidth={2.4} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-display font-bold text-title leading-tight ${
                    todayChallenge.completed
                      ? 'text-ink-900 dark:text-ink-100'
                      : 'text-white'
                  }`}
                >
                  {todayChallenge.title}
                </p>
                <p
                  className={`mt-1 text-caption leading-snug line-clamp-2 ${
                    todayChallenge.completed
                      ? 'text-ink-600 dark:text-ink-300'
                      : 'text-white/90'
                  }`}
                >
                  {todayChallenge.description}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-capsule text-[10px] font-bold capitalize ${
                        todayChallenge.completed
                          ? 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {todayChallenge.difficulty}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-capsule text-[10px] font-bold ${
                        todayChallenge.completed
                          ? 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {todayChallenge.timeEstimate}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold shrink-0 ${
                      todayChallenge.completed
                        ? 'text-mint-600 dark:text-mint-300'
                        : 'text-white'
                    }`}
                  >
                    {todayChallenge.completed ? 'Done' : 'Tap to start'}
                  </span>
                </div>
              </div>
              {!todayChallenge.completed && (
                <ArrowRight size={18} className="text-white shrink-0 mt-1" strokeWidth={2.5} />
              )}
            </div>
          </motion.button>
        </div>
      )}

      {/* Today's four signals */}
      <div className="px-6 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
            Today&apos;s signals
          </h2>
          {!checkedInToday && (
            <button
              type="button"
              className="text-micro uppercase tracking-[0.14em] text-lighthouse-600 font-bold"
              onClick={() => setCheckInOpen(true)}
            >
              Record
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SignalTile
            icon={<Battery size={16} className="text-mint-600 dark:text-mint-300" strokeWidth={2.25} />}
            iconTone="bg-mint-500/12"
            label={t('home.social_battery')}
            value={checkedInToday && todayCheckIn ? `${todayCheckIn.socialBattery}%` : ''}
            muted={!checkedInToday}
            onClick={() => !checkedInToday && setCheckInOpen(true)}
          />
          <SignalTile
            icon={<Moon size={16} className="text-coral-500" strokeWidth={2.25} />}
            iconTone="bg-coral-500/12"
            label={t('home.sleep')}
            value={checkedInToday && todayCheckIn ? `${todayCheckIn.sleep}h` : ''}
            muted={!checkedInToday}
            onClick={() => !checkedInToday && setCheckInOpen(true)}
          />
          <SignalTile
            icon={<Smartphone size={16} className={checkedInToday ? screenTimeColor : 'text-[#8B6CF0]'} strokeWidth={2.25} />}
            iconTone="bg-[#A78BFA]/15"
            label={t('home.screen_time')}
            value={checkedInToday && todayCheckIn ? `${todayCheckIn.screenTime}h` : ''}
            valueClass={checkedInToday ? screenTimeColor : undefined}
            muted={!checkedInToday}
            onClick={() => !checkedInToday && setCheckInOpen(true)}
          />
          <SignalTile
            icon={<span className="text-sm leading-none">{moodEmojis[checkedInToday && todayCheckIn ? todayCheckIn.mood : 2]}</span>}
            iconTone="bg-lighthouse-500/15"
            label={t('home.mood')}
            value={
              checkedInToday && todayCheckIn
                ? moodLabels[todayCheckIn.mood] ?? ''
                : ''
            }
            muted={!checkedInToday}
            onClick={() => !checkedInToday && setCheckInOpen(true)}
          />
        </div>
      </div>

      {weeklyUnlocked && weeklyInsight && (
        <div className="px-6 mt-5">
          <motion.button
            type="button"
            className="relative w-full overflow-hidden p-4 rounded-hero glass-strong text-left"
            whileTap={{ scale: 0.98 }}
            onClick={() => setWeeklyOpen(true)}
          >
            <div
              className="absolute -top-14 -right-14 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)', filter: 'blur(24px)' }}
            />
            <div className="relative flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-soft shrink-0"
                style={{ background: 'linear-gradient(135deg, #A78BFA, #FF6B7A)' }}
              >
                <FlaskConical size={18} className="text-white" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
                  Weekly Insights
                </p>
                <p className="mt-0.5 font-display font-bold text-title text-ink-900 dark:text-ink-100">
                  {weeklyInsight.experiment.title}
                </p>
                <p className="mt-1 text-caption text-ink-600 dark:text-ink-300 line-clamp-2">
                  {weeklyInsight.summary}
                </p>
              </div>
              <ArrowRight size={18} className="text-ink-600 dark:text-ink-300 shrink-0 mt-1" strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>
      )}

      {/* DEV-ONLY: Demo Weekly Insights — delete this block + src/dev/demoWeeklyInsights.ts before production */}
      {import.meta.env.DEV && (
        <div className="px-6 mt-3">
          <button
            type="button"
            className="w-full px-3 py-2.5 rounded-card border border-dashed border-lighthouse-500/50 text-left"
            onClick={() => {
              void import('../dev/demoWeeklyInsights').then((mod) => {
                setDemoWeekly(mod.buildDemoWeeklyInsight());
                setDemoWeeklyOpen(true);
              });
            }}
          >
            <p className="text-micro uppercase tracking-[0.14em] font-bold text-lighthouse-600">
              Generate Demo Weekly Insights
            </p>
            <p className="mt-0.5 text-caption text-ink-600 dark:text-ink-300">
              Instant 7-day sample preview · never saved to your account
            </p>
          </button>
        </div>
      )}

      <div className="px-6 mt-5 mb-2">
        <div className="px-3 py-2.5 rounded-card glass flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full hero-glow flex items-center justify-center shadow-soft shrink-0">
            <Sparkles size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="text-[11px] leading-snug text-ink-900 dark:text-ink-100 font-medium">
            Find <span className="font-display font-bold">Lumi</span> in the center tab whenever you need a gentle hand.
          </p>
        </div>
      </div>

      <div className="h-6" />

      <DailyCheckIn
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onFinished={(out) => {
          setSavedToastOpen(true);
          if (out.weeklyReady) {
            pendingWeekly.current = true;
            ensureWeeklyInsight();
          }
        }}
      />
      <CheckInSavedPopup
        isOpen={savedToastOpen}
        onClose={() => {
          setSavedToastOpen(false);
          if (pendingWeekly.current) {
            pendingWeekly.current = false;
            setWeeklyOpen(true);
          }
        }}
      />
      <WeeklyInsights
        isOpen={weeklyOpen}
        onClose={() => setWeeklyOpen(false)}
        insight={weeklyInsight}
      />
      {/* DEV-ONLY Demo Weekly Insights sheet — remove with demoWeeklyInsights.ts */}
      {import.meta.env.DEV && (
        <WeeklyInsights
          isOpen={demoWeeklyOpen}
          onClose={() => setDemoWeeklyOpen(false)}
          insight={demoWeekly?.insight ?? null}
          checkInsOverride={demoWeekly?.checkIns}
          isDemo
        />
      )}

      <BottomSheet
        isOpen={tipDetailOpen && Boolean(tip)}
        onClose={() => setTipDetailOpen(false)}
        title="Tip"
        snapPoints={[0.42, 0.72]}
      >
        {tip && (
          <p className="text-body text-ink-900 dark:text-ink-100 leading-relaxed font-medium whitespace-pre-line selectable pb-2">
            {tip}
          </p>
        )}
      </BottomSheet>

      <BottomSheet
        isOpen={challengeOpen && Boolean(todayChallenge) && !todayChallenge?.completed}
        onClose={closeChallengeSheet}
        title={todayChallenge?.title}
      >
        {todayChallenge && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-micro uppercase tracking-wider font-bold ${
                  todayChallenge.difficulty === 'easy'
                    ? 'text-mint-500'
                    : todayChallenge.difficulty === 'medium'
                      ? 'text-lighthouse-500'
                      : 'text-coral-500'
                }`}
              >
                {todayChallenge.difficulty}
              </span>
              <span className="text-caption text-ink-300">{todayChallenge.timeEstimate}</span>
              <span className="text-caption text-lighthouse-500 font-bold">
                +{todayChallenge.points} XP
              </span>
            </div>
            <p className="text-body text-ink-600 dark:text-ink-300 selectable">
              {todayChallenge.instructions}
            </p>

            <input
              ref={proofInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProofPicked(e.target.files?.[0] ?? null)}
            />

            <AnimatePresence mode="wait">
              {showComplete ? (
                <motion.div
                  key="done"
                  className="text-center py-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Lumi pose="cheering" size={80} />
                  <p className="mt-3 font-display font-bold text-title text-mint-700 dark:text-mint-300">
                    Amazing work! {'\u{1F31F}'}
                  </p>
                  <p className="mt-1 font-display font-bold text-body text-lighthouse-600">
                    +{todayChallenge.points} XP
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="proof"
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div>
                    <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300 mb-2">
                      Proof photo
                    </p>
                    {proofPreview ? (
                      <div className="relative overflow-hidden rounded-hero">
                        <img
                          src={proofPreview}
                          alt="Challenge proof"
                          className="w-full max-h-56 object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center"
                          onClick={() => setProofPreview(null)}
                          aria-label="Remove photo"
                        >
                          <X size={16} className="text-ink-900 dark:text-ink-100" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full p-5 rounded-hero glass border border-dashed border-ink-200 dark:border-night-500 text-center"
                        onClick={() => proofInputRef.current?.click()}
                        disabled={proofBusy}
                      >
                        <div className="mx-auto w-11 h-11 rounded-full hero-glow shadow-soft flex items-center justify-center mb-2">
                          {proofBusy ? (
                            <Camera size={18} className="text-white animate-pulse" />
                          ) : (
                            <ImagePlus size={18} className="text-white" />
                          )}
                        </div>
                        <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                          {proofBusy ? 'Preparing photo…' : 'Add a photo'}
                        </p>
                        <p className="mt-1 text-caption text-ink-300">
                          Snap or pick a pic that shows you did this.
                        </p>
                      </button>
                    )}
                    {proofError && (
                      <p className="mt-2 text-caption text-coral-500 font-semibold">{proofError}</p>
                    )}
                  </div>

                  <motion.button
                    className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
                      proofPreview
                        ? 'hero-glow text-white'
                        : 'glass text-ink-300 cursor-not-allowed'
                    }`}
                    whileTap={proofPreview ? { scale: 0.97 } : undefined}
                    disabled={!proofPreview || proofBusy}
                    onClick={handleCompletePersonal}
                  >
                    Done! {'\u2728'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function SignalTile({
  icon,
  iconTone,
  label,
  value,
  valueClass,
  muted,
  onClick,
}: {
  icon: ReactNode;
  iconTone: string;
  label: string;
  value: string;
  valueClass?: string;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      className="flex items-center gap-3 px-3.5 py-3.5 rounded-[22px] glass shadow-soft text-left"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full ${iconTone} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-ink-600 dark:text-ink-300 leading-tight">
          {label}
        </p>
        {value ? (
          <p
            className={`font-display font-bold mt-0.5 truncate ${
              muted
                ? 'text-caption text-ink-300'
                : `text-body text-ink-900 dark:text-ink-100 ${valueClass ?? ''}`
            }`}
          >
            {value}
          </p>
        ) : null}
      </div>
      {muted && (
        <ArrowRight size={16} className="text-ink-300 shrink-0" strokeWidth={2.25} />
      )}
    </motion.button>
  );
}
