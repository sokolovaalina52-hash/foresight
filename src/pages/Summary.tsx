import { Link, useNavigate } from 'react-router-dom';
import { STAGES } from '../content/model';
import { DynamicsView } from '../components/Diagnostics';
import { DownloadButton, fmtDate } from '../components/ui';
import { ans } from '../lib/answers';
import { dateStamp } from '../lib/io';
import { PRODUCT_IDS } from '../lib/products';
import { allRequiredDone, canAdvance } from '../lib/rules';
import { portfolioMarkdown } from '../lib/run';
import { useActiveRun, useStore } from '../store/store';

export default function Summary() {
  const run = useActiveRun();
  const mode = useStore(s => s.mode);
  const finishRun = useStore(s => s.finishRun);
  const startNextRun = useStore(s => s.startNextRun);
  const nav = useNavigate();
  if (!run) return <div className="wrap"><p>Проход ещё не начат. <Link to="/">На старт</Link></p></div>;
  const complete = allRequiredDone(run);
  const rq = ans(run, '6.5');

  return (
    <div className="wrap">
      <header className="view-head">
        <div className="eyebrow">Виток {run.number}</div>
        <h1>{run.finishedAt ? 'Итог витка' : 'Завершение витка'}</h1>
        <p className="lead">{run.finishedAt ? `Виток завершён ${fmtDate(run.finishedAt)}. Результаты предыдущего витка становятся отправной точкой следующего.` : 'Проверьте продукты и динамику, затем завершите виток — после этого его можно будет только просматривать.'}</p>
      </header>

      {!run.finishedAt && mode === 'own' && (
        <section className="card stack">
          {!complete && <p className="note">Не все обязательные задания и паузы выполнены: {[0, 1, 2, 3, 4, 5, 6].filter(n => !canAdvance(run, n)).map(n => (n === 0 ? 'вход' : STAGES[n - 1].roman)).join(', ')}. Виток можно завершить и так — незавершённые этапы останутся помеченными.</p>}
          <div className="row"><button type="button" className="btn primary" onClick={() => finishRun()}>Завершить виток</button><Link className="btn" to="/stage/6">Вернуться к этапу VI</Link></div>
        </section>
      )}

      <section className="stack" aria-labelledby="sum-p">
        <h2 id="sum-p" style={{ fontSize: '1.15rem' }}>Шесть продуктов</h2>
        <div className="grid g3">
          {PRODUCT_IDS.map((id, i) => (
            <Link key={id} to={`/portfolio?p=${id}`} className="card stack" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className={`pill ${STAGES[i].zone}`} style={{ alignSelf: 'flex-start' }}>{STAGES[i].roman}. {STAGES[i].name}</span>
              <b>{run.products[id].title}</b>
              <span className="small muted">{canAdvance(run, i + 1) ? 'этап завершён' : 'черновик'} · {fmtDate(run.products[id].updatedAt)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="sum-d">
        <h2 id="sum-d" style={{ fontSize: '1.15rem' }}>Динамика</h2>
        <DynamicsView entry={run.entry} exit={run.exit} />
      </section>

      <section className="card stack" aria-labelledby="sum-r">
        <h2 id="sum-r" style={{ fontSize: '1.15rem' }}>Запрос на новый виток</h2>
        <dl className="defl">
          <dt>Новая проблема</dt><dd>{rq.problem || '—'}</dd>
          <dt>Отличие от исходной</dt><dd>{rq.difference || '—'}</dd>
          <dt>Критический этап</dt><dd>{rq.criticalStage ? `${STAGES[rq.criticalStage - 1].roman}. ${STAGES[rq.criticalStage - 1].name}` : '—'}</dd>
          <dt>Возвращение к карте</dt><dd>{[rq.date, rq.occasion].filter(x => x.trim()).join(' — ') || '—'}</dd>
        </dl>
      </section>

      <div className="row">
        {run.finishedAt && <button type="button" className="btn primary" onClick={() => { startNextRun(); nav('/start'); }}>Начать виток {run.number + 1}</button>}
        <DownloadButton className="btn" name={`portfolio-vitok-${run.number}-${dateStamp()}.md`} content={() => portfolioMarkdown(run)} label="Экспортировать портфолио (.md)" />
        <Link className="btn" to="/portfolio">Открыть портфолио</Link>
      </div>
    </div>
  );
}
