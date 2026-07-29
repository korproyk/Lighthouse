/** Challenge XP drives the lighthouse tier ladder (separate from Life Balance). */

export type TierId =
  | 'spark'
  | 'spark2'
  | 'ember'
  | 'flame'
  | 'beacon'
  | 'lighthouse'
  | 'keeper';

export interface TierDef {
  id: TierId;
  name: string;
  /** Inclusive lower bound of XP for this tier. */
  min: number;
  /** Exclusive upper bound (next tier's min). Keeper uses Infinity. */
  max: number;
  color: string;
}

export const TIER_LADDER: TierDef[] = [
  { id: 'spark', name: 'Spark |', min: 0, max: 150, color: 'from-lighthouse-300 to-lighthouse-500' },
  { id: 'spark2', name: 'Spark ||', min: 150, max: 300, color: 'from-lighthouse-300 to-lighthouse-600' },
  { id: 'ember', name: 'Ember', min: 300, max: 450, color: 'from-lighthouse-500 to-coral-400' },
  { id: 'flame', name: 'Flame', min: 450, max: 600, color: 'from-lighthouse-500 to-coral-500' },
  { id: 'beacon', name: 'Beacon', min: 600, max: 750, color: 'from-coral-500 to-lavender-500' },
  { id: 'lighthouse', name: 'Lighthouse', min: 750, max: 1000, color: 'from-lavender-500 to-ocean-500' },
  { id: 'keeper', name: 'Lighthouse Keeper', min: 1000, max: Infinity, color: 'from-lavender-500 to-ocean-500' },
];

export function tierFromXp(xp: number): TierDef {
  const n = Math.max(0, xp);
  for (let i = TIER_LADDER.length - 1; i >= 0; i--) {
    if (n >= TIER_LADDER[i].min) return TIER_LADDER[i];
  }
  return TIER_LADDER[0];
}

/** 0–100 progress within the current tier toward the next. */
export function tierProgressPercent(xp: number): number {
  const tier = tierFromXp(xp);
  if (!Number.isFinite(tier.max)) return 100;
  const span = tier.max - tier.min;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((xp - tier.min) / span) * 100));
}

export function nextTierThreshold(xp: number): number | null {
  const tier = tierFromXp(xp);
  return Number.isFinite(tier.max) ? tier.max : null;
}
