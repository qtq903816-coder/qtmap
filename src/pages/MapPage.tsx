import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RecordDetail } from '../components/RecordDetail';
import { TravelMap } from '../components/maps/TravelMap';
import { continents } from '../data/worldGeo';
import { useTravelYears } from '../hooks';
import { useTravelStore } from '../state/travelStore';
import type { TravelRecord, TravelScope } from '../types';

type MapPageProps = {
  scope: TravelScope;
};

const countryContinentMap: Record<string, string> = {
  CN: '亚洲',
  KR: '亚洲',
  VN: '亚洲',
  JP: '亚洲',
  US: '北美洲',
  FR: '欧洲',
  AU: '大洋洲',
};

export function MapPage({ scope }: MapPageProps) {
  const records = useTravelStore((state) => state.records);
  const years = useTravelYears();
  const [year, setYear] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [continent, setContinent] = useState('全部');
  const [selected, setSelected] = useState<TravelRecord | undefined>();

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (record.scope !== scope) return false;
      if (year !== '全部' && !record.arrivalDate.startsWith(year)) return false;
      if (keyword && !`${record.countryName}${record.province ?? ''}${record.city ?? ''}${record.locationCode ?? ''}${record.countryCode}`.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (scope === 'world' && continent !== '全部' && countryContinentMap[record.countryCode] !== continent) return false;
      return true;
    });
  }, [continent, keyword, records, scope, year]);

  const title = scope === 'china' ? '中国足迹' : '世界足迹';

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-fog">
              已到访地点以珊瑚色点亮，计划地点以浅绿色标记。地图支持缩放、拖动和点击查看详情。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={year} onChange={(event) => setYear(event.target.value)} className="control">
              <option>全部</option>
              {years.map((item) => <option key={item}>{item}</option>)}
            </select>
            {scope === 'world' ? (
              <select value={continent} onChange={(event) => setContinent(event.target.value)} className="control">
                {continents.map((item) => <option key={item}>{item}</option>)}
              </select>
            ) : null}
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索城市、国家或代码" className="control w-full pl-9 sm:w-64" />
            </label>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <TravelMap scope={scope} records={filteredRecords} onSelectRecord={setSelected} />
        <RecordDetail record={selected} onClose={() => setSelected(undefined)} />
      </section>
    </div>
  );
}
