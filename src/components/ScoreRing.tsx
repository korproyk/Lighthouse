import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  onClick?: () => void;
}

export default function ScoreRing({ score, size = 180, strokeWidth = 10, onClick }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const motionProgress = useMotionValue(0);
  const strokeDashoffset = useTransform(
    motionProgress,
    [0, 100],
    [circumference, 0]
  );

  useEffect(() => {
    const controls = animate(motionProgress, score, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [score, motionProgress]);

  return (
    <motion.button
      className="relative focus-ring rounded-full"
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={`Lighthouse score: ${score}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="score-ring-bg"
          strokeWidth={strokeWidth}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB547" />
            <stop offset="60%" stopColor="#FF6B7A" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[2.5rem] leading-none text-ink-900 dark:text-ink-100">
          {score}
        </span>
        <span className="text-micro uppercase text-ink-300 mt-1 tracking-wider">Score</span>
      </div>
    </motion.button>
  );
}
