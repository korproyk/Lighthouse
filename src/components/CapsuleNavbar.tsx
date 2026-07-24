import { motion } from 'framer-motion';
import { Home, Target, Users, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';

const tabs = [
  { icon: Home, label: 'nav.home' },
  { icon: Target, label: 'nav.challenges' },
  { icon: Sparkles, label: 'nav.lightbot', center: true },
  { icon: Users, label: 'nav.community' },
  { icon: null, label: 'nav.you' },
];

interface CapsuleNavbarProps {
  onLightBotPress: () => void;
  onLightBotLongPress: () => void;
}

export default function CapsuleNavbar({ onLightBotPress, onLightBotLongPress }: CapsuleNavbarProps) {
  const { activeTab, setActiveTab, lightBotHasNudge, user } = useStore();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = (idx: number) => {
    if (idx === 2) {
      longPressTimer.current = setTimeout(() => {
        onLightBotLongPress();
        longPressTimer.current = null;
      }, 500);
    }
  };

  const handlePointerUp = (idx: number) => {
    if (idx === 2 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onLightBotPress();
    }
  };

  return (
    <nav
      className="fixed left-4 right-4 z-30 capsule-nav rounded-capsule flex items-center px-2"
      style={{
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        height: 68,
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <div className="relative flex items-center justify-around w-full h-full">
        {/* Sliding active pill (glass highlight) */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: 8,
            bottom: 8,
            width: `calc((100% / ${tabs.length}) - 6px)`,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px rgba(255,181,71,0.25)',
            zIndex: 0,
          }}
          animate={{
            left: `calc(${(activeTab / tabs.length) * 100}% + 3px)`,
            opacity: activeTab === 2 ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />

        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          const isCenter = idx === 2;

          if (isCenter) {
            return (
              <motion.button
                key={idx}
                className="relative flex items-center justify-center focus-ring"
                style={{ width: 60, height: 60, marginTop: -18, zIndex: 2 }}
                whileTap={{ scale: 0.9 }}
                onPointerDown={() => handlePointerDown(idx)}
                onPointerUp={() => handlePointerUp(idx)}
                onPointerCancel={() => {
                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                }}
                aria-label={t(tab.label)}
              >
                {/* Outer halo */}
                <motion.div
                  className="absolute inset-[-10px] rounded-full hero-glow opacity-30 blur-lg"
                  animate={lightBotHasNudge ? { scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] } : undefined}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
                {/* Ring */}
                <div
                  className="absolute inset-[-3px] rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #FFB547, #FF6B7A, #A78BFA, #FFB547)',
                  }}
                />
                {/* Inner body */}
                <div className="absolute inset-0 rounded-full hero-glow shadow-[0_10px_24px_rgba(255,107,122,0.45)] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 45%)',
                    }}
                  />
                </div>
                <Sparkles className="relative z-10 text-white drop-shadow" size={24} strokeWidth={2} fill="white" />
              </motion.button>
            );
          }

          if (idx === 4) {
            return (
              <motion.button
                key={idx}
                className="relative flex items-center justify-center gap-0 h-full focus-ring flex-1"
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(idx)}
                aria-label={t(tab.label)}
                style={{ zIndex: 1 }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold font-display transition-colors ${
                    isActive
                      ? 'hero-glow text-white shadow-[0_4px_10px_rgba(255,107,122,0.35)]'
                      : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  {user.name[0]}
                </div>
              </motion.button>
            );
          }

          const Icon = tab.icon!;

          return (
            <motion.button
              key={idx}
              className="relative flex items-center justify-center h-full focus-ring flex-1"
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(idx)}
              aria-label={t(tab.label)}
              style={{ zIndex: 1 }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className={
                    isActive
                      ? 'text-lighthouse-600'
                      : 'text-ink-300 dark:text-night-500'
                  }
                />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
