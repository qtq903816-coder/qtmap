import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { HomePage } from './pages/HomePage';
import { ManagePage } from './pages/ManagePage';
import { MapPage } from './pages/MapPage';
import { useTravelStore } from './state/travelStore';

export function App() {
  const hydrate = useTravelStore((state) => state.hydrate);
  const theme = useTravelStore((state) => state.settings.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="china" element={<MapPage scope="china" />} />
          <Route path="world" element={<MapPage scope="world" />} />
          <Route path="manage" element={<ManagePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
