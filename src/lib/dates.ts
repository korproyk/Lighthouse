import type { CheckIn } from './mockData';

/** Local calendar YYYY-MM-DD (avoids UTC day-shift from toISOString). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD key as a local calendar date (noon-safe for comparisons). */
export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addLocalDays(key: string, delta: number): string {
  const d = parseLocalDateKey(key);
  d.setDate(d.getDate() + delta);
  return localDateKey(d);
}

/** Monday 00:00 local of the week containing `date`. */
export function startOfWeekMonday(date: Date = new Date()): Date {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diff);
  return local;
}

export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type WeekDayState = 'completed' | 'missed' | 'upcoming' | 'before_start';

export interface WeekDaySlot {
  date: string;
  label: (typeof WEEKDAY_LABELS)[number];
  weekdayName: (typeof WEEKDAY_NAMES)[number];
  state: WeekDayState;
  isToday: boolean;
  score: number;
  ariaLabel: string;
}

function statusPhrase(slot: Pick<WeekDaySlot, 'state' | 'isToday'>): string {
  if (slot.isToday && slot.state !== 'completed') return 'today, not completed';
  if (slot.isToday && slot.state === 'completed') return 'today, completed';
  switch (slot.state) {
    case 'completed':
      return 'completed';
    case 'missed':
      return 'missed';
    case 'upcoming':
      return 'upcoming';
    case 'before_start':
      return 'before account creation';
  }
}

/**
 * First calendar day the user was eligible to check in.
 * Uses account creation (`memberSince`); if a completed check-in exists earlier
 * (legacy/demo), that earlier date becomes the floor so history still shows.
 */
export function eligibleCheckInStart(
  memberSince: string,
  checkIns: CheckIn[]
): string {
  const firstCompleted = checkIns
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()[0];
  if (firstCompleted && firstCompleted < memberSince) return firstCompleted;
  return memberSince;
}

/**
 * Fixed Mon→Sun week indicator for the current local week.
 * Pre-eligibility days are `before_start` (not missed).
 */
export function buildCurrentWeekProgress(
  checkIns: CheckIn[],
  memberSince: string,
  now: Date = new Date()
): WeekDaySlot[] {
  const today = localDateKey(now);
  const eligibleStart = eligibleCheckInStart(memberSince, checkIns);
  const weekStart = startOfWeekMonday(now);
  const byDate = new Map(
    checkIns.filter((c) => c.completed).map((c) => [c.date, c] as const)
  );

  return WEEKDAY_LABELS.map((label, i) => {
    const date = localDateKey(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
    );
    const isToday = date === today;
    const row = byDate.get(date);

    let state: WeekDayState;
    if (date < eligibleStart) {
      state = 'before_start';
    } else if (row) {
      state = 'completed';
    } else if (date > today) {
      state = 'upcoming';
    } else if (isToday) {
      state = 'upcoming'; // today, not completed — emphasized in UI
    } else {
      state = 'missed';
    }

    const weekdayName = WEEKDAY_NAMES[i];
    const score = row?.score ?? 0;
    const slot = { date, label, weekdayName, state, isToday, score, ariaLabel: '' };
    slot.ariaLabel = `${weekdayName}: ${statusPhrase(slot)}`;
    return slot;
  });
}
