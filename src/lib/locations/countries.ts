import type { Country } from './types';
import { SOUTH_KOREA_REGIONS } from './southKorea';
import { BANGLADESH_REGIONS } from './bangladesh';

export const COUNTRIES: Country[] = [
  {
    id: 'south-korea',
    names: { en: 'South Korea', ko: '대한민국' },
    regions: SOUTH_KOREA_REGIONS,
  },
  {
    id: 'bangladesh',
    names: { en: 'Bangladesh', bn: 'বাংলাদেশ', ko: '방글라데시' },
    regions: BANGLADESH_REGIONS,
  },
];
