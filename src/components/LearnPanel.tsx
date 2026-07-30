import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  GraduationCap, Clock, Users, ChefHat, Hammer, Home as HomeIcon,
  Coins, Trees, Wrench, HeartHandshake, Play, Check, ChevronLeft, ArrowRight,
  RotateCcw, ExternalLink, BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { learningSkills, type LearningSkill } from '../lib/mockData';
import { useStore } from '../lib/store';
import BottomSheet from './BottomSheet';
import Lumi from './Lumi';

const categoryIcons: Record<LearningSkill['category'], React.ElementType> = {
  cooking: ChefHat,
  craft: Hammer,
  home: HomeIcon,
  money: Coins,
  outdoors: Trees,
  repair: Wrench,
  wellness: HeartHandshake,
};

const categoryFilters: { key: LearningSkill['category'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'home', label: 'Home' },
  { key: 'repair', label: 'Repair' },
  { key: 'money', label: 'Money' },
  { key: 'outdoors', label: 'Outdoors' },
  { key: 'wellness', label: 'Wellness' },
];

type LessonPhase = 'overview' | 'lesson' | 'done';

export default function LearnPanel() {
  const completedLearningIds = useStore((s) => s.completedLearningIds);
  const markLearningComplete = useStore((s) => s.markLearningComplete);
  const syncAccount = useStore((s) => s.syncAccount);
  const userName = useStore((s) => s.user.name);

  const [filter, setFilter] = useState<LearningSkill['category'] | 'all'>('all');
  const [selected, setSelected] = useState<LearningSkill | null>(null);
  const [phase, setPhase] = useState<LessonPhase>('overview');
  const [stepIndex, setStepIndex] = useState(0);

  const skills = filter === 'all' ? learningSkills : learningSkills.filter((s) => s.category === filter);
  const steps = selected?.steps ?? [];
  const totalSteps = steps.length;
  const isLastStep = stepIndex >= totalSteps - 1;
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const alreadyLearned = Boolean(selected && completedLearningIds.includes(selected.id));

  const closeSheet = () => {
    setSelected(null);
    setPhase('overview');
    setStepIndex(0);
  };

  const startLesson = () => {
    if (!selected?.steps.length) return;
    setStepIndex(0);
    setPhase('lesson');
  };

  const goNext = () => {
    if (!selected) return;
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      return;
    }
    setPhase('done');
    if (!completedLearningIds.includes(selected.id)) {
      markLearningComplete(selected.id);
      syncAccount(userName);
    }
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFB547', '#FF6B7A', '#34D399', selected.color],
    });
  };

  const goBackStep = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else setPhase('overview');
  };

  return (
    <div className="px-6 mt-4 space-y-4">
      <motion.div
        className="relative overflow-hidden rounded-hero glass-strong p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(28px)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.3), transparent 70%)', filter: 'blur(28px)' }}
        />
        <div className="relative flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-[16px] hero-glow flex items-center justify-center shadow-soft">
            <GraduationCap size={22} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="flex-1">
            <p className="text-micro uppercase tracking-[0.16em] text-ink-600 dark:text-ink-300 font-bold">
              Learning Center
            </p>
            <h2 className="mt-0.5 font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
              Learn real things from real people
            </h2>
            <p className="mt-1 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
              Cooking, fixing, growing, budgeting. Practical skills shared by aunties, uncles, coaches, and friends.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-6 px-6 pb-1">
        {categoryFilters.map((c) => (
          <motion.button
            key={c.key}
            className={`whitespace-nowrap px-3.5 py-2 rounded-capsule text-caption font-bold ${
              filter === c.key ? 'hero-glow text-white shadow-soft' : 'glass text-ink-700 dark:text-ink-200'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill, i) => {
          const Icon = categoryIcons[skill.category];
          const done = completedLearningIds.includes(skill.id);
          return (
            <motion.button
              key={skill.id}
              className="relative overflow-hidden rounded-card glass-strong text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelected(skill);
                setPhase('overview');
                setStepIndex(0);
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${skill.color}66, transparent 70%)`, filter: 'blur(22px)' }}
              />
              <div
                className="relative h-1"
                style={{ background: `linear-gradient(90deg, ${skill.color}, transparent)` }}
              />
              <div className="relative p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-soft"
                    style={{ background: `linear-gradient(135deg, ${skill.color}, ${skill.color}cc)` }}
                  >
                    <Icon size={18} className="text-white" strokeWidth={2.25} />
                  </div>
                  {done && (
                    <span className="w-5 h-5 rounded-full bg-mint-500/20 border border-mint-500 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-mint-600" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <h4 className="mt-2.5 font-display font-bold text-caption text-ink-900 dark:text-ink-100 leading-tight">
                  {skill.title}
                </h4>
                <p className="mt-1 text-[11px] text-ink-600 dark:text-ink-300">
                  {skill.teacherFlag} {skill.teacher}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-ink-600 dark:text-ink-300">
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} strokeWidth={2.5} />
                    {skill.duration}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users size={10} strokeWidth={2.5} />
                    {skill.learners}
                  </span>
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-ink-100/70 dark:bg-night-700/70 capitalize">
                    {skill.ageMin}+
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <BottomSheet
        isOpen={selected !== null}
        onClose={closeSheet}
        title={
          phase === 'lesson'
            ? `Step ${stepIndex + 1} of ${totalSteps}`
            : phase === 'done'
              ? 'Nice work'
              : selected?.title ?? ''
        }
        snapPoints={phase === 'lesson' || phase === 'done' ? [0.55, 0.88] : [0.4, 0.92]}
      >
        {selected && (
          <AnimatePresence mode="wait">
            {phase === 'overview' && (
              <motion.div
                key="overview"
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <div
                  className="relative overflow-hidden p-4 rounded-card"
                  style={{ background: `linear-gradient(135deg, ${selected.color}22, ${selected.color}11)` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-[16px] flex items-center justify-center shadow-soft"
                      style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)` }}
                    >
                      {(() => {
                        const Icon = categoryIcons[selected.category];
                        return <Icon size={22} className="text-white" strokeWidth={2.25} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-micro uppercase tracking-[0.14em] text-ink-600 font-bold">
                        Taught by
                      </p>
                      <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                        {selected.teacherFlag} {selected.teacher}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-body text-ink-900 dark:text-ink-100 leading-relaxed">
                  {selected.description}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Time', value: selected.duration, Icon: Clock },
                    { label: 'Ages', value: `${selected.ageMin}+`, Icon: Users },
                    { label: 'Level', value: selected.difficulty, Icon: GraduationCap },
                  ].map((s) => {
                    const Icon = s.Icon;
                    return (
                      <div key={s.label} className="p-2.5 rounded-card glass text-center">
                        <Icon size={14} className="mx-auto text-lighthouse-600" strokeWidth={2.5} />
                        <p className="mt-1 text-[9px] uppercase tracking-[0.1em] font-bold text-ink-600 dark:text-ink-300">
                          {s.label}
                        </p>
                        <p className="font-display font-bold text-caption text-ink-900 dark:text-ink-100 capitalize">
                          {s.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p className="text-caption text-ink-600 dark:text-ink-300">
                  {totalSteps} guided steps · tap {alreadyLearned ? 'Review' : 'Start'} to begin
                </p>

                <motion.button
                  type="button"
                  className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title flex items-center justify-center gap-2 shadow-medium shine"
                  whileTap={{ scale: 0.97 }}
                  onClick={startLesson}
                >
                  {alreadyLearned ? (
                    <>
                      <RotateCcw size={18} strokeWidth={2.5} />
                      Review
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="white" />
                      Start learning
                    </>
                  )}
                </motion.button>

                <p className="text-[11px] text-ink-600 dark:text-ink-300 text-center">
                  Ask an adult to watch the first time if there are hot pans, sharp tools, or tall places.
                </p>
              </motion.div>
            )}

            {phase === 'lesson' && (
              <motion.div
                key={`lesson-${stepIndex}`}
                className="space-y-4"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <div className="h-1.5 rounded-full bg-ink-100 dark:bg-night-600 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${selected.color}, #FF6B7A)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                  />
                </div>

                <div
                  className="p-4 rounded-card"
                  style={{ background: `linear-gradient(135deg, ${selected.color}18, ${selected.color}08)` }}
                >
                  <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
                    {selected.teacherFlag} {selected.teacher} says
                  </p>
                  <p className="mt-2 font-display font-bold text-title text-ink-900 dark:text-ink-100 leading-snug">
                    {steps[stepIndex]}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    className="flex-1 py-3.5 rounded-capsule glass font-display font-bold text-body text-ink-900 dark:text-ink-100 flex items-center justify-center gap-1.5"
                    whileTap={{ scale: 0.97 }}
                    onClick={goBackStep}
                  >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    className="flex-[1.4] py-3.5 rounded-capsule hero-glow text-white font-display font-bold text-body flex items-center justify-center gap-1.5 shadow-medium"
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                  >
                    {isLastStep ? (
                      <>
                        Finish
                        <Check size={18} strokeWidth={2.5} />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                key="done"
                className="py-2 space-y-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-center space-y-2">
                  <Lumi pose="cheering" size={72} />
                  <p className="font-display font-bold text-title text-mint-700 dark:text-mint-300">
                    You finished the lesson!
                  </p>
                  <p className="text-caption text-ink-600 dark:text-ink-300 leading-relaxed px-2">
                    {selected.title} — keep practicing once more this week if you can.
                  </p>
                </div>

                {selected.sources.length > 0 && (
                  <div className="rounded-card glass-strong p-3.5 text-left">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen size={14} className="text-lighthouse-600 shrink-0" strokeWidth={2.5} />
                      <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
                        Reliable sources
                      </p>
                    </div>
                    <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-snug mb-2.5">
                      Want more accurate detail? Open a trusted guide:
                    </p>
                    <ul className="space-y-2">
                      {selected.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 text-caption font-semibold text-lighthouse-600 dark:text-lighthouse-300 underline underline-offset-2 decoration-lighthouse-500/40 hover:decoration-lighthouse-500 focus-ring rounded-md"
                          >
                            <ExternalLink size={14} className="shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="leading-snug">{source.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.button
                  type="button"
                  className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium"
                  whileTap={{ scale: 0.97 }}
                  onClick={closeSheet}
                >
                  Back to Learning Center
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </BottomSheet>
    </div>
  );
}
