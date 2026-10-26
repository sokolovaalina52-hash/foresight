import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { STAGES } from '../content/model';
import { currentStage, stageStatus, type StageStatus } from '../lib/rules';
import type { Run } from '../lib/types';
import { useActiveRun, useStore } from '../store/store';
import { Spiral, SpiralStrip } from './Spiral';

type NodeState = StageStatus | 'current';
export function nodeStates(run: Run | null): Record<number, NodeState> {
  const out: Record<number, NodeState> = {};
  const cur = run ? currentStage(run) : -1;
  for (const s of STAGES) {
    if (!run) { out[s.n] = 'locked'; continue; }
    const st = stageStatus(run, s.n);
    out[s.n] = s.n === cur && st !== 'done' && !run.finishedAt ? 'current' : st;
  }
  return out;
}

const STATUS_SHORT: Record<string, string> = { done: 'готово', partial: 'не полностью', locked: '', open: '', current: 'сейчас' };

export function Layout() {
  const run = useActiveRun();
  const mode = useStore(s => s.mode);
  const exitDemo = useStore(s => s.exitDemo);
  const copyDemo = useStore(s => s.copyDemo);
  const nav = useNavigate();
  const loc = useLocation();
  const states = nodeStates(run);

  useEffect(() => {
    document.getElementById('main')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const links = (
    <>
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Главная</NavLink>
      <NavLink to="/start" className={({ isActive }) => (isActive ? 'active' : '')}><span className="r">0</span>Вход в цикл</NavLink>
      {STAGES.map(s => (
        <NavLink key={s.n} to={`/stage/${s.n}`} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="r">{s.roman}</span>{s.name}<span className="st">{STATUS_SHORT[states[s.n]]}</span>
        </NavLink>
      ))}
      <div className="sep" />
      <NavLink to="/portfolio" className={({ isActive }) => (isActive ? 'active' : '')}>Портфолио</NavLink>
      <NavLink to="/library" className={({ isActive }) => (isActive ? 'active' : '')}>Библиотека</NavLink>
      <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>О технологии</NavLink>
      <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>Настройки</NavLink>
    </>
  );

  return (
    <>
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>К содержанию</a>
      {mode === 'demo' && (
        <div className="demo-bar no-print" role="note">
          <b>Демонстрационный пример</b><span>учебный, не данные апробации · только просмотр</span>
          <button type="button" onClick={() => { copyDemo().then(() => nav('/stage/1')); }}>Сделать копию и редактировать</button>
          <NavLink to="/about">О технологии</NavLink>
          <button type="button" onClick={() => { exitDemo(); nav('/'); }}>Выйти из демо</button>
        </div>
      )}
      <div className="app">
        <aside className="side" aria-label="Навигация по циклу">
          <NavLink to="/" className="brand">
            <span className="name">Форсайт-навигатор</span>
            <span className="sub">Форсайт-технология профессионального развития преподавателей вузов с использованием цифровых ресурсов</span>
          </NavLink>
          <div className="spiral-box">
            <Spiral size={240} compact states={states} onSelect={n => nav(`/stage/${n}`)} label="Прогресс витка по шести этапам" />
            <div className="turn"><span>{run ? `Виток ${run.number}` : 'Виток не начат'}</span>{run?.finishedAt && <span className="pill ok">завершён</span>}</div>
          </div>
          <nav className="nav" aria-label="Разделы">{links}</nav>
          <div className="foot">Соколова А.С. · Самарский университет<br />Науч. рук. — д.п.н., проф. Левченко В.В.</div>
        </aside>
        <div className="mobile-bar no-print">
          <div className="top">
            <NavLink to="/" className="brand"><span className="name">Форсайт-навигатор</span></NavLink>
            <span className="small muted">{run ? `Виток ${run.number}` : ''}</span>
          </div>
          <SpiralStrip states={states} onSelect={n => nav(`/stage/${n}`)} />
          <nav aria-label="Разделы">
            <NavLink to="/start" className={({ isActive }) => (isActive ? 'active' : '')}>Вход</NavLink>
            {STAGES.map(s => <NavLink key={s.n} to={`/stage/${s.n}`} className={({ isActive }) => (isActive ? 'active' : '')}>{s.roman}. {s.name}</NavLink>)}
            <NavLink to="/portfolio" className={({ isActive }) => (isActive ? 'active' : '')}>Портфолио</NavLink>
            <NavLink to="/library" className={({ isActive }) => (isActive ? 'active' : '')}>Библиотека</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>О технологии</NavLink>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>Настройки</NavLink>
          </nav>
        </div>
        <main className="main" id="main" tabIndex={-1} style={{ outline: 'none' }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
