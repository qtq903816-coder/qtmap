import { describe, expect, it } from 'vitest';
import { sampleTravelData } from '../data/sampleRecords';
import { buildImportPreview, createBackup, mergeRecords, validateBackupJson } from './backup';

describe('backup utilities', () => {
  it('creates a complete backup from raw records', () => {
    const backup = createBackup(sampleTravelData, new Date('2026-07-14T12:30:00.000Z'));
    expect(backup.format).toBe('qtmap-backup');
    expect(backup.recordCount).toBe(sampleTravelData.records.length);
    expect(backup.records.some((record) => record.city === '深圳')).toBe(true);
  });

  it('rejects invalid json without returning records', () => {
    const result = validateBackupJson('{bad');
    expect(result.errors[0]).toContain('JSON');
    expect(result.validRecords).toHaveLength(0);
  });

  it('separates invalid records from valid records', () => {
    const backup = createBackup(sampleTravelData);
    const text = JSON.stringify({
      ...backup,
      records: [...backup.records, { id: 'broken', scope: 'world' }],
    });
    const result = validateBackupJson(text);
    expect(result.errors).toHaveLength(0);
    expect(result.validRecords).toHaveLength(sampleTravelData.records.length);
    expect(result.invalidRecords).toHaveLength(1);
  });

  it('detects duplicates and conflicts for merge preview', () => {
    const incoming = {
      ...sampleTravelData.records[0],
      notes: 'changed',
    };
    const validation = {
      validRecords: [sampleTravelData.records[1], incoming],
      invalidRecords: [],
      errors: [],
    };
    const preview = buildImportPreview(sampleTravelData.records, validation);
    expect(preview.duplicateCount).toBe(1);
    expect(preview.conflictCount).toBe(1);
  });

  it('does not duplicate equal records when merging', () => {
    const merged = mergeRecords(sampleTravelData.records, [sampleTravelData.records[0]], 'keep-current');
    expect(merged).toHaveLength(sampleTravelData.records.length);
  });
});
