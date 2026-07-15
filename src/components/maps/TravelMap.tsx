import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { chinaCityCoordinates, chinaGeoJson, chinaMapName } from '../../data/chinaGeo';
import { countryCoordinates, worldGeoJson, worldMapName } from '../../data/worldGeo';
import type { TravelRecord, TravelScope } from '../../types';
import { formatDate } from '../../utils/date';
import { getRecordPlaceKey, normalizeCode } from '../../utils/records';
import { BaseMap } from './BaseMap';

type TravelMapProps = {
  scope: TravelScope;
  records: TravelRecord[];
  onSelectRecord: (record: TravelRecord) => void;
};

export function TravelMap({ scope, records, onSelectRecord }: TravelMapProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, TravelRecord[]>();
    for (const record of records.filter((item) => item.scope === scope)) {
      const key = scope === 'china' ? getRecordPlaceKey(record) : normalizeCode(record.countryCode);
      map.set(key, [...(map.get(key) ?? []), record]);
    }
    return map;
  }, [records, scope]);

  const mapName = scope === 'china' ? chinaMapName : worldMapName;
  const geoJson = scope === 'china' ? chinaGeoJson : worldGeoJson;
  const coordinates = scope === 'china' ? chinaCityCoordinates : countryCoordinates;

  const data = useMemo(() => {
    return Array.from(grouped.entries()).map(([key, items]) => {
      const visited = items.filter((item) => !item.isPlanned);
      const planned = items.filter((item) => item.isPlanned);
      const latest = [...items].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))[0];
      const coord = coordinates[key];
      return {
        name: scope === 'china' ? latest.city ?? key : latest.countryName,
        value: coord ? [...coord, visited.length || planned.length] : undefined,
        itemStyle: { color: visited.length > 0 ? '#e97855' : '#8ab79b' },
        records: items,
        visitCount: visited.length,
        latestDate: latest.arrivalDate,
        plannedCount: planned.length,
      };
    }).filter((item) => item.value);
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
        const item = params as { data?: { name: string; visitCount: number; plannedCount: number; latestDate: string } };
        if (!item.data) return '暂无记录';
        return `${item.data.name}<br/>到访 ${item.data.visitCount} 次<br/>计划 ${item.data.plannedCount} 次<br/>最近 ${formatDate(item.data.latestDate)}`;
      },
    },
    geo: {
      map: mapName,
      roam: true,
      zoom: scope === 'china' ? 1.5 : 1.08,
      center: scope === 'china' ? [104, 35] : [70, 23],
      itemStyle: {
        areaColor: '#eef1ed',
        borderColor: '#ffffff',
        borderWidth: 1.2,
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
  );
}
