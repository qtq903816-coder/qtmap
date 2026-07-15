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

  useEffect(() => {
    if (!geoJson) return;
    echarts.registerMap(mapName, geoJson as never);
  }, [geoJson, mapName]);

  useEffect(() => {
    if (!ref.current || !geoJson) return undefined;
    const chart = echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chart.setOption(option, true);
    const handleResize = () => chart.resize();
    const handleClick = (params: { name?: string }) => {
      if (params.name) onRegionClick?.(params.name);
    };
    chart.on('click', handleClick);
    window.addEventListener('resize', handleResize);
    return () => {
      chart.off('click', handleClick);
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [geoJson, option, onRegionClick]);

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
