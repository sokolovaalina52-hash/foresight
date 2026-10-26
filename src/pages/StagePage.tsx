// Экран этапа: шапка, опора, задания, продукт, рефлексивная пауза, переход к следующему этапу.
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Checkbox, TextArea } from '../components/fields';
import { ProductPreview } from '../components/ProductPreview';
import { LECTURES } from '../content/lectures';
import { STAGES, ZONES } from '../content/model';
import { OPORA, STAGE_LECTURES } from '../content/route';
import type { StageN } from '../content/types';
import { PRODUCT_KEYS, rubricChecks, rubricItems } from '../lib/products';
import { canOpen, isAccessible, partiallyPassed, requiredDone, stageComplete, stageProgress } from '../lib/progress';
import { useReadOnly, useRun, useStore } from '../store/store';
import { Stage1 } from './stages/Stage1';
import { Stage2 } from './stages/Stage2';
import { Stage3 } from './stages/Stage3';
import { Stage4 } from './stages/Stage4';
import { Stage5 } from './stages/Stage5';
import { Stage6 } from './stages/Stage6';

const BODIES = { 1: Stage1, 2: Stage2, 3: Stage3, 4: Stage4, 5: Stage5, 6: Stage6 };

function Rubric({ stage }: { stage: StageN }) {
  const run = useRun()!;
  const setRaw = useStore(s => s.setRaw);
  const items = rubricItems(stage);
  const checks = rubricChecks(run, stage);
  return (
    <fieldset className="stack" style={{ gap: 0 }}>
      <legend className="eyebrow">Рубрика самопроверки</legend>
      {items.map((it, i) => (
        <Checkbox key={i} label={it} checked={!!checks[i]} onChange={v => { const c = [...checks]; c[i] = v; setRaw(`rubric.${stage}`, { checks: c }); }} />
      ))}
    </fieldset>
  );
}

function Pause({ stage }: { stage: StageN }) {
  const run = useRun()!;
  const setReflection = useStore(s => s.setReflection);
  const p = run.reflections[stage] ?? { content: '', process: '', done: false };
  return (
    <section className="card stack" aria-labelledby="pause">
      <div className="row between"><h2 id="pause">Рефлексивная пауза</h2>{p.done && <span className="pill ok">заполнена</span>}</div>
      <TextArea label="Что сделано на этапе" required hint="Содержательная рефлексия: какие результаты получены." value={p.content} onChange={v => setReflection(stage, { content: v })} />
      <TextArea label="Как это получалось: что помогло, что мешало, какие цифровые инструменты сработали" required hint="Процессуальная рефлексия." value={p.process} onChange={v => setReflection(stage, { process: v })} />
    </section>
  );
}

export function StagePage() {
  const { n: raw } = useParams();
  const n = Number(raw) as StageN;
  const run = useRun();
  const ro = useReadOnly();
  const updateRun = useStore(s => s.updateRun);
  const navigate = useNavigate();
  if (!run) return <Navigate to="/" replace />;
  if (![1, 2, 3, 4, 5, 6].includes(n)) return <Navigate to="/" replace />;

  const s = STAGES[n - 1];
  const z = ZONES.find(x => x.id === s.zone)!;
  const prog = stageProgress(run, n);
  const pkey = PRODUCT_KEYS[n - 1];
  const product = run.products[pkey]!;
  const Body = BODIES[n];
  const next = n < 6 ? STAGES[n] : null;
  const lectures = (STAGE_LECTURES[n] ?? []).map(id => LECTURES.find(l => l.id === id)!);
  const openEarly = (target: number) => {
    updateRun(r => ({ ...r, earlyOpened: r.earlyOpened.includes(target as StageN) ? r.earlyOpened : [...r.earlyOpened, target as StageN] }));
    navigate(target === 0 ? '/start' : `/stage/${target}`);
  };

  if (!ro && !isAccessible(run, n)) {
    const prev = n === 1 ? 'входа в цикл' : `этапа ${STAGES[n - 2].roman}`;
    return (
      <section className={`card stack ${s.zone}`}>
        <div className="eyebrow">Этап {s.roman} из VI</div>
        <h1>{s.roman}. {s.name}</h1>
        <p>Этап откроется, когда будут выполнены обязательные задания {prev} и заполнена рефлексивная пауза.</p>
        <div className="row">
          <Link className="btn primary" to={n === 1 ? '/start' : `/stage/${n - 1}`}>Вернуться к {n === 1 ? 'входу' : `этапу ${STAGES[n - 2].roman}`}</Link>
          <button type="button" className="btn link" onClick={() => openEarly(n)}>Открыть досрочно</button>
        </div>
        <p className="small muted">При досрочном открытии предыдущий этап помечается «пройден не полностью» — к нему можно вернуться в любой момент.</p>
      </section>
    );
  }

  return (
    <div className={`stack-lg ${s.zone}`}>
      <header className="stage-head">
        <div className="row">
          <span className={`pill ${s.zone}`}><span className="dot" />{z.short} зона</span>
          <span className="pill">этап {s.roman} из VI</span>
          {stageComplete(run, n) && <span className="pill ok">этап завершён</span>}
          {partiallyPassed(run, n) && <span className="pill warn">пройден не полностью</span>}
        </div>
        <h1>{s.roman}. {s.name}</h1>
        <p><span className="eyebrow">Позиция преподавателя</span> <b>{s.position}</b></p>
        <div className="row" style={{ maxWidth: '30rem' }}>
          <div className="progress" style={{ flex: 1 }} role="progressbar" aria-label="Задания этапа" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done}>
            <i style={{ width: `${(prog.done / prog.total) * 100}%` }} />
          </div>
          <span className="small muted num">{prog.done} / {prog.total} заданий</span>
        </div>
      </header>

      <details className="basis">
        <summary>Что важно понять перед заданиями</summary>
        <div className="body">
          <p className="lead" style={{ fontSize: '1rem' }}>{OPORA[n]}</p>
          <p><b>Цель этапа.</b> {s.aim}</p>
          <ul>{s.content.map((c, i) => <li key={i}>{c}</li>)}</ul>
          <dl className="defl">
            <dt>Проектное требование</dt><dd>{s.requirement}</dd>
            <dt>Методологическая опора</dt><dd>{s.basis}</dd>
          </dl>
          {lectures.length > 0 && (
            <div className="row">{lectures.map(l => <Link key={l.id} className="btn sm" to={`/library/lectures?l=${l.id}`}>Полная лекция: {l.title}</Link>)}</div>
          )}
        </div>
      </details>

      <div className="stack">
        <h2 className="sr-only">Задания</h2>
        <Body />
      </div>

      <ProductPreview product={product} pkey={pkey}>{(n === 2 || n === 4) && <Rubric stage={n} />}</ProductPreview>

      {n < 6 && <Pause stage={n} />}

      {next ? (
        <div className="stack no-print" style={{ alignItems: 'flex-start' }}>
          <button type="button" className="btn primary" disabled={!canOpen(run, n + 1)} onClick={() => navigate(`/stage/${n + 1}`)}>Перейти к этапу {next.roman}</button>
          {!canOpen(run, n + 1) && (
            <>
              <p className="small muted">{requiredDone(run, n) ? 'Осталось заполнить рефлексивную паузу.' : 'Выполните обязательные задания этапа и заполните рефлексивную паузу.'}</p>
              <button type="button" className="btn link" onClick={() => openEarly(n + 1)}>Открыть досрочно</button>
            </>
          )}
        </div>
      ) : (
        <div className="stack no-print" style={{ alignItems: 'flex-start' }}>
          {run.finishedAt ? <Link className="btn primary" to="/summary">Итог витка</Link> : (
            <button type="button" className="btn primary" disabled={ro} onClick={() => {
              if (!stageComplete(run, 6) && !window.confirm('Не все обязательные задания VI этапа выполнены. Завершить виток всё равно?')) return;
              updateRun(r => ({ ...r, finishedAt: new Date().toISOString() }));
              navigate('/summary');
            }}>Завершить виток</button>
          )}
        </div>
      )}
    </div>
  );
}
