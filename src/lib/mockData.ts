import type { TierId } from './tiers';

export interface CheckIn {
  date: string;
  mood: number;
  screenTime: number;
  sleep: number;
  socialBattery: number;
  score: number;
  completed: boolean;
  /** Short AI tip saved with today's check-in. */
  tip?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'bold';
  pack: 'bangladesh' | 'korea' | 'worldwide';
  flag: string;
  timeEstimate: string;
  points: number;
  completed?: boolean;
  /** When the challenge was marked done — used for the 2-week redo window. */
  completedAt?: number;
  /** Compressed JPEG data URL of user proof photo (local only). */
  proofDataUrl?: string;
  // Required quests are pinned above the list and ignore the pack/difficulty
  // filters. `tracker` marks a quest that is measured by the app instead of
  // being self-reported with a Done button.
  required?: boolean;
  tracker?: 'sleep';
}

export const SLEEP_GOAL_HOURS = 8;

export interface CommunityWin {
  id: string;
  text: string;
  country: string;
  flag: string;
  color: string;
  timestamp: string;
  reactions: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  earned: boolean;
  earnedDate?: string;
  description: string;
}

export interface HealthCluster {
  id: string;
  lat: number;
  lng: number;
  city: string;
  symptom: string;
  intensity: number;
  count: number;
}

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type { TierId } from './tiers';

export const userProfile = {
  name: 'Aranya',
  avatar: 'classic',
  country: 'Bangladesh',
  countryFlag: '\u{1F1E7}\u{1F1E9}',
  ageRange: '15-16',
  language: 'en',
  memberSince: '2026-03-15',
  tier: 'spark' as TierId,
  tierProgress: 0,
  totalChallenges: 0,
  /** Challenge XP — fuels the tier ladder (not Life Balance). */
  xp: 0,
  currentScore: 0,
  currentStreak: 0,
  weeklyChange: 0,
};

export const checkIns: CheckIn[] = [
  { date: daysAgo(13), mood: 3, screenTime: 5.2, sleep: 6.5, socialBattery: 45, score: 58, completed: true },
  { date: daysAgo(12), mood: 4, screenTime: 4.1, sleep: 7.0, socialBattery: 60, score: 62, completed: true },
  { date: daysAgo(11), mood: 3, screenTime: 6.0, sleep: 5.5, socialBattery: 35, score: 55, completed: true },
  { date: daysAgo(10), mood: 4, screenTime: 3.8, sleep: 7.5, socialBattery: 70, score: 67, completed: true },
  { date: daysAgo(9), mood: 4, screenTime: 3.2, sleep: 8.0, socialBattery: 80, score: 72, completed: true },
  { date: daysAgo(8), mood: 4, screenTime: 4.5, sleep: 7.0, socialBattery: 55, score: 65, completed: true },
  { date: daysAgo(7), mood: 3, screenTime: 5.5, sleep: 6.0, socialBattery: 40, score: 58, completed: true },
  { date: daysAgo(6), mood: 4, screenTime: 3.5, sleep: 7.5, socialBattery: 65, score: 69, completed: true },
  { date: daysAgo(5), mood: 4, screenTime: 2.8, sleep: 8.0, socialBattery: 75, score: 74, completed: true },
  { date: daysAgo(4), mood: 4, screenTime: 4.0, sleep: 7.0, socialBattery: 60, score: 68, completed: true },
  { date: daysAgo(3), mood: 4, screenTime: 3.2, sleep: 7.5, socialBattery: 70, score: 71, completed: true },
  { date: daysAgo(2), mood: 4, screenTime: 2.5, sleep: 8.0, socialBattery: 80, score: 76, completed: true },
  { date: daysAgo(1), mood: 4, screenTime: 3.0, sleep: 7.5, socialBattery: 65, score: 73, completed: true },
  { date: daysAgo(0), mood: 0, screenTime: 0, sleep: 0, socialBattery: 0, score: 73, completed: false },
];

export const challenges: Challenge[] = [
  {
    id: 'core-sleep',
    title: 'Sleep 8 Hours',
    description: 'Everyone starts here. Time a full night of rest.',
    instructions: 'Tap Record sleep time to open the sleep page. Double-tap Start Bedtime when you put your phone down. The timer keeps counting while the app is closed. In the morning, double-tap Are U Awake? to stop it. Reach 8 hours to complete it.',
    difficulty: 'easy',
    pack: 'worldwide',
    flag: '\u{1F31B}',
    timeEstimate: '8 h',
    points: 40,
    required: true,
    tracker: 'sleep',
  },
  {
    id: 'bd-1',
    title: 'Tea with Someone New',
    description: 'Share a cup of tea with someone you don\'t usually talk to.',
    instructions: 'Find someone at school, in your neighborhood, or family you rarely speak to. Offer to share tea together. Listen more than you talk. Notice how it feels.',
    difficulty: 'easy',
    pack: 'bangladesh',
    flag: '\u{1F1E7}\u{1F1E9}',
    timeEstimate: '20 min',
    points: 15,
  },
  {
    id: 'bd-2',
    title: 'River Walk Reflection',
    description: 'Walk along any water body and journal 3 things you noticed.',
    instructions: 'Walk for at least 15 minutes near a river, pond, or lake. Pay attention to sounds, smells, and sights. Write down 3 things that caught your attention in the app.',
    difficulty: 'easy',
    pack: 'bangladesh',
    flag: '\u{1F1E7}\u{1F1E9}',
    timeEstimate: '30 min',
    points: 20,
  },
  {
    id: 'bd-3',
    title: 'Cook a Family Recipe',
    description: 'Ask a grandparent or parent for their favorite recipe and make it together.',
    instructions: 'Reach out to an older family member. Ask them to teach you one dish. Focus on the process, not perfection. Take a photo when done!',
    difficulty: 'medium',
    pack: 'bangladesh',
    flag: '\u{1F1E7}\u{1F1E9}',
    timeEstimate: '1 hour',
    points: 35,
  },
  {
    id: 'bd-4',
    title: 'Monsoon Mindfulness',
    description: 'Sit near a window during rain and practice 5 minutes of deep breathing.',
    instructions: 'When it rains, sit comfortably near a window. Close your eyes. Breathe in for 4 counts, hold for 4, out for 6. Let the rain sounds ground you.',
    difficulty: 'easy',
    pack: 'bangladesh',
    flag: '\u{1F1E7}\u{1F1E9}',
    timeEstimate: '10 min',
    points: 15,
  },
  {
    id: 'kr-1',
    title: 'Han River Sunset Walk',
    description: 'Walk along any riverside path and watch the sunset.',
    instructions: 'Go to your nearest riverside walking path. Walk slowly for 20 minutes before sunset. Put your phone in your pocket. Just be present.',
    difficulty: 'easy',
    pack: 'korea',
    flag: '\u{1F1F0}\u{1F1F7}',
    timeEstimate: '30 min',
    points: 20,
  },
  {
    id: 'kr-2',
    title: 'PC Bang Detox Day',
    description: 'Spend one day without gaming. Do something analog instead.',
    instructions: 'Choose a full day. No PC bang, no mobile games. Instead: draw, read manhwa in paper, play basketball, cook ramyeon from scratch. Journal how it felt at the end.',
    difficulty: 'bold',
    pack: 'korea',
    flag: '\u{1F1F0}\u{1F1F7}',
    timeEstimate: 'Full day',
    points: 50,
  },
  {
    id: 'kr-3',
    title: 'Handwritten Letter',
    description: 'Write a letter to a friend on paper and give it to them.',
    instructions: 'Get paper and a pen. Write a letter to a friend telling them something you appreciate about them. Give it in person. Watch their reaction.',
    difficulty: 'medium',
    pack: 'korea',
    flag: '\u{1F1F0}\u{1F1F7}',
    timeEstimate: '30 min',
    points: 30,
  },
  {
    id: 'kr-4',
    title: 'Temple Stay Lite',
    description: 'Practice 10 minutes of seated meditation with tea.',
    instructions: 'Make green tea. Sit quietly. Focus on the warmth of the cup, the taste, the silence. Set a timer for 10 minutes. Let thoughts pass like clouds.',
    difficulty: 'easy',
    pack: 'korea',
    flag: '\u{1F1F0}\u{1F1F7}',
    timeEstimate: '15 min',
    points: 15,
  },
  {
    id: 'ww-1',
    title: 'Compliment Chain',
    description: 'Give 3 genuine compliments to 3 different people today.',
    instructions: 'Throughout the day, give 3 sincere compliments to different people. They can be friends, family, teachers, or strangers. Notice how giving makes you feel.',
    difficulty: 'easy',
    pack: 'worldwide',
    flag: '\u{1F30D}',
    timeEstimate: 'All day',
    points: 20,
  },
  {
    id: 'ww-2',
    title: 'Digital Sunset',
    description: 'No screens for the last 90 minutes before bed.',
    instructions: 'Set an alarm 90 minutes before your target bedtime. When it rings, put all screens away. Read, stretch, journal, or just lie in bed and think.',
    difficulty: 'medium',
    pack: 'worldwide',
    flag: '\u{1F30D}',
    timeEstimate: '90 min',
    points: 30,
  },
  {
    id: 'ww-3',
    title: '5-4-3-2-1 Grounding',
    description: 'Use the 5-4-3-2-1 technique wherever you are right now.',
    instructions: 'Notice: 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste. Take your time with each one.',
    difficulty: 'easy',
    pack: 'worldwide',
    flag: '\u{1F30D}',
    timeEstimate: '5 min',
    points: 10,
  },
  {
    id: 'ww-4',
    title: 'Gratitude Photo Walk',
    description: 'Take 5 photos of things you\'re grateful for and caption them.',
    instructions: 'Walk around your neighborhood. Photograph 5 things that bring you joy or comfort. Write a one-line caption for each. Share one on the Community board if you want.',
    difficulty: 'medium',
    pack: 'worldwide',
    flag: '\u{1F30D}',
    timeEstimate: '30 min',
    points: 25,
  },
];

const winColors = ['#FFB547', '#FF6B7A', '#34D399', '#67E8F0', '#A78BFA', '#FFD479'];

export const communityWins: CommunityWin[] = [
  { id: 'w1', text: 'Went for a morning walk before school. The air felt different.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[0], timestamp: '2026-04-28T07:23:00Z', reactions: 24 },
  { id: 'w2', text: 'Wrote a letter to my best friend. She cried (happy tears).', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[1], timestamp: '2026-04-28T06:45:00Z', reactions: 31 },
  { id: 'w3', text: 'Made tea for my grandmother. We talked for an hour.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[2], timestamp: '2026-04-27T18:12:00Z', reactions: 19 },
  { id: 'w4', text: 'No gaming for a full day. Read a whole manhwa volume instead.', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[3], timestamp: '2026-04-27T15:30:00Z', reactions: 42 },
  { id: 'w5', text: 'Did the breathing exercise during math exam panic. It helped!', country: 'India', flag: '\u{1F1EE}\u{1F1F3}', color: winColors[4], timestamp: '2026-04-27T11:05:00Z', reactions: 56 },
  { id: 'w6', text: 'Gave 3 compliments today. The janitor at school smiled so big.', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', color: winColors[5], timestamp: '2026-04-27T08:22:00Z', reactions: 37 },
  { id: 'w7', text: 'Watched the sunset from my rooftop. No phone. Just me and the sky.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[0], timestamp: '2026-04-26T17:45:00Z', reactions: 28 },
  { id: 'w8', text: '12-day streak! I actually look forward to challenges now.', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[1], timestamp: '2026-04-26T14:10:00Z', reactions: 63 },
  { id: 'w9', text: 'My mom asked why I seem happier lately. This app, Ammu. This app.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[2], timestamp: '2026-04-26T09:30:00Z', reactions: 88 },
  { id: 'w10', text: 'Cooked japchae with my halmoni. Best Sunday ever.', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[3], timestamp: '2026-04-25T19:00:00Z', reactions: 45 },
  { id: 'w11', text: 'Used 5-4-3-2-1 grounding during a panic moment at hagwon.', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[4], timestamp: '2026-04-25T16:15:00Z', reactions: 34 },
  { id: 'w12', text: 'Went to bed without my phone for the first time in months.', country: 'USA', flag: '\u{1F1FA}\u{1F1F8}', color: winColors[5], timestamp: '2026-04-25T10:45:00Z', reactions: 29 },
  { id: 'w13', text: 'My accountability partner sent me a wave right when I needed it.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[0], timestamp: '2026-04-25T07:30:00Z', reactions: 21 },
  { id: 'w14', text: 'Rainy day meditation by the window. Pure peace.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[1], timestamp: '2026-04-24T18:50:00Z', reactions: 38 },
  { id: 'w15', text: 'Told my friend something real instead of saying "I\'m fine."', country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', color: winColors[2], timestamp: '2026-04-24T14:20:00Z', reactions: 52 },
  { id: 'w16', text: 'Screen time down 2 hours from last week. Proud of myself.', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', color: winColors[3], timestamp: '2026-04-24T11:00:00Z', reactions: 41 },
  { id: 'w17', text: 'Took the gratitude photo walk. My neighborhood is beautiful.', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', color: winColors[4], timestamp: '2026-04-24T08:15:00Z', reactions: 33 },
  { id: 'w18', text: 'Became a Flame tier today! The animation was so cool.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[5], timestamp: '2026-04-23T19:30:00Z', reactions: 67 },
  { id: 'w19', text: 'My sleep went from 5hrs to 7.5hrs average this month.', country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', color: winColors[0], timestamp: '2026-04-23T15:45:00Z', reactions: 44 },
  { id: 'w20', text: 'LightBot helped me through a rough night. Thank you Lumi.', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', color: winColors[1], timestamp: '2026-04-23T10:00:00Z', reactions: 76 },
];

export const badges: Badge[] = [
  { id: 'b1', name: 'First Light', icon: 'sunrise', gradient: 'from-lighthouse-300 to-lighthouse-500', earned: true, earnedDate: '2026-03-15', description: 'Complete your first check-in' },
  { id: 'b2', name: 'Week Warrior', icon: 'calendar', gradient: 'from-mint-300 to-mint-500', earned: true, earnedDate: '2026-03-22', description: '7-day check-in streak' },
  { id: 'b3', name: 'Challenge Starter', icon: 'target', gradient: 'from-coral-300 to-coral-500', earned: true, earnedDate: '2026-03-18', description: 'Complete your first challenge' },
  { id: 'b4', name: 'Social Spark', icon: 'heart', gradient: 'from-lavender-300 to-lavender-500', earned: true, earnedDate: '2026-04-02', description: 'Send your first wave' },
  { id: 'b5', name: 'Night Owl Reformed', icon: 'moon', gradient: 'from-ocean-300 to-ocean-500', earned: false, description: 'Sleep 8+ hours for 5 days in a row' },
  { id: 'b6', name: 'Digital Detox Hero', icon: 'smartphone-off', gradient: 'from-lighthouse-500 to-coral-500', earned: false, description: 'Under 2 hours screen time for 3 days' },
  { id: 'b7', name: 'Culture Explorer', icon: 'globe', gradient: 'from-ocean-500 to-mint-500', earned: false, description: 'Complete challenges from all 3 packs' },
  { id: 'b8', name: 'Flame Keeper', icon: 'flame', gradient: 'from-lighthouse-600 to-coral-600', earned: false, description: 'Reach Flame tier' },
  { id: 'b9', name: 'Community Voice', icon: 'megaphone', gradient: 'from-coral-300 to-lavender-300', earned: false, description: 'Share 5 wins on the board' },
  { id: 'b10', name: 'Mindful Master', icon: 'brain', gradient: 'from-lavender-500 to-ocean-500', earned: false, description: 'Complete 10 breathing exercises' },
  { id: 'b11', name: 'Lighthouse Keeper', icon: 'lighthouse', gradient: 'from-lighthouse-500 to-lighthouse-700', earned: false, description: 'Reach the highest tier' },
  { id: 'b12', name: 'Month Strong', icon: 'trophy', gradient: 'from-mint-500 to-ocean-700', earned: false, description: '30-day check-in streak' },
];

/**
 * Sample/demo map clusters for Community > Map (Seoul viewport at zoom ~12).
 * Intensities map to alert levels: normal <0.5, slight <0.65, watch <0.8, warning ≥0.8.
 * Physical: ~11 Normal, ~5 Slight, 2 Watch, 2 Warning.
 * Digital Habits: ~4 Normal, ~8 Slight, ~7 Watch, ~2 Warning (yellow/orange dominate).
 * Does not drive Community Summary totals or live alert detection.
 */
export const healthClusters: HealthCluster[] = [
  // —— Normal (green) —— physical
  { id: 'h-n1', lat: 37.5668, lng: 126.9784, city: 'Jung-gu, Seoul', symptom: 'Headache', intensity: 0.28, count: 42 },
  { id: 'h-n2', lat: 37.5552, lng: 126.9362, city: 'Mapo-gu, Seoul', symptom: 'Fatigue', intensity: 0.32, count: 38 },
  { id: 'h-n3', lat: 37.5792, lng: 126.9368, city: 'Seodaemun-gu, Seoul', symptom: 'Cough', intensity: 0.24, count: 29 },
  { id: 'h-n4', lat: 37.5488, lng: 127.0405, city: 'Seongdong-gu, Seoul', symptom: 'Sore Throat', intensity: 0.36, count: 33 },
  { id: 'h-n5', lat: 37.5215, lng: 126.9248, city: 'Yeongdeungpo-gu, Seoul', symptom: 'Fever', intensity: 0.22, count: 21 },
  { id: 'h-n6', lat: 37.5895, lng: 127.0168, city: 'Seongbuk-gu, Seoul', symptom: 'Stomach Pain', intensity: 0.40, count: 27 },
  { id: 'h-n7', lat: 37.5138, lng: 126.9425, city: 'Dongjak-gu, Seoul', symptom: 'Diarrhea', intensity: 0.30, count: 19 },
  { id: 'h-n8', lat: 37.6018, lng: 126.9555, city: 'Eunpyeong-gu, Seoul', symptom: 'Fatigue', intensity: 0.26, count: 24 },
  { id: 'h-n9', lat: 37.5365, lng: 127.0842, city: 'Gwangjin-gu, Seoul', symptom: 'Headache', intensity: 0.34, count: 31 },
  { id: 'h-n10', lat: 37.4985, lng: 126.9952, city: 'Seocho-gu, Seoul', symptom: 'Cough', intensity: 0.38, count: 26 },
  { id: 'h-n11', lat: 37.5625, lng: 127.0358, city: 'Dongdaemun-gu, Seoul', symptom: 'Sore Throat', intensity: 0.29, count: 22 },
  // —— Slight Increase (yellow) —— physical
  { id: 'h-s1', lat: 37.5798, lng: 126.9788, city: 'Jongno-gu, Seoul', symptom: 'Fever', intensity: 0.54, count: 18 },
  { id: 'h-s2', lat: 37.5412, lng: 126.9688, city: 'Yongsan-gu, Seoul', symptom: 'Fatigue', intensity: 0.58, count: 22 },
  { id: 'h-s3', lat: 37.5088, lng: 127.0625, city: 'Gangnam-gu, Seoul', symptom: 'Headache', intensity: 0.52, count: 16 },
  { id: 'h-s4', lat: 37.4865, lng: 126.9018, city: 'Guro-gu, Seoul', symptom: 'Cough', intensity: 0.60, count: 20 },
  { id: 'h-s5', lat: 37.6548, lng: 127.0562, city: 'Nowon-gu, Seoul', symptom: 'Stomach Pain', intensity: 0.56, count: 15 },
  // —— Watch (orange) —— physical
  { id: 'h-w1', lat: 37.5285, lng: 127.0288, city: 'Gangnam-gu, Seoul', symptom: 'Fever', intensity: 0.70, count: 48 },
  { id: 'h-w2', lat: 37.5688, lng: 126.9485, city: 'Mapo-gu, Seoul', symptom: 'Fatigue', intensity: 0.74, count: 36 },
  // —— Warning (red) —— physical
  { id: 'h-r1', lat: 37.5525, lng: 126.9885, city: 'Yongsan-gu, Seoul', symptom: 'Fever', intensity: 0.88, count: 62 },
  { id: 'h-r2', lat: 37.5725, lng: 126.9918, city: 'Jongno-gu, Seoul', symptom: 'Headache', intensity: 0.86, count: 41 },

  // —— Digital Habits sample (~4 Normal, ~8 Slight, ~7 Watch, ~2 Warning) ——
  // Yellow/orange dominate; locations offset from Physical pins for a distinct map feel.
  { id: 'h-dn1', lat: 37.5568, lng: 126.9238, city: 'Mapo-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.28, count: 14 },
  { id: 'h-dn2', lat: 37.5785, lng: 126.9355, city: 'Seodaemun-gu, Seoul', symptom: 'FOMO', intensity: 0.32, count: 11 },
  { id: 'h-dn3', lat: 37.5195, lng: 126.9788, city: 'Yongsan-gu, Seoul', symptom: 'Sleep Loss', intensity: 0.24, count: 16 },
  { id: 'h-dn4', lat: 37.5912, lng: 127.0225, city: 'Seongbuk-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.36, count: 12 },

  { id: 'h-ds1', lat: 37.5105, lng: 127.0418, city: 'Gangnam-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.54, count: 31 },
  { id: 'h-ds2', lat: 37.5815, lng: 126.9425, city: 'Seodaemun-gu, Seoul', symptom: 'Sleep Loss', intensity: 0.58, count: 28 },
  { id: 'h-ds3', lat: 37.5428, lng: 127.0685, city: 'Gwangjin-gu, Seoul', symptom: 'FOMO', intensity: 0.52, count: 25 },
  { id: 'h-ds4', lat: 37.4935, lng: 126.9085, city: 'Guro-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.60, count: 33 },
  { id: 'h-ds5', lat: 37.5648, lng: 126.9845, city: 'Jung-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.55, count: 29 },
  { id: 'h-ds6', lat: 37.5325, lng: 126.9585, city: 'Yongsan-gu, Seoul', symptom: 'Sleep Loss', intensity: 0.57, count: 22 },
  { id: 'h-ds7', lat: 37.5055, lng: 126.9535, city: 'Dongjak-gu, Seoul', symptom: 'FOMO', intensity: 0.53, count: 27 },
  { id: 'h-ds8', lat: 37.5485, lng: 127.0488, city: 'Seongdong-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.59, count: 30 },

  { id: 'h-dw1', lat: 37.5245, lng: 126.9688, city: 'Yongsan-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.70, count: 27 },
  { id: 'h-dw2', lat: 37.5025, lng: 127.0325, city: 'Gangnam-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.74, count: 34 },
  { id: 'h-dw3', lat: 37.5585, lng: 126.9455, city: 'Mapo-gu, Seoul', symptom: 'FOMO', intensity: 0.68, count: 24 },
  { id: 'h-dw4', lat: 37.5755, lng: 126.9885, city: 'Jongno-gu, Seoul', symptom: 'Sleep Loss', intensity: 0.72, count: 29 },
  { id: 'h-dw5', lat: 37.4885, lng: 126.9825, city: 'Seocho-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.76, count: 31 },
  { id: 'h-dw6', lat: 37.5385, lng: 127.0885, city: 'Gwangjin-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.69, count: 26 },
  { id: 'h-dw7', lat: 37.5685, lng: 127.0285, city: 'Dongdaemun-gu, Seoul', symptom: 'FOMO', intensity: 0.73, count: 23 },

  { id: 'h-dr1', lat: 37.5708, lng: 126.9765, city: 'Jongno-gu, Seoul', symptom: 'Doomscrolling', intensity: 0.88, count: 9 },
  { id: 'h-dr2', lat: 37.5155, lng: 127.0185, city: 'Gangnam-gu, Seoul', symptom: 'Screen Fatigue', intensity: 0.91, count: 12 },
];

// Places that help you put the phone down: quiet screen-free rooms, outdoor
// spots, hands-on skill workshops, and peer support for screen struggles.
export type PlaceCategory = 'screenfree' | 'outdoors' | 'skills' | 'support';

export interface NearbyPlace {
  id: string;
  name: string;
  detail: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
}

export const nearbyPlaces: NearbyPlace[] = [
  { id: 'p1', name: 'Jongno Quiet Reading Room', detail: 'Phones stay in the locker', category: 'screenfree', lat: 37.5700, lng: 126.9910 },
  { id: 'p2', name: 'Yongsan Library Focus Floor', detail: 'No-screen study desks', category: 'screenfree', lat: 37.5385, lng: 126.9660 },
  { id: 'p3', name: 'Euljiro Offline Caf\u00e9', detail: 'Deliberately no wifi', category: 'screenfree', lat: 37.5665, lng: 127.0000 },
  { id: 'p4', name: 'Hangang Park, Ttukseom', detail: 'River walk \u00b7 Bike path', category: 'outdoors', lat: 37.5310, lng: 127.0665 },
  { id: 'p5', name: 'Namsan Trail Entrance', detail: '20 min uphill \u00b7 Big view', category: 'outdoors', lat: 37.5512, lng: 126.9882 },
  { id: 'p6', name: 'Mapo Sports Court', detail: 'Pickup basketball, evenings', category: 'outdoors', lat: 37.5540, lng: 126.9410 },
  { id: 'p7', name: 'Mapo Community Kitchen', detail: 'Weekend cooking classes', category: 'skills', lat: 37.5575, lng: 126.9255 },
  { id: 'p8', name: 'Seongsu Repair Workshop', detail: 'Fix your own things', category: 'skills', lat: 37.5445, lng: 127.0560 },
  { id: 'p9', name: 'Jongno Craft Studio', detail: 'Woodwork \u00b7 Knots \u00b7 Sewing', category: 'skills', lat: 37.5748, lng: 126.9850 },
  { id: 'p10', name: 'Hongdae Teen Support Circle', detail: 'Meets Saturdays \u00b7 Anonymous', category: 'support', lat: 37.5560, lng: 126.9240 },
  { id: 'p11', name: 'Yeouido Counselling Centre', detail: 'Free youth counselling', category: 'support', lat: 37.5215, lng: 126.9245 },
  { id: 'p12', name: 'Gangnam Screen-Balance Group', detail: 'Weekly peer group \u00b7 Drop in', category: 'support', lat: 37.5045, lng: 127.0245 },
];

export const accountabilityPartner = {
  name: 'Minjun',
  avatar: 'scholar',
  country: 'South Korea',
  flag: '\u{1F1F0}\u{1F1F7}',
  lastSeen: '2 hours ago',
  streak: 9,
};

export interface LeaderboardEntry {
  rank: number;
  name: string;
  country: string;
  flag: string;
  score: number;
  streak: number;
  avatar: string;
  isYou?: boolean;
}

export interface ChallengeGroup {
  id: string;
  name: string;
  code: string;
  members: { name: string; avatar: string; flag: string; score: number; challenges: number }[];
  totalScore: number;
  createdAt: string;
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Subin', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', score: 94, streak: 28, avatar: 'S' },
  { rank: 2, name: 'Fatima', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', score: 91, streak: 21, avatar: 'F' },
  { rank: 3, name: 'Hana', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', score: 88, streak: 19, avatar: 'H' },
  { rank: 4, name: 'Raihan', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', score: 85, streak: 16, avatar: 'R' },
  { rank: 5, name: 'Yuki', country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', score: 82, streak: 14, avatar: 'Y' },
  { rank: 6, name: 'Aranya', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', score: 73, streak: 12, avatar: 'A', isYou: true },
  { rank: 7, name: 'Priya', country: 'India', flag: '\u{1F1EE}\u{1F1F3}', score: 71, streak: 11, avatar: 'P' },
  { rank: 8, name: 'Minjun', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', score: 68, streak: 9, avatar: 'M' },
  { rank: 9, name: 'Anika', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', score: 65, streak: 8, avatar: 'A' },
  { rank: 10, name: 'Leo', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', score: 62, streak: 7, avatar: 'L' },
];

export const challengeGroups: ChallengeGroup[] = [
  {
    id: 'g1',
    name: 'Dhaka Dreamers',
    code: 'DHAKA24',
    members: [
      { name: 'Aranya', avatar: 'A', flag: '\u{1F1E7}\u{1F1E9}', score: 73, challenges: 47 },
      { name: 'Fatima', avatar: 'F', flag: '\u{1F1E7}\u{1F1E9}', score: 91, challenges: 62 },
      { name: 'Raihan', avatar: 'R', flag: '\u{1F1E7}\u{1F1E9}', score: 85, challenges: 55 },
      { name: 'Anika', avatar: 'A', flag: '\u{1F1E7}\u{1F1E9}', score: 65, challenges: 38 },
    ],
    totalScore: 314,
    createdAt: '2026-03-20',
  },
  {
    id: 'g2',
    name: 'Seoul Squad',
    code: 'SEOUL99',
    members: [
      { name: 'Subin', avatar: 'S', flag: '\u{1F1F0}\u{1F1F7}', score: 94, challenges: 71 },
      { name: 'Hana', avatar: 'H', flag: '\u{1F1F0}\u{1F1F7}', score: 88, challenges: 59 },
      { name: 'Minjun', avatar: 'M', flag: '\u{1F1F0}\u{1F1F7}', score: 68, challenges: 42 },
    ],
    totalScore: 250,
    createdAt: '2026-03-18',
  },
];

export interface LearningSkill {
  id: string;
  title: string;
  category: 'cooking' | 'craft' | 'home' | 'money' | 'outdoors' | 'repair' | 'wellness';
  teacher: string;
  teacherFlag: string;
  duration: string;
  ageMin: number;
  learners: number;
  difficulty: 'easy' | 'medium' | 'bold';
  description: string;
  color: string;
}

export const learningSkills: LearningSkill[] = [
  {
    id: 'l1',
    title: 'Cook a one-pot khichuri',
    category: 'cooking',
    teacher: 'Nanu Rahima',
    teacherFlag: '\u{1F1E7}\u{1F1E9}',
    duration: '25 min',
    ageMin: 8,
    learners: 412,
    difficulty: 'easy',
    description: 'A warm rainy-day meal. You will learn how to wash rice, measure water with your finger, and know when it is done.',
    color: '#FFB27A',
  },
  {
    id: 'l2',
    title: 'Sew on a button (properly)',
    category: 'repair',
    teacher: 'Mr. Hassan',
    teacherFlag: '\u{1F30D}',
    duration: '10 min',
    ageMin: 7,
    learners: 289,
    difficulty: 'easy',
    description: 'Every grown-up should be able to do this. Four holes, one knot, zero drama.',
    color: '#FF6B7A',
  },
  {
    id: 'l3',
    title: 'Fold laundry like an adult',
    category: 'home',
    teacher: 'Appa Sora',
    teacherFlag: '\u{1F1F0}\u{1F1F7}',
    duration: '8 min',
    ageMin: 5,
    learners: 533,
    difficulty: 'easy',
    description: 'T-shirts, pants, and the dreaded fitted sheet. Yes, even that one.',
    color: '#63C5B2',
  },
  {
    id: 'l4',
    title: 'Plant something that will actually live',
    category: 'outdoors',
    teacher: 'Dadu Karim',
    teacherFlag: '\u{1F1E7}\u{1F1E9}',
    duration: '20 min',
    ageMin: 6,
    learners: 178,
    difficulty: 'easy',
    description: 'Mint, chili, or tomato. From seed to windowsill in 3 weeks.',
    color: '#5FB17F',
  },
  {
    id: 'l5',
    title: 'Change a bike tire',
    category: 'repair',
    teacher: 'Coach Minho',
    teacherFlag: '\u{1F1F0}\u{1F1F7}',
    duration: '15 min',
    ageMin: 10,
    learners: 146,
    difficulty: 'medium',
    description: 'Flat on the way home? Not anymore. Tools, patches, and the trick to seating the tire.',
    color: '#4A90E2',
  },
  {
    id: 'l6',
    title: 'Budget your first 500 taka',
    category: 'money',
    teacher: 'Bhaiya Faisal',
    teacherFlag: '\u{1F1E7}\u{1F1E9}',
    duration: '12 min',
    ageMin: 9,
    learners: 322,
    difficulty: 'easy',
    description: 'Needs, wants, and save. A simple split that works for a week\u2019s allowance or a year\u2019s salary.',
    color: '#F5A623',
  },
  {
    id: 'l7',
    title: 'Make dalgona (honeycomb) candy',
    category: 'cooking',
    teacher: 'Halmoni Park',
    teacherFlag: '\u{1F1F0}\u{1F1F7}',
    duration: '15 min',
    ageMin: 8,
    learners: 604,
    difficulty: 'medium',
    description: 'Sugar, baking soda, and patience. Adult help for the hot part.',
    color: '#FFB27A',
  },
  {
    id: 'l8',
    title: 'Tie 5 useful knots',
    category: 'outdoors',
    teacher: 'Scout Leader Tahmid',
    teacherFlag: '\u{1F1E7}\u{1F1E9}',
    duration: '18 min',
    ageMin: 7,
    learners: 201,
    difficulty: 'medium',
    description: 'Square, bowline, clove hitch, figure-eight, and trucker\u2019s hitch. Camping, hanging, tying a shoe tight.',
    color: '#8E7CC3',
  },
  {
    id: 'l9',
    title: 'Write a thank-you note that means it',
    category: 'wellness',
    teacher: 'Teacher Anika',
    teacherFlag: '\u{1F30D}',
    duration: '10 min',
    ageMin: 5,
    learners: 412,
    difficulty: 'easy',
    description: 'One specific thing. One feeling. Sign your name. That\u2019s the whole trick.',
    color: '#FF6B7A',
  },
];

export const volunteerEvents = [
  { id: 'e1', title: 'River Cleanup Drive', location: 'Buriganga Riverfront, Dhaka', date: '2026-05-03', attendees: 34 },
  { id: 'e2', title: 'Mental Health Awareness Walk', location: 'Hangang Park, Seoul', date: '2026-05-10', attendees: 67 },
  { id: 'e3', title: 'Community Garden Day', location: 'Ramna Park, Dhaka', date: '2026-05-17', attendees: 22 },
];
