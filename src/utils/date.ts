const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function daysBetweenInclusive(arrivalDate: string, departureDate?: string): number {
  if (!isValidDateString(arrivalDate)) return 0;
  const start = new Date(`${arrivalDate}T00:00:00.000Z`).getTime();
  const end = departureDate && isValidDateString(departureDate)
    ? new Date(`${departureDate}T00:00:00.000Z`).getTime()
    : start;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function formatDate(value?: string): string {
  if (!value) return '暂无';
  return value.replace(/-/g, '.');
}

export function formatBackupTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}
