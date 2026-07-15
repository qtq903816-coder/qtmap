import type { ImportPreview, ImportValidationResult, TravelBackup, TravelData, TravelRecord, UserSettings } from '../types';
import { isValidDateString } from './date';
import { areRecordsEqual, normalizeCode } from './records';

export const APP_VERSION = '1.0.0';
export const BACKUP_FORMAT = 'qtmap-backup';
export const SUPPORTED_SCHEMA_VERSION = 1;
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export function createBackup(data: TravelData, exportedAt = new Date()): TravelBackup {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: exportedAt.toISOString(),
    recordCount: data.records.length,
    settings: data.settings,
    records: data.records,
  };
}

export function validateBackupJson(text: string): ImportValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { validRecords: [], invalidRecords: [], errors: ['文件不是合法 JSON。'] };
  }

  if (!isPlainObject(parsed)) {
    return { validRecords: [], invalidRecords: [], errors: ['备份内容必须是 JSON 对象。'] };
  }

  const errors: string[] = [];
  if (parsed.format !== BACKUP_FORMAT) errors.push('format 不是 qtmap-backup。');
  if (parsed.schemaVersion !== SUPPORTED_SCHEMA_VERSION) errors.push('schemaVersion 暂不支持。');
  if (!Array.isArray(parsed.records)) errors.push('records 必须是数组。');

  if (errors.length > 0) {
    return { validRecords: [], invalidRecords: [], errors };
  }

  const settings = normalizeSettings(parsed.settings);
  const duplicateIds = findDuplicateIds(parsed.records as unknown[]);
  const invalidRecords: Array<{ index: number; reason: string }> = [];
  const validRecords: TravelRecord[] = [];

  (parsed.records as unknown[]).forEach((record, index) => {
    const result = validateTravelRecord(record);
    if (!result.valid) {
      invalidRecords.push({ index, reason: result.reason });
      return;
    }
    if (duplicateIds.has(result.record.id)) {
      invalidRecords.push({ index, reason: '备份文件中存在重复 ID。' });
      return;
    }
    validRecords.push(result.record);
  });

  return {
    backup: {
      format: BACKUP_FORMAT,
      schemaVersion: SUPPORTED_SCHEMA_VERSION,
      appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : APP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      recordCount: typeof parsed.recordCount === 'number' ? parsed.recordCount : validRecords.length,
      settings,
      records: validRecords,
    },
    validRecords,
    invalidRecords,
    errors: [],
  };
}

export function buildImportPreview(currentRecords: TravelRecord[], validation: ImportValidationResult): ImportPreview {
  const currentById = new Map(currentRecords.map((record) => [record.id, record]));
  let newCount = 0;
  let duplicateCount = 0;
  const conflicts: Array<{ current: TravelRecord; incoming: TravelRecord }> = [];

  for (const incoming of validation.validRecords) {
    const current = currentById.get(incoming.id);
    if (!current) {
      newCount += 1;
    } else if (areRecordsEqual(current, incoming)) {
      duplicateCount += 1;
    } else {
      conflicts.push({ current, incoming });
    }
  }

  return {
    exportedAt: validation.backup?.exportedAt,
    appVersion: validation.backup?.appVersion,
    recordCount: validation.validRecords.length,
    newCount,
    duplicateCount,
    conflictCount: conflicts.length,
    invalidCount: validation.invalidRecords.length,
    conflicts,
    validRecords: validation.validRecords,
    invalidRecords: validation.invalidRecords,
  };
}

export function mergeRecords(
  currentRecords: TravelRecord[],
  incomingRecords: TravelRecord[],
  conflictChoice: 'keep-current' | 'use-imported',
): TravelRecord[] {
  const byId = new Map(currentRecords.map((record) => [record.id, record]));
  for (const incoming of incomingRecords) {
    const current = byId.get(incoming.id);
    if (!current) {
      byId.set(incoming.id, incoming);
    } else if (!areRecordsEqual(current, incoming) && conflictChoice === 'use-imported') {
      byId.set(incoming.id, incoming);
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
}

function validateTravelRecord(value: unknown): { valid: true; record: TravelRecord } | { valid: false; reason: string } {
  if (!isPlainObject(value)) return { valid: false, reason: '记录必须是对象。' };
  if (typeof value.id !== 'string' || value.id.trim().length === 0) return { valid: false, reason: '缺少 id。' };
  if (value.scope !== 'china' && value.scope !== 'world') return { valid: false, reason: 'scope 必须是 china 或 world。' };
  if (typeof value.countryCode !== 'string' || !/^[A-Za-z]{2,3}$/.test(value.countryCode.trim())) return { valid: false, reason: '国家代码不合法。' };
  if (typeof value.countryName !== 'string' || value.countryName.trim().length === 0) return { valid: false, reason: '缺少国家名称。' };
  if (value.scope === 'china' && (typeof value.city !== 'string' || value.city.trim().length === 0)) return { valid: false, reason: '中国足迹必须包含城市。' };
  if (value.scope === 'world' && (typeof value.city !== 'string' || value.city.trim().length === 0)) return { valid: false, reason: '世界足迹必须包含城市。' };
  if (!isValidDateString(value.arrivalDate)) return { valid: false, reason: '到达日期不合法。' };
  if (value.departureDate !== undefined && !isValidDateString(value.departureDate)) return { valid: false, reason: '离开日期不合法。' };
  if (typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) return { valid: false, reason: 'createdAt 不合法。' };
  if (typeof value.updatedAt !== 'string' || Number.isNaN(Date.parse(value.updatedAt))) return { valid: false, reason: 'updatedAt 不合法。' };
  if (value.rating !== undefined && (typeof value.rating !== 'number' || value.rating < 1 || value.rating > 5)) return { valid: false, reason: '评分必须在 1 到 5 之间。' };
  if (value.photoUrls !== undefined && (!Array.isArray(value.photoUrls) || value.photoUrls.some((url) => typeof url !== 'string'))) return { valid: false, reason: '图片链接必须是字符串数组。' };

  return {
    valid: true,
    record: {
      id: value.id.trim(),
      scope: value.scope,
      countryCode: normalizeCode(value.countryCode),
      countryName: value.countryName.trim(),
      province: typeof value.province === 'string' ? value.province.trim() : undefined,
      city: typeof value.city === 'string' ? value.city.trim() : undefined,
      locationCode: typeof value.locationCode === 'string' ? value.locationCode.trim() : undefined,
      arrivalDate: value.arrivalDate,
      departureDate: typeof value.departureDate === 'string' ? value.departureDate : undefined,
      notes: typeof value.notes === 'string' ? value.notes : undefined,
      rating: typeof value.rating === 'number' ? value.rating : undefined,
      photoUrls: Array.isArray(value.photoUrls) ? value.photoUrls : undefined,
      isPlanned: Boolean(value.isPlanned),
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    },
  };
}

function normalizeSettings(value: unknown): UserSettings {
  if (!isPlainObject(value)) return { theme: 'light' };
  return {
    theme: value.theme === 'dark' ? 'dark' : 'light',
    nextDestination: typeof value.nextDestination === 'string' ? value.nextDestination : undefined,
  };
}

function findDuplicateIds(records: unknown[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of records) {
    if (!isPlainObject(value) || typeof value.id !== 'string') continue;
    if (seen.has(value.id)) duplicates.add(value.id);
    seen.add(value.id);
  }
  return duplicates;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
