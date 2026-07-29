import { motion } from 'framer-motion';

interface AttentionBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/** Orange "!" ping — glow + gentle shake to say "hey, see me". */
export default function AttentionBadge({ className = '', size = 'sm' }: AttentionBadgeProps) {
  const dim = size === 'md' ? 22 : 16;
  const text = size === 'md' ? 'text-[12px]' : 'text-[10px]';

  return (
    <motion.span
      className={`inline-flex items-center justify-center rounded-full font-display font-black text-white pointer-events-none ${text} ${className}`}
      style={{
        width: dim,
        height: dim,
        background: 'linear-gradient(145deg, #FFB547, #FF8A3D)',
        boxShadow:
          '0 0 0 2px rgba(255,255,255,0.95), 0 0 10px rgba(255,181,71,0.85), 0 2px 6px rgba(255,138,61,0.45)',
      }}
      aria-hidden
      animate={{
        rotate: [0, -10, 9, -7, 5, 0],
        scale: [1, 1.08, 1, 1.06, 1],
        boxShadow: [
          '0 0 0 2px rgba(255,255,255,0.95), 0 0 8px rgba(255,181,71,0.7), 0 2px 6px rgba(255,138,61,0.4)',
          '0 0 0 2px rgba(255,255,255,0.95), 0 0 16px rgba(255,181,71,1), 0 2px 8px rgba(255,138,61,0.55)',
          '0 0 0 2px rgba(255,255,255,0.95), 0 0 8px rgba(255,181,71,0.7), 0 2px 6px rgba(255,138,61,0.4)',
        ],
      }}
      transition={{
        duration: 1.35,
        repeat: Infinity,
        repeatDelay: 1.1,
        ease: 'easeInOut',
      }}
    >
      !
    </motion.span>
  );
}
