import type { TravelRecord } from '../types';
import { daysBetweenInclusive, formatDate } from '../utils/date';

type RecordDetailProps = {
  record?: TravelRecord;
  onClose: () => void;
};

export function RecordDetail({ record, onClose }: RecordDetailProps) {
  if (!record) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#1a2024] md:absolute md:inset-auto md:right-6 md:top-6 md:w-80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-fog">{record.scope === 'china' ? '中国足迹' : '世界足迹'}</p>
          <h3 className="mt-1 text-xl font-semibold">{record.countryName}{record.city ? ` · ${record.city}` : ''}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 dark:border-white/10 dark:text-fog">关闭</button>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-fog">到达</dt>
          <dd>{formatDate(record.arrivalDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-fog">停留</dt>
          <dd>{daysBetweenInclusive(record.arrivalDate, record.departureDate)} 天</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-fog">状态</dt>
          <dd>{record.isPlanned ? '计划前往' : '已到访'}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-fog">评分</dt>
          <dd>{record.rating ? `${record.rating}/5` : '未评分'}</dd>
        </div>
      </dl>
      {record.notes ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-white/5 dark:text-fog">{record.notes}</p> : null}
    </aside>
  );
}
