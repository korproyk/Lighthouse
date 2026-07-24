import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useCallback, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: [number, number];
  title?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.4, 0.92],
  title,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const currentSnap = useRef(1);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.velocity.y > 500 || info.offset.y > 150) {
        if (currentSnap.current === 1) {
          currentSnap.current = 0;
        } else {
          onClose();
        }
      } else if (info.velocity.y < -500 || info.offset.y < -100) {
        currentSnap.current = 1;
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            className="fixed left-0 right-0 bottom-0 z-50 bg-paper dark:bg-night-800 rounded-t-[28px] max-w-[440px] mx-auto"
            style={{ maxHeight: `${snapPoints[1] * 100}vh` }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-ink-300 dark:bg-night-500" />
            </div>
            {title && (
              <div className="px-6 pb-3">
                <h2 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
                  {title}
                </h2>
              </div>
            )}
            <div
              className="overflow-y-auto px-6 selectable"
              style={{
                maxHeight: `calc(${snapPoints[1] * 100}vh - 60px)`,
                paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 16px))',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
