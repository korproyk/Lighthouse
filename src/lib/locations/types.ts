/** Generic Country → Region → Local Area model for Community Map check-ins. */

export type LocationLang = 'en' | 'ko' | 'bn';

export type LocalizedNames = {
  en: string;
  ko?: string;
  bn?: string;
};

export type LocalAreaType = 'gu' | 'gun' | 'si' | 'district' | 'city' | 'county' | 'other';

export interface LocalArea {
  id: string;
  type: LocalAreaType;
  names: LocalizedNames;
  /** Approximate centroid for anonymous map pins (not precise GPS). */
  lat: number;
  lng: number;
}

export interface AdminRegion {
  id: string;
  countryId: string;
  names: LocalizedNames;
  localAreas: LocalArea[];
}

export interface Country {
  id: string;
  names: LocalizedNames;
  regions: AdminRegion[];
}

export function displayName(names: LocalizedNames, lang: string): string {
  if (lang === 'ko' && names.ko) return names.ko;
  if (lang === 'bn' && names.bn) return names.bn;
  return names.en;
}

export function normalizeLocationQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/-gu\b/g, '')
    .replace(/-gun\b/g, '')
    .replace(/-si\b/g, '')
    .replace(/구$/g, '')
    .replace(/군$/g, '')
    .replace(/시$/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

export function matchesLocationQuery(
  names: LocalizedNames,
  id: string,
  query: string
): boolean {
  const q = normalizeLocationQuery(query.trim());
  if (!q) return true;
  const candidates = [names.en, names.ko, names.bn, id]
    .filter(Boolean)
    .map((v) => normalizeLocationQuery(String(v)));
  return candidates.some((c) => c.includes(q));
}

/** Privacy floor for showing a local-area aggregate on the map. */
export const MIN_AGGREGATE_COUNT = 5;
