import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, Check, Users, Plus, Copy, ArrowRight, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import Lumi from '../components/Lumi';
import BottomSheet from '../components/BottomSheet';
import { leaderboard, challengeGroups } from '../lib/mockData';
import type { Challenge, ChallengeGroup } from '../lib/mockData';

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
  { key: 'groups', label: 'challenges.groups' },
] as const;

function triggerConfetti() {
  const colors = ['#FFB547', '#FF6B7A', '#34D399', '#A78BFA', '#67E8F0'];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
}

export default function Challenges() {
  const { challenges, completeChallenge } = useStore();
  const [topTab, setTopTab] = useState<'challenges' | 'leaderboard' | 'groups'>('challenges');
  const [activePack, setActivePack] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState<typeof difficulties[number] | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChallengeGroup | null>(null);

  const filtered = challenges.filter((c) => {
    if (activePack !== 'all' && c.pack !== activePack) return false;
    if (activeDifficulty && c.difficulty !== activeDifficulty) return false;
    return true;
  });

  const completedToday = challenges.filter((c) => c.completed).length;

  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
  }, []);

  const handleComplete = (id: string) => {
    completeChallenge(id);
    triggerConfetti();
    setShowComplete(true);
    completeTimeoutRef.current = setTimeout(() => {
      setSelectedChallenge(null);
      setShowComplete(false);
    }, 1800);
  };

  const handleCloseChallenge = () => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    setSelectedChallenge(null);
    setShowComplete(false);
  };

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
          Quests &amp; community
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

        {topTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <GroupsView
              onCreateGroup={() => setShowCreateGroup(true)}
              onJoinGroup={() => setShowJoinGroup(true)}
              onSelectGroup={setSelectedGroup}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge detail sheet */}
      <BottomSheet
        isOpen={!!selectedChallenge}
        onClose={handleCloseChallenge}
        title={selectedChallenge?.title}
      >
        {selectedChallenge && (
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
            <AnimatePresence mode="wait">
              {showComplete ? (
                <motion.div key="done" className="text-center py-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                  <Lumi pose="cheering" size={80} />
                  <p className="mt-3 font-display font-bold text-title text-mint-700 dark:text-mint-300">Amazing work! {'\u{1F31F}'}</p>
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleComplete(selectedChallenge.id)}
                >
                  Done! {'\u2728'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </BottomSheet>

      {/* Create Group sheet */}
      <CreateGroupSheet isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />

      {/* Join Group sheet */}
      <JoinGroupSheet isOpen={showJoinGroup} onClose={() => setShowJoinGroup(false)} />

      {/* Group detail sheet */}
      <GroupDetailSheet group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </div>
  );
}

/* =========== Challenges Sub-view =========== */
function ChallengesView({
  challenges, activePack, setActivePack, activeDifficulty, setActiveDifficulty, completedToday, onSelect,
}: {
  challenges: Challenge[];
  activePack: string;
  setActivePack: (p: string) => void;
  activeDifficulty: typeof difficulties[number] | null;
  setActiveDifficulty: (d: typeof difficulties[number] | null) => void;
  completedToday: number;
  onSelect: (c: Challenge) => void;
}) {
  return (
    <>
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
                <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center ml-3 flex-shrink-0 shadow-soft">
                  <Check size={16} className="text-white" strokeWidth={3} />
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
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="px-6 mt-5">
      {/* Podium in a glass hero */}
      <motion.div
        className="relative overflow-hidden rounded-hero glass-strong p-5 mb-4"
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
      <div className="relative flex items-end justify-center gap-3">
        {/* 2nd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ink-100 to-ink-300 dark:from-night-500 dark:to-night-700 flex items-center justify-center text-lg font-bold text-ink-900 dark:text-ink-100 ring-2 ring-ink-300 dark:ring-night-500">
            {podium[1].avatar}
          </div>
          <p className="mt-1.5 text-caption font-bold text-ink-900 dark:text-ink-100">{podium[1].name}</p>
          <p className="text-[11px] text-ink-300">{podium[1].flag} {podium[1].score}</p>
          <div className="mt-2 w-16 h-16 rounded-t-sm bg-ink-100 dark:bg-night-700 flex items-center justify-center">
            <span className="font-display font-bold text-display-l text-ink-600 dark:text-ink-300">2</span>
          </div>
        </motion.div>

        {/* 1st place */}
        <motion.div
          className="flex flex-col items-center -mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className="relative">
            <Crown size={20} className="absolute -top-5 left-1/2 -translate-x-1/2 text-lighthouse-500" fill="#FFB547" />
            <div className="w-16 h-16 rounded-full hero-glow flex items-center justify-center text-xl font-bold text-white ring-3 ring-lighthouse-300">
              {podium[0].avatar}
            </div>
          </div>
          <p className="mt-1.5 text-caption font-bold text-ink-900 dark:text-ink-100">{podium[0].name}</p>
          <p className="text-[11px] text-lighthouse-600 dark:text-lighthouse-300 font-bold">{podium[0].flag} {podium[0].score}</p>
          <div className="mt-2 w-16 h-24 rounded-t-sm hero-glow flex items-center justify-center">
            <span className="font-display font-bold text-display-l text-white">1</span>
          </div>
        </motion.div>

        {/* 3rd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lighthouse-100 to-lighthouse-300 flex items-center justify-center text-lg font-bold text-lighthouse-700 ring-2 ring-lighthouse-300">
            {podium[2].avatar}
          </div>
          <p className="mt-1.5 text-caption font-bold text-ink-900 dark:text-ink-100">{podium[2].name}</p>
          <p className="text-[11px] text-ink-300">{podium[2].flag} {podium[2].score}</p>
          <div className="mt-2 w-16 h-12 rounded-t-sm bg-lighthouse-100 dark:bg-lighthouse-700/20 flex items-center justify-center">
            <span className="font-display font-bold text-display-l text-lighthouse-600 dark:text-lighthouse-300">3</span>
          </div>
        </motion.div>
      </div>
      </motion.div>

      {/* Rest of list */}
      <div className="space-y-2">
        {rest.map((entry, i) => (
          <motion.div
            key={entry.rank}
            className={`relative overflow-hidden flex items-center gap-3 p-3.5 rounded-card ${
              entry.isYou ? 'glass-tint-warm' : 'glass'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className={`w-7 text-center font-display font-bold text-caption ${
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
              <div className="flex items-center gap-1.5">
                <p className={`font-display font-bold text-body truncate ${
                  entry.isYou ? 'text-lighthouse-700 dark:text-lighthouse-300' : 'text-ink-900 dark:text-ink-100'
                }`}>
                  {entry.name}
                  {entry.isYou && <span className="text-caption text-lighthouse-500 ml-1">(you)</span>}
                </p>
              </div>
              <p className="text-[11px] text-ink-300">{entry.flag} {entry.country}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">{entry.score}</p>
              <p className="text-[11px] text-coral-500">{'\u{1F525}'} {entry.streak}d</p>
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

/* =========== Groups View =========== */
function GroupsView({
  onCreateGroup, onJoinGroup, onSelectGroup,
}: {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onSelectGroup: (g: ChallengeGroup) => void;
}) {
  return (
    <div className="px-6 mt-5">
      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          className="flex-1 py-3.5 rounded-capsule hero-glow text-white font-display font-bold text-caption shadow-soft flex items-center justify-center gap-2"
          whileTap={{ scale: 0.97 }}
          onClick={onCreateGroup}
        >
          <Plus size={16} />
          {t('challenges.create_group')}
        </motion.button>
        <motion.button
          className="flex-1 py-3.5 rounded-capsule glass-strong text-ink-900 dark:text-ink-100 font-display font-bold text-caption flex items-center justify-center gap-2"
          whileTap={{ scale: 0.97 }}
          onClick={onJoinGroup}
        >
          <Users size={16} />
          {t('challenges.join_group')}
        </motion.button>
      </div>

      {/* My Groups */}
      <h3 className="mt-6 font-display font-bold text-title text-ink-900 dark:text-ink-100">
        My Groups
      </h3>
      <div className="mt-3 space-y-3">
        {challengeGroups.map((group, i) => (
          <motion.button
            key={group.id}
            className="relative w-full text-left p-4 rounded-card glass-strong overflow-hidden"
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectGroup(group)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.45), transparent 70%)', filter: 'blur(24px)' }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                  {group.name}
                </h4>
                <p className="text-caption text-ink-300 mt-0.5">
                  {group.members.length} {t('challenges.members')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-body text-lighthouse-600 dark:text-lighthouse-300">
                  {group.totalScore}
                </p>
                <p className="text-[11px] text-ink-300">{t('challenges.group_score')}</p>
              </div>
            </div>

            {/* Member avatars */}
            <div className="relative flex items-center mt-3 -space-x-2">
              {group.members.slice(0, 5).map((m, j) => (
                <div
                  key={j}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-lighthouse-300 to-coral-300 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-paper dark:ring-night-800"
                >
                  {m.avatar}
                </div>
              ))}
              {group.members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-ink-100 dark:bg-night-700 flex items-center justify-center text-[11px] font-bold text-ink-600 dark:text-ink-300 ring-2 ring-paper dark:ring-night-800">
                  +{group.members.length - 5}
                </div>
              )}
              <ArrowRight size={16} className="text-ink-300 ml-auto" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Empty state hint */}
      {challengeGroups.length === 0 && (
        <div className="mt-8 text-center">
          <Lumi pose="thinking" size={64} animate={false} />
          <p className="mt-3 text-body text-ink-300">
            Create a group or join one with a friend's invite code to compete together!
          </p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

/* =========== Create Group Sheet =========== */
function CreateGroupSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [created, setCreated] = useState(false);
  const [code, setCode] = useState('');

  const handleCreate = () => {
    const newCode = name.toUpperCase().replace(/\s+/g, '').slice(0, 4) + Math.floor(Math.random() * 90 + 10);
    setCode(newCode);
    setCreated(true);
  };

  const handleClose = () => {
    setCreated(false);
    setName('');
    setCode('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={t('challenges.create_group')}>
      {!created ? (
        <div className="space-y-4">
          <div>
            <label className="text-caption text-ink-600 dark:text-ink-300 font-medium">{t('challenges.group_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dhaka Dreamers"
              className="mt-2 w-full py-3 px-4 rounded-sm bg-ink-100 dark:bg-night-700 text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 focus-ring"
            />
          </div>
          <p className="text-caption text-ink-300">
            Your friends can join using the invite code you'll get after creating the group.
          </p>
          <motion.button
            className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
              name.trim()
                ? 'hero-glow text-white'
                : 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
            }`}
            whileTap={name.trim() ? { scale: 0.97 } : undefined}
            onClick={handleCreate}
          >
            Create Group
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="text-center space-y-4 py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lumi pose="cheering" size={72} />
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
            Group created! {'\u{1F389}'}
          </h3>
          <p className="text-body text-ink-600 dark:text-ink-300">
            Share this code with your friends:
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-6 py-3 rounded-card bg-lighthouse-50 dark:bg-night-700 border-2 border-dashed border-lighthouse-500">
              <span className="font-display font-bold text-display-l text-lighthouse-600 dark:text-lighthouse-300 tracking-wider">
                {code}
              </span>
            </div>
            <motion.button
              className="w-10 h-10 rounded-full bg-lighthouse-500 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigator.clipboard?.writeText(code)}
              aria-label="Copy code"
            >
              <Copy size={16} className="text-white" />
            </motion.button>
          </div>
          <motion.button
            className="w-full py-3 rounded-capsule bg-ink-100 dark:bg-night-700 text-ink-900 dark:text-ink-100 font-display font-semibold"
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
          >
            Done
          </motion.button>
        </motion.div>
      )}
    </BottomSheet>
  );
}

/* =========== Join Group Sheet =========== */
function JoinGroupSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    const match = challengeGroups.find((g) => g.code === code.toUpperCase());
    if (match) {
      setJoined(true);
      setError('');
    } else {
      setError('Group not found. Check the code and try again.');
    }
  };

  const handleClose = () => {
    setJoined(false);
    setCode('');
    setError('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={t('challenges.join_group')}>
      {!joined ? (
        <div className="space-y-4">
          <div>
            <label className="text-caption text-ink-600 dark:text-ink-300 font-medium">{t('challenges.invite_code')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. DHAKA24"
              className="mt-2 w-full py-3 px-4 rounded-sm bg-ink-100 dark:bg-night-700 text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 focus-ring uppercase tracking-wider font-display font-bold text-center text-title"
              maxLength={8}
            />
          </div>
          {error && (
            <p className="text-caption text-coral-500 font-medium">{error}</p>
          )}
          <p className="text-caption text-ink-300">
            Ask your friend for their group's invite code, then enter it above to join their challenge group.
          </p>
          <motion.button
            className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
              code.trim().length >= 4
                ? 'hero-glow text-white'
                : 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
            }`}
            whileTap={code.trim().length >= 4 ? { scale: 0.97 } : undefined}
            onClick={handleJoin}
          >
            Join Group
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="text-center space-y-4 py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lumi pose="happy" size={72} />
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
            You're in! {'\u{1F31F}'}
          </h3>
          <p className="text-body text-ink-600 dark:text-ink-300">
            Complete challenges together and climb the group leaderboard.
          </p>
          <motion.button
            className="w-full py-3 rounded-capsule hero-glow text-white font-display font-semibold"
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
          >
            Let's go!
          </motion.button>
        </motion.div>
      )}
    </BottomSheet>
  );
}

/* =========== Group Detail Sheet =========== */
function GroupDetailSheet({ group, onClose }: { group: ChallengeGroup | null; onClose: () => void }) {
  if (!group) return null;

  const sorted = [...group.members].sort((a, b) => b.score - a.score);

  return (
    <BottomSheet isOpen={!!group} onClose={onClose} title={group.name}>
      <div className="space-y-4">
        {/* Group stats */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-card bg-lighthouse-50 dark:bg-lighthouse-700/10 text-center">
            <p className="font-display font-bold text-display-l text-lighthouse-600 dark:text-lighthouse-300">{group.totalScore}</p>
            <p className="text-[11px] text-ink-300">{t('challenges.group_score')}</p>
          </div>
          <div className="flex-1 p-3 rounded-card bg-ink-100 dark:bg-night-700 text-center">
            <p className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100">{group.members.length}</p>
            <p className="text-[11px] text-ink-300">Members</p>
          </div>
        </div>

        {/* Invite code */}
        <div className="flex items-center gap-3 p-3 rounded-card bg-ink-100 dark:bg-night-700">
          <div className="flex-1">
            <p className="text-[11px] text-ink-300 uppercase tracking-wider font-bold">Invite Code</p>
            <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100 tracking-wider">{group.code}</p>
          </div>
          <motion.button
            className="w-9 h-9 rounded-full bg-paper dark:bg-night-800 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard?.writeText(group.code)}
            aria-label="Copy code"
          >
            <Copy size={15} className="text-ink-600 dark:text-ink-300" />
          </motion.button>
        </div>

        {/* Members ranking */}
        <h4 className="font-display font-bold text-caption text-ink-600 dark:text-ink-300 uppercase tracking-wider">
          Member Rankings
        </h4>
        <div className="space-y-2">
          {sorted.map((member, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-card ${
                i === 0 ? 'bg-lighthouse-50 dark:bg-lighthouse-700/10' : 'bg-paper dark:bg-night-800 card-border'
              }`}
            >
              <span className={`w-6 text-center font-display font-bold text-caption ${
                i === 0 ? 'text-lighthouse-600' : 'text-ink-300'
              }`}>
                {i + 1}
              </span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'hero-glow text-white' : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
              }`}>
                {member.avatar}
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-body text-ink-900 dark:text-ink-100">
                  {member.name} {member.flag}
                </p>
                <p className="text-[11px] text-ink-300">{member.challenges} challenges done</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">{member.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
