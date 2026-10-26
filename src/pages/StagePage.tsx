import { useEffect, useState, type ComponentType } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { STAGES, ZONES } from '../content/model';
import { LECTURES } from '../content/lectures';
import { tasksOf } from '../content/tasks';
import { TaskShell } from '../components/TaskShell';
import { CopyButton, DownloadButton, TextArea } from '../components/ui';
import { Markdown } from '../components/Markdown';
import { PRODUCT_IDS, rubricChecks, rubricItems } from '../lib/products';
import { canAdvance, reflectionDone, requiredDone, stageOpen, stageProgress, stageStatus, taskDone } from '../lib/rules';
import type { StageN } from '../lib/types';
import { useActiveRun, useReadOnly, useStore } from '../store/store';
import * as S1 from '../tasks/stage1';
import * as S2 from '../tasks/stage2';
import * as S3 from '../tasks/stage3';
import * as S4 from '../tasks/stage4';
import * as S5 from '../tasks/stage5';
import * as S6 from '../tasks/stage6';

const BODIES: Record<string, ComponentType> = {
  '1.1': S1.T1_1, '1.2': S1.T1_2, '1.3': S1.T1_3, '1.4': S1.T1_4,
  '2.1': S2.T2_1, '2.2': S2.T2_2, '2.3': S2.T2_3, '2.4': S2.T2_4,
  '3.1': S3.T3_1, '3.2': S3.T3_2, '3.3': S3.T3_3, '3.4': S3.T3_4, '3.5': S3.T3_5,
  '4.1': S4.T4_1, '4.2': S4.T4_2, '4.3': S4.T4_3, '4.4': S4.T4_4, '4.5': S4.T4_5,
  '5.1': S5.T5_1, '5.2': S5.T5_2, '5.3': S5.T5_3, '5.4': S5.T5_4, '5.5': S5.T5_5,
  '6.1': S6.T6_1, '6.2': S6.T6_2, '6.3': S6.T6_3, '6.4': S6.T6_4, '6.5': S6.T6_5,
};

/** Подсказки «на что обратить внимание» к опоре — интерфейсные пояснения из ТЗ */
const FOCUS: Record<number, string> = {
  1: 'Три установки по отношению к будущему — ретроспективная, адаптивная, проспективная. Задача этапа — не оценить себя, а сформулировать проблему, с которой пойдёт работа.',
  2: 'Работаем не с готовыми трендами, а с противоречиями, которые их порождают. Слабый сигнал — неочевидная, ещё не оформившаяся тенденция.',
  3: 'Прогноз описывает наиболее вероятное будущее, сценарий — одно из возможных. Сценарии должны быть альтернативами, а не градациями.',
  4: 'Карта согласована со сценарием, каждая точка измерима; стратегия есть в каждом сценарии.',
  5: 'Три критерия: реалистичность, инновационность, антропологическая состоятельность. Экспертиза — способ присвоить коллективный образ будущего, а не оценить человека.',
  6: 'Три типа рефлексии по глубине; ценностное самоопределение; выход на новый виток.',
};

function Rubric({ p, stage }: { p: 'p2' | 'p4'; stage: number }) {
  const run = useActiveRun()!;
  const setRaw = useStore(s => s.setRaw);
  const readOnly = useReadOnly();
  const checks = rubricChecks(run, p);
  return (
    <fieldset disabled={readOnly} className="stack" style={{ padding: '0 18px 16px' }}>
      <legend className="eyebrow" style={{ padding: '0 18px' }}>Рубрика самопроверки</legend>
      {rubricItems(stage).map(x => (
        <label key={x} className="check"><input type="checkbox" checked={checks.includes(x)} onChange={e => setRaw(`rubric:${p}`, e.target.checked ? [...checks, x] : checks.filter(c => c !== x))} /><span>{x}</span></label>
      ))}
    </fieldset>
  );
}

export default function StagePage() {
  const n = Number(useParams().n);
  const run = useActiveRun();
  const readOnly = useReadOnly();
  const openStage = useStore(s => s.openStage);
  const setReflection = useStore(s => s.setReflection);
  const nav = useNavigate();
  const tasks = tasksOf(n);
  const [params] = useSearchParams();
  const wanted = params.get('task');
  const firstOpen = wanted && tasks.some(x => x.id === wanted) ? wanted : run ? (tasks.find(x => !taskDone(run, x.id))?.id ?? tasks[0]?.id) : undefined;
  const [openId, setOpenId] = useState<string | undefined>(firstOpen);
  useEffect(() => {
    setOpenId(firstOpen);
    if (wanted) setTimeout(() => document.getElementById(`t-${wanted}`)?.scrollIntoView({ block: 'start' }), 0);
  }, [n, wanted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!(n >= 1 && n <= 6)) return <Navigate to="/" replace />;
  if (!run) return (
    <div className="wrap"><div className="card stack"><h2>Проход ещё не начат</h2><p>Начните с входа в цикл: профиль, диагностика установки и самооценка.</p><div className="row"><Link className="btn primary" to="/">На старт</Link></div></div></div>
  );

  const s = STAGES[n - 1];
  const z = ZONES.find(x => x.id === s.zone)!;
  const pid = PRODUCT_IDS[n - 1];
  const product = run.products[pid];
  const prog = stageProgress(run, n);
  const status = stageStatus(run, n);
  const open = stageOpen(run, n);
  const lectures = LECTURES.filter(l => l.stage === n);
  const ready = canAdvance(run, n);
  const goNext = (early: boolean) => {
    if (n === 6) { nav('/summary'); return; }
    if (early || ready) openStage(n + 1);
    nav(`/stage/${n + 1}`);
  };
  const refl = run.reflections[n as StageN];
  const fileName = `${pid}-${product.title.toLowerCase().replace(/[^а-яёa-z0-9]+/gi, '-').replace(/-+$/, '')}.md`;

  return (
    <div className="wrap">
      <header className="stack">
        <div className="zone-band" style={{ background: `var(--${s.zone})` }} />
        <div className="row between">
          <div className="row">
            <span className={`pill ${s.zone}`}><span className="dot" />{z.short} зона</span>
            <span className="pill">этап {s.roman} из VI</span>
            {status === 'partial' && <span className="pill warn">пройден не полностью</span>}
            {status === 'done' && <span className="pill ok">этап завершён</span>}
          </div>
          <span className="small muted num">Задания: {prog.done} / {prog.total}</span>
        </div>
        <h1>{s.roman}. {s.name}</h1>
        <p className="lead">Позиция преподавателя: <b>{s.position}</b></p>
        <div className="progress" role="progressbar" aria-label="Прогресс по заданиям этапа" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done}><i style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div>
      </header>

      {!open && !readOnly && (
        <div className="note stack">
          <p>Этап откроется, когда на предыдущем этапе выполнены обязательные задания и заполнена рефлексивная пауза.</p>
          <div className="row">
            <Link className="btn sm" to={n === 1 ? '/start' : `/stage/${n - 1}`}>{n === 1 ? 'Ко входу в цикл' : `К этапу ${STAGES[n - 2].roman}`}</Link>
            <button type="button" className="btn sm" onClick={() => openStage(n)}>Открыть досрочно</button>
          </div>
        </div>
      )}

      <details className="opora">
        <summary>Что важно понять перед заданиями</summary>
        <div className="body">
          <p><b>{FOCUS[n]}</b></p>
          <p>{s.aim}</p>
          <ul>{s.content.map(c => <li key={c}>{c}</li>)}</ul>
          <dl className="defl">
            <dt>Проектное требование</dt><dd>{s.requirement}</dd>
            <dt>Методологическая опора</dt><dd>{s.basis}</dd>
            <dt>Цифровые ресурсы</dt><dd>{s.steps.map(st => st[1]).join('; ')}</dd>
          </dl>
          {lectures.length > 0 && <div className="row">{lectures.map(l => <Link key={l.id} className="btn sm" to={`/library/lectures?open=${l.id}`}>Полная лекция: {l.title}</Link>)}</div>}
        </div>
      </details>

      {(open || readOnly) && (
        <section className="stack" aria-label="Задания этапа">
          {tasks.map(def => {
            const Body = BODIES[def.id];
            return (
              <TaskShell key={def.id} def={def} open={openId === def.id} onToggle={() => setOpenId(openId === def.id ? undefined : def.id)}>
                <Body />
              </TaskShell>
            );
          })}
        </section>
      )}

      <section className="product" aria-labelledby="prod-h">
        <div className="ph">
          <div><div className="eyebrow">Продукт этапа · обновляется по мере заполнения</div><h2 id="prod-h" style={{ fontSize: '1.15rem' }}>{product.title}</h2></div>
          <div className="row no-print">
            <CopyButton text={product.markdown} />
            <DownloadButton name={fileName} content={product.markdown} />
            <Link className="btn sm" to={`/portfolio?p=${pid}`}>Открыть в портфолио</Link>
          </div>
        </div>
        <div className="pb"><Markdown text={n === 2 || n === 4 ? product.markdown.replace(/\n+### Рубрика самопроверки[\s\S]*$/, '') : product.markdown} /></div>
        {n === 2 && <Rubric p="p2" stage={2} />}
        {n === 4 && <Rubric p="p4" stage={4} />}
      </section>

      {n < 6 ? (
        <section className="card stack" aria-labelledby="pause-h">
          <h2 id="pause-h" style={{ fontSize: '1.15rem' }}>Рефлексивная пауза</h2>
          <fieldset disabled={readOnly} className="stack-lg">
            <TextArea label="Что сделано на этапе" required hint="Содержательная рефлексия" value={refl?.content || ''} onChange={content => setReflection(n as StageN, { content })} />
            <TextArea label="Как это получалось: что помогло, что мешало, какие цифровые инструменты сработали" required hint="Процессуальная рефлексия" value={refl?.process || ''} onChange={process => setReflection(n as StageN, { process })} />
          </fieldset>
        </section>
      ) : (
        <p className="small muted">На VI этапе рефлексивная пауза заменена полным протоколом (задание 6.1).</p>
      )}

      <nav className="stack" aria-label="Переход между этапами" style={{ alignItems: 'flex-start' }}>
        {!ready && !readOnly && (
          <p className="small muted">
            {!requiredDone(run, n) ? 'Чтобы перейти дальше, выполните обязательные задания' : ''}
            {!requiredDone(run, n) && !reflectionDone(run, n as StageN) ? ' и ' : ''}
            {!reflectionDone(run, n as StageN) ? (n === 6 ? 'заполните рефлексивный протокол (6.1)' : 'заполните рефлексивную паузу') : ''}.
          </p>
        )}
        <div className="row">
          {n > 1 && <Link className="btn" to={`/stage/${n - 1}`}>← {STAGES[n - 2].roman}. {STAGES[n - 2].name}</Link>}
          {n < 6 ? (
            <button type="button" className="btn primary" disabled={!ready && !readOnly} onClick={() => goNext(false)}>Перейти к этапу {STAGES[n].roman}</button>
          ) : (
            <button type="button" className="btn primary" disabled={!ready && !readOnly && !run.finishedAt} onClick={() => goNext(false)}>К итогу витка</button>
          )}
        </div>
        {!ready && !readOnly && n < 6 && (
          <button type="button" className="btn link" onClick={() => goNext(true)}>Открыть досрочно — этап {s.roman} будет помечен «пройден не полностью»</button>
        )}
        {!ready && !readOnly && n === 6 && (
          <button type="button" className="btn link" onClick={() => goNext(true)}>Перейти к итогу витка без завершения</button>
        )}
      </nav>
    </div>
  );
}
