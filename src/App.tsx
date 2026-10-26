import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ui';
import { useStore } from './store/store';
import Home from './pages/Home';

const Start = lazy(() => import('./pages/Start'));
const StagePage = lazy(() => import('./pages/StagePage'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PrintView = lazy(() => import('./pages/PrintView'));
const Library = lazy(() => import('./pages/Library'));
const About = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));
const Summary = lazy(() => import('./pages/Summary'));

function useDocumentSettings() {
  const theme = useStore(s => s.theme);
  const present = useStore(s => s.present);
  const demo = useStore(s => s.mode === 'demo');
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', theme);
  }, [theme]);
  useEffect(() => {
    // В демо-режиме и режиме презентации основной шрифт ≥ 18 px — читаемость на проекторе
    document.documentElement.setAttribute('data-present', String(present || demo));
  }, [present, demo]);
}

export default function App() {
  useDocumentSettings();
  return (
    <ToastProvider>
      <HashRouter>
        <Suspense fallback={<div className="main muted" style={{ padding: 24 }}>Загрузка…</div>}>
          <Routes>
            <Route path="/portfolio/print" element={<PrintView />} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="start" element={<Start />} />
              <Route path="stage/:n" element={<StagePage />} />
              <Route path="summary" element={<Summary />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="library" element={<Navigate to="/library/lectures" replace />} />
              <Route path="library/:tab" element={<Library />} />
              <Route path="about" element={<About />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ToastProvider>
  );
}
