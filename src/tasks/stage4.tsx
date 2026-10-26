import { DESIGN_MODELS, PHASE_LABELS, PROTO_FORMATS, ROADMAP_HORIZONS } from '../content/tasks';
import { Field, TextArea, TextInput } from '../components/ui';
import { Markdown } from '../components/Markdown';
import { useTask } from '../components/TaskShell';
import { ans, CELLS, PHASES, uid } from '../lib/answers';
import { roadmapTable, scenarioTitle } from '../lib/products';
import { useReadOnly } from '../store/store';
import type { RoadmapHorizon, RoadmapPoint } from '../lib/types';
import { DelphiChart, ScenarioSelect } from './stage3';

export function T4_1() {
  const [a, set, run] = useTask('4.1');
  return (
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <div className="stack-lg">
        <ScenarioSelect run={run} label="Целевой сценарий" value={a.scenario} onChange={scenario => set({ scenario })} />
        <TextArea label="Стратегическая цель на 3–5 лет" required hint="Одной фразой" value={a.goal} onChange={goal => set({ goal })} />
      </div>
      <div className="stack"><span className="eyebrow">Результаты мини-Дельфи (III этап)</span><DelphiChart run={run} highlight={a.scenario} /></div>
    </div>
  );
}

const emptyPoint = (horizon: RoadmapHorizon): RoadmapPoint => ({ id: uid(), horizon, title: '', todo: '', resources: '', indicator: '' });

/** Редактируемая таблица ключевых точек — используется в 4.2 (v1) и 5.4 (v2) */
export function RoadmapEditor({ points, onChange, prefix, highlight }: {
  points: RoadmapPoint[]; onChange: (p: RoadmapPoint[]) => void; prefix: string; highlight?: Record<string, 'add' | 'chg'>;
}) {
  const readOnly = useReadOnly();
  const upd = (id: string, p: Partial<RoadmapPoint>) => onChange(points.map(x => (x.id === id ? { ...x, ...p } : x)));
  if (readOnly) return <Markdown text={roadmapTable(points)} />;
  const missing = (['1', '3', '5'] as const).filter(h => !points.some(p => p.horizon === h && p.title.trim() && p.indicator.trim()));
  return (
    <div className="stack">
      {missing.length > 0 && <p className="small muted">Нужна хотя бы одна точка с формулировкой и индикатором на горизонт: {missing.map(h => ROADMAP_HORIZONS.find(x => x.k === h)!.label).join(', ')}.</p>}
      <div className="tbl-wrap">
        <table className="t" style={{ minWidth: 860 }}>
          <thead><tr><th style={{ width: 120 }}>Горизонт</th><th>Ключевая точка</th><th>Что должно быть сделано</th><th>Ресурсы</th><th>Измеримый индикатор</th><th><span className="sr-only">Действия</span></th></tr></thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={p.id} className={highlight?.[p.id] === 'add' ? 'diff-add' : highlight?.[p.id] === 'chg' ? 'diff-chg' : undefined}>
                <td>
                  <label className="sr-only" htmlFor={`${prefix}-h-${p.id}`}>Горизонт точки {i + 1}</label>
                  <select id={`${prefix}-h-${p.id}`} value={p.horizon} onChange={e => upd(p.id, { horizon: e.target.value as RoadmapHorizon })}>
                    {ROADMAP_HORIZONS.map(h => <option key={h.k} value={h.k}>{h.label}</option>)}
                  </select>
                </td>
                {(['title', 'todo', 'resources', 'indicator'] as const).map(k => (
                  <td key={k}>
                    <label className="sr-only" htmlFor={`${prefix}-${k}-${p.id}`}>{({ title: 'Формулировка точки', todo: 'Что должно быть сделано', resources: 'Ресурсы', indicator: 'Измеримый индикатор' })[k]} {i + 1}</label>
                    <textarea id={`${prefix}-${k}-${p.id}`} className="sm" value={p[k]} onChange={e => upd(p.id, { [k]: e.target.value })} />
                  </td>
                ))}
                <td><button type="button" className="btn sm" onClick={() => onChange(points.filter(x => x.id !== p.id))}>Удалить</button></td>
              </tr>
            ))}
            {points.length === 0 && <tr><td colSpan={6} className="muted small">Точек пока нет.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row">
        {ROADMAP_HORIZONS.map(h => <button key={h.k} type="button" className="btn sm" onClick={() => onChange([...points, emptyPoint(h.k)])}>+ точка: {h.label}</button>)}
      </div>
      <p className="hint small muted">Каждая точка — измерима: индикатор отвечает на вопрос «как я пойму, что точка пройдена». Горизонт 10–15 лет — ориентир.</p>
    </div>
  );
}

export function T4_2() {
  const [a, set] = useTask('4.2');
  return <RoadmapEditor prefix="v1" points={a.points} onChange={points => set({ points })} />;
}

export function T4_3() {
  const [a, set, run] = useTask('4.3');
  const target = ans(run, '4.1').scenario;
  if (!target) return <p className="note">Сначала выберите целевой сценарий в задании 4.1.</p>;
  return (
    <div className="stack-lg">
      <p className="small">Целевой сценарий: <b>{scenarioTitle(run, target)}</b></p>
      {CELLS.filter(c => c !== target).map(c => (
        <TextArea key={c} small required label={`Если реализуется «${scenarioTitle(run, c)}»`} hint="Одно действие, которое страхует карту" value={a[c] || ''} onChange={v => set({ [c]: v } as never)} />
      ))}
    </div>
  );
}

export function T4_4() {
  const [a, set] = useTask('4.4');
  const updAlign = (i: number, k: keyof (typeof a.alignment)[number], v: string) => set({ alignment: a.alignment.map((r, j) => (j === i ? { ...r, [k]: v } : r)) });
  const model = DESIGN_MODELS.find(m => m.k === a.model);
  return (
    <div className="stack-lg">
      <TextInput label="Название" required value={a.title} onChange={title => set({ title })} />
      <div className="inline-fields">
        <Field label="Формат" required>
          {id => (
            <select id={id} value={a.format} onChange={e => set({ format: e.target.value })}>
              <option value="">— выберите</option>
              {PROTO_FORMATS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          )}
        </Field>
        <Field label="Модель проектирования" required hint={model?.hint ?? 'ADDIE, SAM, ASSURE или 4C/ID — подсказка появится после выбора'}>
          {(id, h) => (
            <select id={id} aria-describedby={h} value={a.model} onChange={e => set({ model: e.target.value })}>
              <option value="">— выберите</option>
              {DESIGN_MODELS.map(x => <option key={x.k} value={x.k}>{x.k}</option>)}
            </select>
          )}
        </Field>
      </div>
      <fieldset className="stack">
        <legend className="lbl" style={{ fontWeight: 600 }}>Образовательные результаты (2–3)<span className="req" aria-hidden="true">*</span></legend>
        {a.outcomes.map((o, i) => (
          <div key={i}><label className="sr-only" htmlFor={`out-${i}`}>Результат {i + 1}</label>
            <input id={`out-${i}`} type="text" value={o} placeholder={i === 0 ? 'студент умеет формулировать цель и задачи проекта' : ''} onChange={e => set({ outcomes: a.outcomes.map((x, j) => (j === i ? e.target.value : x)) })} /></div>
        ))}
      </fieldset>
      <div className="stack">
        <span className="lbl" style={{ fontWeight: 600 }}>Результат → учебная стратегия → метод оценки → игровая механика</span>
        <p className="hint small muted">Образец из лекции по геймификации: «студент умеет формулировать цель и задачи проекта» → разбор кейсов и шаблоны → составление проектной карты → механика «Миссия стартапа».</p>
        <div className="tbl-wrap">
          <table className="t">
            <thead><tr><th>Результат</th><th>Учебная стратегия</th><th>Метод оценки</th><th>Игровая механика</th><th><span className="sr-only">Действия</span></th></tr></thead>
            <tbody>
              {a.alignment.map((r, i) => (
                <tr key={i}>
                  {(['outcome', 'strategy', 'assessment', 'mechanic'] as const).map(k => (
                    <td key={k}><label className="sr-only" htmlFor={`al-${k}-${i}`}>{({ outcome: 'Результат', strategy: 'Учебная стратегия', assessment: 'Метод оценки', mechanic: 'Игровая механика' })[k]}, строка {i + 1}</label>
                      <textarea id={`al-${k}-${i}`} className="sm" value={r[k]} onChange={e => updAlign(i, k, e.target.value)} /></td>
                  ))}
                  <td>{a.alignment.length > 1 && <button type="button" className="btn sm" onClick={() => set({ alignment: a.alignment.filter((_, j) => j !== i) })}>Удалить</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ alignment: [...a.alignment, { outcome: '', strategy: '', assessment: '', mechanic: '' }] })}>Добавить строку</button>
      </div>
      <fieldset className="stack">
        <legend className="lbl" style={{ fontWeight: 600 }}>Карта пути студента — по одной строке на фазу<span className="req" aria-hidden="true">*</span></legend>
        {PHASES.map(p => (
          <div key={p} className="slider-row" style={{ gridTemplateColumns: '140px minmax(0,1fr)' }}>
            <label htmlFor={`ph-${p}`} className="small" style={{ fontWeight: 600 }}>{PHASE_LABELS[p]}</label>
            <input id={`ph-${p}`} type="text" value={a.journey[p]} onChange={e => set({ journey: { ...a.journey, [p]: e.target.value } })} />
          </div>
        ))}
      </fieldset>
    </div>
  );
}

export function T4_5() {
  const [a, set] = useTask('4.5');
  const upd = (i: number, p: Partial<(typeof a.tasks)[number]>) => set({ tasks: a.tasks.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div className="stack">
      {a.tasks.map((x, i) => (
        <div key={i} className="item-card board-row">
          <input type="checkbox" aria-label={`Задача ${i + 1} выполнена`} checked={x.done} onChange={e => upd(i, { done: e.target.checked })} />
          <div><label className="sr-only" htmlFor={`tb-${i}`}>Задача {i + 1}</label><input id={`tb-${i}`} type="text" value={x.text} onChange={e => upd(i, { text: e.target.value })} placeholder={i === 0 ? 'написать письма двум партнёрам' : ''} /></div>
          <div><label className="sr-only" htmlFor={`tbd-${i}`}>Срок задачи {i + 1}</label><input id={`tbd-${i}`} type="date" value={x.date} onChange={e => upd(i, { date: e.target.value })} /></div>
        </div>
      ))}
      {a.tasks.length < 8 && <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ tasks: [...a.tasks, { text: '', date: '', done: false }] })}>Добавить задачу</button>}
    </div>
  );
}
