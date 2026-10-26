import { CRITERIA } from '../content/tasks';
import { CopyButton, ScoreSelect, TextArea, TextInput, fmtDate } from '../components/ui';
import { Markdown } from '../components/Markdown';
import { AiButton, useTask } from '../components/TaskShell';
import { ans, uid, type Score } from '../lib/answers';
import { peerConclusion, roadmapTable } from '../lib/products';
import { diffRoadmap, FIELD_LABELS, horizonLabel } from '../lib/roadmap';
import type { RoadmapPoint } from '../lib/types';
import { DEMO_PEER_MAP } from '../demo/demoRun';
import { useReadOnly } from '../store/store';
import { RoadmapEditor } from './stage4';

function CriteriaSheet({ value, onChange }: { value: Record<'real' | 'innov' | 'anthro', Score>; onChange: (k: 'real' | 'innov' | 'anthro', s: Score) => void }) {
  return (
    <div className="stack">
      {CRITERIA.map(c => (
        <div key={c.k} className="item-card">
          <b>{c.label}</b>
          <span className="small muted">{c.hint}</span>
          <div className="inline-fields" style={{ gridTemplateColumns: 'minmax(120px,160px) minmax(0,1fr)' }}>
            <ScoreSelect label="Оценка 1–10" value={value[c.k].score} onChange={score => onChange(c.k, { ...value[c.k], score })} />
            <TextArea small required label="Аргумент" value={value[c.k].arg} onChange={arg => onChange(c.k, { ...value[c.k], arg })} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function T5_1() {
  const [a, set, run] = useTask('5.1');
  return (
    <div className="stack-lg">
      <details>
        <summary className="small" style={{ cursor: 'pointer' }}>Показать свою карту v1</summary>
        <Markdown text={roadmapTable(ans(run, '4.2').points)} />
      </details>
      <CriteriaSheet value={a} onChange={(k, s) => set({ [k]: s } as never)} />
      <fieldset className="stack">
        <legend className="lbl" style={{ fontWeight: 600 }}>Три самых рискованных допущения<span className="req" aria-hidden="true">*</span></legend>
        {a.risks.map((r, i) => (
          <div key={i}><label className="sr-only" htmlFor={`risk-${i}`}>Допущение {i + 1}</label>
            <input id={`risk-${i}`} type="text" value={r} onChange={e => { const risks = [...a.risks] as typeof a.risks; risks[i] = e.target.value; set({ risks }); }} /></div>
        ))}
      </fieldset>
    </div>
  );
}

export function T5_2() {
  const [a, set, run] = useTask('5.2');
  return (
    <div className="stack-lg">
      <TextArea label="Карта коллеги" required hint="Вставьте текст карты коллеги — таблицу, документ или фото, переписанное текстом" value={a.map} onChange={map => set({ map })} rows={8} />
      <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ map: DEMO_PEER_MAP })}>Взять демонстрационную карту</button>
      <CriteriaSheet value={a} onChange={(k, s) => set({ [k]: s } as never)} />
      <fieldset className="stack">
        <legend className="lbl" style={{ fontWeight: 600 }}>Три вопроса автору<span className="req" aria-hidden="true">*</span></legend>
        {a.questions.map((q, i) => (
          <div key={i}><label className="sr-only" htmlFor={`q-${i}`}>Вопрос {i + 1}</label>
            <input id={`q-${i}`} type="text" value={q} onChange={e => { const questions = [...a.questions] as typeof a.questions; questions[i] = e.target.value; set({ questions }); }} /></div>
        ))}
      </fieldset>
      <TextInput label="Главное условие реализуемости" required hint="Одно предложение" value={a.condition} onChange={condition => set({ condition })} />
      <div><CopyButton className="btn" text={() => peerConclusion(run)} label="Скопировать заключение для коллеги" /></div>
    </div>
  );
}

export function T5_3() {
  const [a, set] = useTask('5.3');
  const upd = (id: string, p: Partial<(typeof a.items)[number]>) => set({ items: a.items.map(x => (x.id === id ? { ...x, ...p } : x)) });
  return (
    <div className="stack">
      <div className="note small">Если группы нет: <AiButton promptId={9} taskId="5.3" label="Промпт 9 для своей карты" /> — вставьте замечания из ответа модели.</div>
      {a.items.map((it, i) => (
        <div key={it.id} className="item-card">
          <div className="item-head"><b>Замечание {i + 1}</b>{a.items.length > 1 && <button type="button" className="btn sm" onClick={() => set({ items: a.items.filter(x => x.id !== it.id) })}>Удалить</button>}</div>
          <TextArea small label="Текст замечания" required value={it.text} onChange={text => upd(it.id, { text })} />
          <div className="row" role="radiogroup" aria-label={`Решение по замечанию ${i + 1}`}>
            <label className="check" style={{ padding: 0 }}><input type="radio" name={`dec-${it.id}`} checked={it.decision === 'accepted'} onChange={() => upd(it.id, { decision: 'accepted' })} /><span>принято</span></label>
            <label className="check" style={{ padding: 0 }}><input type="radio" name={`dec-${it.id}`} checked={it.decision === 'rejected'} onChange={() => upd(it.id, { decision: 'rejected' })} /><span>отклонено</span></label>
          </div>
          <TextArea small label="Обоснование" required value={it.reason} onChange={reason => upd(it.id, { reason })} />
        </div>
      ))}
      <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ items: [...a.items, { id: uid(), text: '', decision: null, reason: '' }] })}>Добавить замечание</button>
    </div>
  );
}

export function RoadmapDiffView({ before, after }: { before: RoadmapPoint[]; after: RoadmapPoint[] }) {
  const d = diffRoadmap(before, after);
  const total = d.added.length + d.removed.length + d.changed.length;
  return (
    <div className="stack">
      <div className="diff-legend"><span className="c">изменено: {d.changed.length}</span><span className="a">добавлено: {d.added.length}</span><span className="d">удалено: {d.removed.length}</span><span>без изменений: {d.unchanged.length}</span></div>
      {total === 0 && <p className="small muted">Изменений нет.</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
        {d.changed.map(c => (
          <li key={c.after.id} className="item-card diff-chg">
            <div className="row"><b>{c.after.title || c.before.title}</b><span className="pill">{horizonLabel(c.after.horizon)}</span></div>
            <ul className="small">{c.fields.map(f => <li key={f}>{FIELD_LABELS[f]}: <span className="muted" style={{ textDecoration: 'line-through' }}>{f === 'horizon' ? horizonLabel(c.before[f]) : c.before[f] || '—'}</span> → {f === 'horizon' ? horizonLabel(c.after[f]) : c.after[f] || '—'}</li>)}</ul>
          </li>
        ))}
        {d.added.map(p => <li key={p.id} className="item-card diff-add"><div className="row"><span className="sr-only">Добавлено: </span><b>{p.title || '—'}</b><span className="pill">{horizonLabel(p.horizon)}</span></div>{p.indicator && <span className="small">индикатор: {p.indicator}</span>}</li>)}
        {d.removed.map(p => <li key={p.id} className="item-card diff-del"><div className="row"><span className="sr-only">Удалено: </span><b>{p.title || '—'}</b><span className="pill">{horizonLabel(p.horizon)}</span></div></li>)}
      </ul>
    </div>
  );
}

export function T5_4() {
  const [a, set, run] = useTask('5.4');
  const readOnly = useReadOnly();
  const v1 = ans(run, '4.2').points;
  const started = a.points.length > 0 || !!a.savedAt;
  const d = diffRoadmap(v1, a.points);
  const highlight: Record<string, 'add' | 'chg'> = {};
  d.added.forEach(p => { highlight[p.id] = 'add'; });
  d.changed.forEach(c => { highlight[c.after.id] = 'chg'; });
  if (!started) return (
    <div className="stack">
      <p className="small">Карта v1 откроется в режиме правки; v1 останется в портфолио без изменений.</p>
      <button type="button" className="btn primary" style={{ alignSelf: 'flex-start' }} disabled={!v1.length} onClick={() => set({ points: structuredClone(v1) })}>Открыть карту v1 для правки</button>
      {!v1.length && <p className="small muted">Сначала заполните дорожную карту в задании 4.2.</p>}
    </div>
  );
  return (
    <div className="stack-lg">
      <RoadmapEditor prefix="v2" points={a.points} onChange={points => set({ points })} highlight={highlight} />
      <div className="row">
        {!readOnly && <button type="button" className="btn primary" onClick={() => set({ savedAt: new Date().toISOString() })}>{a.savedAt ? 'Пересохранить как v2' : 'Сохранить как v2'}</button>}
        {a.savedAt && <span className="small muted">v2 сохранена {fmtDate(a.savedAt)}</span>}
      </div>
      <div className="stack"><h4>Сравнение v1 → v2</h4><RoadmapDiffView before={v1} after={a.points} /></div>
    </div>
  );
}

export function T5_5() {
  const [a, set] = useTask('5.5');
  return (
    <div className="stack-lg">
      <TextInput label="Сколько участников в группе" value={a.participants} onChange={participants => set({ participants })} placeholder="например: 12" />
      <TextArea label="Приоритеты участников" required hint="Кратко: кто что считает приоритетом" value={a.priorities} onChange={priorities => set({ priorities })} />
      <TextArea label="Совпадения / расхождения / формулировки для голосования" required value={a.result} onChange={result => set({ result })} rows={6} />
    </div>
  );
}
