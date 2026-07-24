import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userProfile, checkIns, challenges, badges } from './mockData';
import type { CheckIn, Challenge, Badge } from './mockData';
import { setLanguage } from './i18n';

export interface Account {
  passwordHash: string;
  user: typeof userProfile;
  checkIns: CheckIn[];
  challenges: Challenge[];
  badges: Badge[];
  darkMode: boolean;
  uvMode: boolean;
  language: string;
}

interface AppState {
  hasOnboarded: boolean;
  darkMode: boolean;
  uvMode: boolean;
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
  accounts: Record<string, Account>;

  setOnboarded: () => void;
  toggleDarkMode: () => void;
  toggleUvMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveTab: (tab: number) => void;
  completeChallenge: (id: string) => void;
  logCheckIn: (data: Partial<CheckIn>) => void;
  dismissNudge: () => void;
  dismissEasterEgg: () => void;
  addBonusPoints: (points: number) => void;
  setUserName: (name: string) => void;
  logOut: () => void;
  hasAccount: (nickname: string) => boolean;
  createAccount: (
    nickname: string,
    passwordHash: string,
    details?: { country?: string; countryFlag?: string; ageRange?: string }
  ) => void;
  loginAccount: (nickname: string) => boolean;
  verifyAccountPassword: (nickname: string, passwordHash: string) => boolean;
  syncAccount: (nickname: string) => void;
}

function accountKey(nickname: string): string {
  return nickname.trim().toLowerCase();
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      darkMode: false,
      uvMode: false,
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
      accounts: {},

      setOnboarded: () => set({ hasOnboarded: true }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleUvMode: () => set((s) => ({ uvMode: !s.uvMode })),
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
      logOut: () => {
        const s = get();
        get().syncAccount(s.user.name);
        set({
          hasOnboarded: false,
          activeTab: 0,
        });
      },

      // --- Local nickname + password accounts ---
      // Each device can hold several nicknames side by side. A nickname's
      // progress is only readable/overwritable by whoever knows its password,
      // so logging out and picking an existing nickname can't silently clobber
      // or peek at someone else's saved data.
      hasAccount: (nickname) => Boolean(get().accounts[accountKey(nickname)]),
      verifyAccountPassword: (nickname, passwordHash) => {
        const account = get().accounts[accountKey(nickname)];
        return !!account && account.passwordHash === passwordHash;
      },
      createAccount: (nickname, passwordHash, details) => {
        const s = get();
        const freshUser = {
          ...userProfile,
          name: nickname.trim(),
          ...(details?.country ? { country: details.country } : {}),
          ...(details?.countryFlag ? { countryFlag: details.countryFlag } : {}),
          ...(details?.ageRange ? { ageRange: details.ageRange } : {}),
          language: s.language,
          tier: 'spark' as const,
          tierProgress: 0,
          currentScore: 0,
          currentStreak: 0,
          weeklyChange: 0,
          totalChallenges: 0,
          memberSince: new Date().toISOString().split('T')[0],
        };
        const freshCheckIns = s.checkIns.map((c) => ({
          ...c,
          mood: 0,
          screenTime: 0,
          sleep: 0,
          socialBattery: 0,
          score: 0,
          completed: false,
        }));
        const freshChallenges = s.challenges.map((c) => ({ ...c, completed: false }));
        const freshBadges = s.badges.map((b) => ({ ...b, earned: false, earnedDate: undefined }));

        set({
          accounts: {
            ...s.accounts,
            [accountKey(nickname)]: {
              passwordHash,
              user: freshUser,
              checkIns: freshCheckIns,
              challenges: freshChallenges,
              badges: freshBadges,
              darkMode: s.darkMode,
              uvMode: s.uvMode,
              language: s.language,
            },
          },
          user: freshUser,
          checkIns: freshCheckIns,
          challenges: freshChallenges,
          badges: freshBadges,
        });
      },
      loginAccount: (nickname) => {
        const account = get().accounts[accountKey(nickname)];
        if (!account) return false;
        setLanguage(account.language);
        set({
          user: account.user,
          checkIns: account.checkIns,
          challenges: account.challenges,
          badges: account.badges,
          darkMode: account.darkMode,
          uvMode: account.uvMode,
          language: account.language,
        });
        return true;
      },
      syncAccount: (nickname) => {
        const s = get();
        const key = accountKey(nickname);
        if (!s.accounts[key]) return;
        set({
          accounts: {
            ...s.accounts,
            [key]: {
              ...s.accounts[key],
              user: s.user,
              checkIns: s.checkIns,
              challenges: s.challenges,
              badges: s.badges,
              darkMode: s.darkMode,
              uvMode: s.uvMode,
              language: s.language,
            },
          },
        });
      },
    }),
    {
      name: 'lighthouse-storage',
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        darkMode: state.darkMode,
        uvMode: state.uvMode,
        language: state.language,
        user: state.user,
        checkIns: state.checkIns,
        challenges: state.challenges,
        badges: state.badges,
        accounts: state.accounts,
      }),
    }
  )
);
