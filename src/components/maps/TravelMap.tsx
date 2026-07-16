import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useState } from 'react';
import { chinaCityBoundariesPath, chinaMapName, chinaMapPath, chinaRegionsPath } from '../../data/chinaGeo';
import { countryRegionNames, worldMapName, worldMapPath } from '../../data/worldGeo';
import type { TravelRecord, TravelScope } from '../../types';
import { formatDate } from '../../utils/date';
import { getRecordPlaceKey, normalizeCode } from '../../utils/records';
import { BaseMap } from './BaseMap';

type TravelMapProps = {
  scope: TravelScope;
  records: TravelRecord[];
  onSelectRecord: (record: TravelRecord) => void;
};

type GeoFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: string;
    properties?: Record<string, unknown>;
    geometry: unknown;
  }>;
};

type RegionState = {
  name: string;
  displayName: string;
  records: TravelRecord[];
  visitCount: number;
  plannedCount: number;
  latestDate: string;
};

function mergeFeatureCollections(...collections: Array<GeoFeatureCollection | undefined>): GeoFeatureCollection | undefined {
  const valid = collections.filter(Boolean) as GeoFeatureCollection[];
  if (valid.length === 0) return undefined;
  return {
    type: 'FeatureCollection',
    features: valid.flatMap((collection) => collection.features),
  };
}

function getWorldRegionName(countryCode: string): string {
  const normalized = normalizeCode(countryCode);
  return countryRegionNames[normalized] ?? normalized;
}

function getRegionName(params: unknown): string | undefined {
  return (params as { name?: string }).name;
}

function buildFeatureLabelMap(collection?: GeoFeatureCollection): Map<string, string> {
  const labels = new Map<string, string>();
  for (const feature of collection?.features ?? []) {
    const name = String(feature.properties?.name ?? '');
    const displayName = String(feature.properties?.displayName ?? feature.properties?.name ?? '');
    if (name && displayName) labels.set(name, displayName);
  }
  return labels;
}

function buildFeatureNameSet(collection?: GeoFeatureCollection): Set<string> {
  return new Set((collection?.features ?? [])
    .map((feature) => String(feature.properties?.name ?? ''))
    .filter(Boolean));
}

function normalizePlaceName(value: string): string {
  return value
    .trim()
    .replace(/(特别行政区|自治州|地区|盟|市|区|县)$/u, '');
}

function findRegionCodeByCityName(record: TravelRecord, featureLabels: Map<string, string>): string | undefined {
  const city = normalizePlaceName(record.city ?? '');
  if (!city) return undefined;

  for (const [code, label] of featureLabels.entries()) {
    const normalizedLabel = normalizePlaceName(label);
    if (normalizedLabel === city || normalizedLabel.includes(city) || city.includes(normalizedLabel)) {
      return code;
    }
  }

  return undefined;
}

function getChinaRegionKey(record: TravelRecord, featureLabels: Map<string, string>): string {
  return record.locationCode?.trim() || findRegionCodeByCityName(record, featureLabels) || getRecordPlaceKey(record);
}

export function TravelMap({ scope, records, onSelectRecord }: TravelMapProps) {
  const [baseGeoJson, setBaseGeoJson] = useState<GeoFeatureCollection>();
  const [chinaCityGeoJson, setChinaCityGeoJson] = useState<GeoFeatureCollection>();
  const [chinaRegionGeoJson, setChinaRegionGeoJson] = useState<GeoFeatureCollection>();
  const [shouldLoadChinaCityBoundaries, setShouldLoadChinaCityBoundaries] = useState(false);
  const [mapError, setMapError] = useState<string>();

  const mapName = scope === 'china' ? chinaMapName : worldMapName;
  const mapPath = scope === 'china' ? chinaMapPath : worldMapPath;

  const baseChinaRegionNames = useMemo(
    () => buildFeatureNameSet(chinaRegionGeoJson),
    [chinaRegionGeoJson],
  );

  const hasChinaRecordOutsideInitialRegions = useMemo(() => {
    if (scope !== 'china' || baseChinaRegionNames.size === 0) return false;
    return records
      .filter((record) => record.scope === 'china')
      .some((record) => !baseChinaRegionNames.has(getRecordPlaceKey(record)));
  }, [baseChinaRegionNames, records, scope]);

  useEffect(() => {
    const controller = new AbortController();
    setBaseGeoJson(undefined);
    setChinaCityGeoJson(undefined);
    setChinaRegionGeoJson(undefined);
    setShouldLoadChinaCityBoundaries(false);
    setMapError(undefined);

    const loadJson = (path: string) => fetch(`${import.meta.env.BASE_URL}${path}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`地图文件加载失败：${response.status}`);
        return response.json() as Promise<GeoFeatureCollection>;
      });

    const requiredRequests = scope === 'china'
      ? [loadJson(mapPath), loadJson(chinaRegionsPath)]
      : [loadJson(mapPath)];

    Promise.all(requiredRequests)
      .then(([base, regions]) => {
        setBaseGeoJson(base);
        setChinaRegionGeoJson(regions);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') {
          setMapError((error as Error).message || '地图文件加载失败');
        }
      });

    return () => controller.abort();
  }, [mapPath, scope]);

  useEffect(() => {
    if (scope !== 'china' || (!shouldLoadChinaCityBoundaries && !hasChinaRecordOutsideInitialRegions) || chinaCityGeoJson) return undefined;

    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}${chinaCityBoundariesPath}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`城市边界文件加载失败：${response.status}`);
        return response.json() as Promise<GeoFeatureCollection>;
      })
      .then(setChinaCityGeoJson)
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') {
          console.warn('城市边界文件加载失败，地图将保留基础边界。', error);
        }
      });

    return () => controller.abort();
  }, [chinaCityGeoJson, hasChinaRecordOutsideInitialRegions, scope, shouldLoadChinaCityBoundaries]);

  const geoJson = useMemo(
    () => scope === 'china'
      ? mergeFeatureCollections(baseGeoJson, chinaCityGeoJson, chinaRegionGeoJson)
      : baseGeoJson,
    [baseGeoJson, chinaCityGeoJson, chinaRegionGeoJson, scope],
  );

  const featureLabels = useMemo(() => buildFeatureLabelMap(geoJson), [geoJson]);

  const regionStates = useMemo(() => {
    const map = new Map<string, TravelRecord[]>();
    for (const record of records.filter((item) => item.scope === scope)) {
      const key = scope === 'china' ? getChinaRegionKey(record, featureLabels) : getWorldRegionName(record.countryCode);
      map.set(key, [...(map.get(key) ?? []), record]);
    }

    const states = new Map<string, RegionState>();
    for (const [name, items] of map.entries()) {
      const visited = items.filter((item) => !item.isPlanned);
      const planned = items.filter((item) => item.isPlanned);
      const latest = [...items].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))[0];
      states.set(name, {
        name,
        displayName: scope === 'china' ? latest.city ?? featureLabels.get(name) ?? name : latest.countryName,
        records: items,
        visitCount: visited.length,
        plannedCount: planned.length,
        latestDate: latest.arrivalDate,
      });
    }
    return states;
  }, [featureLabels, records, scope]);

  const option: EChartsOption = useMemo(() => {
    const formatRegionLabel = (params: unknown) => {
      const name = getRegionName(params);
      return name ? regionStates.get(name)?.displayName ?? featureLabels.get(name) ?? name : '';
    };

    const regions = Array.from(regionStates.values()).map((state) => {
      const visited = state.visitCount > 0;
      return {
        name: state.name,
        itemStyle: {
          areaColor: visited ? '#e97855' : '#a8c9b5',
          borderColor: '#ffffff',
          borderWidth: visited ? 1.8 : 1.5,
          opacity: visited ? 0.86 : 0.62,
        },
        label: {
          formatter: formatRegionLabel,
        },
        emphasis: {
          disabled: true,
        },
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        borderWidth: 0,
        borderRadius: 12,
        padding: 12,
        backgroundColor: 'rgba(36,42,47,0.92)',
        textStyle: { color: '#fff' },
        formatter: (params: unknown) => {
          const name = getRegionName(params);
          const state = name ? regionStates.get(name) : undefined;
          if (!state) return formatRegionLabel(params) || '暂无记录';
          return `${state.displayName}<br/>到访 ${state.visitCount} 次<br/>计划 ${state.plannedCount} 次<br/>最近 ${formatDate(state.latestDate)}`;
        },
      },
      geo: {
        map: mapName,
        roam: true,
        zoom: scope === 'china' ? 1.22 : 1.08,
        center: scope === 'china' ? [104.2, 35.8] : [70, 23],
        regions,
        label: {
          formatter: formatRegionLabel,
        },
        itemStyle: {
          areaColor: '#edf3ef',
          borderColor: '#cfd9d2',
          borderWidth: 0.7,
        },
        emphasis: {
          disabled: true,
        },
      },
      series: [
        {
          name: '城市边界',
          type: 'map',
          map: mapName,
          geoIndex: 0,
          silent: true,
          tooltip: { show: false },
          itemStyle: {
            areaColor: 'rgba(255,255,255,0)',
            borderColor: scope === 'china' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.72)',
            borderWidth: scope === 'china' ? 1.05 : 0.65,
          },
          emphasis: {
            disabled: true,
          },
          data: regions,
        },
      ],
    };
  }, [featureLabels, mapName, regionStates, scope]);

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
          const first = regionStates.get(name)?.records[0];
          if (first) onSelectRecord(first);
        }}
        onRoam={({ zoom }) => {
          if (scope === 'china' && (zoom ?? 0) >= 2) {
            setShouldLoadChinaCityBoundaries(true);
          }
        }}
      />
    </div>
  );
}
