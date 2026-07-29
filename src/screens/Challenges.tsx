import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, Check, Moon, Camera, ImagePlus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import Lumi from '../components/Lumi';
import AttentionBadge from '../components/AttentionBadge';
import BottomSheet from '../components/BottomSheet';
import LearnPanel from '../components/LearnPanel';
import SleepRecording from '../components/SleepRecording';
import { leaderboard, SLEEP_GOAL_HOURS } from '../lib/mockData';
import type { Challenge } from '../lib/mockData';
import {
  challengeCycleEpoch,
  orderChallengesForList,
} from '../lib/challengeCycle';
import { compressProofPhoto } from '../lib/proofPhoto';

const podiumBadges: Record<1 | 2 | 3, { src: string; alt: string; bar: string }> = {
  1: {
    src: '/images/podium-1.png',
    alt: '1st place flame with sunglasses',
    bar: 'hero-glow',
  },
  2: {
    src: '/images/podium-2.png',
    alt: '2nd place silver flame',
    bar: 'bg-[#C0C0C0] dark:bg-[#8A8A8A]',
  },
  3: {
    src: '/images/podium-3.png',
    alt: '3rd place flame',
    bar: 'bg-[#CD7F32]',
  },
};

const packs = [
  { key: 'all', label: 'challenges.all' },
  { key: 'bangladesh', label: 'challenges.bangladesh' },
  { key: 'korea', label: 'challenges.korea' },
  { key: 'worldwide', label: 'challenges.worldwide' },
];

const difficulties = ['easy', 'medium', 'bold'] as const;

const topTabs = [
  { key: 'challenges', label: 'nav.challenges' },
  { key: 'leaderboard', label: 'challenges.leaderboard' },
  { key: 'learn', label: 'Learn' },
] as const;

function triggerConfetti() {
  const colors = ['#FFB547', '#FF6B7A', '#34D399', '#A78BFA', '#67E8F0'];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
}

export default function Challenges() {
  const { challenges, completeChallenge, refreshExpiredChallenges, user } = useStore();
  const [topTab, setTopTab] = useState<'challenges' | 'leaderboard' | 'learn'>('challenges');
  const [activePack, setActivePack] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState<typeof difficulties[number] | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    refreshExpiredChallenges();
  }, [refreshExpiredChallenges]);

  const sleepQuest = challenges.find((c) => c.tracker === 'sleep') ?? null;
  const filtered = useMemo(
    () =>
      orderChallengesForList(challenges, {
        pack: activePack,
        difficulty: activeDifficulty,
        seedKey: `${user.name}|${challengeCycleEpoch()}`,
      }),
    [challenges, activePack, activeDifficulty, user.name]
  );

  const completedToday = challenges.filter((c) => c.completed).length;

  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
  }, []);

  const handleComplete = (id: string) => {
    if (!proofPreview) {
      setProofError('Add a photo to prove you did it.');
      return;
    }
    completeChallenge(id, proofPreview);
    triggerConfetti();
    setShowComplete(true);
    completeTimeoutRef.current = setTimeout(() => {
      setSelectedChallenge(null);
      setShowComplete(false);
      setProofPreview(null);
      setProofError(null);
    }, 1800);
  };

  const handleCloseChallenge = () => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    setSelectedChallenge(null);
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

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
          Quests &amp; skills
        </p>
        <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
          {t('nav.challenges')}
        </h1>

        {/* Top tabs — glass capsule */}
        <div className="mt-4 p-1 rounded-capsule glass flex gap-1">
          {topTabs.map((tab) => (
            <motion.button
              key={tab.key}
              className={`flex-1 py-2 rounded-capsule text-caption font-bold transition-colors ${
                topTab === tab.key
                  ? 'hero-glow text-white shadow-soft'
                  : 'text-ink-600 dark:text-ink-300'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTopTab(tab.key)}
            >
              {t(tab.label)}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {topTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <ChallengesView
              challenges={filtered}
              sleepQuest={sleepQuest}
              activePack={activePack}
              setActivePack={setActivePack}
              activeDifficulty={activeDifficulty}
              setActiveDifficulty={setActiveDifficulty}
              completedToday={completedToday}
              onSelect={setSelectedChallenge}
            />
          </motion.div>
        )}

        {topTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <LeaderboardView />
          </motion.div>
        )}

        {topTab === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <LearnPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge detail sheet — sleep quest uses its own tracker UI */}
      <BottomSheet
        isOpen={!!selectedChallenge && selectedChallenge.tracker !== 'sleep'}
        onClose={handleCloseChallenge}
        title={selectedChallenge?.title}
      >
        {selectedChallenge && selectedChallenge.tracker !== 'sleep' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>{selectedChallenge.flag}</span>
              <span className={`text-micro uppercase tracking-wider font-bold ${
                selectedChallenge.difficulty === 'easy' ? 'text-mint-500'
                  : selectedChallenge.difficulty === 'medium' ? 'text-lighthouse-500'
                  : 'text-coral-500'
              }`}>
                {selectedChallenge.difficulty}
              </span>
              <span className="text-caption text-ink-300">{selectedChallenge.timeEstimate}</span>
              <span className="text-caption text-lighthouse-500 font-bold">+{selectedChallenge.points} pts</span>
            </div>
            <p className="text-body text-ink-600 dark:text-ink-300 selectable">
              {selectedChallenge.instructions}
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
                <motion.div key="done" className="text-center py-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                  <Lumi pose="cheering" size={80} />
                  <p className="mt-3 font-display font-bold text-title text-mint-700 dark:text-mint-300">Amazing work! {'\u{1F31F}'}</p>
                  <p className="mt-1 font-display font-bold text-body text-lighthouse-600">
                    +{selectedChallenge.points} XP
                  </p>
                </motion.div>
              ) : (
                <motion.div key="proof" className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                    onClick={() => handleComplete(selectedChallenge.id)}
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

/* =========== Required sleep quest =========== */
function SleepQuestCard({ quest }: { quest: Challenge }) {
  const { sleepSession, lastSleep } = useStore();
  const [pageOpen, setPageOpen] = useState(false);
  const [result, setResult] = useState<{ hours: number; completed: boolean } | null>(null);
  const sleeping = Boolean(sleepSession);

  return (
    <>
      <motion.div
        className={`relative mx-6 mt-4 p-5 rounded-hero overflow-hidden ${
          quest.completed ? 'glass-tint-warm' : 'glass-strong'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!quest.completed && (
          <AttentionBadge className="absolute top-3 left-3 z-10" size="md" />
        )}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(26px)' }}
        />
        <div
          className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.4), transparent 70%)', filter: 'blur(26px)' }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 pl-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-micro uppercase tracking-wider font-bold text-ink-300">Sleep</span>
            </div>
            <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">{quest.title}</h3>
            <p className="text-caption text-ink-600 dark:text-ink-300 mt-1">{quest.description}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-night-800/10 dark:bg-night-700 flex items-center justify-center shrink-0">
            <Moon size={22} className="text-lavender-500" />
          </div>
        </div>

        <div className="relative mt-4 space-y-3">
          {result && (
            <div className={`p-3 rounded-card text-center ${
              result.completed
                ? 'bg-mint-500/15 text-mint-700 dark:text-mint-300'
                : 'bg-coral-500/10 text-coral-600 dark:text-coral-300'
            }`}>
              <p className="font-display font-bold text-body">
                {result.hours.toFixed(1)}h recorded
              </p>
              <p className="text-caption mt-0.5">
                {result.completed
                  ? `Goal reached — +${quest.points} pts`
                  : `Need ${SLEEP_GOAL_HOURS}h to complete. Try again tonight.`}
              </p>
            </div>
          )}
          {!result && lastSleep && !quest.completed && !sleeping && (
            <p className="text-caption text-ink-300 text-center">
              Last night: {lastSleep.hours.toFixed(1)}h
            </p>
          )}
          {sleeping && (
            <p className="text-caption text-lighthouse-600 dark:text-lighthouse-300 text-center font-semibold">
              Recording in progress — open the sleep page to wake up.
            </p>
          )}
          {quest.completed ? (
            <div className="flex items-center justify-center gap-2 py-3">
              <Check size={16} className="text-mint-500" strokeWidth={3} />
              <span className="font-display font-bold text-caption text-mint-700 dark:text-mint-300">
                Completed
              </span>
            </div>
          ) : (
            <motion.button
              className="w-full py-3.5 rounded-capsule hero-glow text-white font-display font-bold text-caption shadow-soft flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setResult(null);
                setPageOpen(true);
              }}
            >
              <Moon size={16} />
              {sleeping ? 'Continue recording' : 'Record sleep time'}
            </motion.button>
          )}
          <div className="flex items-center justify-between text-caption text-ink-300">
            <span className="flex items-center gap-1"><Clock size={12} />{quest.timeEstimate}</span>
            <span className="flex items-center gap-1 text-lighthouse-600 dark:text-lighthouse-300 font-bold">
              <Star size={12} fill="currentColor" />+{quest.points}
            </span>
          </div>
        </div>
      </motion.div>

      <SleepRecording
        isOpen={pageOpen}
        onClose={() => setPageOpen(false)}
        onCompleted={(hours) => {
          setResult({ hours, completed: hours >= SLEEP_GOAL_HOURS });
        }}
      />
    </>
  );
}

/* =========== Challenges Sub-view =========== */
function ChallengesView({
  challenges, sleepQuest, activePack, setActivePack, activeDifficulty, setActiveDifficulty, completedToday, onSelect,
}: {
  challenges: Challenge[];
  sleepQuest: Challenge | null;
  activePack: string;
  setActivePack: (p: string) => void;
  activeDifficulty: typeof difficulties[number] | null;
  setActiveDifficulty: (d: typeof difficulties[number] | null) => void;
  completedToday: number;
  onSelect: (c: Challenge) => void;
}) {
  return (
    <>
      {sleepQuest && <SleepQuestCard quest={sleepQuest} />}

      {/* Pack filter */}
      <div className="px-6 mt-4 flex gap-2 overflow-x-auto scrollbar-none">
        {packs.map((pack) => (
          <motion.button
            key={pack.key}
            className={`whitespace-nowrap px-4 py-2 rounded-capsule text-caption font-semibold ${
              activePack === pack.key
                ? 'hero-glow text-white shadow-soft'
                : 'glass text-ink-600 dark:text-ink-300'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivePack(pack.key)}
          >
            {t(pack.label)}
          </motion.button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="px-6 mt-3 flex gap-2">
        {difficulties.map((diff) => (
          <motion.button
            key={diff}
            className={`flex-1 py-2.5 rounded-capsule text-caption font-bold capitalize ${
              activeDifficulty === diff
                ? 'hero-glow text-white shadow-soft'
                : 'glass text-ink-600 dark:text-ink-300'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
          >
            {t(`challenges.${diff}`)}
          </motion.button>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="px-6 mt-4 space-y-3">
        {challenges.map((challenge, idx) => (
          <motion.button
            key={challenge.id}
            className={`relative w-full text-left p-5 rounded-hero overflow-hidden ${
              challenge.completed ? 'glass-tint-warm' : 'glass-strong'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => !challenge.completed && onSelect(challenge)}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background:
                  challenge.difficulty === 'easy'
                    ? 'radial-gradient(circle, rgba(255,202,107,0.45), transparent 70%)'
                    : challenge.difficulty === 'medium'
                      ? 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)'
                      : 'radial-gradient(circle, rgba(255,77,106,0.45), transparent 70%)',
                filter: 'blur(26px)',
              }}
            />
            <div
              className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.2), transparent 70%)', filter: 'blur(26px)' }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{challenge.flag}</span>
                  <span
                    className={`text-micro uppercase tracking-wider font-bold ${
                      challenge.difficulty === 'easy'
                        ? 'text-mint-700 dark:text-mint-300'
                        : challenge.difficulty === 'medium'
                          ? 'text-lighthouse-600 dark:text-lighthouse-300'
                          : 'text-coral-600 dark:text-coral-300'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">{challenge.title}</h3>
                <p className="text-caption text-ink-600 dark:text-ink-300 mt-1">{challenge.description}</p>
              </div>
              {challenge.completed && (
                <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-2">
                  {challenge.proofDataUrl ? (
                    <img
                      src={challenge.proofDataUrl}
                      alt=""
                      className="w-14 h-14 rounded-[14px] object-cover shadow-soft ring-2 ring-white/70 dark:ring-night-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center shadow-soft">
                      <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-caption text-ink-600 dark:text-ink-300">
                <Clock size={13} />
                {challenge.timeEstimate}
              </div>
              <div className="flex items-center gap-1 text-caption text-lighthouse-600 dark:text-lighthouse-300 font-bold">
                <Star size={13} fill="currentColor" />+{challenge.points}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {completedToday > 0 && (
        <div className="px-6 mt-6 mb-4">
          <motion.div
            className="relative overflow-hidden p-4 rounded-card glass-tint-warm text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lumi pose="cheering" size={48} animate={false} />
            <p className="mt-2 font-display font-bold text-coral-600 dark:text-coral-300">
              {completedToday} {t('challenges.completed')} {'\u{1F389}'}
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* =========== Leaderboard View =========== */
function LeaderboardView() {
  const { user } = useStore();
  const rows = useMemo(() => {
    // Mirror the current user's live score onto the "you" row.
    return leaderboard.map((entry) =>
      entry.isYou
        ? {
            ...entry,
            name: user.name || entry.name,
            score: Math.round(user.currentScore),
            streak: user.currentStreak,
            flag: user.countryFlag || entry.flag,
            country: user.country || entry.country,
            avatar: (user.name?.[0] || entry.avatar).toUpperCase(),
          }
        : entry
    ).sort((a, b) => b.score - a.score)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [user]);

  const podium = [rows[1], rows[0], rows[2]].filter(Boolean);
  const rest = rows.slice(3);

  return (
    <div className="px-6 mt-5">
      {/* Podium — 2 · 1 · 3 */}
      <motion.div
        className="relative overflow-hidden rounded-hero glass-strong px-3 pt-6 pb-2 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,202,107,0.55), transparent 70%)', filter: 'blur(28px)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.35), transparent 70%)', filter: 'blur(28px)' }}
        />

        <div className="relative flex items-end justify-center gap-1.5">
          {podium.map((entry, visualIndex) => {
            // visualIndex: 0 = 2nd, 1 = 1st, 2 = 3rd
            const place = (visualIndex === 1 ? 1 : visualIndex === 0 ? 2 : 3) as 1 | 2 | 3;
            const isFirst = place === 1;
            const badge = podiumBadges[place];
            const barH = isFirst ? 'h-24' : place === 2 ? 'h-16' : 'h-12';
            const scoreTone =
              place === 1
                ? 'text-lighthouse-600 dark:text-lighthouse-300'
                : place === 2
                  ? 'text-[#8A8A8A] dark:text-[#C0C0C0]'
                  : 'text-[#B87333]';
            return (
              <motion.div
                key={entry.rank}
                className={`flex flex-col items-center flex-1 max-w-[7.5rem] ${isFirst ? '-mt-3' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isFirst ? 0 : place * 0.08 }}
              >
                <motion.img
                  src={badge.src}
                  alt={badge.alt}
                  className={`object-contain drop-shadow-sm ${
                    isFirst ? 'w-[5.75rem] h-[5.75rem]' : 'w-[4.75rem] h-[4.75rem]'
                  }`}
                  draggable={false}
                  animate={{ y: [0, isFirst ? -4 : -3, 0] }}
                  transition={{ duration: isFirst ? 2.8 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p className="mt-1 text-caption font-bold text-ink-900 dark:text-ink-100 truncate max-w-full">
                  {entry.name}
                </p>
                <p className={`text-[11px] font-bold flex items-center gap-0.5 ${scoreTone}`}>
                  <span aria-hidden>{'\u{1F525}'}</span> {entry.score}
                </p>
                <div className={`mt-2 w-full ${barH} rounded-t-sm flex items-center justify-center ${badge.bar}`}>
                  <span className="font-display font-bold text-display-l text-white">
                    {place}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Ranks 4+ */}
      <div className="space-y-2">
        {rest.map((entry, i) => (
          <motion.div
            key={entry.rank}
            className={`relative overflow-hidden flex items-center gap-3 p-3.5 rounded-card ${
              entry.isYou
                ? 'glass-tint-warm ring-2 ring-lighthouse-400/60'
                : 'glass'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className={`w-6 text-center font-display font-bold text-caption ${
              entry.isYou ? 'text-lighthouse-600' : 'text-ink-300'
            }`}>
              {entry.rank}
            </span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              entry.isYou
                ? 'hero-glow text-white'
                : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
            }`}>
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-display font-bold text-body truncate ${
                entry.isYou ? 'text-lighthouse-700 dark:text-lighthouse-300' : 'text-ink-900 dark:text-ink-100'
              }`}>
                {entry.name}
                {entry.isYou && <span className="text-caption text-lighthouse-500 ml-1">(you)</span>}
              </p>
              <p className="text-[11px] text-ink-300">{entry.flag} {entry.country}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">{entry.score}</p>
              <p className="text-[11px] text-coral-500 font-semibold flex items-center justify-end gap-0.5">
                <span aria-hidden>{'\u{1F525}'}</span> {entry.streak}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 mb-4 text-center">
        <p className="text-[11px] text-ink-300">Updated daily at midnight UTC</p>
      </div>
    </div>
  );
}

