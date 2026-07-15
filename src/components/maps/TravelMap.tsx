import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useState } from 'react';
import { chinaCityCoordinates, chinaMapName, chinaMapPath } from '../../data/chinaGeo';
import { countryCoordinates, worldMapName, worldMapPath } from '../../data/worldGeo';
import type { TravelRecord, TravelScope } from '../../types';
import { formatDate } from '../../utils/date';
import { getRecordPlaceKey, normalizeCode } from '../../utils/records';
import { BaseMap } from './BaseMap';

type TravelMapProps = {
  scope: TravelScope;
  records: TravelRecord[];
  onSelectRecord: (record: TravelRecord) => void;
};

type MapPoint = {
  name: string;
  value?: [number, number, number];
  itemStyle: { color: string };
  records: TravelRecord[];
  visitCount: number;
  latestDate: string;
  plannedCount: number;
};

export function TravelMap({ scope, records, onSelectRecord }: TravelMapProps) {
  const [geoJson, setGeoJson] = useState<object>();
  const [mapError, setMapError] = useState<string>();

  const grouped = useMemo(() => {
    const map = new Map<string, TravelRecord[]>();
    for (const record of records.filter((item) => item.scope === scope)) {
      const key = scope === 'china' ? getRecordPlaceKey(record) : normalizeCode(record.countryCode);
      map.set(key, [...(map.get(key) ?? []), record]);
    }
    return map;
  }, [records, scope]);

  const mapName = scope === 'china' ? chinaMapName : worldMapName;
  const mapPath = scope === 'china' ? chinaMapPath : worldMapPath;
  const coordinates = scope === 'china' ? chinaCityCoordinates : countryCoordinates;

  useEffect(() => {
    const controller = new AbortController();
    setGeoJson(undefined);
    setMapError(undefined);

    fetch(`${import.meta.env.BASE_URL}${mapPath}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`地图文件加载失败：${response.status}`);
        return response.json() as Promise<object>;
      })
      .then(setGeoJson)
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') {
          setMapError((error as Error).message || '地图文件加载失败');
        }
      });

    return () => controller.abort();
  }, [mapPath]);

  const data = useMemo<MapPoint[]>(() => {
    return Array.from(grouped.entries())
      .map(([key, items]) => {
        const visited = items.filter((item) => !item.isPlanned);
        const planned = items.filter((item) => item.isPlanned);
        const latest = [...items].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))[0];
        const coord = coordinates[key];

        return {
          name: scope === 'china' ? latest.city ?? key : latest.countryName,
          value: coord ? [coord[0], coord[1], visited.length || planned.length] : undefined,
          itemStyle: { color: visited.length > 0 ? '#e97855' : '#8ab79b' },
          records: items,
          visitCount: visited.length,
          latestDate: latest.arrivalDate,
          plannedCount: planned.length,
        };
      })
      .filter((item): item is MapPoint & { value: [number, number, number] } => Boolean(item.value));
  }, [coordinates, grouped, scope]);

  const option: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      borderWidth: 0,
      borderRadius: 12,
      padding: 12,
      backgroundColor: 'rgba(36,42,47,0.92)',
      textStyle: { color: '#fff' },
      formatter: (params: unknown) => {
        const item = params as { data?: MapPoint };
        if (!item.data) return '暂无记录';
        return `${item.data.name}<br/>到访 ${item.data.visitCount} 次<br/>计划 ${item.data.plannedCount} 次<br/>最近 ${formatDate(item.data.latestDate)}`;
      },
    },
    geo: {
      map: mapName,
      roam: true,
      zoom: scope === 'china' ? 1.22 : 1.08,
      center: scope === 'china' ? [104.2, 35.8] : [70, 23],
      itemStyle: {
        areaColor: '#edf3ef',
        borderColor: '#cfd9d2',
        borderWidth: 0.7,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#dce7df',
        },
        label: {
          color: '#242a2f',
        },
      },
      select: {
        itemStyle: {
          areaColor: '#e97855',
        },
      },
    },
    series: [
      {
        name: '地图',
        type: 'map',
        map: mapName,
        geoIndex: 0,
        data: [],
        tooltip: { show: false },
        emphasis: {
          label: { show: true, color: '#242a2f' },
          itemStyle: { areaColor: '#dce7df' },
        },
      },
      {
        name: '足迹',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data,
        symbolSize: (value: unknown) => {
          const tuple = value as number[];
          return Math.min(24, 8 + (tuple?.[2] ?? 1) * 2.4);
        },
        rippleEffect: { brushType: 'stroke', scale: 2.4 },
        itemStyle: {
          color: '#e97855',
          shadowBlur: 10,
          shadowColor: 'rgba(233,120,85,0.28)',
        },
        emphasis: { scale: true },
      },
    ],
  }), [data, mapName, scope]);

  return (
    <div>
      {mapError && (
        <div className="mb-3 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-ink">
          {mapError}
        </div>
      )}
      <BaseMap
        mapName={mapName}
        geoJson={geoJson}
        option={option}
        onRegionClick={(name) => {
          const match = data.find((item) => item.name === name);
          const first = match?.records[0] ?? records.find((record) => record.city === name || record.countryName === name);
          if (first) onSelectRecord(first);
        }}
      />
    </div>
  );
}
