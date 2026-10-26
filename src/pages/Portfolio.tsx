// Мои продукты: шесть продуктов, версии дорожной карты, витки, экспорт.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { ProductActions } from '../components/ProductPreview';
import { RoadmapDiffView } from '../components/Roadmap';
import { STAGES } from '../content/model';
import { attitudeName, fmt, sInt } from '../lib/diag';
import { PRODUCT_KEYS } from '../lib/products';
import { requiredDone, stageComplete } from '../lib/progress';
import { roadmapTable } from '../lib/products';
import { download, exportJSON, portfolioMarkdown } from '../lib/run';
import type { ProductKey, Run } from '../lib/types';
import { DEMO_RUN } from '../demo/demoRun';
import { useRun, useStore } from '../store/store';

const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('ru-RU') : '—');

function status(run: Run, n: number) {
  if (stageComplete(run, n)) return { t: 'этап завершён', c: 'ok' };
  if (requiredDone(run, n)) return { t: 'собран', c: 'warn' };
  return { t: 'черновик', c: '' };
}

function printProduct() {
  document.body.dataset.print = 'product';
  const off = () => { delete document.body.dataset.print; window.removeEventListener('afterprint', off); };
  window.addEventListener('afterprint', off);
  window.print();
}

export function Portfolio() {
  const run = useRun();
  const demo = useStore(s => s.demo);
  const userRuns = useStore(s => s.runs);
  const templates = useStore(s => s.templates);
  const runs = demo ? [DEMO_RUN] : userRuns;
  const [params, setParams] = useSearchParams();
  const sel = (params.get('p') as ProductKey) || null;
  const versions = runs.flatMap(r => r.roadmapVersions.map(v => ({ run: r.number, ...v })));
  const [vi, setVi] = useState(Math.max(0, versions.length - 1));
  useEffect(() => { setVi(Math.max(0, versions.length - 1)); }, [versions.length]);
  useEffect(() => { if (sel) document.getElementById('product-view')?.scrollIntoView({ block: 'start' }); }, [sel]);

  if (!run) return (
    <div className="view-head"><h1>Портфолио</h1><p className="lead">Портфолио появится, когда вы начнёте проход цикла.</p></div>
  );
  const product = sel ? run.products[sel] : undefined;
  const cur = versions[vi];
  const prevVersion = vi > 0 ? versions[vi - 1] : undefined;

  return (
    <>
      <div className="view-head print-hide">
        <div className="eyebrow">Виток {run.number} · {run.profile.discipline || 'дисциплина не указана'}</div>
        <h1>Мои продукты</h1>
        <p className="lead">Шесть проектных продуктов собираются из ваших ответов автоматически. Откройте продукт, чтобы прочитать, скопировать, скачать в Markdown или распечатать.</p>
      </div>

      <section className="grid g3 print-hide" aria-label="Продукты витка">
        {PRODUCT_KEYS.map((k, i) => {
          const p = run.products[k]!; const st = status(run, i + 1);
          return (
            <button key={k} type="button" className="card stack" aria-pressed={sel === k}
              style={{ textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', borderColor: sel === k ? 'var(--accent)' : undefined }}
              onClick={() => setParams(sel === k ? {} : { p: k })}>
              <span className="row between"><span className={`pill ${STAGES[i].zone}`}>{STAGES[i].roman}. {STAGES[i].name}</span><span className={`pill ${st.c}`}>{st.t}</span></span>
              <b>{p.title}</b>
              <span className="small muted">Обновлено {date(p.updatedAt)}</span>
            </button>
          );
        })}
      </section>

      {product && sel && (
        <section className="product" id="product-view" aria-labelledby="pv-title">
          <div className="product-head no-print">
            <h2 id="pv-title">{product.title}</h2>
            <div className="row"><ProductActions product={product} pkey={sel} toPortfolio={false} /><button type="button" className="btn sm" onClick={printProduct}>Печать</button></div>
          </div>
          <div className="product-body full"><Markdown text={product.markdown} /></div>
        </section>
      )}

      <section className="card stack print-hide" aria-labelledby="rm">
        <h2 id="rm">Дорожная карта</h2>
        {!cur ? <p className="muted">Версии карты появятся после задания 4.2 (v1) и корректировки на этапе V (v2).</p> : (
          <>
            <div className="tabs" role="group" aria-label="Версии карты">
              {versions.map((v, i) => <button key={`${v.run}-${v.version}`} type="button" className="chip" aria-pressed={i === vi} onClick={() => setVi(i)}>Виток {v.run} · v{v.version}</button>)}
            </div>
            <p className="small muted">{cur.label} · сохранено {date(cur.savedAt)}</p>
            <Markdown text={roadmapTable(cur.rows)} />
            {prevVersion && <div className="stack"><h3>Изменения: виток {prevVersion.run} v{prevVersion.version} → виток {cur.run} v{cur.version}</h3><RoadmapDiffView a={prevVersion.rows} b={cur.rows} /></div>}
          </>
        )}
      </section>

      <section className="card stack print-hide" aria-labelledby="runs">
        <h2 id="runs">Витки</h2>
        <div className="tbl-wrap"><table>
          <thead><tr><th scope="col">Виток</th><th scope="col">Начало</th><th scope="col">Завершение</th><th scope="col">Установка: вход → выход</th><th scope="col">Sинт: вход → выход</th></tr></thead>
          <tbody>{runs.map(r => (
            <tr key={r.id}>
              <td>{r.number}{r.example ? ' (учебный пример)' : ''}</td><td>{date(r.startedAt)}</td><td>{date(r.finishedAt)}</td>
              <td>{r.entry?.attitude ? attitudeName(r.entry.attitude.dominant) : '—'} → {r.exit?.attitude ? attitudeName(r.exit.attitude.dominant) : '—'}</td>
              <td className="num">{r.entry?.selfScore ? fmt(sInt(r.entry.selfScore)) : '—'} → {r.exit?.selfScore ? fmt(sInt(r.exit.selfScore)) : '—'}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>

      <section className="card stack print-hide no-print" aria-labelledby="exp">
        <h2 id="exp">Экспортировать всё</h2>
        <p className="small muted">Markdown — титул с профилем, затем продукты по порядку этапов, затем рефлексии. JSON — полная резервная копия всех витков.</p>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => download(`portfolio-vitok-${run.number}.md`, portfolioMarkdown(run))}>Скачать портфолио .md</button>
          <button type="button" className="btn" onClick={() => download(`forsight-navigator-${new Date().toISOString().slice(0, 10)}.json`, exportJSON(runs, demo ? {} : templates), 'application/json')}>Скачать резервную копию .json</button>
        </div>
      </section>
    </>
  );
}
