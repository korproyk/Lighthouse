import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Users, TrendingUp, ArrowRight, Flame, Zap, Heart } from 'lucide-react';

interface SplashProps {
  onDone: () => void;
}

type Slide = {
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  icon: typeof Target;
  accent: string;
  preview: 'score' | 'streak' | 'ai' | 'community';
};

const slides: Slide[] = [
  {
    eyebrow: 'Small wins, real life',
    title: 'Build habits that',
    highlight: 'actually stick',
    body: 'Daily micro-challenges nudge you off the screen and into the world — one small, doable step at a time.',
    icon: Target,
    accent: 'from-lighthouse-300 to-lighthouse-500',
    preview: 'streak',
  },
  {
    eyebrow: 'Your week, visualized',
    title: 'Track what',
    highlight: 'actually matters',
    body: 'Sleep, screen time, and challenges — see your week light up as a single Life Balance score.',
    icon: TrendingUp,
    accent: 'from-lighthouse-500 to-coral-500',
    preview: 'score',
  },
  {
    eyebrow: 'Always in your corner',
    title: 'A gentle AI,',
    highlight: 'just for you',
    body: 'Lumi listens, suggests breathing space when you need it, and quietly celebrates your streaks.',
    icon: Sparkles,
    accent: 'from-coral-500 to-lighthouse-600',
    preview: 'ai',
  },
  {
    eyebrow: 'You, but together',
    title: 'Grow with',
    highlight: 'your people',
    body: 'Join quiet groups of teens building real-world skills together. No feeds, no pressure, just wins.',
    icon: Users,
    accent: 'from-lighthouse-600 to-coral-600',
    preview: 'community',
  },
];

export default function Splash({ onDone }: SplashProps) {
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;
  const slide = slides[step];
  const Icon = slide.icon;

  const next = () => {
    if (isLast) onDone();
    else setStep(step + 1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background:
          'radial-gradient(ellipse at 15% 0%, rgba(255, 178, 122, 0.65), transparent 50%),' +
          'radial-gradient(ellipse at 85% 100%, rgba(255, 77, 106, 0.45), transparent 55%),' +
          'radial-gradient(ellipse at 50% 55%, rgba(255, 202, 107, 0.35), transparent 60%),' +
          '#FAF7F2',
      }}
    >
      {/* Ambient drifting blobs */}
      <motion.div
        className="aurora-blob"
        style={{ width: 420, height: 420, top: '-10%', left: '-16%', background: 'radial-gradient(circle, #FFB27A 0%, transparent 70%)', opacity: 0.7 }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora-blob"
        style={{ width: 380, height: 380, bottom: '-12%', right: '-14%', background: 'radial-gradient(circle, #FF4D6A 0%, transparent 70%)', opacity: 0.4 }}
        animate={{ x: [0, -24, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora-blob"
        style={{ width: 280, height: 280, top: '35%', right: '-10%', background: 'radial-gradient(circle, #FFCA6B 0%, transparent 70%)', opacity: 0.35 }}
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="noise-overlay" />

      {/* Top bar */}
      <div
        className="relative flex items-center justify-between px-6 pt-4"
        style={{ paddingTop: 'calc(20px + env(safe-area-inset-top))', zIndex: 2 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="relative w-10 h-10 rounded-[14px] hero-glow shadow-medium flex items-center justify-center overflow-hidden"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7), transparent 45%)' }} />
            <Sparkles className="relative z-10 text-white" size={20} strokeWidth={2.25} fill="white" />
          </motion.div>
          <div>
            <p className="font-display font-bold text-ink-900 tracking-tight leading-none" style={{ fontSize: 18 }}>
              Lighthouse
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-600 mt-0.5">
              Balance. Beautifully.
            </p>
          </div>
        </div>

        {!isLast && (
          <motion.button
            className="text-caption font-semibold text-ink-600 px-3 py-1.5 rounded-capsule focus-ring glass"
            whileTap={{ scale: 0.96 }}
            onClick={onDone}
          >
            Skip
          </motion.button>
        )}
      </div>

      {/* Slide content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6" style={{ zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex flex-col items-center max-w-[380px] w-full"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glass preview card with floating icon */}
            <div className="relative w-full rounded-hero glass-strong overflow-hidden p-6 mb-8">
              {/* inner gradient orbs */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(24px)' }}
              />
              <div
                className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.4), transparent 70%)', filter: 'blur(26px)' }}
              />

              <div className="relative flex items-start gap-4">
                {/* Medallion */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${slide.accent} blur-lg opacity-60`}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className={`relative w-16 h-16 rounded-[20px] bg-gradient-to-br ${slide.accent} flex items-center justify-center shadow-medium`}>
                    <Icon size={28} strokeWidth={2} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-micro uppercase tracking-[0.16em] text-ink-600">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-1 font-display font-bold text-ink-900 tracking-tight" style={{ fontSize: 26, lineHeight: 1.1 }}>
                    {slide.title}{' '}
                    <span className="text-gradient-ember">{slide.highlight}</span>
                  </h1>
                </div>
              </div>

              {/* Preview widget specific to the slide */}
              <div className="relative mt-5">
                <PreviewWidget kind={slide.preview} />
              </div>
            </div>

            <p className="text-body text-ink-600 text-center leading-relaxed px-2">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="relative flex items-center justify-center gap-2 mb-6" style={{ zIndex: 2 }}>
        {slides.map((_, i) => (
          <motion.button
            key={i}
            className="h-2 rounded-full focus-ring"
            animate={{
              width: i === step ? 28 : 8,
              backgroundColor: i === step ? '#FF7A45' : 'rgba(14, 11, 8, 0.14)',
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => setStep(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div
        className="relative px-6 pb-8"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))', zIndex: 2 }}
      >
        <motion.button
          className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium flex items-center justify-center gap-2 shine"
          whileTap={{ scale: 0.97 }}
          onClick={next}
        >
          {isLast ? 'Get started' : 'Next'}
          <ArrowRight size={20} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function PreviewWidget({ kind }: { kind: Slide['preview'] }) {
  if (kind === 'score') {
    const days = [54, 62, 58, 71, 68, 74, 78];
    const max = Math.max(...days);
    return (
      <div className="rounded-card glass p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-micro uppercase tracking-[0.14em] text-ink-600">Life Balance</p>
            <p className="font-display font-bold text-title text-ink-900">78</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-capsule bg-mint-500/10 border border-mint-500/20 text-mint-700 text-[11px] font-bold">
            <Zap size={11} />
            +8 this week
          </div>
        </div>
        <div className="flex items-end gap-1 h-12">
          {days.map((d, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                background: i === days.length - 1
                  ? 'linear-gradient(180deg, #FF7A45, #FF4D6A)'
                  : 'linear-gradient(180deg, #FFCA6B, #FFB27A)',
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(d / max) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 160, damping: 22 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (kind === 'streak') {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
      <div className="rounded-card glass p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-micro uppercase tracking-[0.14em] text-ink-600">Today's quest</p>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-capsule bg-coral-500/10 border border-coral-500/20 text-coral-600 text-[11px] font-bold">
            <Flame size={11} fill="currentColor" />
            12-day streak
          </div>
        </div>
        <p className="font-display font-bold text-body text-ink-900">Tea with someone new</p>
        <p className="text-caption text-ink-600 mt-0.5">Listen more than you talk · 20 min</p>
        <div className="mt-3 flex gap-1.5">
          {days.map((d, i) => (
            <motion.div
              key={i}
              className={`flex-1 h-8 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                i <= 4
                  ? 'text-white'
                  : i === 5
                    ? 'text-coral-500'
                    : 'text-ink-300'
              }`}
              style={{
                background: i <= 4
                  ? 'linear-gradient(180deg, #FFCA6B, #FF7A45)'
                  : i === 5
                    ? 'rgba(255,77,106,0.1)'
                    : 'rgba(14,11,8,0.06)',
                border: i === 5 ? '1px solid rgba(255,77,106,0.4)' : undefined,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              {d}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === 'ai') {
    return (
      <div className="rounded-card glass p-4 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full hero-glow flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" fill="white" />
          </div>
          <div className="flex-1 rounded-[14px] bg-ink-100/70 px-3 py-2">
            <p className="text-caption text-ink-900">Hey, I noticed your sleep has dipped this week. Want to try a 4-7-8 breath?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <motion.div
            className="rounded-[14px] px-3 py-2 hero-glow max-w-[70%]"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-caption text-white font-medium">Yes please</p>
          </motion.div>
        </div>
        <div className="flex items-center gap-1 pl-10">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-300 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-ink-300 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-ink-300 typing-dot" />
        </div>
      </div>
    );
  }

  // community
  const members = [
    { n: 'A', g: 'from-lighthouse-300 to-lighthouse-500' },
    { n: 'M', g: 'from-coral-300 to-coral-500' },
    { n: 'J', g: 'from-lighthouse-500 to-coral-500' },
    { n: 'S', g: 'from-coral-500 to-lighthouse-600' },
  ];
  return (
    <div className="rounded-card glass p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-micro uppercase tracking-[0.14em] text-ink-600">Dhaka Dreamers</p>
          <p className="font-display font-bold text-body text-ink-900">4 friends · 2,140 pts</p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-capsule bg-lighthouse-500/10 border border-lighthouse-500/20 text-lighthouse-600 text-[11px] font-bold">
          <Heart size={11} fill="currentColor" />
          Together
        </div>
      </div>
      <div className="flex -space-x-2">
        {members.map((m, i) => (
          <motion.div
            key={i}
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.g} ring-2 ring-white flex items-center justify-center text-white text-caption font-bold`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            {m.n}
          </motion.div>
        ))}
        <motion.div
          className="w-10 h-10 rounded-full bg-white ring-2 ring-white flex items-center justify-center text-ink-600 text-[11px] font-bold border border-ink-100"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          +2
        </motion.div>
      </div>
    </div>
  );
}
