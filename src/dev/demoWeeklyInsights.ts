/**
 * DEV-ONLY: Weekly Insights preview sample
 * ----------------------------------------
 * Used by `/weekly-insights-preview` and the optional Home demo button.
 * Does NOT write to Zustand / localStorage / real user accounts.
 *
 * REMOVE BEFORE PRODUCTION:
 * 1. Delete this file: `src/dev/demoWeeklyInsights.ts`
 * 2. Delete `src/dev/WeeklyInsightsPreviewPage.tsx`
 * 3. Remove the `/weekly-insights-preview` route from `src/main.tsx`
 * 4. Remove `import.meta.env.DEV` Demo Weekly Insights blocks from `src/screens/Home.tsx` (if present)
 * 5. Remove `isDemo` / `checkInsOverride` / `howCopy` / `showWeeklyProgress` props from
 *    `src/components/WeeklyInsights.tsx` if unused
 */

import type { CheckIn } from '../lib/mockData';
import {
  computeLifeBalanceScore,
  generateDailyTip,
  type WeeklyInsight,
} from '../lib/lifeBalance';

function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

type SampleDay = {
  mood: number;
  sleep: number;
  screenTime: number;
  socialBattery: number;
};

/** Sleep 6.5–8.2h, screen 1–5h — lower evening screen ↔ longer sleep / higher energy. */
const DEMO_DAY_SIGNALS: SampleDay[] = [
  { mood: 1, sleep: 6.5, screenTime: 5.0, socialBattery: 35 },
  { mood: 1, sleep: 6.6, screenTime: 4.8, socialBattery: 38 },
  { mood: 2, sleep: 6.9, screenTime: 4.0, socialBattery: 52 },
  { mood: 2, sleep: 7.1, screenTime: 3.2, socialBattery: 58 },
  { mood: 3, sleep: 7.5, screenTime: 2.4, socialBattery: 72 },
  { mood: 4, sleep: 7.9, screenTime: 1.6, socialBattery: 80 },
  { mood: 4, sleep: 8.2, screenTime: 1.2, socialBattery: 84 },
];

function toCheckIn(signals: SampleDay, date: string): CheckIn {
  const score = computeLifeBalanceScore(signals);
  return {
    date,
    ...signals,
    score,
    completed: true,
    tip: generateDailyTip({ ...signals, score }),
  };
}

export function buildDemoWeeklyCheckIns(): CheckIn[] {
  return DEMO_DAY_SIGNALS.map((signals, i) =>
    toCheckIn(signals, daysAgoIso(DEMO_DAY_SIGNALS.length - 1 - i))
  );
}

/** Fixed preview copy for the dedicated `/weekly-insights-preview` route. */
export const WEEKLY_INSIGHTS_PREVIEW = {
  sheetTitle: 'Your Weekly Insights',
  insight: {
    summary:
      'You tended to sleep longer and report higher energy on days with less evening screen time.',
    insightSummary:
      'You tended to sleep longer and report higher energy on days with less evening screen time.',
    insightTitle: 'Digital Sunset',
    evidenceSummary:
      'On lower-screen-time days, your average sleep was about 45 minutes longer.',
    recommendation: 'Try a 30-minute digital sunset before bedtime for the next 7 days.',
    dataCategoriesUsed: ['Sleep', 'Screen Time', 'Mood', 'Energy'],
    validDaysAnalyzed: 7,
    daysAnalyzed: 7,
    generatedAt: new Date().toISOString(),
    experiment: {
      id: 'preview-digital-sunset',
      title: 'Digital Sunset',
      description: 'Try a 30-minute digital sunset before bedtime for the next 7 days.',
    },
  } satisfies WeeklyInsight,
  howCopy: {
    validDaysLabel: '7 valid check-in days analyzed',
    categoriesLabel: 'Categories used: Sleep, Screen Time, Mood, Energy',
    patternLabel:
      'Main detected pattern: Lower evening screen time was associated with longer sleep and higher energy',
    explanationLabel:
      'Explanation: The comparison was based on repeated patterns across the sample check-ins',
  },
  /** All 7 sample days completed — for the weekly progress strip. */
  weeklyProgressFilled: [true, true, true, true, true, true, true] as boolean[],
} as const;

export function buildDemoWeeklyInsight(): {
  checkIns: CheckIn[];
  insight: WeeklyInsight;
} {
  const checkIns = buildDemoWeeklyCheckIns();
  return {
    checkIns,
    insight: { ...WEEKLY_INSIGHTS_PREVIEW.insight },
  };
}
