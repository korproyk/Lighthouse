import { motion } from 'framer-motion';

interface BeaconMascotProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function BeaconMascot({ size = 80, className = '', animate = true }: BeaconMascotProps) {
  return (
    <motion.img
      src="/images/beacon.png"
      alt="Beacon, the Lighthouse flame mascot"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      draggable={false}
      initial={false}
      animate={animate ? { y: [0, -5, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
    />
  );
}
