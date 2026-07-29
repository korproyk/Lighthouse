import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame, Battery, Moon, Smartphone, TrendingUp, Sparkles,
  ArrowRight, ClipboardCheck, FlaskConical,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import ScoreRing from '../components/ScoreRing';
import DailyCheckIn from '../components/DailyCheckIn';
import WeeklyInsights from '../components/WeeklyInsights';
import { canUnlockWeeklyInsights } from '../lib/lifeBalance';

const moodEmojis = ['\u{1F614}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}'];
const moodLabels = ['Sad', 'Meh', 'Okay', 'Good', 'Great'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.greeting.morning');
  if (h < 18) return t('home.greeting.afternoon');
  return t('home.greeting.evening');
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export default function Home() {
  const {
    user,
    checkIns,
    dailyTip,
    weeklyInsight,
    ensureWeeklyInsight,
  } = useStore();

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [balanceTipOpen, setBalanceTipOpen] = useState(false);
  const balanceTipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureWeeklyInsight();
  }, [ensureWeeklyInsight, checkIns]);

  useEffect(() => {
    return () => {
      if (balanceTipTimer.current) clearTimeout(balanceTipTimer.current);
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

  const lifeScore = checkedInToday
    ? todayCheckIn!.score
    : 0;

  const tip =
    (checkedInToday
      ? dailyTip ?? todayCheckIn?.tip
      : 'Check in once a day — mood, sleep, screen, and social battery become your Life Balance score.') ??
    null;

  // Streak strip: left → right fills green as you check in each day (no red "today" bar).
  const streakLen = Math.min(7, Math.max(0, user.currentStreak));
  const streakScores = checkIns
    .filter((c) => c.completed)
    .slice(-streakLen)
    .map((c) => c.score);
  const streakSlots = Array.from({ length: 7 }, (_, i) => {
    if (i < streakScores.length) {
      return { filled: true, score: streakScores[i] };
    }
    return { filled: false, score: 0 };
  });
  const maxStreakScore = Math.max(...streakScores, 1);

  const weeklyUnlocked = canUnlockWeeklyInsights(checkIns);

  const screenTimeColor =
    checkedInToday && todayCheckIn && todayCheckIn.screenTime <= 3
      ? 'text-mint-500'
      : checkedInToday && todayCheckIn && todayCheckIn.screenTime <= 5
        ? 'text-lighthouse-500'
        : 'text-coral-500';

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      {/* Brand + greeting */}
      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="/images/logo.png"
            alt=""
            draggable={false}
            className="w-8 h-8 rounded-[10px] shadow-soft object-cover"
          />
          <span className="font-display font-bold text-body text-ink-900 dark:text-ink-100 tracking-tight">
            Lighthouse
          </span>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
            {getGreeting()},
            <br />
            <span className="text-gradient-ember">{user.name}</span>
          </h1>
        </div>
      </div>

      {/* Daily check-in CTA */}
      <div className="px-6 mt-5">
        {checkedInToday ? (
          <div className="flex items-center gap-3 p-3.5 rounded-card glass">
            <div className="w-10 h-10 rounded-full bg-mint-500/15 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-mint-600 dark:text-mint-300" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                Today&apos;s check-in saved
              </p>
              <p className="text-caption text-ink-600 dark:text-ink-300">
                Life Balance updated from mood, sleep, screen & social battery
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Hero: Life Balance */}
      <div className="px-6 mt-5">
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
                    {/* Caret pointing up at the ring */}
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
                <div className="flex items-baseline gap-2 min-w-0">
                  <TrendingUp size={16} className="text-mint-500 shrink-0" strokeWidth={2.5} />
                  <span className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                    {user.weeklyChange >= 0 ? '+' : ''}{user.weeklyChange}
                  </span>
                  <span className="text-caption text-ink-600 dark:text-ink-300">vs yesterday</span>
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

              <div className="mt-2.5 flex items-end gap-1.5 h-8">
                {streakSlots.map((slot, i) => {
                  const h = slot.filled
                    ? Math.max(28, (slot.score / maxStreakScore) * 78)
                    : 16;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-full"
                      style={{
                        background: slot.filled
                          ? 'linear-gradient(180deg, #34D399, #10B981)'
                          : 'rgba(14,11,8,0.08)',
                      }}
                      initial={{ height: 6 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.12 + i * 0.04, type: 'spring', stiffness: 160, damping: 22 }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {tip && (
            <motion.div
              className="relative mt-4 p-3.5 rounded-card bg-mint-500/10 border border-mint-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <img
                  src="/images/lumi.png"
                  alt=""
                  className="w-4 h-4 object-contain shrink-0"
                  draggable={false}
                />
                <span className="text-micro uppercase tracking-[0.14em] font-bold text-mint-700 dark:text-mint-300">
                  AI tip
                </span>
              </div>
              <p className="text-caption text-ink-900 dark:text-ink-100 leading-relaxed font-medium">
                {tip}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

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

      {/* Weekly insights — only once unlocked */}
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
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-soft shrink-0"
                style={{ background: 'linear-gradient(135deg, #A78BFA, #FF6B7A)' }}
              >
                <FlaskConical size={18} className="text-white" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
                  Weekly AI Insights
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

      {/* Lumi guide */}
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
          if (out.weeklyReady) {
            ensureWeeklyInsight();
            setTimeout(() => setWeeklyOpen(true), 2400);
          }
        }}
      />
      <WeeklyInsights
        isOpen={weeklyOpen}
        onClose={() => setWeeklyOpen(false)}
        insight={weeklyInsight}
      />
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
