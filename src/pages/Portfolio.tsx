import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { STAGES } from '../content/model';
import { CopyButton, DownloadButton, fmtDate } from '../components/ui';
import { Markdown } from '../components/Markdown';
import { RoadmapDiffView } from '../tasks/stage5';
import { attitudeName } from '../lib/diagnostics';
import { dateStamp } from '../lib/io';
import { PRODUCT_IDS, roadmapTable } from '../lib/products';
import { canAdvance, requiredDone } from '../lib/rules';
import { portfolioMarkdown } from '../lib/run';
import type { ProductId, Run } from '../lib/types';
import { activeOf, useRuns, useStore } from '../store/store';

const productStatus = (run: Run, i: number) => (canAdvance(run, i + 1) ? 'этап завершён' : requiredDone(run, i + 1) ? 'собран' : 'черновик');
const slug = (s: string) => s.toLowerCase().replace(/[^а-яёa-z0-9]+/gi, '-').replace(/-+$/, '');

export default function Portfolio() {
  const runs = useRuns();
  const mode = useStore(s => s.mode);
  const exportData = useStore(s => s.exportData);
  const startNextRun = useStore(s => s.startNextRun);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const run = runs.find(r => r.id === params.get('run')) ?? activeOf(runs);
  const pid = (params.get('p') as ProductId | null) ?? null;
  const versions = runs.flatMap(r => r.roadmapVersions.map(v => ({ run: r, v, key: `${r.id}:${v.label}` })));
  const [verKey, setVerKey] = useState<string | null>(null);
  const curVer = versions.find(x => x.key === verKey) ?? versions[versions.length - 1];
  const curIdx = curVer ? versions.indexOf(curVer) : -1;
  const prevVer = curIdx > 0 ? versions[curIdx - 1] : undefined;

  if (!run) return (
    <div className="wrap"><div className="card stack"><h1>Мои продукты</h1><p>Проход ещё не начат — продукты появятся по мере выполнения заданий.</p><div className="row"><Link className="btn primary" to="/">На старт</Link></div></div></div>
  );
  const setP = (p: string | null) => { const n = new URLSearchParams(params); if (p) n.set('p', p); else n.delete('p'); setParams(n); };
  const product = pid ? run.products[pid] : null;

  return (
    <div className="wrap">
      <header className="view-head">
        <div className="eyebrow">Портфолио · виток {run.number}{run.isDemoCopy ? ' · учебный пример' : ''}</div>
        <h1>Мои продукты</h1>
        <p className="lead">Шесть продуктов витка собираются из ответов автоматически. Откройте продукт, чтобы прочитать, скопировать, скачать или распечатать.</p>
      </header>

      <section className="grid g3" aria-label="Продукты витка">
        {PRODUCT_IDS.map((id, i) => (
          <button key={id} type="button" className="card stack" aria-pressed={pid === id} onClick={() => setP(pid === id ? null : id)}
            style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit', borderColor: pid === id ? 'var(--accent)' : undefined }}>
            <span className={`pill ${STAGES[i].zone}`} style={{ alignSelf: 'flex-start' }}>{STAGES[i].roman}. {STAGES[i].name}</span>
            <b>{run.products[id].title}</b>
            <span className="small muted">{productStatus(run, i)} · обновлён {fmtDate(run.products[id].updatedAt)}</span>
          </button>
        ))}
      </section>

      {product && pid && (
        <section className="product" aria-labelledby="pv-h">
          <div className="ph">
            <h2 id="pv-h" style={{ fontSize: '1.15rem' }}>{product.title}</h2>
            <div className="row">
              <CopyButton text={product.markdown} />
              <DownloadButton name={`${pid}-${slug(product.title)}.md`} content={product.markdown} />
              <Link className="btn sm" to={`/portfolio/print?p=${pid}&run=${run.id}`}>Печать</Link>
              <Link className="btn sm" to={`/stage/${STAGES[PRODUCT_IDS.indexOf(pid)].n}`}>К этапу</Link>
              <button type="button" className="btn sm" onClick={() => setP(null)}>Закрыть</button>
            </div>
          </div>
          <div className="pb full"><Markdown text={product.markdown} /></div>
        </section>
      )}

      <section className="card stack" aria-labelledby="rm-h">
        <h2 id="rm-h" style={{ fontSize: '1.15rem' }}>Дорожная карта</h2>
        {versions.length === 0 ? <p className="small muted">Версия v1 появится после заполнения карты на IV этапе, v2 — после корректировки на V этапе.</p> : (
          <>
            <div className="tabs" role="group" aria-label="Версии карты">
              {versions.map(x => <button key={x.key} type="button" className="chip" aria-pressed={x === curVer} onClick={() => setVerKey(x.key)}>Виток {x.run.number} · {x.v.label}</button>)}
            </div>
            {curVer && <>
              <p className="small muted">Сохранена {fmtDate(curVer.v.savedAt)}{curVer.v.scenario ? ` · сценарий «${curVer.v.scenario}»` : ''}{curVer.v.goal ? ` · цель: ${curVer.v.goal}` : ''}</p>
              <Markdown text={roadmapTable(curVer.v.points)} />
              {prevVer && <div className="stack"><h3 style={{ fontSize: '1rem' }}>Изменения: виток {prevVer.run.number} {prevVer.v.label} → виток {curVer.run.number} {curVer.v.label}</h3><RoadmapDiffView before={prevVer.v.points} after={curVer.v.points} /></div>}
            </>}
          </>
        )}
      </section>

      <section className="card stack" aria-labelledby="runs-h">
        <h2 id="runs-h" style={{ fontSize: '1.15rem' }}>Витки</h2>
        <div className="tbl-wrap">
          <table className="t" style={{ minWidth: 520 }}>
            <thead><tr><th>Виток</th><th>Даты</th><th>Установка: вход → выход</th><th><span className="sr-only">Открыть</span></th></tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id}>
                  <td>{r.number}{r.isDemoCopy ? ' (учебный)' : ''}</td>
                  <td>{fmtDate(r.startedAt)} — {r.finishedAt ? fmtDate(r.finishedAt) : 'в работе'}</td>
                  <td>{attitudeName(r.entry.attitude)} → {attitudeName(r.exit?.attitude)}</td>
                  <td>{r.id === run.id ? <span className="small muted">открыт</span> : <button type="button" className="btn sm" onClick={() => setParams({ run: r.id })}>Открыть</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {run.finishedAt && run === runs[runs.length - 1] && (
          <div><button type="button" className="btn primary" onClick={() => { startNextRun(); nav('/start'); }}>Начать виток {run.number + 1}</button></div>
        )}
      </section>

      <section className="card stack" aria-labelledby="exp-h">
        <h2 id="exp-h" style={{ fontSize: '1.15rem' }}>Экспортировать всё</h2>
        <p className="small muted">Markdown — титул с профилем, продукты по порядку этапов, рефлексивные паузы. JSON — полная резервная копия всех витков{mode === 'demo' ? ' (в демо-режиме — ваши собственные данные, не пример)' : ''}.</p>
        <div className="row">
          <DownloadButton className="btn" name={`portfolio-vitok-${run.number}-${dateStamp()}.md`} content={() => portfolioMarkdown(run)} label="Скачать портфолио .md" />
          <DownloadButton className="btn" name={`forsight-navigator-${dateStamp()}.json`} type="application/json" content={() => JSON.stringify(exportData(), null, 2)} label="Скачать резервную копию .json" />
          <Link className="btn" to={`/portfolio/print?run=${run.id}`}>Печать / PDF</Link>
        </div>
      </section>
    </div>
  );
}
