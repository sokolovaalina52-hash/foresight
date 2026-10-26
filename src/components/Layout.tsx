// Каркас: слева (десктоп) / сверху (мобильный) — прогресс по спирали с шестью узлами, номер витка и разделы.
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { STAGES } from '../content/model';
import { canOpen, currentStage, partiallyPassed, stageComplete, stageProgress } from '../lib/progress';
import { useRun, useStore } from '../store/store';
import { Toast } from './toast';

function StageLinks() {
  const run = useRun();
  const { pathname } = useLocation();
  if (!run) return null;
  const cur = currentStage(run);
  const items = [{ n: 0, roman: '0', name: 'Вход в цикл', zone: 'z0', to: '/start' },
    ...STAGES.map(s => ({ n: s.n, roman: s.roman, name: s.name, zone: s.zone, to: `/stage/${s.n}` }))];
  return (
    <div className="progress-rail" aria-label="Прогресс по виткам">
      <div className="turn full">Виток {run.number}{run.finishedAt ? ' · завершён' : ''}</div>
      <nav className="stage-links" aria-label="Этапы цикла">
        {items.map(it => {
          const done = stageComplete(run, it.n);
          const partial = partiallyPassed(run, it.n);
          const p = it.n ? stageProgress(run, it.n) : null;
          const active = pathname === it.to;
          const locked = !done && !canOpen(run, it.n) && it.n !== cur;
          return (
            <NavLink key={it.n} to={it.to} className={`${active ? 'active' : ''}${locked ? ' locked' : ''}`}
              aria-label={`${it.n ? `Этап ${it.roman}` : 'Этап 0'} — ${it.name}${done ? ', завершён' : partial ? ', пройден не полностью' : it.n === cur ? ', текущий' : ''}`}>
              <span className={`node-dot ${it.zone}${done ? ' done' : ''}${it.n === cur ? ' current' : ''}`} style={partial ? { borderStyle: 'dashed' } : undefined} aria-hidden="true"><span>{it.roman}</span></span>
              <span className="lbl">{it.name}</span>
              <span className="cnt small muted num">{p ? `${p.done}/${p.total}` : ''}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export function Layout() {
  const theme = useStore(s => s.theme);
  const presentation = useStore(s => s.presentation);
  const demo = useStore(s => s.demo);
  const setDemo = useStore(s => s.setDemo);
  const setPresentation = useStore(s => s.setPresentation);
  const run = useRun();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') delete el.dataset.theme; else el.dataset.theme = theme;
    try { localStorage.setItem('fn-theme', theme); } catch { /* хранилище недоступно */ }
  }, [theme]);
  useEffect(() => { document.documentElement.classList.toggle('presentation', presentation); }, [presentation]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className={demo ? 'demo-on' : undefined}>
      <a className="skip" href="#main">К содержанию</a>
      {demo && (
        <div className="demo-bar no-print" role="note">
          <span>Демонстрационный пример — учебный, не данные апробации</span>
          <Link to="/about">О технологии</Link>
          <button type="button" onClick={() => setPresentation(!presentation)}>{presentation ? 'Обычный масштаб' : 'Режим презентации'}</button>
          <button type="button" onClick={() => { setDemo(false); navigate('/'); }}>Выйти из примера</button>
        </div>
      )}
      <div className="app">
        <aside className="side">
          <div className="side-top">
            <Link to="/" className="brand">
              <span className="name">Форсайт-навигатор</span>
              <span className="sub">Форсайт-технология профессионального развития преподавателей вузов с использованием цифровых ресурсов</span>
            </Link>
            {run && <span className="pill num" style={{ whiteSpace: 'nowrap' }}>виток {run.number}</span>}
          </div>
          <StageLinks />
          <nav className="nav" aria-label="Разделы">
            <NavLink to="/" end>Старт</NavLink>
            <NavLink to="/portfolio">Портфолио</NavLink>
            <NavLink to="/library">Библиотека</NavLink>
            <div className="sep" />
            <NavLink to="/about">О технологии</NavLink>
            <NavLink to="/settings">Настройки</NavLink>
          </nav>
          <div className="foot">Соколова А.С. · Самарский университет<br />Науч. рук. — д.п.н., проф. Левченко В.В.</div>
        </aside>
        <main className="main" id="main" tabIndex={-1}>
          <div className="wrap"><Outlet /></div>
        </main>
      </div>
      <Toast />
    </div>
  );
}
