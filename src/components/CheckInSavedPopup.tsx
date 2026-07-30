import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Toast shown once after a successful Today's Check-in save. Auto-dismisses. */
export default function CheckInSavedPopup({ isOpen, onClose }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => onCloseRef.current(), 2500);
    return () => clearTimeout(id);
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-28 left-4 right-4 z-[70] max-w-[400px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          <div className="p-3.5 rounded-card glass-strong shadow-floating flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center shrink-0 shadow-soft">
              <Check size={16} className="text-white" strokeWidth={3} />
            </span>
            <p className="text-caption font-semibold text-ink-900 dark:text-ink-100">
              Today&apos;s Check-in saved!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
