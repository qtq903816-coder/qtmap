import { sampleTravelData } from '../data/sampleRecords';
import type { TravelData } from '../types';
import { SUPPORTED_SCHEMA_VERSION } from '../utils/backup';

export const STORAGE_KEY = 'qtmap.travel-data';

export function readTravelData(): TravelData {
  if (!isStorageAvailable()) return sampleTravelData;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    writeTravelData(sampleTravelData);
    return sampleTravelData;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TravelData>;
    return migrateTravelData(parsed);
  } catch {
    writeTravelData(sampleTravelData);
    return sampleTravelData;
  }
}

export function writeTravelData(data: TravelData): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    throw new Error(error instanceof DOMException && error.name === 'QuotaExceededError'
      ? '浏览器存储空间不足，写入失败。'
      : '旅行数据写入失败。');
  }
}

export function replaceTravelData(next: TravelData): void {
  const snapshot = readTravelData();
  try {
    writeTravelData(next);
  } catch (error) {
    writeTravelData(snapshot);
    throw error;
  }
}

export function clearTravelData(): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}

function migrateTravelData(data: Partial<TravelData>): TravelData {
  if (!Array.isArray(data.records)) {
    writeTravelData(sampleTravelData);
    return sampleTravelData;
  }

  return {
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    settings: {
      theme: data.settings?.theme === 'dark' ? 'dark' : 'light',
      nextDestination: data.settings?.nextDestination,
    },
    records: data.records,
  };
}

function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window;
  } catch {
    return false;
  }
}
