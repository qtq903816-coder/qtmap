import { describe, expect, it } from 'vitest';
import { sampleRecords } from '../data/sampleRecords';
import { deriveStats } from './records';

describe('record derived data', () => {
  it('derives visited stats from the initial travel records', () => {
    const stats = deriveStats(sampleRecords);
    expect(stats.visitedCountryCount).toBe(1);
    expect(stats.visitedChinaCityCount).toBe(42);
    expect(stats.totalTrips).toBe(45);
  });
});
