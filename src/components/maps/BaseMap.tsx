import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

type BaseMapProps = {
  mapName: string;
  geoJson?: object;
  option: EChartsOption;
  onRegionClick?: (name: string) => void;
};

export function BaseMap({ mapName, geoJson, option, onRegionClick }: BaseMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const clickHandlerRef = useRef<typeof onRegionClick>();
  const currentMapNameRef = useRef<string>();

  useEffect(() => {
    clickHandlerRef.current = onRegionClick;
  }, [onRegionClick]);

  useEffect(() => {
    if (!geoJson) return;
    echarts.registerMap(mapName, geoJson as never);
  }, [geoJson, mapName]);

  useEffect(() => {
    if (!ref.current || !geoJson) return;
    const chart = chartRef.current ?? echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chartRef.current = chart;

    const chartOption = chart.getOption() as { geo?: Array<{ center?: unknown; map?: string; zoom?: number }> };
    const currentGeo = chartOption.geo?.[0];
    const shouldKeepRoam = currentMapNameRef.current === mapName && typeof currentGeo?.zoom === 'number';
    const nextOption = shouldKeepRoam
      ? {
        ...option,
        geo: {
          ...(option.geo as object),
          center: currentGeo?.center,
          zoom: currentGeo?.zoom,
        },
      }
      : option;

    chart.setOption(nextOption, false);
    currentMapNameRef.current = mapName;
    chart.resize();
  }, [geoJson, option]);

  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = chartRef.current ?? echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chartRef.current = chart;

    const handleResize = () => chart.resize();
    const handleClick = (params: { name?: string }) => {
      if (params.name) clickHandlerRef.current?.(params.name);
    };

    chart.on('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      chart.off('click', handleClick);
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
