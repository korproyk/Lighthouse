import type { Challenge } from './mockData';

/** Done challenges become redoable after this window. */
export const CHALLENGE_CYCLE_MS = 14 * 24 * 60 * 60 * 1000;

export function challengeCycleEpoch(now = Date.now()): number {
  return Math.floor(now / CHALLENGE_CYCLE_MS);
}

/** Flip completed → open once the 2-week window has passed. */
export function refreshChallengeCompletion(
  challenge: Challenge,
  now = Date.now()
): Challenge {
  if (!challenge.completed) {
    if (!challenge.completedAt && !challenge.proofDataUrl) return challenge;
    return { ...challenge, completedAt: undefined, proofDataUrl: undefined };
  }
  const stamped = challenge.completedAt;
  // Legacy completions (no stamp) expire immediately so they can be redone.
  if (stamped == null || now - stamped >= CHALLENGE_CYCLE_MS) {
    return {
      ...challenge,
      completed: false,
      completedAt: undefined,
      proofDataUrl: undefined,
    };
  }
  return challenge;
}

export function refreshChallengeList(
  list: Challenge[],
  now = Date.now()
): Challenge[] {
  return list.map((c) => refreshChallengeCompletion(c, now));
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seedKey: string): T[] {
  const arr = [...items];
  const rand = mulberry32(hashSeed(seedKey));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Incomplete (stable shuffle) first, completed last. Filters apply after. */
export function orderChallengesForList(
  challenges: Challenge[],
  opts: {
    pack: string;
    difficulty: string | null;
    seedKey: string;
  }
): Challenge[] {
  const pool = challenges.filter((c) => !c.required && c.tracker !== 'sleep');
  const open = seededShuffle(
    pool.filter((c) => !c.completed),
    opts.seedKey
  );
  const done = pool
    .filter((c) => c.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const matches = (c: Challenge) => {
    if (opts.pack !== 'all' && c.pack !== opts.pack) return false;
    if (opts.difficulty && c.difficulty !== opts.difficulty) return false;
    return true;
  };

  return [...open.filter(matches), ...done.filter(matches)];
}
