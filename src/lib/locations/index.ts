import { COUNTRIES } from './countries';
import {
  displayName,
  matchesLocationQuery,
  MIN_AGGREGATE_COUNT,
  type AdminRegion,
  type Country,
  type LocalArea,
} from './types';

export type { AdminRegion, Country, LocalArea, LocalizedNames, LocalAreaType } from './types';
export { displayName, matchesLocationQuery, MIN_AGGREGATE_COUNT, normalizeLocationQuery } from './types';
export { COUNTRIES } from './countries';

export function getCountry(countryId: string | null | undefined): Country | undefined {
  if (!countryId) return undefined;
  return COUNTRIES.find((c) => c.id === countryId);
}

export function getRegion(
  countryId: string | null | undefined,
  regionId: string | null | undefined
): AdminRegion | undefined {
  if (!countryId || !regionId) return undefined;
  return getCountry(countryId)?.regions.find((r) => r.id === regionId);
}

export function getLocalArea(
  countryId: string | null | undefined,
  regionId: string | null | undefined,
  localAreaId: string | null | undefined
): LocalArea | undefined {
  if (!localAreaId) return undefined;
  return getRegion(countryId, regionId)?.localAreas.find((a) => a.id === localAreaId);
}

export function filterCountries(query: string, lang: string): Country[] {
  return COUNTRIES.filter((c) => matchesLocationQuery(c.names, c.id, query));
}

export function filterRegions(
  countryId: string | null | undefined,
  query: string,
  _lang: string
): AdminRegion[] {
  const regions = getCountry(countryId)?.regions ?? [];
  return regions.filter((r) => matchesLocationQuery(r.names, r.id, query));
}

export function filterLocalAreas(
  countryId: string | null | undefined,
  regionId: string | null | undefined,
  query: string,
  _lang: string
): LocalArea[] {
  const areas = getRegion(countryId, regionId)?.localAreas ?? [];
  return areas.filter((a) => matchesLocationQuery(a.names, a.id, query));
}

/** Stable English map label used for local-area aggregation. */
export function localAreaMapLabel(
  countryId: string,
  regionId: string,
  localArea: LocalArea
): string {
  const region = getRegion(countryId, regionId);
  const regionEn = region?.names.en ?? regionId;
  return `${localArea.names.en}, ${regionEn}`;
}

export function encodeCheckInLocation(input: {
  mapLabel: string;
  countryId: string;
  regionId: string;
  localAreaId: string;
  submittedAtLocal: string;
}): string {
  return [
    input.mapLabel,
    input.localAreaId,
    input.countryId,
    input.regionId,
    input.submittedAtLocal,
  ].join('|');
}

export function parseCheckInLocation(city: string): {
  mapLabel: string;
  localAreaId: string | null;
  countryId: string | null;
  regionId: string | null;
  submittedAtLocal: string | null;
  areaName: string;
} {
  const parts = city.split('|');
  const mapLabel = parts[0] ?? city;
  return {
    mapLabel,
    localAreaId: parts[1] ?? null,
    countryId: parts[2] ?? null,
    regionId: parts[3] ?? null,
    submittedAtLocal: parts[4] ?? null,
    areaName: mapLabel.split(',')[0]?.trim() || mapLabel,
  };
}

export function areaDisplayFromStoredCity(city: string, lang: string): string {
  const parsed = parseCheckInLocation(city);
  if (parsed.countryId && parsed.regionId && parsed.localAreaId) {
    const area = getLocalArea(parsed.countryId, parsed.regionId, parsed.localAreaId);
    if (area) return displayName(area.names, lang);
  }
  return parsed.areaName;
}

/** Resolve lat/lng for a stored check-in without exposing precise GPS. */
export function coordsForStoredCity(city: string): { lat: number; lng: number } | null {
  const parsed = parseCheckInLocation(city);
  if (!parsed.countryId || !parsed.regionId || !parsed.localAreaId) return null;
  const area = getLocalArea(parsed.countryId, parsed.regionId, parsed.localAreaId);
  if (!area) return null;
  return { lat: area.lat, lng: area.lng };
}

export function localIsoTimestamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}
