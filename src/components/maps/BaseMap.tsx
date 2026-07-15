import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

type BaseMapProps = {
  mapName: string;
  geoJson: object;
  option: EChartsOption;
  onRegionClick?: (name: string) => void;
};

export function BaseMap({ mapName, geoJson, option, onRegionClick }: BaseMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    echarts.registerMap(mapName, geoJson as never);
  }, [geoJson, mapName]);

  useEffect(() => {
    if (!ref.current) return undefined;
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
  }, [option, onRegionClick]);

  return <div ref={ref} className="h-[58vh] min-h-[420px] w-full md:h-[640px]" />;
}
