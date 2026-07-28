import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './lib/store';
import { setLanguage } from './lib/i18n';
import CapsuleNavbar from './components/CapsuleNavbar';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Challenges from './screens/Challenges';
import LightBotChat from './screens/LightBot';
import Community from './screens/Community';
import Profile from './screens/Profile';
import BottomSheet from './components/BottomSheet';
import ScoreHistory from './components/ScoreHistory';

const screens = [Home, Challenges, null, Community, Profile];

export default function App() {
  const { hasOnboarded, activeTab, darkMode, uvMode, language } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  const [lightBotOpen, setLightBotOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [scoreHistoryOpen, setScoreHistoryOpen] = useState(false);

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (uvMode) {
      document.documentElement.classList.add('uv');
    } else {
      document.documentElement.classList.remove('uv');
    }
  }, [uvMode]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Easter egg: 15 minutes on-app
  const { sessionStartTime, showEasterEgg, dismissEasterEgg, addBonusPoints } = useStore();
  const [easterEggShown, setEasterEggShown] = useState(false);
  useEffect(() => {
    if (easterEggShown) return;
    const timer = setInterval(() => {
      if (Date.now() - sessionStartTime > 15 * 60 * 1000) {
        useStore.setState({ showEasterEgg: true });
        setEasterEggShown(true);
        clearInterval(timer);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime, easterEggShown]);

  if (showSplash) {
    return (
      <div className="app-container">
        <Splash onDone={() => setShowSplash(false)} />
      </div>
    );
  }

  if (!hasOnboarded) {
    return (
      <div className="app-container">
        <Onboarding />
      </div>
    );
  }

  const ActiveScreen = screens[activeTab];

  return (
    <div className="app-container bg-cream dark:bg-night-900">
      <div className="app-shell">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="flex-1 min-h-0 flex flex-col"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {ActiveScreen && <ActiveScreen />}
          </motion.div>
        </AnimatePresence>

        <CapsuleNavbar
          onLightBotPress={() => setLightBotOpen(true)}
          onLightBotLongPress={() => setQuickActionsOpen(true)}
        />
      </div>

      <LightBotChat isOpen={lightBotOpen} onClose={() => setLightBotOpen(false)} />

      {/* Quick actions sheet */}
      <BottomSheet
        isOpen={quickActionsOpen}
        onClose={() => setQuickActionsOpen(false)}
        title="Quick Actions"
        snapPoints={[0.3, 0.4]}
      >
        <div className="space-y-2">
          {[
            { label: 'Breathing exercise', emoji: '\u{1F32C}\u{FE0F}', action: () => { setQuickActionsOpen(false); setLightBotOpen(true); } },
            { label: 'Vent for 60s', emoji: '\u{1F4AC}', action: () => { setQuickActionsOpen(false); setLightBotOpen(true); } },
            { label: 'Pick a challenge', emoji: '\u{1F3AF}', action: () => { setQuickActionsOpen(false); useStore.setState({ activeTab: 1 }); } },
          ].map((item) => (
            <motion.button
              key={item.label}
              className="w-full flex items-center gap-3 p-4 rounded-card glass text-left focus-ring"
              whileTap={{ scale: 0.97 }}
              onClick={item.action}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-display font-semibold text-body text-ink-900 dark:text-ink-100">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </BottomSheet>

      <ScoreHistory isOpen={scoreHistoryOpen} onClose={() => setScoreHistoryOpen(false)} />

      {/* Easter egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            className="fixed bottom-28 left-4 right-4 z-40 max-w-[400px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="p-4 rounded-card glass-strong shadow-floating flex items-center gap-3">
              <span className="text-2xl">{'\u{1F3EE}'}</span>
              <div className="flex-1">
                <p className="text-caption font-semibold text-ink-900 dark:text-ink-100">
                  Hey — go look out the window for 60 seconds. I'll wait.
                </p>
              </div>
              <motion.button
                className="px-3 py-1.5 rounded-capsule bg-lighthouse-500 text-white text-caption font-bold"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  addBonusPoints(5);
                  dismissEasterEgg();
                }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
