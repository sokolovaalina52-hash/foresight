// Итог витка: шесть продуктов, динамика, запрос на новый виток.
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Dynamics } from '../components/Dynamics';
import { STAGES } from '../content/model';
import { ans } from '../lib/answers';
import { PRODUCT_KEYS } from '../lib/products';
import { download, portfolioMarkdown } from '../lib/run';
import { useRun, useStore } from '../store/store';

export function Summary() {
  const run = useRun();
  const demo = useStore(s => s.demo);
  const startNextRun = useStore(s => s.startNextRun);
  const copyDemo = useStore(s => s.copyDemo);
  const runs = useStore(s => s.runs);
  const navigate = useNavigate();
  if (!run) return <Navigate to="/" replace />;
  const req = ans(run, '6.5');
  const next = () => {
    if (demo) {
      if (runs.length && !window.confirm('Демонстрационный пример будет скопирован в ваши данные и заменит сохранённые витки. Продолжить?')) return;
      copyDemo();
    }
    startNextRun();
    navigate('/start');
  };
  return (
    <>
      <div className="view-head">
        <div className="eyebrow">Итог витка {run.number}{run.finishedAt ? ` · завершён ${new Date(run.finishedAt).toLocaleDateString('ru-RU')}` : ''}</div>
        <h1>Виток пройден</h1>
        <p className="lead">Шесть продуктов собраны, динамика зафиксирована, запрос на новый виток сформулирован. Результаты этого витка становятся отправной точкой следующего.</p>
      </div>
      <section className="stack">
        <h2>Шесть продуктов</h2>
        <div className="grid g3">{PRODUCT_KEYS.map((k, i) => (
          <Link key={k} to={`/portfolio?p=${k}`} className="card stack" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className={`pill ${STAGES[i].zone}`}>{STAGES[i].roman}. {STAGES[i].name}</span>
            <b>{run.products[k]?.title}</b>
          </Link>
        ))}</div>
      </section>
      <section className="card stack"><h2>Динамика</h2><Dynamics run={run} /></section>
      <section className="card stack">
        <h2>Запрос на новый виток</h2>
        <dl className="defl">
          <dt>Новая проблема</dt><dd>{req.problem || '—'}</dd>
          <dt>Отличие от исходной</dt><dd>{req.diff || '—'}</dd>
          <dt>Критический этап</dt><dd>{req.critical ? `${STAGES[req.critical - 1].roman}. ${STAGES[req.critical - 1].name}` : '—'}</dd>
          <dt>Возвращение к карте</dt><dd>{[req.date && new Date(req.date).toLocaleDateString('ru-RU'), req.occasion].filter(Boolean).join(', ') || '—'}</dd>
        </dl>
      </section>
      <div className="row no-print">
        <button type="button" className="btn primary" disabled={!run.finishedAt} onClick={next}>Начать виток {run.number + 1}</button>
        <button type="button" className="btn" onClick={() => download(`portfolio-vitok-${run.number}.md`, portfolioMarkdown(run))}>Экспортировать портфолио</button>
        <Link className="btn" to="/portfolio">Открыть портфолио</Link>
      </div>
    </>
  );
}
