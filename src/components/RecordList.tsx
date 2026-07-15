import type { TravelRecord } from '../types';
import { formatDate } from '../utils/date';

type RecordListProps = {
  records: TravelRecord[];
  onSelect?: (record: TravelRecord) => void;
  compact?: boolean;
};

export function RecordList({ records, onSelect, compact = false }: RecordListProps) {
  if (records.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-fog">暂无足迹记录。</p>;
  }

  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          onClick={() => onSelect?.(record)}
          className="grid w-full gap-2 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/5 sm:grid-cols-[1fr_auto]"
        >
          <span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{record.countryName}{record.city ? ` · ${record.city}` : ''}</span>
              {record.isPlanned ? <span className="rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 text-xs text-moss dark:text-[#b9d4be]">计划</span> : null}
            </span>
            {!compact && record.notes ? <span className="mt-1 block text-sm text-slate-500 dark:text-fog">{record.notes}</span> : null}
          </span>
          <span className="text-sm text-slate-500 dark:text-fog">{formatDate(record.arrivalDate)}</span>
        </button>
      ))}
    </div>
  );
}
