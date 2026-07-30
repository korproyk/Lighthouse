/**
 * DEV-ONLY preview page for Weekly Insights.
 *
 * Open: http://127.0.0.1:5173/weekly-insights-preview
 *
 * REMOVE BEFORE PRODUCTION:
 * 1. Delete this file
 * 2. Remove the route from `src/main.tsx`
 * 3. Delete `src/dev/demoWeeklyInsights.ts` if unused elsewhere
 */

import { Navigate, useNavigate } from 'react-router-dom';
import WeeklyInsights from '../components/WeeklyInsights';
import {
  WEEKLY_INSIGHTS_PREVIEW,
  buildDemoWeeklyCheckIns,
} from './demoWeeklyInsights';

export default function WeeklyInsightsPreviewPage() {
  const navigate = useNavigate();

  // Production builds must never expose this preview.
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  const checkIns = buildDemoWeeklyCheckIns();

  return (
    <div className="app-container bg-cream dark:bg-night-900">
      <div className="app-shell relative">
        <div className="flex-1 min-h-0 screen-scroll px-6 pt-8">
          <p className="text-micro uppercase tracking-[0.14em] font-bold text-lighthouse-600 mb-2">
            Dev preview
          </p>
          <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
            Weekly Insights
          </h1>
          <p className="mt-2 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
            Sample data only — nothing is saved to an account. Close the sheet to return home.
          </p>
        </div>

        <WeeklyInsights
          isOpen
          onClose={() => navigate('/')}
          insight={WEEKLY_INSIGHTS_PREVIEW.insight}
          checkInsOverride={checkIns}
          isDemo
          sheetTitle={WEEKLY_INSIGHTS_PREVIEW.sheetTitle}
          howCopy={{ ...WEEKLY_INSIGHTS_PREVIEW.howCopy }}
          showWeeklyProgress
          weeklyProgressFilled={[...WEEKLY_INSIGHTS_PREVIEW.weeklyProgressFilled]}
        />
      </div>
    </div>
  );
}
