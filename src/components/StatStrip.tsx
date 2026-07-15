type StatStripProps = {
  stats: Array<{ label: string; value: string | number; note?: string }>;
};

export function StatStrip({ stats }: StatStripProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs text-slate-500 dark:text-fog">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink dark:text-white">{stat.value}</p>
          {stat.note ? <p className="mt-1 text-xs text-slate-500 dark:text-fog">{stat.note}</p> : null}
        </div>
      ))}
    </section>
  );
}
