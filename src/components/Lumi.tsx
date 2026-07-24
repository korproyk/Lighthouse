import { motion } from 'framer-motion';

type LumiPose = 'idle' | 'happy' | 'thinking' | 'sleepy' | 'cheering' | 'headphones';

interface LumiProps {
  pose?: LumiPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function Lumi({ pose = 'idle', size = 80, className = '', animate = true }: LumiProps) {
  const s = size;
  const bodyH = s * 0.6;
  const bodyW = s * 0.5;
  const lanternR = s * 0.12;
  const legW = s * 0.08;
  const legH = s * 0.12;

  const cx = s / 2;
  const bodyY = s * 0.35;
  const lanternY = s * 0.18;

  const eyeProps = (() => {
    switch (pose) {
      case 'happy':
        return { type: 'arc' as const };
      case 'sleepy':
        return { type: 'line' as const };
      case 'thinking':
        return { type: 'dot' as const, offsetX: 3 };
      default:
        return { type: 'dot' as const, offsetX: 0 };
    }
  })();

  const mouthProps = (() => {
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

  const armAngle = pose === 'cheering' ? -30 : pose === 'happy' ? -15 : 0;

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
        <linearGradient id={`lumi-glow-${pose}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB547" />
          <stop offset="60%" stopColor="#FF6B7A" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id={`lumi-lantern-${pose}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB547" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB547" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Lantern glow */}
      <motion.circle
        cx={cx}
        cy={lanternY}
        r={lanternR * 2.5}
        fill={`url(#lumi-lantern-${pose})`}
        className="lumi-glow"
      />

      {/* Lantern top */}
      <circle cx={cx} cy={lanternY} r={lanternR} fill={`url(#lumi-glow-${pose})`} />
      <rect
        x={cx - lanternR * 0.3}
        y={lanternY + lanternR - 1}
        width={lanternR * 0.6}
        height={s * 0.06}
        rx={2}
        fill="#C46B0E"
      />

      {/* Body */}
      <ellipse
        cx={cx}
        cy={bodyY + bodyH * 0.4}
        rx={bodyW / 2}
        ry={bodyH * 0.45}
        fill="#FFF8EC"
        stroke="#F1ECE3"
        strokeWidth={1.5}
      />

      {/* Stripe */}
      <ellipse
        cx={cx}
        cy={bodyY + bodyH * 0.35}
        rx={bodyW / 2 - 4}
        ry={bodyH * 0.08}
        fill="#FFEFCF"
      />

      {/* Eye(s) */}
      {eyeProps.type === 'dot' && (
        <>
          <circle cx={cx - bodyW * 0.15 + (eyeProps.offsetX || 0)} cy={bodyY + bodyH * 0.25} r={s * 0.035} fill="#1F1A12" />
          <circle cx={cx + bodyW * 0.15 + (eyeProps.offsetX || 0)} cy={bodyY + bodyH * 0.25} r={s * 0.035} fill="#1F1A12" />
          {/* Eye shine */}
          <circle cx={cx - bodyW * 0.15 + (eyeProps.offsetX || 0) + 1} cy={bodyY + bodyH * 0.23} r={s * 0.012} fill="white" />
          <circle cx={cx + bodyW * 0.15 + (eyeProps.offsetX || 0) + 1} cy={bodyY + bodyH * 0.23} r={s * 0.012} fill="white" />
        </>
      )}
      {eyeProps.type === 'arc' && (
        <>
          <path
            d={`M ${cx - bodyW * 0.22} ${bodyY + bodyH * 0.27} Q ${cx - bodyW * 0.15} ${bodyY + bodyH * 0.2} ${cx - bodyW * 0.08} ${bodyY + bodyH * 0.27}`}
            stroke="#1F1A12"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${cx + bodyW * 0.08} ${bodyY + bodyH * 0.27} Q ${cx + bodyW * 0.15} ${bodyY + bodyH * 0.2} ${cx + bodyW * 0.22} ${bodyY + bodyH * 0.27}`}
            stroke="#1F1A12"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {eyeProps.type === 'line' && (
        <>
          <line x1={cx - bodyW * 0.22} y1={bodyY + bodyH * 0.26} x2={cx - bodyW * 0.08} y2={bodyY + bodyH * 0.26} stroke="#1F1A12" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + bodyW * 0.08} y1={bodyY + bodyH * 0.26} x2={cx + bodyW * 0.22} y2={bodyY + bodyH * 0.26} stroke="#1F1A12" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      {mouthProps === 'smile' && (
        <path
          d={`M ${cx - bodyW * 0.1} ${bodyY + bodyH * 0.38} Q ${cx} ${bodyY + bodyH * 0.45} ${cx + bodyW * 0.1} ${bodyY + bodyH * 0.38}`}
          stroke="#1F1A12"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {mouthProps === 'smile-open' && (
        <ellipse cx={cx} cy={bodyY + bodyH * 0.4} rx={bodyW * 0.1} ry={bodyH * 0.06} fill="#1F1A12" />
      )}
      {mouthProps === 'o' && (
        <circle cx={cx} cy={bodyY + bodyH * 0.4} r={bodyW * 0.06} fill="#1F1A12" />
      )}
      {mouthProps === 'hmm' && (
        <line
          x1={cx - bodyW * 0.08}
          y1={bodyY + bodyH * 0.4}
          x2={cx + bodyW * 0.08}
          y2={bodyY + bodyH * 0.38}
          stroke="#1F1A12"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}

      {/* Arms */}
      <motion.line
        x1={cx - bodyW / 2 + 2}
        y1={bodyY + bodyH * 0.35}
        x2={cx - bodyW / 2 - s * 0.08}
        y2={bodyY + bodyH * 0.45}
        stroke="#F1ECE3"
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ rotate: armAngle }}
        style={{ originX: `${cx - bodyW / 2 + 2}px`, originY: `${bodyY + bodyH * 0.35}px` }}
      />
      <motion.line
        x1={cx + bodyW / 2 - 2}
        y1={bodyY + bodyH * 0.35}
        x2={cx + bodyW / 2 + s * 0.08}
        y2={bodyY + bodyH * 0.45}
        stroke="#F1ECE3"
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ rotate: -armAngle }}
        style={{ originX: `${cx + bodyW / 2 - 2}px`, originY: `${bodyY + bodyH * 0.35}px` }}
      />

      {/* Legs */}
      <rect
        x={cx - bodyW * 0.2 - legW / 2}
        y={bodyY + bodyH * 0.75}
        width={legW}
        height={legH}
        rx={legW / 2}
        fill="#F1ECE3"
        stroke="#E5DDD0"
        strokeWidth={1}
      />
      <rect
        x={cx + bodyW * 0.2 - legW / 2}
        y={bodyY + bodyH * 0.75}
        width={legW}
        height={legH}
        rx={legW / 2}
        fill="#F1ECE3"
        stroke="#E5DDD0"
        strokeWidth={1}
      />

      {/* Headphones for LightBot variant */}
      {pose === 'headphones' && (
        <>
          <path
            d={`M ${cx - bodyW * 0.35} ${bodyY + bodyH * 0.15} Q ${cx - bodyW * 0.35} ${bodyY - bodyH * 0.1} ${cx} ${bodyY - bodyH * 0.12} Q ${cx + bodyW * 0.35} ${bodyY - bodyH * 0.1} ${cx + bodyW * 0.35} ${bodyY + bodyH * 0.15}`}
            stroke="#A78BFA"
            strokeWidth={2.5}
            fill="none"
          />
          <circle cx={cx - bodyW * 0.35} cy={bodyY + bodyH * 0.2} r={s * 0.05} fill="#A78BFA" />
          <circle cx={cx + bodyW * 0.35} cy={bodyY + bodyH * 0.2} r={s * 0.05} fill="#A78BFA" />
        </>
      )}

      {/* Blush */}
      {(pose === 'happy' || pose === 'cheering') && (
        <>
          <ellipse cx={cx - bodyW * 0.25} cy={bodyY + bodyH * 0.33} rx={s * 0.04} ry={s * 0.025} fill="#FFB3BA" opacity={0.5} />
          <ellipse cx={cx + bodyW * 0.25} cy={bodyY + bodyH * 0.33} rx={s * 0.04} ry={s * 0.025} fill="#FFB3BA" opacity={0.5} />
        </>
      )}
    </motion.svg>
  );
}
