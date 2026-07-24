import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Target, Trophy, Globe, Settings, ChevronRight,
  Languages, Bell, Shield, LifeBuoy, Info, LogOut, Moon, Sun,
  Sunrise, Calendar, Heart, Smartphone, Brain, Megaphone,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { badges } from '../lib/mockData';
import BottomSheet from '../components/BottomSheet';
import Lumi from '../components/Lumi';

const tierData = {
  spark: { name: 'Spark', min: 0, max: 30, color: 'from-lighthouse-300 to-lighthouse-500' },
  flame: { name: 'Flame', min: 30, max: 60, color: 'from-lighthouse-500 to-coral-500' },
  beacon: { name: 'Beacon', min: 60, max: 85, color: 'from-coral-500 to-lavender-500' },
  keeper: { name: 'Lighthouse Keeper', min: 85, max: 100, color: 'from-lavender-500 to-ocean-500' },
};

const badgeIcons: Record<string, React.ElementType> = {
  sunrise: Sunrise, calendar: Calendar, target: Target, heart: Heart,
  moon: Moon, 'smartphone-off': Smartphone, globe: Globe, flame: Flame,
  megaphone: Megaphone, brain: Brain, lighthouse: Flame, trophy: Trophy,
};

export default function Profile() {
  const { user, darkMode, toggleDarkMode, setLanguage, language, logOut } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTierUp, setShowTierUp] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const tier = tierData[user.tier];
  const tierProgress = ((user.currentScore - tier.min) / (tier.max - tier.min)) * 100;
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  const handleLogOut = () => {
    setShowSettings(false);
    logOut();
  };

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      {/* Hero glass card */}
      <div className="px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <motion.div
          className="relative overflow-hidden rounded-hero glass-strong p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.65), transparent 70%)', filter: 'blur(30px)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.4), transparent 70%)', filter: 'blur(30px)' }}
          />

          {/* Settings gear */}
          <motion.button
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center focus-ring z-10"
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <Settings size={18} className="text-ink-900 dark:text-ink-100" />
          </motion.button>

          {/* Top row: avatar + identity */}
          <div className="relative flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full hero-glow blur-xl opacity-60 scale-110" />
              <div className="relative w-20 h-20 rounded-full hero-glow flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white shadow-medium">
                {user.name[0]}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center ring-2 ring-white shadow-soft`}>
                <Flame size={14} className="text-white" fill="white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-micro uppercase tracking-[0.16em] text-ink-600 dark:text-ink-300 font-bold">
                {tier.name}
              </p>
              <h1 className="mt-0.5 font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight truncate">
                {user.name}
              </h1>
              <p className="text-caption text-ink-600 dark:text-ink-300 mt-0.5">
                {user.countryFlag} {user.country} &middot; {t('profile.member_since')} {new Date(user.memberSince).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Tier progress */}
          <motion.button
            className="relative w-full mt-4 text-left"
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowTierUp(true)}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-caption font-semibold text-ink-700 dark:text-ink-200">
                Next tier: <span className="font-display font-bold">{Math.round(tierProgress)}%</span>
              </span>
              <span className="text-[11px] text-ink-600 dark:text-ink-300 font-bold">
                {user.currentScore} / {tier.max}
              </span>
            </div>
            <div className="h-2.5 bg-white/40 dark:bg-night-700/60 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${tier.color} relative`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, tierProgress)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="absolute inset-0 shine" />
              </motion.div>
            </div>
          </motion.button>

          {/* Stats trio inside hero */}
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              { label: t('profile.score'), value: user.currentScore, Icon: Trophy, color: 'text-lighthouse-600' },
              { label: t('profile.streak'), value: `${user.currentStreak}d`, Icon: Flame, color: 'text-coral-500' },
              { label: t('profile.challenges_done'), value: user.totalChallenges, Icon: Target, color: 'text-mint-500' },
            ].map((stat) => {
              const Icon = stat.Icon;
              return (
                <div key={stat.label} className="p-3 rounded-card glass text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon size={12} className={stat.color} strokeWidth={2.5} />
                    <p className="text-[10px] uppercase tracking-[0.1em] text-ink-600 dark:text-ink-300 font-bold">
                      {stat.label}
                    </p>
                  </div>
                  <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100 mt-1">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Badges */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
            {t('profile.badges')}
          </h3>
          <span className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold">
            {earnedBadges.length} / {badges.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {earnedBadges.map((badge, i) => {
            const Icon = badgeIcons[badge.icon] ?? Trophy;
            return (
              <motion.div
                key={badge.id}
                className="relative overflow-hidden rounded-card glass-strong p-3 flex flex-col items-center text-center"
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.45), transparent 70%)', filter: 'blur(16px)' }}
                />
                <div className="relative">
                  <div className={`absolute inset-0 rounded-[18px] bg-gradient-to-br ${badge.gradient} blur-md opacity-50 scale-110`} />
                  <div className={`relative w-12 h-12 rounded-[18px] bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-soft`}>
                    <Icon size={20} className="text-white" strokeWidth={2} fill="white" />
                  </div>
                </div>
                <span className="relative mt-2 text-[11px] font-display font-bold text-ink-900 dark:text-ink-100 leading-tight">
                  {badge.name}
                </span>
                <span className="relative mt-0.5 text-[9px] uppercase tracking-[0.1em] font-bold text-mint-700 dark:text-mint-300">
                  Earned
                </span>
              </motion.div>
            );
          })}

          {lockedBadges.map((badge, i) => {
            const Icon = badgeIcons[badge.icon] ?? Trophy;
            return (
              <motion.div
                key={badge.id}
                className="relative rounded-card p-3 flex flex-col items-center text-center border-2 border-dashed border-ink-200 dark:border-night-600 bg-white/40 dark:bg-night-800/40"
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (earnedBadges.length + i) * 0.04 }}
              >
                <div className="w-12 h-12 rounded-[18px] bg-ink-100/70 dark:bg-night-700/70 flex items-center justify-center">
                  <Icon size={20} className="text-ink-300 dark:text-night-500" strokeWidth={2} />
                </div>
                <span className="mt-2 text-[11px] font-display font-bold text-ink-600 dark:text-ink-300 leading-tight">
                  {badge.name}
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.1em] font-bold text-ink-300">
                  Locked
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 mt-6">
        <motion.div
          className="relative overflow-hidden p-4 rounded-card glass-tint-warm"
          whileTap={{ scale: 0.97 }}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.5), transparent 70%)', filter: 'blur(22px)' }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                {t('profile.insights')}
              </p>
              <p className="text-caption text-ink-600 dark:text-ink-300 mt-0.5">
                Available after 14 days
              </p>
            </div>
            <ChevronRight size={18} className="text-lighthouse-600" />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 mt-8 mb-4 text-center">
        <p className="text-[11px] text-ink-300">
          Lighthouse v0.1 &middot; Built for e-ICON 2026 by Team Sundar Saeng (Beautiful Life)
        </p>
      </div>

      {/* Settings Sheet */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('profile.settings')}
      >
        <div className="space-y-1">
          <div className="pb-3 mb-2 border-b border-ink-100 dark:border-night-700">
            <SettingsRow icon={LogOut} label={t('settings.signout')} onClick={handleLogOut} danger />
          </div>
          <SettingsRow
            icon={Languages}
            label={t('settings.language')}
            value={language === 'en' ? 'English' : language === 'bn' ? '\u09AC\u09BE\u0982\u09B2\u09BE' : '\uD55C\uAD6D\uC5B4'}
            onClick={() => setShowLangPicker(true)}
          />
          <SettingsRow
            icon={darkMode ? Sun : Moon}
            label={darkMode ? 'Light Mode' : 'Dark Mode'}
            onClick={toggleDarkMode}
          />
          <SettingsRow icon={Bell} label={t('settings.notifications')} />
          <SettingsRow icon={Shield} label={t('settings.privacy')} />
          <SettingsRow icon={LifeBuoy} label={t('settings.crisis')} />
          <SettingsRow icon={Info} label={t('settings.about')} />
        </div>

        {/* Language picker inline */}
        <AnimatePresence>
          {showLangPicker && (
            <motion.div
              className="mt-4 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {[
                { code: 'en', name: 'English' },
                { code: 'bn', name: '\u09AC\u09BE\u0982\u09B2\u09BE' },
                { code: 'ko', name: '\uD55C\uAD6D\uC5B4' },
              ].map((lang) => (
                <motion.button
                  key={lang.code}
                  className={`w-full py-3 px-4 rounded-sm text-left font-display font-semibold ${
                    language === lang.code
                      ? 'bg-lighthouse-500 text-white'
                      : 'bg-ink-100 dark:bg-night-700 text-ink-900 dark:text-ink-100'
                  }`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangPicker(false);
                  }}
                >
                  {lang.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>

      {/* Tier-up celebration */}
      <AnimatePresence>
        {showTierUp && (
          <motion.div
            className="fixed inset-0 z-50 bg-night-900/90 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTierUp(false)}
          >
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-floating`}>
                <Lumi pose="cheering" size={80} animate={true} />
              </div>
              <motion.h2
                className="mt-6 font-display font-bold text-display-xl text-white text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                You're a {tier.name} now. {'\u2728'}
              </motion.h2>
              <motion.p
                className="mt-2 text-body text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Tap to continue
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  danger,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className="w-full flex items-center gap-3 py-3 px-1 focus-ring"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Icon
        size={18}
        className={danger ? 'text-coral-500' : 'text-ink-600 dark:text-ink-300'}
      />
      <span className={`flex-1 text-left text-body ${danger ? 'text-coral-500' : 'text-ink-900 dark:text-ink-100'}`}>
        {label}
      </span>
      {value && <span className="text-caption text-ink-300">{value}</span>}
      <ChevronRight size={16} className="text-ink-300" />
    </motion.button>
  );
}
