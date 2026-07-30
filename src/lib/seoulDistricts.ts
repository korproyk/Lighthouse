/**
 * @deprecated Import from `./locations` instead.
 * Kept as a thin re-export so older Seoul-only imports keep working.
 */
export {
  displayName as districtDisplayName,
  getLocalArea,
  localAreaMapLabel as districtMapCityLabel,
} from './locations';
export { SOUTH_KOREA_REGIONS } from './locations/southKorea';

import { SOUTH_KOREA_REGIONS } from './locations/southKorea';

const seoul = SOUTH_KOREA_REGIONS.find((r) => r.id === 'seoul');

export const SEOUL_DISTRICTS =
  seoul?.localAreas.map((a) => ({
    id: a.id === 'jung-gu-seoul' ? 'jung-gu' : a.id === 'gangseo-gu-seoul' ? 'gangseo-gu' : a.id,
    names: { en: a.names.en, ko: a.names.ko ?? a.names.en },
    lat: a.lat,
    lng: a.lng,
  })) ?? [];

export const SEOUL_COUNTRY = {
  id: 'south-korea',
  names: { en: 'South Korea', ko: '대한민국' },
} as const;

export const SEOUL_CITY = {
  id: 'seoul',
  names: { en: 'Seoul', ko: '서울특별시' },
} as const;
