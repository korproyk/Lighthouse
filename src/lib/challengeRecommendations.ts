import type { Challenge, CheckIn } from './mockData';

export type ChallengeRecommendation = {
  challenge: Challenge;
  reason: string;
};

const DEFAULT_TITLES = [
  'Digital Sunset',
  'Read for 20 Minutes',
  'Plan Your Week',
] as const;

type Signal = {
  titles: string[];
  reason: string;
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = avg(values);
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function byTitle(challenges: Challenge[], title: string): Challenge | undefined {
  return challenges.find((c) => c.title === title && !c.required && c.tracker !== 'sleep');
}

/**
 * Up to three personalized challenge recommendations from recent check-ins.
 * Falls back to Digital Sunset / Read for 20 Minutes / Plan Your Week.
 */
export function getRecommendedChallenges(
  challenges: Challenge[],
  checkIns: CheckIn[],
  limit = 3
): ChallengeRecommendation[] {
  const recent = checkIns
    .filter((c) => c.completed && c.score > 0)
    .slice(-7);

  const pick = (titles: readonly string[], reason: string): ChallengeRecommendation[] => {
    const out: ChallengeRecommendation[] = [];
    const used = new Set<string>();
    for (const title of titles) {
      const challenge = byTitle(challenges, title);
      if (!challenge || challenge.completed || used.has(challenge.id)) continue;
      used.add(challenge.id);
      out.push({ challenge, reason });
      if (out.length >= limit) break;
    }
    return out;
  };

  if (recent.length < 2) {
    return pick(DEFAULT_TITLES, 'A gentle place to start').map((item) => ({
      ...item,
      reason:
        item.challenge.title === 'Digital Sunset'
          ? 'Wind down without screens'
          : item.challenge.title === 'Read for 20 Minutes'
            ? 'A calm offline reset'
            : 'Steady your week with a light plan',
    }));
  }

  const screen = avg(recent.map((c) => c.screenTime));
  const sleep = avg(recent.filter((c) => c.sleep > 0).map((c) => c.sleep));
  const mood = avg(recent.map((c) => c.mood));
  const social = avg(recent.map((c) => c.socialBattery));
  const sleepVar = stddev(recent.filter((c) => c.sleep > 0).map((c) => c.sleep));
  const screenVar = stddev(recent.map((c) => c.screenTime));

  const signals: Signal[] = [];

  if (screen >= 5) {
    signals.push({
      titles: ['Digital Sunset', 'No YouTube Tonight'],
      reason: 'Your screen time has been high lately',
    });
  }
  if (sleep > 0 && sleep < 6.5) {
    signals.push({
      titles: ['Sleep Before 11 PM'],
      reason: 'Your recent sleep has been short',
    });
  }
  if (mood <= 2) {
    signals.push({
      titles: ['Gratitude Journal'],
      reason: 'A small gratitude boost for low mood days',
    });
  }
  if (social < 40) {
    signals.push({
      titles: ['5-4-3-2-1 Grounding'],
      reason: 'Quick reset when stress feels high',
    });
  }
  if (sleepVar >= 1.2 || screenVar >= 1.5) {
    signals.push({
      titles: ['Plan Your Week'],
      reason: 'Steady your routine with a simple plan',
    });
  }

  const out: ChallengeRecommendation[] = [];
  const used = new Set<string>();

  for (const signal of signals) {
    for (const title of signal.titles) {
      const challenge = byTitle(challenges, title);
      if (!challenge || challenge.completed || used.has(challenge.id)) continue;
      used.add(challenge.id);
      out.push({ challenge, reason: signal.reason });
      if (out.length >= limit) return out;
    }
  }

  // Fill remaining slots with defaults.
  for (const title of DEFAULT_TITLES) {
    const challenge = byTitle(challenges, title);
    if (!challenge || challenge.completed || used.has(challenge.id)) continue;
    used.add(challenge.id);
    out.push({
      challenge,
      reason:
        title === 'Digital Sunset'
          ? 'Wind down without screens'
          : title === 'Read for 20 Minutes'
            ? 'A calm offline reset'
            : 'Steady your week with a light plan',
    });
    if (out.length >= limit) break;
  }

  return out;
}
