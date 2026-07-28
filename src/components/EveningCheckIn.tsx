import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lumi from './Lumi';
import BottomSheet from './BottomSheet';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';

const sleepLabels = ['< 5h', '5-6h', '6-7h', '7-8h', '8h+'];
const sleepValues = [4.5, 5.5, 6.5, 7.5, 8.5];
const screenLabels = ['< 2h', '2-4h', '4-6h', '6-8h', '8h+'];
const screenValues = [1.5, 3, 5, 7, 9];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EveningCheckIn({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState(2);
  const [sleep, setSleep] = useState(2);
  const [done, setDone] = useState(false);
  const { logCheckIn } = useStore();

  const handleComplete = () => {
    logCheckIn({
      screenTime: screenValues[screen],
      sleep: sleepValues[sleep],
    });
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setStep(0);
      onClose();
    }, 2000);
  };

  const questions = [
    {
      title: t('checkin.screen'),
      content: (
        <div className="flex gap-2 mt-6">
          {screenLabels.map((label, i) => (
            <motion.button
              key={i}
              className={`flex-1 py-3 rounded-sm text-caption font-bold ${
                screen === i ? 'bg-lighthouse-500 text-white' : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setScreen(i); setTimeout(() => setStep(1), 300); }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: t('checkin.sleep'),
      content: (
        <div className="flex gap-2 mt-6">
          {sleepLabels.map((label, i) => (
            <motion.button
              key={i}
              className={`flex-1 py-3 rounded-sm text-caption font-bold ${
                sleep === i ? 'bg-ocean-500 text-white' : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSleep(i); }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('checkin.title')}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            className="text-center py-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Lumi pose="happy" size={80} />
            <p className="mt-4 font-display font-bold text-title text-mint-700 dark:text-mint-300">
              Check-in complete! {'\u{1F31F}'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-1 mb-6">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full ${
                    i <= step ? 'hero-glow' : 'bg-ink-100 dark:bg-night-700'
                  }`}
                />
              ))}
            </div>

            <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
              {questions[step].title}
            </h3>
            {questions[step].content}

            {step === questions.length - 1 && (
              <motion.button
                className="w-full mt-6 py-4 rounded-capsule hero-glow text-white font-display font-bold shadow-medium"
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
              >
                Done {'\u2728'}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
