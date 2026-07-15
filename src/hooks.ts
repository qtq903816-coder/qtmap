import { useMemo } from 'react';
import { useTravelStore } from './state/travelStore';
import { deriveStats, getYears } from './utils/records';

export function useTravelStats() {
  const records = useTravelStore((state) => state.records);
  return useMemo(() => deriveStats(records), [records]);
}

export function useTravelYears() {
  const records = useTravelStore((state) => state.records);
  return useMemo(() => getYears(records), [records]);
}
