import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userProfile, checkIns, challenges, badges } from './mockData';
import type { CheckIn, Challenge, Badge } from './mockData';
import { setLanguage } from './i18n';

interface AppState {
  hasOnboarded: boolean;
  darkMode: boolean;
  language: string;
  reducedMotion: boolean;
  user: typeof userProfile;
  checkIns: CheckIn[];
  challenges: Challenge[];
  badges: Badge[];
  activeTab: number;
  lightBotHasNudge: boolean;
  sessionStartTime: number;
  showEasterEgg: boolean;

  setOnboarded: () => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveTab: (tab: number) => void;
  completeChallenge: (id: string) => void;
  logCheckIn: (data: Partial<CheckIn>) => void;
  dismissNudge: () => void;
  dismissEasterEgg: () => void;
  addBonusPoints: (points: number) => void;
  setUserName: (name: string) => void;
  logOut: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      darkMode: false,
      language: 'en',
      reducedMotion: false,
      user: userProfile,
      checkIns: checkIns,
      challenges: challenges,
      badges: badges,
      activeTab: 0,
      lightBotHasNudge: true,
      sessionStartTime: Date.now(),
      showEasterEgg: false,

      setOnboarded: () => set({ hasOnboarded: true }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setLanguage: (lang) => {
        setLanguage(lang);
        set({ language: lang });
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      completeChallenge: (id) =>
        set((s) => ({
          challenges: s.challenges.map((c) =>
            c.id === id ? { ...c, completed: true } : c
          ),
          user: {
            ...s.user,
            currentScore: Math.min(100, s.user.currentScore + (s.challenges.find((c) => c.id === id)?.points ?? 0) / 5),
            totalChallenges: s.user.totalChallenges + 1,
          },
        })),
      logCheckIn: (data) =>
        set((s) => {
          const today = new Date().toISOString().split('T')[0];
          return {
            checkIns: s.checkIns.map((c) =>
              c.date === today ? { ...c, ...data, completed: true } : c
            ),
          };
        }),
      dismissNudge: () => set({ lightBotHasNudge: false }),
      dismissEasterEgg: () => set({ showEasterEgg: false }),
      addBonusPoints: (points) =>
        set((s) => ({
          user: {
            ...s.user,
            currentScore: Math.min(100, s.user.currentScore + points),
          },
        })),
      setUserName: (name) =>
        set((s) => ({
          user: { ...s.user, name },
        })),
      logOut: () =>
        set({
          hasOnboarded: false,
          activeTab: 0,
        }),
    }),
    {
      name: 'lighthouse-storage',
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        darkMode: state.darkMode,
        language: state.language,
        user: state.user,
        checkIns: state.checkIns,
        challenges: state.challenges,
        badges: state.badges,
      }),
    }
  )
);
