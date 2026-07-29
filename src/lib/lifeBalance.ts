import type { CheckIn } from './mockData';

export interface WellnessExperiment {
  id: string;
  title: string;
  description: string;
}

export interface WeeklyInsight {
  summary: string;
  experiment: WellnessExperiment;
  generatedAt: string;
  daysAnalyzed: number;
}

const EXPERIMENTS: WellnessExperiment[] = [
  {
    id: 'phone-sunset',
    title: 'Phone Sunset',
    description: 'Park your phone outside the bedroom 30 minutes before sleep for 5 nights.',
  },
  {
    id: 'walk-first',
    title: 'Walk Before Scroll',
    description: 'Take a 10-minute outdoor walk before opening social apps each morning.',
  },
  {
    id: 'battery-guard',
    title: 'Social Battery Guard',
    description: 'Schedule one no-plans evening this week and protect it like a meeting.',
  },
  {
    id: 'focus-island',
    title: 'Focus Island',
    description: 'Try two 45-minute screen-free focus blocks on school or creative work.',
  },
  {
    id: 'mood-note',
    title: 'Two-Line Mood Note',
    description: 'Each evening, write two lines: what drained you, and one small win.',
  },
];

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function sleepHoursToScore(hours: number): number {
  if (hours <= 0) return 0;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours < 7) return 80;
  if (hours > 9 && hours <= 10) return 85;
  if (hours >= 5 && hours < 6) return 55;
  if (hours > 10) return 60;
  return 30;
}

function screenHoursToScore(hours: number): number {
  if (hours <= 2) return 100;
  if (hours <= 4) return 78;
  if (hours <= 6) return 52;
  if (hours <= 8) return 28;
  return 12;
}

export function computeLifeBalanceScore(input: {
  mood: number;
  sleep: number;
  screenTime: number;
  socialBattery: number;
}): number {
  const moodScore = clamp((input.mood / 4) * 100);
  const sleepScore = sleepHoursToScore(input.sleep);
  const screenScore = screenHoursToScore(input.screenTime);
  const socialScore = clamp(input.socialBattery);
  return Math.round((moodScore + sleepScore + screenScore + socialScore) / 4);
}

/** 1–2 sentence tip aimed at the weakest area. */
export function generateDailyTip(input: {
  mood: number;
  sleep: number;
  screenTime: number;
  socialBattery: number;
  score: number;
}): string {
  const parts = [
    { key: 'mood', score: clamp((input.mood / 4) * 100) },
    { key: 'sleep', score: sleepHoursToScore(input.sleep) },
    { key: 'screen', score: screenHoursToScore(input.screenTime) },
    { key: 'social', score: clamp(input.socialBattery) },
  ].sort((a, b) => a.score - b.score);

  const weakest = parts[0].key;

  if (input.score >= 80) {
    return 'Your balance looks solid today. Keep one small offline ritual tonight so the streak stays easy.';
  }

  switch (weakest) {
    case 'sleep':
      return input.sleep < 6
        ? 'Sleep is dragging your score. Try lights-down 20 minutes earlier tonight — even one night helps.'
        : 'You are close on sleep. Protect a calm wind-down and skip late scrolling if you can.';
    case 'screen':
      return 'Screen time is the heavy weight today. Pick one app to close after dinner and leave it closed.';
    case 'social':
      return 'Social battery looks low. Give yourself one quiet block with no plans — rest counts as progress.';
    case 'mood':
    default:
      return 'Mood is asking for care. A short walk or a message to someone safe can shift the evening.';
  }
}

export function completedCheckIns(checkIns: CheckIn[]): CheckIn[] {
  return checkIns.filter((c) => c.completed && c.score > 0);
}

export function canUnlockWeeklyInsights(checkIns: CheckIn[]): boolean {
  return completedCheckIns(checkIns).length >= 7;
}

export function generateWeeklyInsight(checkIns: CheckIn[]): WeeklyInsight | null {
  const done = completedCheckIns(checkIns).slice(-7);
  if (done.length < 7) return null;

  const avg = (fn: (c: CheckIn) => number) =>
    done.reduce((sum, c) => sum + fn(c), 0) / done.length;

  const avgScore = avg((c) => c.score);
  const avgSleep = avg((c) => c.sleep);
  const avgScreen = avg((c) => c.screenTime);
  const avgSocial = avg((c) => c.socialBattery);
  const avgMood = avg((c) => c.mood);

  const first = done[0].score;
  const last = done[done.length - 1].score;
  const trend =
    last - first >= 5 ? 'rising' : first - last >= 5 ? 'dipping' : 'steady';

  const dims = [
    { key: 'sleep', score: sleepHoursToScore(avgSleep), label: 'sleep' },
    { key: 'screen', score: screenHoursToScore(avgScreen), label: 'screen time' },
    { key: 'social', score: clamp(avgSocial), label: 'social battery' },
    { key: 'mood', score: clamp((avgMood / 4) * 100), label: 'mood' },
  ].sort((a, b) => a.score - b.score);

  const weakest = dims[0];
  const strongest = dims[dims.length - 1];

  const trendLine =
    trend === 'rising'
      ? 'Your Life Balance has been trending up across the week.'
      : trend === 'dipping'
        ? 'Your Life Balance softened a little toward the end of the week.'
        : 'Your Life Balance stayed fairly steady across the week.';

  const summary =
    `${trendLine} Average score ${Math.round(avgScore)} — strongest in ${strongest.label}, ` +
    `while ${weakest.label} needs the most care (sleep ${avgSleep.toFixed(1)}h, screen ${avgScreen.toFixed(1)}h).`;

  const experiment =
    weakest.key === 'sleep'
      ? EXPERIMENTS[0]
      : weakest.key === 'screen'
        ? EXPERIMENTS[1]
        : weakest.key === 'social'
          ? EXPERIMENTS[2]
          : weakest.key === 'mood'
            ? EXPERIMENTS[4]
            : EXPERIMENTS[3];

  return {
    summary,
    experiment,
    generatedAt: new Date().toISOString(),
    daysAnalyzed: done.length,
  };
}
