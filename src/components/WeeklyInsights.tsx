import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, FlaskConical, ChevronDown } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { useStore } from '../lib/store';
import {
  WEEKLY_INSIGHT_METHOD_NOTE,
  buildWeeklyExplainability,
  type WeeklyInsight,
} from '../lib/lifeBalance';
import type { CheckIn } from '../lib/mockData';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export type WeeklyHowCopy = {
  validDaysLabel: string;
  categoriesLabel: string;
  patternLabel: string;
  explanationLabel: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  insight: WeeklyInsight | null;
  /** DEV-ONLY: use these check-ins for explainability instead of store data. */
  checkInsOverride?: CheckIn[];
  /** DEV-ONLY: show Demo Data badge and skip auth gate for explainable section. */
  isDemo?: boolean;
  /** Optional sheet title override (preview uses “Your Weekly Insights”). */
  sheetTitle?: string;
  /** DEV-ONLY: fixed “How was this insight generated?” copy. */
  howCopy?: WeeklyHowCopy;
  /** DEV-ONLY: show a weekly progress capsule strip (filled flags, Mon→Sun). */
  showWeeklyProgress?: boolean;
  weeklyProgressFilled?: boolean[];
}

export default function WeeklyInsights({
  isOpen,
  onClose,
  insight,
  checkInsOverride,
  isDemo = false,
  sheetTitle,
  howCopy,
  showWeeklyProgress = false,
  weeklyProgressFilled,
}: Props) {
  const { checkIns, user, hasAccount } = useStore();
  const [howOpen, setHowOpen] = useState(false);
  const isAuthenticated = hasAccount(user.name);
  const sourceCheckIns = checkInsOverride ?? checkIns;
  const showExplainable = isDemo || isAuthenticated;

  useEffect(() => {
    if (!isOpen) setHowOpen(false);
  }, [isOpen]);

  const explainable = useMemo(() => {
    if (!insight) return null;
    if (
      insight.evidenceSummary &&
      insight.dataCategoriesUsed?.length &&
      insight.validDaysAnalyzed
    ) {
      return {
        insightTitle: insight.insightTitle || insight.experiment.title,
        insightSummary: insight.insightSummary || insight.summary,
        evidenceSummary: insight.evidenceSummary,
        dataCategoriesUsed: insight.dataCategoriesUsed,
        validDaysAnalyzed: insight.validDaysAnalyzed,
        recommendation: insight.recommendation || insight.experiment.description,
      };
    }
    return buildWeeklyExplainability(sourceCheckIns);
  }, [insight, sourceCheckIns]);

  if (!insight) return null;

  const progress = weeklyProgressFilled ?? Array.from({ length: 7 }, () => false);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={sheetTitle ?? (isDemo ? 'Your Weekly Insights' : 'Weekly AI Insights')}
      snapPoints={[0.55, 0.92]}
    >
      <div className="space-y-4 pb-2">
        {isDemo && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-capsule text-micro font-normal tracking-normal text-lighthouse-600 dark:text-lighthouse-300 bg-lighthouse-500/15 border border-lighthouse-500/25">
              Demo Data
            </span>
            <span className="text-micro font-normal tracking-normal text-ink-600/70 dark:text-ink-300/70">
              Development only · not saved
            </span>
          </div>
        )}

        {showWeeklyProgress && (
          <div className="rounded-hero glass-strong p-4">
            <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300 mb-2.5">
              Weekly progress
            </p>
            <div className="flex items-end gap-1.5 h-8">
              {progress.map((filled, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: filled ? '78%' : '16%',
                    background: filled
                      ? 'linear-gradient(180deg, #34D399, #10B981)'
                      : 'rgba(14,11,8,0.08)',
                  }}
                />
              ))}
            </div>
            <div className="mt-1 flex gap-1.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="flex-1 text-center text-micro font-normal tracking-normal leading-none text-ink-600 dark:text-ink-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-hero glass-strong p-4">
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.45), transparent 70%)', filter: 'blur(24px)' }}
          />
          <div className="relative flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-lavender-500" />
            <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
              {insight.daysAnalyzed}-day pattern
            </p>
          </div>
          {(isDemo || sheetTitle) && (
            <p className="relative text-micro uppercase tracking-[0.14em] font-bold text-ink-600/80 dark:text-ink-300/80 mb-1">
              AI Insight
            </p>
          )}
          <p className="relative text-body text-ink-900 dark:text-ink-100 leading-relaxed">
            {insight.insightSummary || insight.summary}
          </p>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-hero glass-tint-warm p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full hero-glow flex items-center justify-center shadow-soft">
              <FlaskConical size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300">
                {isDemo ? 'Recommendation' : 'Wellness experiment'}
              </p>
              <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                {insight.insightTitle || insight.experiment.title}
              </p>
            </div>
          </div>
          <p className="text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
            {insight.recommendation || insight.experiment.description}
          </p>
        </motion.div>

        {showExplainable && explainable && explainable.dataCategoriesUsed.length > 0 && (
          <motion.div
            className="relative rounded-hero glass-strong p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300 mb-2.5">
              Based on your check-ins
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {explainable.dataCategoriesUsed.map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 rounded-capsule text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 bg-black/[0.04] dark:bg-white/[0.06]"
                >
                  {category}
                </span>
              ))}
            </div>

            <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600/80 dark:text-ink-300/80 mb-1">
              Evidence Summary
            </p>
            <p className="text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
              {explainable.evidenceSummary}
            </p>

            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300"
              onClick={() => setHowOpen((open) => !open)}
              aria-expanded={howOpen}
            >
              How was this insight generated?
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform ${howOpen ? 'rotate-180' : ''}`}
                strokeWidth={2.25}
              />
            </button>

            <AnimatePresence initial={false}>
              {howOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 pt-2.5 border-t border-ink-100/80 dark:border-white/10 space-y-1.5">
                    {howCopy ? (
                      <>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          {howCopy.validDaysLabel}
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          {howCopy.categoriesLabel}
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          {howCopy.patternLabel}
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          {howCopy.explanationLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          Valid check-in days analyzed: {explainable.validDaysAnalyzed}.
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          Categories analyzed: {explainable.dataCategoriesUsed.join(', ')}.
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          Main pattern(s) detected: {explainable.evidenceSummary}
                        </p>
                        <p className="text-micro font-normal tracking-normal text-ink-600 dark:text-ink-300 leading-snug">
                          How we reached this: {WEEKLY_INSIGHT_METHOD_NOTE}
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-micro font-normal tracking-normal text-ink-600/70 dark:text-ink-300/70 leading-snug">
              Insights show personal patterns, not medical diagnoses.
            </p>
          </motion.div>
        )}

        <motion.button
          type="button"
          className="w-full py-3.5 rounded-capsule hero-glow text-white font-display font-bold shadow-medium"
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
        >
          Got it
        </motion.button>
      </div>
    </BottomSheet>
  );
}
