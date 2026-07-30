import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userProfile, checkIns, challenges, badges, SLEEP_GOAL_HOURS } from './mockData';
import type { CheckIn, Challenge, Badge, ChallengeGroup } from './mockData';
import { setLanguage } from './i18n';
import { refreshChallengeList, resetAllChallengeProgress } from './challengeCycle';
import { tierFromXp, tierProgressPercent, type TierId } from './tiers';
import {
  computeLifeBalanceScore,
  generateDailyTip,
  generateWeeklyInsight,
  generatePersonalChallenge,
  canUnlockWeeklyInsights,
  type WeeklyInsight,
  type PersonalChallenge,
} from './lifeBalance';
import { addLocalDays, localDateKey } from './dates';

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
  /** Locked at bedtime — subtract 20 min on wake for a more accurate result. */
  minus20: boolean;
}

export interface SleepRecord {
  startedAt: number;
  endedAt: number;
  hours: number;
}

export interface TierUpCelebrationState {
  fromId: TierId;
  toId: TierId;
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
  dailyTip: string | null;
  weeklyInsight: WeeklyInsight | null;
  lastWeeklyInsightAt: string | null;
  personalChallenge: PersonalChallenge | null;
  /** Ephemeral — shown globally when XP crosses a tier threshold. */
  tierUpCelebration: TierUpCelebrationState | null;
  /** Tracks which RESET ALL TIERS! wipe has been applied. */
  tierProgressEpoch: number;

  setOnboarded: () => void;
  toggleDarkMode: () => void;
  toggleUvMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveTab: (tab: number) => void;
  completeChallenge: (id: string, proofDataUrl?: string) => void;
  completePersonalChallenge: (proofDataUrl: string) => boolean;
  ensurePersonalChallenge: () => void;
  dismissTierUp: () => void;
  refreshExpiredChallenges: () => void;
  logCheckIn: (data: Partial<CheckIn>) => void;
  logDailyCheckIn: (data: {
    mood: number;
    sleep: number;
    screenTime: number;
    socialBattery: number;
  }) => { score: number; tip: string; weeklyReady: boolean } | null;
  dismissWeeklyInsight: () => void;
  ensureWeeklyInsight: () => void;
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
  startSleepSession: (minus20: boolean) => void;
  stopSleepSession: (adjustMs?: number) => SleepRecord | null;
  cancelSleepSession: () => void;
  joinGroup: (id: string) => boolean;
  leaveGroup: () => void;
  createGroup: (name: string) => ChallengeGroup | null;
}

function accountKey(nickname: string): string {
  return nickname.trim().toLowerCase();
}

/**
 * Bumped only on explicit `RESET ALL TIERS!`.
 * Merge checks this every hydrate so the wipe can't be skipped.
 */
export const TIER_PROGRESS_EPOCH = 1;

function wipeUserChallengeProgress<
  T extends {
    totalChallenges?: number;
    xp?: number;
    tier?: string;
    tierProgress?: number;
    currentScore?: number;
  },
>(user: T | undefined, wipeLifeBalanceScore = false): T | undefined {
  if (!user) return user;
  return {
    ...user,
    totalChallenges: 0,
    xp: 0,
    tier: 'spark',
    tierProgress: 0,
    ...(wipeLifeBalanceScore ? { currentScore: 0 } : {}),
  };
}

function resetPersonalChallenge(
  challenge: PersonalChallenge | null | undefined
): PersonalChallenge | null {
  if (!challenge) return null;
  if (!challenge.completed && !challenge.proofDataUrl) return challenge;
  return {
    ...challenge,
    completed: false,
    completedAt: undefined,
    proofDataUrl: undefined,
  };
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
            proofDataUrl: prev.proofDataUrl,
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
      dailyTip: null,
      weeklyInsight: null,
      lastWeeklyInsightAt: null,
      personalChallenge: null,
      tierUpCelebration: null,
      tierProgressEpoch: TIER_PROGRESS_EPOCH,

      setOnboarded: () => set({ hasOnboarded: true }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleUvMode: () => set((s) => ({ uvMode: !s.uvMode })),
      setLanguage: (lang) => {
        setLanguage(lang);
        set({ language: lang });
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      completeChallenge: (id, proofDataUrl) =>
        set((s) => {
          const target = s.challenges.find((c) => c.id === id);
          if (!target || target.completed) return s;
          // Non-sleep challenges need a proof photo.
          if (target.tracker !== 'sleep' && !proofDataUrl) return s;
          const prevXp = s.user.xp ?? 0;
          const nextXp = prevXp + target.points;
          const prevTier = tierFromXp(prevXp);
          const nextTier = tierFromXp(nextXp);
          return {
            challenges: s.challenges.map((c) =>
              c.id === id
                ? {
                    ...c,
                    completed: true,
                    completedAt: Date.now(),
                    ...(proofDataUrl ? { proofDataUrl } : {}),
                  }
                : c
            ),
            user: {
              ...s.user,
              // Challenge pts → XP / tiers. Life Balance stays check-in-only.
              xp: nextXp,
              tier: nextTier.id,
              tierProgress: tierProgressPercent(nextXp),
              totalChallenges: s.user.totalChallenges + 1,
            },
            tierUpCelebration:
              prevTier.id !== nextTier.id
                ? { fromId: prevTier.id, toId: nextTier.id }
                : s.tierUpCelebration,
          };
        }),
      completePersonalChallenge: (proofDataUrl) => {
        const s = get();
        const challenge = s.personalChallenge;
        if (!challenge || challenge.completed || !proofDataUrl) return false;
        const today = localDateKey();
        if (challenge.date !== today) return false;
        const prevXp = s.user.xp ?? 0;
        const nextXp = prevXp + challenge.points;
        const prevTier = tierFromXp(prevXp);
        const nextTier = tierFromXp(nextXp);
        set({
          personalChallenge: {
            ...challenge,
            completed: true,
            completedAt: Date.now(),
            proofDataUrl,
          },
          user: {
            ...s.user,
            xp: nextXp,
            tier: nextTier.id,
            tierProgress: tierProgressPercent(nextXp),
            totalChallenges: s.user.totalChallenges + 1,
          },
          tierUpCelebration:
            prevTier.id !== nextTier.id
              ? { fromId: prevTier.id, toId: nextTier.id }
              : s.tierUpCelebration,
        });
        return true;
      },
      ensurePersonalChallenge: () => {
        const s = get();
        const today = localDateKey();
        const todayRow = s.checkIns.find((c) => c.date === today);
        if (!todayRow?.completed) {
          if (s.personalChallenge) set({ personalChallenge: null });
          return;
        }
        if (s.personalChallenge?.date === today) return;
        set({
          personalChallenge: generatePersonalChallenge(
            {
              mood: todayRow.mood,
              sleep: todayRow.sleep,
              screenTime: todayRow.screenTime,
              socialBattery: todayRow.socialBattery,
              score: todayRow.score,
            },
            today
          ),
        });
      },
      dismissTierUp: () => set({ tierUpCelebration: null }),
      refreshExpiredChallenges: () =>
        set((s) => {
          const next = refreshChallengeList(s.challenges);
          // Align the done count with cards still inside the 2-week window.
          const stillDone = next.filter((c) => c.completed).length;
          return {
            challenges: next,
            user:
              stillDone === s.user.totalChallenges
                ? s.user
                : { ...s.user, totalChallenges: stillDone },
          };
        }),
      logCheckIn: (data) =>
        set((s) => {
          const today = localDateKey();
          return {
            checkIns: s.checkIns.map((c) =>
              c.date === today ? { ...c, ...data, completed: true } : c
            ),
          };
        }),
      logDailyCheckIn: (data) => {
        const s = get();
        const today = localDateKey();
        const todayRow = s.checkIns.find((c) => c.date === today);
        if (todayRow?.completed) return null;

        const score = computeLifeBalanceScore(data);
        const tip = generateDailyTip({ ...data, score });

        const nextCheckIns = s.checkIns.map((c) =>
          c.date === today
            ? {
                ...c,
                ...data,
                score,
                tip,
                completed: true,
              }
            : c
        );

        // Ensure today exists even if seed was missing it.
        const hasToday = nextCheckIns.some((c) => c.date === today);
        const withToday = hasToday
          ? nextCheckIns
          : [
              ...nextCheckIns,
              {
                date: today,
                ...data,
                score,
                tip,
                completed: true,
              },
            ];

        const completedBefore = s.checkIns.filter((c) => c.completed).length;
        const completedAfter = withToday.filter((c) => c.completed).length;
        const weeklyReady = canUnlockWeeklyInsights(withToday);
        const needsFreshWeekly =
          weeklyReady &&
          (!s.lastWeeklyInsightAt ||
            Date.now() - new Date(s.lastWeeklyInsightAt).getTime() >= 7 * 24 * 60 * 60 * 1000 ||
            (completedBefore < 7 && completedAfter >= 7));

        const weeklyInsight = needsFreshWeekly
          ? generateWeeklyInsight(withToday)
          : s.weeklyInsight;

        const yesterday = withToday.find(
          (c) => c.date === addLocalDays(today, -1)
        );
        const weeklyChange = yesterday?.completed ? score - yesterday.score : s.user.weeklyChange;

        const personalChallenge = generatePersonalChallenge(
          { ...data, score },
          today
        );

        set({
          checkIns: withToday,
          dailyTip: tip,
          personalChallenge,
          weeklyInsight: weeklyInsight ?? s.weeklyInsight,
          lastWeeklyInsightAt: needsFreshWeekly && weeklyInsight
            ? weeklyInsight.generatedAt
            : s.lastWeeklyInsightAt,
          user: {
            ...s.user,
            // Life Balance only — never touches XP / tier.
            currentScore: score,
            weeklyChange,
            currentStreak: s.user.currentStreak + 1,
          },
        });

        return { score, tip, weeklyReady };
      },
      dismissWeeklyInsight: () => set({ weeklyInsight: null }),
      ensureWeeklyInsight: () => {
        const s = get();
        if (!canUnlockWeeklyInsights(s.checkIns)) return;
        const stale =
          !s.lastWeeklyInsightAt ||
          Date.now() - new Date(s.lastWeeklyInsightAt).getTime() >= 7 * 24 * 60 * 60 * 1000;
        if (s.weeklyInsight && !stale) return;
        const insight = generateWeeklyInsight(s.checkIns);
        if (!insight) return;
        set({
          weeklyInsight: insight,
          lastWeeklyInsightAt: insight.generatedAt,
        });
      },
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
          sleepSession: null,
          lastSleep: null,
          joinedGroupId: null,
          customGroups: [],
          dailyTip: null,
          weeklyInsight: null,
          lastWeeklyInsightAt: null,
          personalChallenge: null,
          tierUpCelebration: null,
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
          xp: 0,
          currentStreak: 0,
          weeklyChange: 0,
          totalChallenges: 0,
          memberSince: localDateKey(),
        };
        const freshCheckIns = s.checkIns.map((c) => ({
          ...c,
          mood: 0,
          screenTime: 0,
          sleep: 0,
          socialBattery: 0,
          score: 0,
          tip: undefined,
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
          dailyTip: null,
          weeklyInsight: null,
          lastWeeklyInsightAt: null,
          personalChallenge: null,
          tierUpCelebration: null,
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
          personalChallenge: null,
          dailyTip: null,
          tierUpCelebration: null,
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
      startSleepSession: (minus20) =>
        set({ sleepSession: { startedAt: Date.now(), minus20: Boolean(minus20) } }),
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
        const today = localDateKey();
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
          createdAt: localDateKey(),
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
      // Keep bumping with RESET ALL TIERS!; merge also enforces TIER_PROGRESS_EPOCH.
      version: 5,
      migrate: async (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        // Always return state — the real wipe is enforced in merge via epoch.
        if (fromVersion >= 5) return state;

        const wipeLifeBalance = fromVersion < 2;
        const wipeAccount = (account: Account): Account => ({
          ...account,
          user:
            wipeUserChallengeProgress(account.user, wipeLifeBalance) ??
            account.user,
          challenges: resetAllChallengeProgress(
            mergeChallengeCatalog(account.challenges, challenges)
          ),
        });

        return {
          ...state,
          user:
            wipeUserChallengeProgress(state.user, wipeLifeBalance) ?? state.user,
          challenges: resetAllChallengeProgress(
            mergeChallengeCatalog(state.challenges, challenges)
          ),
          personalChallenge: resetPersonalChallenge(state.personalChallenge),
          tierUpCelebration: null,
          tierProgressEpoch: TIER_PROGRESS_EPOCH,
          accounts: Object.fromEntries(
            Object.entries(state.accounts ?? {}).map(([key, account]) => [
              key,
              wipeAccount(account),
            ])
          ),
        };
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const normalizeUser = <T extends typeof userProfile>(
          user: T | undefined
        ): T | undefined => {
          if (!user) return user;
          const xp = typeof user.xp === 'number' ? user.xp : 0;
          const tier = tierFromXp(xp);
          return {
            ...user,
            xp,
            tier: tier.id,
            tierProgress: tierProgressPercent(xp),
          };
        };

        const storedEpoch =
          typeof (p as { tierProgressEpoch?: number }).tierProgressEpoch ===
          'number'
            ? (p as { tierProgressEpoch: number }).tierProgressEpoch
            : 0;
        const needsTierWipe = storedEpoch < TIER_PROGRESS_EPOCH;

        let nextUser =
          normalizeUser(p.user as typeof userProfile) ?? current.user;
        let nextChallenges = mergeChallengeCatalog(p.challenges, challenges);
        let nextPersonal = (p.personalChallenge ??
          current.personalChallenge) as PersonalChallenge | null;
        let nextAccounts = Object.fromEntries(
          Object.entries(p.accounts ?? current.accounts).map(([key, account]) => [
            key,
            {
              ...account,
              user: normalizeUser(account.user) ?? account.user,
              challenges: mergeChallengeCatalog(account.challenges, challenges),
            },
          ])
        );

        if (needsTierWipe) {
          nextUser = wipeUserChallengeProgress(nextUser) ?? nextUser;
          nextChallenges = resetAllChallengeProgress(nextChallenges);
          nextPersonal = resetPersonalChallenge(nextPersonal);
          nextAccounts = Object.fromEntries(
            Object.entries(nextAccounts).map(([key, account]) => [
              key,
              {
                ...account,
                user: wipeUserChallengeProgress(account.user) ?? account.user,
                challenges: resetAllChallengeProgress(account.challenges),
              },
            ])
          );
        }

        return {
          ...current,
          ...p,
          user: nextUser,
          challenges: nextChallenges,
          personalChallenge: nextPersonal,
          tierUpCelebration: needsTierWipe ? null : current.tierUpCelebration,
          tierProgressEpoch: TIER_PROGRESS_EPOCH,
          accounts: nextAccounts,
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
        dailyTip: state.dailyTip,
        weeklyInsight: state.weeklyInsight,
        lastWeeklyInsightAt: state.lastWeeklyInsightAt,
        personalChallenge: state.personalChallenge,
        tierProgressEpoch: state.tierProgressEpoch,
      }),
    }
  )
);
