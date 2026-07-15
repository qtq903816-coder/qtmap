import { ArrowRight, Globe2, MapPinned } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RecordList } from '../components/RecordList';
import { StatStrip } from '../components/StatStrip';
import { useTravelStats } from '../hooks';
import { useTravelStore } from '../state/travelStore';
import { formatDate } from '../utils/date';

export function HomePage() {
  const stats = useTravelStats();
  const nextDestination = useTravelStore((state) => state.settings.nextDestination);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-stretch">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            小qt的旅行地图
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-fog">
            用一张轻量地图和一份清晰记录，整理去过的城市、国家和时间。数据保存在本机，也可以随时备份成 JSON。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/manage" className="inline-flex items-center rounded-xl bg-clay px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-clay/90">
              添加足迹 <ArrowRight className="ml-2" size={16} />
            </Link>
            <Link to="/china" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-clay/40 hover:bg-clay/5 dark:border-white/10 dark:bg-white/5 dark:text-white">
              查看地图
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-moss/12 via-white to-clay/10 p-6 shadow-sm dark:border-white/10 dark:from-moss/20 dark:via-white/[0.04] dark:to-clay/10">
          <p className="text-sm text-slate-500 dark:text-fog">最近一次旅行</p>
          <p className="mt-3 text-3xl font-semibold">
            {stats.latestTrip ? `${stats.latestTrip.countryName} · ${stats.latestTrip.city ?? '未知城市'}` : '暂无'}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-fog">{formatDate(stats.latestTrip?.arrivalDate)}</p>
          <div className="mt-8 rounded-2xl bg-white/70 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-fog">
            下一站：{nextDestination ?? '待定'}
          </div>
        </div>
      </section>

      <StatStrip
        stats={[
          { label: '去过的国家', value: stats.visitedCountryCount },
          { label: '去过的中国城市', value: stats.visitedChinaCityCount },
          { label: '累计旅行次数', value: stats.totalTrips },
          { label: '累计旅行天数', value: stats.totalDays },
          { label: '下一站计划', value: nextDestination ?? '待定' },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <MapEntry to="/china" title="中国足迹" description="按地级市记录去过的地方，支持年份筛选、搜索和详情查看。" icon={<MapPinned size={24} />} tone="coral" />
        <MapEntry to="/world" title="世界足迹" description="按 ISO 国家代码点亮国家，查看去过的城市和到访记录。" icon={<Globe2 size={24} />} tone="sage" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.68fr_0.32fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">最近添加的足迹</h2>
            <Link to="/manage" className="text-sm font-medium text-clay">管理全部</Link>
          </div>
          <RecordList records={stats.recentRecords} compact />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-semibold">数据备份</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-fog">
            当前数据保存在浏览器本地。清空数据或更换设备前，建议先导出完整备份。
          </p>
          <Link to="/manage" className="mt-5 inline-flex items-center rounded-xl bg-moss px-3 py-2 text-sm font-medium text-white">
            去备份 <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function MapEntry({ to, title, description, icon, tone }: { to: string; title: string; description: string; icon: ReactNode; tone: 'coral' | 'sage' }) {
  const toneClass = tone === 'coral' ? 'from-clay/12 to-terracotta/10 text-clay' : 'from-moss/14 to-fog/60 text-moss';
  return (
    <Link to={to} className={`group min-h-56 rounded-3xl border border-slate-200 bg-gradient-to-br ${toneClass} p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/10`}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">{icon}</span>
      <h2 className="mt-8 text-2xl font-semibold text-ink dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-fog">{description}</p>
      <span className="mt-5 inline-flex items-center text-sm font-medium">
        打开地图 <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} />
      </span>
    </Link>
  );
}
