import { motion } from 'framer-motion';

type SparkPose = 'idle' | 'happy' | 'thinking' | 'sleepy' | 'cheering';

interface SparkProps {
  pose?: SparkPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function Spark({ pose = 'idle', size = 80, className = '', animate = true }: SparkProps) {
  const s = size;
  const cx = s / 2;

  const eyeProps = (() => {
    switch (pose) {
      case 'happy':
      case 'cheering':
        return { type: 'arc' as const };
      case 'sleepy':
        return { type: 'line' as const };
      case 'thinking':
        return { type: 'dot' as const, offsetX: 3 };
      default:
        return { type: 'dot' as const, offsetX: 0 };
    }
  })();

  const mouthType = (() => {
    switch (pose) {
      case 'happy':
      case 'cheering':
        return 'smile-open';
      case 'sleepy':
        return 'o';
      case 'thinking':
        return 'hmm';
      default:
        return 'smile';
    }
  })();

  const armAngle = pose === 'cheering' ? -32 : pose === 'happy' ? -16 : 0;
  const eyeY = 0.68 * s;
  const eyeOffsetX = eyeProps.type === 'dot' ? eyeProps.offsetX ?? 0 : 0;

  return (
    <motion.svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      initial={false}
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <defs>
        <linearGradient id={`spark-outer-${pose}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FFCA6B" />
          <stop offset="45%" stopColor="#FF7A45" />
          <stop offset="100%" stopColor="#E8334F" />
        </linearGradient>
        <linearGradient id={`spark-inner-${pose}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#FFB547" />
        </linearGradient>
        <radialGradient id={`spark-glow-${pose}`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#FFB547" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFB547" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx={cx} cy={0.58 * s} r={0.56 * s} fill={`url(#spark-glow-${pose})`} className="lumi-glow" />

      {/* Arms */}
      <motion.line
        x1={cx - 0.2 * s}
        y1={0.58 * s}
        x2={cx - 0.32 * s}
        y2={0.68 * s}
        stroke="#FFE9A8"
        strokeWidth={s * 0.045}
        strokeLinecap="round"
        animate={{ rotate: armAngle }}
        style={{ originX: `${cx - 0.2 * s}px`, originY: `${0.58 * s}px` }}
      />
      <motion.line
        x1={cx + 0.2 * s}
        y1={0.58 * s}
        x2={cx + 0.32 * s}
        y2={0.68 * s}
        stroke="#FFE9A8"
        strokeWidth={s * 0.045}
        strokeLinecap="round"
        animate={{ rotate: -armAngle }}
        style={{ originX: `${cx + 0.2 * s}px`, originY: `${0.58 * s}px` }}
      />

      {/* Little feet */}
      <ellipse cx={cx - 0.1 * s} cy={0.965 * s} rx={0.07 * s} ry={0.035 * s} fill="#E8334F" opacity={0.35} />
      <ellipse cx={cx + 0.1 * s} cy={0.965 * s} rx={0.07 * s} ry={0.035 * s} fill="#E8334F" opacity={0.35} />

      {/* Outer flame body */}
      <path
        d={`
          M ${cx} ${0.05 * s}
          C ${cx + 0.3 * s} ${0.2 * s} ${cx + 0.36 * s} ${0.42 * s} ${cx + 0.19 * s} ${0.53 * s}
          C ${cx + 0.36 * s} ${0.59 * s} ${cx + 0.4 * s} ${0.79 * s} ${cx + 0.21 * s} ${0.91 * s}
          C ${cx + 0.1 * s} ${0.975 * s} ${cx - 0.1 * s} ${0.975 * s} ${cx - 0.21 * s} ${0.91 * s}
          C ${cx - 0.4 * s} ${0.79 * s} ${cx - 0.36 * s} ${0.59 * s} ${cx - 0.19 * s} ${0.53 * s}
          C ${cx - 0.36 * s} ${0.42 * s} ${cx - 0.3 * s} ${0.2 * s} ${cx} ${0.05 * s}
          Z
        `}
        fill={`url(#spark-outer-${pose})`}
      />

      {/* Inner highlight flame */}
      <path
        d={`
          M ${cx} ${0.36 * s}
          C ${cx + 0.15 * s} ${0.47 * s} ${cx + 0.17 * s} ${0.62 * s} ${cx + 0.08 * s} ${0.72 * s}
          C ${cx + 0.17 * s} ${0.77 * s} ${cx + 0.18 * s} ${0.89 * s} ${cx + 0.065 * s} ${0.945 * s}
          C ${cx + 0.02 * s} ${0.97 * s} ${cx - 0.02 * s} ${0.97 * s} ${cx - 0.065 * s} ${0.945 * s}
          C ${cx - 0.18 * s} ${0.89 * s} ${cx - 0.17 * s} ${0.77 * s} ${cx - 0.08 * s} ${0.72 * s}
          C ${cx - 0.17 * s} ${0.62 * s} ${cx - 0.15 * s} ${0.47 * s} ${cx} ${0.36 * s}
          Z
        `}
        fill={`url(#spark-inner-${pose})`}
        opacity={0.9}
      />

      {/* Eyes */}
      {eyeProps.type === 'dot' && (
        <>
          <circle cx={cx - 0.09 * s + eyeOffsetX} cy={eyeY} r={s * 0.032} fill="#7A1822" />
          <circle cx={cx + 0.09 * s + eyeOffsetX} cy={eyeY} r={s * 0.032} fill="#7A1822" />
          <circle cx={cx - 0.09 * s + eyeOffsetX + 1} cy={eyeY - 0.02 * s} r={s * 0.011} fill="white" />
          <circle cx={cx + 0.09 * s + eyeOffsetX + 1} cy={eyeY - 0.02 * s} r={s * 0.011} fill="white" />
        </>
      )}
      {eyeProps.type === 'arc' && (
        <>
          <path
            d={`M ${cx - 0.14 * s} ${eyeY + 0.02 * s} Q ${cx - 0.09 * s} ${eyeY - 0.05 * s} ${cx - 0.04 * s} ${eyeY + 0.02 * s}`}
            stroke="#7A1822"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${cx + 0.04 * s} ${eyeY + 0.02 * s} Q ${cx + 0.09 * s} ${eyeY - 0.05 * s} ${cx + 0.14 * s} ${eyeY + 0.02 * s}`}
            stroke="#7A1822"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {eyeProps.type === 'line' && (
        <>
          <line x1={cx - 0.14 * s} y1={eyeY} x2={cx - 0.04 * s} y2={eyeY} stroke="#7A1822" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 0.04 * s} y1={eyeY} x2={cx + 0.14 * s} y2={eyeY} stroke="#7A1822" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {/* Blush */}
      {(pose === 'happy' || pose === 'cheering') && (
        <>
          <ellipse cx={cx - 0.17 * s} cy={eyeY + 0.05 * s} rx={s * 0.04} ry={s * 0.024} fill="#FFB3BA" opacity={0.6} />
          <ellipse cx={cx + 0.17 * s} cy={eyeY + 0.05 * s} rx={s * 0.04} ry={s * 0.024} fill="#FFB3BA" opacity={0.6} />
        </>
      )}

      {/* Mouth */}
      {mouthType === 'smile' && (
        <path
          d={`M ${cx - 0.06 * s} ${eyeY + 0.09 * s} Q ${cx} ${eyeY + 0.15 * s} ${cx + 0.06 * s} ${eyeY + 0.09 * s}`}
          stroke="#7A1822"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {mouthType === 'smile-open' && (
        <ellipse cx={cx} cy={eyeY + 0.1 * s} rx={s * 0.055} ry={s * 0.035} fill="#7A1822" />
      )}
      {mouthType === 'o' && <circle cx={cx} cy={eyeY + 0.1 * s} r={s * 0.032} fill="#7A1822" />}
      {mouthType === 'hmm' && (
        <line
          x1={cx - 0.05 * s}
          y1={eyeY + 0.1 * s}
          x2={cx + 0.05 * s}
          y2={eyeY + 0.08 * s}
          stroke="#7A1822"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </motion.svg>
  );
}
