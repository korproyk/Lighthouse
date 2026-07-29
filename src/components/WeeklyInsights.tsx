import { motion } from 'framer-motion';
import { Sparkles, FlaskConical } from 'lucide-react';
import BottomSheet from './BottomSheet';
import type { WeeklyInsight } from '../lib/lifeBalance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  insight: WeeklyInsight | null;
}

export default function WeeklyInsights({ isOpen, onClose, insight }: Props) {
  if (!insight) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Weekly AI Insights" snapPoints={[0.55, 0.88]}>
      <div className="space-y-4 pb-2">
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
          <p className="relative text-body text-ink-900 dark:text-ink-100 leading-relaxed">
            {insight.summary}
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
                Wellness experiment
              </p>
              <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                {insight.experiment.title}
              </p>
            </div>
          </div>
          <p className="text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
            {insight.experiment.description}
          </p>
        </motion.div>

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
