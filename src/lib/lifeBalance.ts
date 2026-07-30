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
  /** Explainable AI fields derived from the user's own check-ins. */
  insightTitle: string;
  insightSummary: string;
  evidenceSummary: string;
  dataCategoriesUsed: string[];
  validDaysAnalyzed: number;
  recommendation: string;
}

/** Teen-friendly note for the collapsible “how” section — not a medical claim. */
export const WEEKLY_INSIGHT_METHOD_NOTE =
  'We compared your check-in signals across these days and looked for patterns that tended to appear together — without assuming one caused the other.';

/** Categories the explainable section may surface (only if valid data exists). */
export const WEEKLY_DATA_CATEGORIES = [
  'Sleep',
  'Screen Time',
  'Mood',
  'Energy',
  'Physical Symptoms',
] as const;

export type WeeklyDataCategory = (typeof WEEKLY_DATA_CATEGORIES)[number];

const MIN_CATEGORY_DAYS = 4;

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
    return 'Your balance looks solid today.\nKeep one small offline ritual tonight.';
  }

  switch (weakest) {
    case 'sleep':
      return input.sleep < 6
        ? 'Sleep needs a little care tonight.\nTry lights-down 20 minutes earlier.'
        : 'You are close on sleep.\nProtect a calm wind-down and skip late scrolling.';
    case 'screen':
      return 'Screen time is the heavy weight today.\nClose one app after dinner and leave it closed.';
    case 'social':
      return 'Social battery looks low.\nGive yourself one quiet block with no plans.';
    case 'mood':
    default:
      return 'Mood is asking for care.\nTake a short walk or message someone you trust.';
  }
}

export type PersonalChallengeFocus = 'mood' | 'sleep' | 'screen' | 'social';

export interface PersonalChallenge {
  date: string;
  title: string;
  description: string;
  instructions: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'bold';
  timeEstimate: string;
  focus: PersonalChallengeFocus;
  completed: boolean;
  completedAt?: number;
  proofDataUrl?: string;
}

type ChallengeSeed = Omit<PersonalChallenge, 'date' | 'completed' | 'completedAt' | 'proofDataUrl'>;

const PERSONAL_BY_FOCUS: Record<PersonalChallengeFocus, ChallengeSeed[]> = {
  sleep: [
    {
      focus: 'sleep',
      title: 'Phone Outside Bedroom',
      description: 'Park your phone outside the bedroom for tonight’s wind-down.',
      instructions:
        'Thirty minutes before bed, leave your phone in another room. Do a calm activity instead — stretch, read, or just dim the lights. Snap a photo of the phone charging outside your room.',
      points: 15,
      difficulty: 'easy',
      timeEstimate: '30 min',
    },
    {
      focus: 'sleep',
      title: 'Lights-Down Stretch',
      description: 'A short stretch under low light before you sleep.',
      instructions:
        'Dim the lights and stretch gently for about 10 minutes. No screens during it. Take a photo of your dim room or stretch setup when you finish.',
      points: 12,
      difficulty: 'easy',
      timeEstimate: '10 min',
    },
  ],
  screen: [
    {
      focus: 'screen',
      title: 'One App Off After Dinner',
      description: 'Close one heavy app after dinner and leave it closed.',
      instructions:
        'Pick the app that usually eats your evening. Close it after dinner and don’t reopen it tonight. Photo the lock screen or a sticky note with the app name crossed out.',
      points: 15,
      difficulty: 'easy',
      timeEstimate: 'Tonight',
    },
    {
      focus: 'screen',
      title: 'Walk Before Scroll',
      description: 'Take a short outdoor walk before opening social apps.',
      instructions:
        'Before you open social media, step outside for at least 10 minutes. Photo something from the walk — sky, street, or your shoes on the path.',
      points: 15,
      difficulty: 'easy',
      timeEstimate: '10 min',
    },
  ],
  social: [
    {
      focus: 'social',
      title: 'Quiet Block',
      description: 'Protect one no-plans block to recharge your social battery.',
      instructions:
        'Block 45–60 minutes with no plans and no group chats. Do something quiet alone. Photo your calm setup — tea, book, or a cozy corner.',
      points: 15,
      difficulty: 'easy',
      timeEstimate: '45 min',
    },
    {
      focus: 'social',
      title: 'One Soft Check-In',
      description: 'Send one low-pressure message to someone safe.',
      instructions:
        'Text or call one person who feels easy — no big talk required. A “thinking of you” is enough. Photo the sent message (blur names if you want).',
      points: 12,
      difficulty: 'easy',
      timeEstimate: '5 min',
    },
  ],
  mood: [
    {
      focus: 'mood',
      title: 'Two-Line Mood Note',
      description: 'Write what drained you and one small win.',
      instructions:
        'On paper or in notes, write two lines: what drained you today, and one small win. Photo the note when you’re done.',
      points: 12,
      difficulty: 'easy',
      timeEstimate: '5 min',
    },
    {
      focus: 'mood',
      title: 'Sunshine Reset',
      description: 'Step outside for a short mood reset.',
      instructions:
        'Go outside for 8–10 minutes — sit, walk, or just feel the air. Photo the sky or a detail from outdoors.',
      points: 12,
      difficulty: 'easy',
      timeEstimate: '10 min',
    },
  ],
};

function weakestFocus(input: {
  mood: number;
  sleep: number;
  screenTime: number;
  socialBattery: number;
}): PersonalChallengeFocus {
  const parts: { key: PersonalChallengeFocus; score: number }[] = [
    { key: 'mood', score: clamp((input.mood / 4) * 100) },
    { key: 'sleep', score: sleepHoursToScore(input.sleep) },
    { key: 'screen', score: screenHoursToScore(input.screenTime) },
    { key: 'social', score: clamp(input.socialBattery) },
  ].sort((a, b) => a.score - b.score);
  return parts[0].key;
}

/** Build a personal daily challenge from today’s four check-in signals. */
export function generatePersonalChallenge(
  input: {
    mood: number;
    sleep: number;
    screenTime: number;
    socialBattery: number;
    score: number;
  },
  date: string
): PersonalChallenge {
  const focus =
    input.score >= 85 ? 'mood' : weakestFocus(input);
  const pool = PERSONAL_BY_FOCUS[focus];
  // Stable pick for the day so refresh doesn’t reshuffle.
  const dayHash = date.split('').reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const seed = pool[dayHash % pool.length];
  return {
    ...seed,
    date,
    completed: false,
  };
}

export function completedCheckIns(checkIns: CheckIn[]): CheckIn[] {
  return checkIns.filter((c) => c.completed && c.score > 0);
}

export function canUnlockWeeklyInsights(checkIns: CheckIn[]): boolean {
  return completedCheckIns(checkIns).length >= 7;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Which check-in categories have enough real values in the 7-day window. */
export function resolveWeeklyDataCategories(done: CheckIn[]): WeeklyDataCategory[] {
  const used: WeeklyDataCategory[] = [];
  const sleepDays = done.filter((c) => typeof c.sleep === 'number' && c.sleep > 0).length;
  const screenDays = done.filter((c) => typeof c.screenTime === 'number' && c.screenTime >= 0).length;
  const moodDays = done.filter((c) => typeof c.mood === 'number' && c.mood >= 0 && c.mood <= 4).length;
  const energyDays = done.filter(
    (c) => typeof c.socialBattery === 'number' && c.socialBattery > 0
  ).length;

  if (sleepDays >= MIN_CATEGORY_DAYS) used.push('Sleep');
  if (screenDays >= MIN_CATEGORY_DAYS) used.push('Screen Time');
  if (moodDays >= MIN_CATEGORY_DAYS) used.push('Mood');
  if (energyDays >= MIN_CATEGORY_DAYS) used.push('Energy');
  // Physical Symptoms are not stored on daily check-ins — never invent them.
  return used;
}

type Signal = {
  key: string;
  shortLabel: string;
  lowPhrase: string;
  highPhrase: string;
  values: number[];
};

function buildEvidenceSummary(done: CheckIn[], categories: WeeklyDataCategory[]): string {
  const signals: Signal[] = [];
  if (categories.includes('Sleep')) {
    signals.push({
      key: 'sleep',
      shortLabel: 'sleep',
      lowPhrase: 'shorter sleep',
      highPhrase: 'longer sleep',
      values: done.map((c) => c.sleep),
    });
  }
  if (categories.includes('Screen Time')) {
    signals.push({
      key: 'screen',
      shortLabel: 'screen time',
      lowPhrase: 'lower screen time',
      highPhrase: 'higher screen time',
      values: done.map((c) => c.screenTime),
    });
  }
  if (categories.includes('Mood')) {
    signals.push({
      key: 'mood',
      shortLabel: 'mood',
      lowPhrase: 'lower mood',
      highPhrase: 'higher mood',
      values: done.map((c) => c.mood),
    });
  }
  if (categories.includes('Energy')) {
    signals.push({
      key: 'energy',
      shortLabel: 'energy',
      lowPhrase: 'lower energy',
      highPhrase: 'higher energy',
      values: done.map((c) => c.socialBattery),
    });
  }

  if (signals.length < 2) {
    return `Across ${done.length} check-ins, your logged signals looked fairly steady — keep checking in to spot clearer personal patterns.`;
  }

  let best: { strength: number; text: string } | null = null;

  for (const split of signals) {
    const med = median(split.values);
    const lowIdx: number[] = [];
    const highIdx: number[] = [];
    split.values.forEach((v, idx) => {
      if (v <= med) lowIdx.push(idx);
      else highIdx.push(idx);
    });
    if (lowIdx.length < 2 || highIdx.length < 2) continue;

    for (const outcome of signals) {
      if (outcome.key === split.key) continue;
      const lowMean = mean(lowIdx.map((i) => outcome.values[i]));
      const highMean = mean(highIdx.map((i) => outcome.values[i]));
      const diff = highMean - lowMean;
      const scale = Math.max(Math.abs(mean(outcome.values)), 0.35);
      const strength = Math.abs(diff) / scale;
      if (strength < 0.08) continue;

      const whenLow =
        diff < 0
          ? `Days with ${split.lowPhrase} tended to come with ${outcome.highPhrase}.`
          : `Days with ${split.lowPhrase} tended to come with ${outcome.lowPhrase}.`;
      const whenHigh =
        diff > 0
          ? `${outcome.highPhrase.charAt(0).toUpperCase()}${outcome.highPhrase.slice(1)} was associated with ${split.highPhrase} across your check-ins.`
          : `${outcome.lowPhrase.charAt(0).toUpperCase()}${outcome.lowPhrase.slice(1)} appeared more often on days with ${split.highPhrase}.`;

      // Prefer teen-friendly "days with X tended to…" phrasing
      const text = strength >= 0.2 ? whenLow : whenHigh;
      if (!best || strength > best.strength) {
        best = { strength, text };
      }
    }
  }

  if (best) return best.text;

  const names = categories.slice(0, 3).join(', ');
  return `${names} appeared in your last ${done.length} check-ins, with no single strong link standing out yet.`;
}

/** Build / refresh explainable fields from the signed-in user's check-ins. */
export function buildWeeklyExplainability(
  checkIns: CheckIn[]
): Pick<
  WeeklyInsight,
  | 'insightTitle'
  | 'insightSummary'
  | 'evidenceSummary'
  | 'dataCategoriesUsed'
  | 'validDaysAnalyzed'
  | 'recommendation'
> | null {
  const done = completedCheckIns(checkIns).slice(-7);
  if (done.length < 7) return null;

  const dataCategoriesUsed = resolveWeeklyDataCategories(done);
  const base = generateWeeklyInsightCore(done);
  if (!base) return null;

  return {
    insightTitle: base.experiment.title,
    insightSummary: base.summary,
    evidenceSummary: buildEvidenceSummary(done, dataCategoriesUsed),
    dataCategoriesUsed,
    validDaysAnalyzed: done.length,
    recommendation: base.experiment.description,
  };
}

function generateWeeklyInsightCore(done: CheckIn[]): Omit<
  WeeklyInsight,
  | 'insightTitle'
  | 'insightSummary'
  | 'evidenceSummary'
  | 'dataCategoriesUsed'
  | 'validDaysAnalyzed'
  | 'recommendation'
> | null {
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

export function generateWeeklyInsight(checkIns: CheckIn[]): WeeklyInsight | null {
  const done = completedCheckIns(checkIns).slice(-7);
  if (done.length < 7) return null;

  const core = generateWeeklyInsightCore(done);
  if (!core) return null;

  const dataCategoriesUsed = resolveWeeklyDataCategories(done);
  const evidenceSummary = buildEvidenceSummary(done, dataCategoriesUsed);

  return {
    ...core,
    insightTitle: core.experiment.title,
    insightSummary: core.summary,
    evidenceSummary,
    dataCategoriesUsed,
    validDaysAnalyzed: done.length,
    recommendation: core.experiment.description,
  };
}
