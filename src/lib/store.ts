import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userProfile, checkIns, challenges, badges, SLEEP_GOAL_HOURS } from './mockData';
import type { CheckIn, Challenge, Badge, ChallengeGroup } from './mockData';
import { setLanguage } from './i18n';
import { refreshChallengeList } from './challengeCycle';

export interface Account {
  passwordHash: string;
  user: typeof userProfile;
  checkIns: CheckIn[];
  challenges: Challenge[];
  badges: Badge[];
  darkMode: boolean;
  uvMode: boolean;
  language: string;
  joinedGroupId?: string | null;
  customGroups?: ChallengeGroup[];
}

export interface SleepSession {
  startedAt: number;
}

export interface SleepRecord {
  startedAt: number;
  endedAt: number;
  hours: number;
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
  sleepSession: SleepSession | null;
  lastSleep: SleepRecord | null;
  joinedGroupId: string | null;
  customGroups: ChallengeGroup[];

  setOnboarded: () => void;
  toggleDarkMode: () => void;
  toggleUvMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveTab: (tab: number) => void;
  completeChallenge: (id: string) => void;
  refreshExpiredChallenges: () => void;
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
  startSleepSession: () => void;
  stopSleepSession: (adjustMs?: number) => SleepRecord | null;
  cancelSleepSession: () => void;
  joinGroup: (id: string) => boolean;
  leaveGroup: () => void;
  createGroup: (name: string) => ChallengeGroup | null;
}

function accountKey(nickname: string): string {
  return nickname.trim().toLowerCase();
}

/** Keep completion from saved progress, but always include new seed quests
 *  (e.g. the required sleep tracker added after someone already onboarded).
 *  Also clear done flags once the 2-week redo window has passed. */
function mergeChallengeCatalog(saved: Challenge[] | undefined, seed: Challenge[]): Challenge[] {
  const byId = new Map((saved ?? []).map((c) => [c.id, c]));
  return refreshChallengeList(
    seed.map((seedChallenge) => {
      const prev = byId.get(seedChallenge.id);
      return prev
        ? {
            ...seedChallenge,
            completed: prev.completed,
            completedAt: prev.completedAt,
          }
        : { ...seedChallenge };
    })
  );
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
      sleepSession: null,
      lastSleep: null,
      joinedGroupId: null,
      customGroups: [],

      setOnboarded: () => set({ hasOnboarded: true }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleUvMode: () => set((s) => ({ uvMode: !s.uvMode })),
      setLanguage: (lang) => {
        setLanguage(lang);
        set({ language: lang });
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      completeChallenge: (id) =>
        set((s) => {
          const target = s.challenges.find((c) => c.id === id);
          if (!target || target.completed) return s;
          return {
            challenges: s.challenges.map((c) =>
              c.id === id
                ? { ...c, completed: true, completedAt: Date.now() }
                : c
            ),
            user: {
              ...s.user,
              currentScore: s.user.currentScore + (target.points ?? 0),
              totalChallenges: s.user.totalChallenges + 1,
            },
          };
        }),
      refreshExpiredChallenges: () =>
        set((s) => ({
          challenges: refreshChallengeList(s.challenges),
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
            currentScore: s.user.currentScore + points,
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
          sleepSession: null,
          lastSleep: null,
          joinedGroupId: null,
          customGroups: [],
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
          screenTime: 0,
          sleep: 0,
          score: 0,
          completed: false,
        }));
        const freshChallenges = challenges.map((c) => ({ ...c, completed: false }));
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
              joinedGroupId: null,
              customGroups: [],
            },
          },
          user: freshUser,
          checkIns: freshCheckIns,
          challenges: freshChallenges,
          badges: freshBadges,
          joinedGroupId: null,
          customGroups: [],
          sleepSession: null,
          lastSleep: null,
        });
      },
      loginAccount: (nickname) => {
        const account = get().accounts[accountKey(nickname)];
        if (!account) return false;
        setLanguage(account.language);
        set({
          user: account.user,
          checkIns: account.checkIns,
          challenges: mergeChallengeCatalog(account.challenges, challenges),
          badges: account.badges,
          darkMode: account.darkMode,
          uvMode: account.uvMode,
          language: account.language,
          joinedGroupId: account.joinedGroupId ?? null,
          customGroups: account.customGroups ?? [],
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
              joinedGroupId: s.joinedGroupId,
              customGroups: s.customGroups,
            },
          },
        });
      },

      // --- Sleep tracking ---
      // Only the bedtime stamp is stored, so elapsed time is always derived from
      // the clock. That keeps the count honest while the app is backgrounded,
      // killed, or the phone is locked all night.
      startSleepSession: () => set({ sleepSession: { startedAt: Date.now() } }),
      cancelSleepSession: () => set({ sleepSession: null }),
      stopSleepSession: (adjustMs = 0) => {
        const s = get();
        if (!s.sleepSession) return null;
        const endedAt = Date.now();
        const adjustedMs = Math.max(0, endedAt - s.sleepSession.startedAt - Math.max(0, adjustMs));
        const record: SleepRecord = {
          startedAt: s.sleepSession.startedAt,
          endedAt,
          hours: adjustedMs / 3_600_000,
        };
        const today = new Date().toISOString().split('T')[0];
        set({
          sleepSession: null,
          lastSleep: record,
          checkIns: s.checkIns.map((c) =>
            c.date === today ? { ...c, sleep: Math.round(record.hours * 10) / 10 } : c
          ),
        });
        if (record.hours >= SLEEP_GOAL_HOURS) {
          const quest = s.challenges.find((c) => c.tracker === 'sleep');
          if (quest && !quest.completed) get().completeChallenge(quest.id);
        }
        return record;
      },

      // One group at a time — join / create both fail if you're already in one.
      joinGroup: (id) => {
        if (get().joinedGroupId) return false;
        set({ joinedGroupId: id });
        return true;
      },
      leaveGroup: () => set({ joinedGroupId: null }),
      createGroup: (name) => {
        const s = get();
        if (s.joinedGroupId) return null;
        const trimmed = name.trim();
        if (!trimmed) return null;
        const code =
          trimmed.toUpperCase().replace(/\s+/g, '').slice(0, 4) +
          String(Math.floor(Math.random() * 90 + 10));
        const group: ChallengeGroup = {
          id: `created-${code}`,
          name: trimmed,
          code,
          members: [
            {
              name: s.user.name,
              avatar: (s.user.name?.[0] || 'Y').toUpperCase(),
              flag: s.user.countryFlag,
              score: Math.round(s.user.currentScore),
              challenges: s.user.totalChallenges,
            },
          ],
          totalScore: Math.round(s.user.currentScore),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set({
          customGroups: [...s.customGroups, group],
          joinedGroupId: group.id,
        });
        return group;
      },
    }),
    {
      name: 'lighthouse-storage',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          challenges: mergeChallengeCatalog(p.challenges, challenges),
          accounts: Object.fromEntries(
            Object.entries(p.accounts ?? current.accounts).map(([key, account]) => [
              key,
              {
                ...account,
                challenges: mergeChallengeCatalog(account.challenges, challenges),
              },
            ])
          ),
        };
      },
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
        sleepSession: state.sleepSession,
        lastSleep: state.lastSleep,
        joinedGroupId: state.joinedGroupId,
        customGroups: state.customGroups,
      }),
    }
  )
);
