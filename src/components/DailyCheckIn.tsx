import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomSheet from './BottomSheet';
import Lumi from './Lumi';
import { useStore } from '../lib/store';

const moodEmojis = ['\u{1F614}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}'];
const sleepLabels = ['< 5h', '5–6h', '6–7h', '7–8h', '8h+'];
const sleepValues = [4.5, 5.5, 6.5, 7.5, 8.5];
const screenLabels = ['< 2h', '2–4h', '4–6h', '6–8h', '8h+'];
const screenValues = [1.5, 3, 5, 7, 9];
const socialLabels = ['Drained', 'Low', 'Okay', 'Good', 'Energized'];
const socialValues = [15, 30, 50, 70, 90];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinished?: (result: { score: number; tip: string; weeklyReady: boolean }) => void;
}

export default function DailyCheckIn({ isOpen, onClose, onFinished }: Props) {
  const { logDailyCheckIn } = useStore();
  const [mood, setMood] = useState(2);
  const [sleep, setSleep] = useState(2);
  const [screen, setScreen] = useState(2);
  const [social, setSocial] = useState(2);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ score: number; tip: string } | null>(null);

  const handleSubmit = () => {
    const out = logDailyCheckIn({
      mood,
      sleep: sleepValues[sleep],
      screenTime: screenValues[screen],
      socialBattery: socialValues[social],
    });
    if (!out) return;
    setResult({ score: out.score, tip: out.tip });
    setDone(true);
    onFinished?.(out);
    setTimeout(() => {
      setDone(false);
      setResult(null);
      onClose();
    }, 2200);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Daily check-in" snapPoints={[0.72, 0.94]}>
      <AnimatePresence mode="wait">
        {done && result ? (
          <motion.div
            key="done"
            className="text-center py-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Lumi pose="happy" size={72} />
            <p className="mt-3 font-display font-bold text-title text-ink-900 dark:text-ink-100">
              Life Balance {result.score}
            </p>
            <p className="mt-2 text-caption text-ink-600 dark:text-ink-300 leading-relaxed px-2">
              {result.tip}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="space-y-5 pb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
              Four quick taps — about 30 seconds. This becomes today&apos;s Life Balance score.
            </p>

            <div>
              <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300 mb-2">
                Mood
              </p>
              <div className="flex justify-between gap-1">
                {moodEmojis.map((emoji, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    className={`flex-1 h-12 rounded-card text-xl ${
                      mood === i ? 'hero-glow shadow-soft' : 'glass'
                    }`}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setMood(i)}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <ChipRow
              label="Sleep"
              options={sleepLabels}
              value={sleep}
              onChange={setSleep}
              activeClass="bg-ocean-500 text-white"
            />
            <ChipRow
              label="Screen time"
              options={screenLabels}
              value={screen}
              onChange={setScreen}
              activeClass="bg-lighthouse-500 text-white"
            />
            <ChipRow
              label="Social battery"
              options={socialLabels}
              value={social}
              onChange={setSocial}
              activeClass="bg-mint-500 text-white"
            />

            <motion.button
              type="button"
              className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium"
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
            >
              Save today&apos;s score
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
  activeClass,
}: {
  label: string;
  options: string[];
  value: number;
  onChange: (i: number) => void;
  activeClass: string;
}) {
  return (
    <div>
      <p className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600 dark:text-ink-300 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <motion.button
            key={opt}
            type="button"
            className={`px-3 py-2 rounded-capsule text-caption font-bold ${
              value === i ? activeClass : 'glass text-ink-600 dark:text-ink-300'
            }`}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(i)}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
