import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

type BaseMapProps = {
  mapName: string;
  geoJson?: object;
  option: EChartsOption;
  onRegionClick?: (name: string) => void;
  onRoam?: (state: { center?: unknown; zoom?: number }) => void;
};

export function BaseMap({ mapName, geoJson, option, onRegionClick, onRoam }: BaseMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const clickHandlerRef = useRef<typeof onRegionClick>();
  const roamHandlerRef = useRef<typeof onRoam>();
  const currentMapNameRef = useRef<string>();

  useEffect(() => {
    clickHandlerRef.current = onRegionClick;
  }, [onRegionClick]);

  useEffect(() => {
    roamHandlerRef.current = onRoam;
  }, [onRoam]);

  useEffect(() => {
    if (!geoJson) return;
    echarts.registerMap(mapName, geoJson as never);
  }, [geoJson, mapName]);

  useEffect(() => {
    if (!ref.current || !geoJson) return;
    const chart = chartRef.current ?? echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chartRef.current = chart;

    const chartOption = (chart.getOption() ?? {}) as { geo?: Array<{ center?: unknown; zoom?: number }> };
    const currentGeo = chartOption.geo?.[0];
    const shouldKeepRoam = currentMapNameRef.current === mapName && typeof currentGeo?.zoom === 'number';
    const nextOption = shouldKeepRoam
      ? {
        ...option,
        geo: {
          ...((option.geo ?? {}) as object),
          center: currentGeo?.center,
          zoom: currentGeo?.zoom,
        },
      }
      : option;

    chart.setOption(nextOption, false);
    currentMapNameRef.current = mapName;
    chart.resize();
  }, [geoJson, mapName, option]);

  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = chartRef.current ?? echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chartRef.current = chart;

    const handleResize = () => chart.resize();
    const handleClick = (params: { name?: string }) => {
      if (params.name) clickHandlerRef.current?.(params.name);
    };
    const handleRoam = () => {
      const chartOption = (chart.getOption() ?? {}) as { geo?: Array<{ center?: unknown; zoom?: number }> };
      const currentGeo = chartOption.geo?.[0];
      roamHandlerRef.current?.({ center: currentGeo?.center, zoom: currentGeo?.zoom });
    };

    chart.on('click', handleClick);
    chart.on('georoam', handleRoam);
    window.addEventListener('resize', handleResize);

    return () => {
      chart.off('click', handleClick);
      chart.off('georoam', handleRoam);
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-[58vh] min-h-[420px] w-full md:h-[640px]">
      {!geoJson && (
        <div className="absolute inset-0 grid place-items-center text-sm text-umber">
          正在加载地图...
        </div>
      )}
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
