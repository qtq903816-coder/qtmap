import { Map, Moon, Plane, Sun } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTravelStore } from '../state/travelStore';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/china', label: '中国足迹' },
  { to: '/world', label: '世界足迹' },
  { to: '/manage', label: '足迹管理' },
];

export function Shell() {
  const theme = useTravelStore((state) => state.settings.theme);
  const updateSettings = useTravelStore((state) => state.updateSettings);

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors dark:bg-[#121619] dark:text-[#f7f4ee]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-paper/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#121619]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-clay text-white shadow-soft">
              <Map size={20} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-normal">小qt的旅行地图</span>
              <span className="text-xs text-slate-500 dark:text-fog">清爽记录每一次出发</span>
            </span>
          </NavLink>
          <nav className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-sm dark:border-white/10 dark:bg-white/5 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${
                    isActive ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-slate-600 hover:bg-slate-100 dark:text-fog dark:hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NavLink to="/manage" className="hidden rounded-xl bg-moss px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-moss/90 sm:inline-flex">
              <Plane className="mr-2" size={16} />
              记录足迹
            </NavLink>
            <button
              type="button"
              aria-label="切换深色模式"
              onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-fog"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <nav className="grid grid-cols-4 border-t border-slate-200 text-center text-xs dark:border-white/10 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `py-3 ${isActive ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-slate-600 dark:text-fog'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
