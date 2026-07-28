import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp, Sparkles, Target, ArrowRight, GraduationCap, Clock, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import ScoreRing, { scoreRingColor } from '../components/ScoreRing';
import ScoreLadderSheet from '../components/ScoreLadderSheet';
import Lumi from '../components/Lumi';
import { learningSkills } from '../lib/mockData';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.greeting.morning');
  if (h < 18) return t('home.greeting.afternoon');
  return t('home.greeting.evening');
}

function LearnSomethingNew() {
  const { setActiveTab } = useStore();
  const pick = learningSkills[new Date().getDate() % learningSkills.length];

  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-soft" style={{ background: 'linear-gradient(135deg, #63C5B2, #4A90E2)' }}>
            <GraduationCap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
            Learn a new thing
          </h2>
        </div>
        <button
          className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold"
          onClick={() => setActiveTab(3)}
        >
          See all
        </button>
      </div>

      <motion.button
        className="relative w-full p-5 rounded-hero glass-strong text-left overflow-hidden"
        whileTap={{ scale: 0.98 }}
        onClick={() => setActiveTab(3)}
      >
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${pick.color}77, transparent 70%)`, filter: 'blur(26px)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.3), transparent 70%)', filter: 'blur(24px)' }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-[16px] flex items-center justify-center shadow-soft"
            style={{ background: `linear-gradient(135deg, ${pick.color}, ${pick.color}cc)` }}
          >
            <GraduationCap size={20} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold">
              Today's skill
            </p>
            <h3 className="mt-0.5 font-display font-bold text-title text-ink-900 dark:text-ink-100 leading-tight tracking-tight">
              {pick.title}
            </h3>
            <p className="mt-1 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
              Taught by {pick.teacherFlag} {pick.teacher}
            </p>
          </div>
          <ArrowRight size={18} className="text-ink-600 dark:text-ink-300 flex-shrink-0 mt-1" strokeWidth={2.5} />
        </div>
        <div className="relative flex items-center gap-2 mt-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-capsule glass text-[11px] font-bold text-ink-900 dark:text-ink-100">
            <Clock size={11} strokeWidth={2.5} />
            {pick.duration}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-capsule glass text-[11px] font-bold text-ink-900 dark:text-ink-100">
            <Users size={11} strokeWidth={2.5} />
            {pick.learners} learning
          </span>
          <span className="ml-auto px-2.5 py-1 rounded-capsule glass text-[11px] font-bold text-ink-900 dark:text-ink-100 capitalize">
            {pick.difficulty}
          </span>
        </div>
      </motion.button>
    </div>
  );
}

export default function Home() {
  const { user, checkIns, challenges, lightBotHasNudge, setActiveTab } = useStore();
  const [ladderOpen, setLadderOpen] = useState(false);

  const last7 = checkIns.slice(-7);

  const todayChallenge = challenges.find((c) => !c.completed);

  const maxScore = Math.max(...last7.map((d) => d.score || 0), 80);

  return (
    <div className="screen-scroll">
      {/* Ambient aurora backdrop */}
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      {/* Greeting */}
      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-capsule glass text-caption text-ink-900 dark:text-ink-100 font-semibold">
            <span className="w-2 h-2 rounded-full bg-lighthouse-500" />
            28° Dhaka
          </div>
        </div>
      </div>

      {/* Hero Card: Score + Summary */}
      <div className="px-6 mt-6">
        <motion.div
          className="relative overflow-hidden rounded-hero glass-strong p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Warm aurora blob inside the hero */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(30px)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.35), transparent 70%)', filter: 'blur(30px)' }}
          />

          <div className="relative flex items-center gap-5">
            {/* Score ring */}
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-2xl scale-110"
                style={{ background: scoreRingColor(user.currentScore), opacity: 0.35 }}
              />
              <ScoreRing
                score={user.currentScore}
                size={140}
                onClick={() => setLadderOpen(true)}
              />
            </div>

            {/* Right column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-lighthouse-600" />
                <span className="text-micro uppercase tracking-[0.16em] text-ink-600 dark:text-ink-300">
                  Life Balance
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <TrendingUp size={16} className="text-mint-500" strokeWidth={2.5} />
                <span className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                  +{user.weeklyChange}
                </span>
                <span className="text-caption text-ink-600 dark:text-ink-300">this week</span>
              </div>

              <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-capsule bg-coral-500/10 border border-coral-500/20 w-fit">
                <Flame size={13} className="text-coral-500" fill="currentColor" />
                <span className="text-caption font-bold text-coral-600 dark:text-coral-300">
                  {user.currentStreak}-day streak
                </span>
              </div>

              {/* 7-day mini bars */}
              <div className="mt-4 flex items-end gap-1 h-10">
                {last7.map((day, i) => {
                  const h = Math.max(16, ((day.score || 0) / maxScore) * 100);
                  const isToday = i === last7.length - 1;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: isToday
                          ? 'linear-gradient(180deg, #FF7A45, #FF4D6A)'
                          : day.completed
                            ? 'linear-gradient(180deg, #FFCA6B, #FFB27A)'
                            : 'rgba(14,11,8,0.08)',
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 160, damping: 22 }}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex items-center justify-between">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold flex-1 text-center ${
                      i === last7.length - 1
                        ? 'text-coral-500'
                        : 'text-ink-600/60 dark:text-ink-300/60'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="relative mt-4 flex items-center justify-center gap-1.5 py-2 rounded-capsule bg-mint-500/10 border border-mint-500/20 text-mint-700 dark:text-mint-300 text-caption font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Zap size={14} />
            Your best day this week was {last7.reduce((a, b) => (a.score > b.score ? a : b)).score} points
          </motion.div>
        </motion.div>
      </div>

      {/* Today's Challenge */}
      {todayChallenge && (
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full hero-glow flex items-center justify-center shadow-soft">
                <Target size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <h2 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
                {t('home.today_challenge')}
              </h2>
            </div>
            <span className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold">
              +{todayChallenge.points} pts
            </span>
          </div>

          <motion.button
            className="relative w-full p-5 rounded-hero hero-glow text-left shadow-medium overflow-hidden shine"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(1)}
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)', filter: 'blur(24px)' }}
            />
            <div className="relative flex items-start gap-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-[14px] bg-white/25 backdrop-blur-sm flex items-center justify-center text-xl">
                {todayChallenge.flag}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-title text-white leading-tight">
                  {todayChallenge.title}
                </h3>
                <p className="text-caption text-white/90 mt-1">
                  {todayChallenge.description}
                </p>
              </div>
              <ArrowRight size={18} className="text-white flex-shrink-0 mt-1" strokeWidth={2.5} />
            </div>
            <div className="relative flex items-center gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-capsule bg-white/25 backdrop-blur-sm text-[11px] font-bold text-white capitalize">
                {todayChallenge.difficulty}
              </span>
              <span className="px-2.5 py-1 rounded-capsule bg-white/25 backdrop-blur-sm text-[11px] font-bold text-white">
                {todayChallenge.timeEstimate}
              </span>
              <span className="ml-auto text-[11px] font-bold text-white/90">
                Tap to start
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Learn something new */}
      <LearnSomethingNew />

      {/* Lumi nudge */}
      {lightBotHasNudge && (
        <div className="px-6 mt-6">
          <motion.div
            className="p-4 rounded-card glass-tint-warm flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Lumi pose="headphones" size={56} animate={false} />
            <div className="flex-1">
              <p className="text-body text-ink-900 dark:text-ink-100 font-medium">
                {t('home.nudge')}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-6" />

      <ScoreLadderSheet
        isOpen={ladderOpen}
        onClose={() => setLadderOpen(false)}
        score={user.currentScore}
      />
    </div>
  );
}
