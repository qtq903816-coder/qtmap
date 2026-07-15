import type { TravelRecord, TravelStats } from '../types';
import { daysBetweenInclusive } from './date';

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export function getRecordPlaceKey(record: TravelRecord): string {
  if (record.scope === 'china') {
    return record.locationCode?.trim() || `${record.province ?? ''}-${record.city ?? ''}`;
  }
  return normalizeCode(record.countryCode);
}

export function areRecordsEqual(a: TravelRecord, b: TravelRecord): boolean {
  return JSON.stringify(sortRecord(a)) === JSON.stringify(sortRecord(b));
}

function sortRecord(record: TravelRecord): TravelRecord {
  return {
    ...record,
    photoUrls: record.photoUrls ? [...record.photoUrls].sort() : undefined,
  };
}

export function deriveStats(records: TravelRecord[]): TravelStats {
  const visited = records.filter((record) => !record.isPlanned);
  const countryCodes = new Set<string>();
  const chinaCityCodes = new Set<string>();

  for (const record of visited) {
    if (record.scope === 'world') countryCodes.add(normalizeCode(record.countryCode));
    if (record.scope === 'china') chinaCityCodes.add(getRecordPlaceKey(record));
  }

  const sorted = [...records].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));

  return {
    visitedCountryCount: countryCodes.size,
    visitedChinaCityCount: chinaCityCodes.size,
    totalTrips: visited.length,
    totalDays: visited.reduce((sum, record) => sum + daysBetweenInclusive(record.arrivalDate, record.departureDate), 0),
    latestTrip: visited.sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))[0],
    recentRecords: sorted.slice(0, 5),
  };
}

export function getYears(records: TravelRecord[]): string[] {
  return Array.from(new Set(records.map((record) => record.arrivalDate.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
}

export function createRecordId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
