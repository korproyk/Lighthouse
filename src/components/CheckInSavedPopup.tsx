import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  score?: number;
}

export default function CheckInSavedPopup({ isOpen, onClose, score }: Props) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blocks the page — does not dismiss */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />
          <motion.div
            className="fixed inset-0 z-[71] flex items-center justify-center px-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="check-in-saved-title"
              className="pointer-events-auto relative w-full max-w-[300px] rounded-hero glass-strong p-6 pt-7 text-center shadow-medium"
              initial={{ scale: 0.92, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={15} className="text-ink-600 dark:text-ink-300" strokeWidth={2.5} />
              </button>

              <div className="mx-auto w-14 h-14 rounded-full bg-mint-500 flex items-center justify-center shadow-soft">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>

              <h2
                id="check-in-saved-title"
                className="mt-4 font-display font-bold text-title text-ink-900 dark:text-ink-100"
              >
                Today&apos;s check-in saved
              </h2>
              <p className="mt-2 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
                Life Balance updated from mood, sleep, screen & social battery
                {typeof score === 'number' ? (
                  <>
                    . Your score is{' '}
                    <span className="font-bold text-ink-900 dark:text-ink-100">{score}</span>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
