import { CONTRADICTION_EXAMPLES, FACTOR_TYPES, SOURCE_SUGGESTIONS, SOURCE_TYPES } from '../content/tasks';
import { Field, TextArea, TextInput } from '../components/ui';
import { useTask } from '../components/TaskShell';
import { uid, type Factor } from '../lib/answers';

export function T2_1() {
  const [a, set] = useTask('2.1');
  const upd = (i: number, k: 'title' | 'type' | 'url', v: string) => set({ sources: a.sources.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  return (
    <div className="stack">
      <p className="hint small muted">Подсказка: {SOURCE_SUGGESTIONS.join(', ')}.</p>
      {a.sources.map((s, i) => (
        <div key={i} className="item-card">
          <div className="item-head"><b>Источник {i + 1}</b>{a.sources.length > 3 && <button type="button" className="btn sm" onClick={() => set({ sources: a.sources.filter((_, j) => j !== i) })}>Удалить</button>}</div>
          <div className="inline-fields">
            <TextInput label="Название" required={i < 3} value={s.title} onChange={v => upd(i, 'title', v)} placeholder="например: eLibrary — публикации 2022–2026" />
            <Field label="Тип">
              {id => (
                <select id={id} value={s.type} onChange={e => upd(i, 'type', e.target.value)}>
                  <option value="">— выберите</option>
                  {SOURCE_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              )}
            </Field>
            <TextInput label="Ссылка" type="url" value={s.url} onChange={v => upd(i, 'url', v)} placeholder="https://…" />
          </div>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => set({ sources: [...a.sources, { title: '', type: '', url: '' }] })}>Добавить источник</button>
    </div>
  );
}

const emptyFactor = (): Factor => ({ id: uid(), type: '', text: '', evidence: '', kind: '', impact: '' });

export function T2_2() {
  const [a, set] = useTask('2.2');
  const factors = a.factors.length ? a.factors : [];
  const upd = (id: string, p: Partial<Factor>) => set({ factors: factors.map(f => (f.id === id ? { ...f, ...p } : f)) });
  const weak = factors.filter(f => f.kind === 'weak').length;
  return (
    <div className="stack">
      <p className="small muted">Карточек: <b className="num">{factors.filter(f => f.text.trim()).length}</b> из минимум 6 · слабых сигналов: <b className="num">{weak}</b> из минимум 2.</p>
      <p className="hint small muted">Слабый сигнал — неочевидная, ещё не оформившаяся тенденция: упоминается редко, но может стать определяющей.</p>
      {factors.map((f, i) => (
        <div key={f.id} className="item-card">
          <div className="item-head"><b>Фактор {i + 1}</b><button type="button" className="btn sm" onClick={() => set({ factors: factors.filter(x => x.id !== f.id) })}>Удалить</button></div>
          <div className="inline-fields">
            <Field label="Тип" required>
              {id => (
                <select id={id} value={f.type} onChange={e => upd(f.id, { type: e.target.value as Factor['type'] })}>
                  <option value="">— выберите</option>
                  {FACTOR_TYPES.map(x => <option key={x.k} value={x.k}>{x.k} — {x.label}</option>)}
                </select>
              )}
            </Field>
            <fieldset className="f">
              <legend className="lbl" style={{ fontSize: '.93rem', fontWeight: 600 }}>Тренд или слабый сигнал<span className="req" aria-hidden="true">*</span></legend>
              <div className="row">
                <label className="check" style={{ padding: 0 }}><input type="radio" name={`kind-${f.id}`} checked={f.kind === 'trend'} onChange={() => upd(f.id, { kind: 'trend' })} /><span>тренд</span></label>
                <label className="check" style={{ padding: 0 }}><input type="radio" name={`kind-${f.id}`} checked={f.kind === 'weak'} onChange={() => upd(f.id, { kind: 'weak' })} /><span>слабый сигнал</span></label>
              </div>
            </fieldset>
          </div>
          <TextInput label="Формулировка" required value={f.text} onChange={v => upd(f.id, { text: v })} placeholder="например: ИИ-ассистенты пишут проектную документацию" />
          <TextArea small label="Свидетельство" hint="Источник, цитата или наблюдение" value={f.evidence} onChange={v => upd(f.id, { evidence: v })} />
          <TextArea small label="На что влияет в моей дисциплине" value={f.impact} onChange={v => upd(f.id, { impact: v })} />
        </div>
      ))}
      <div className="row">
        <button type="button" className="btn sm" onClick={() => set({ factors: [...factors, emptyFactor()] })}>Добавить карточку</button>
        {factors.length === 0 && <button type="button" className="btn sm" onClick={() => set({ factors: Array.from({ length: 6 }, emptyFactor) })}>Создать 6 пустых карточек</button>}
      </div>
      <TextArea label="Фрагменты источников для промпта 3" hint="Необязательно: вставьте аннотации, новости, выдержки из документов — они подставятся в промпт 3. Если поле пустое, подставится список источников из 2.1." value={a.fragments} onChange={fragments => set({ fragments })} />
    </div>
  );
}

export function T2_3() {
  const [a, set, run] = useTask('2.3');
  const factors = ((run.answers['2.2'] as { factors?: Factor[] })?.factors || []).filter(f => f.text.trim());
  const upd = (id: string, p: Partial<(typeof a.items)[number]>) => set({ items: a.items.map(c => (c.id === id ? { ...c, ...p } : c)) });
  return (
    <div className="stack">
      <details className="small">
        <summary style={{ cursor: 'pointer' }}>Примеры противоречий из диссертации</summary>
        <ul style={{ marginTop: 6 }}>{CONTRADICTION_EXAMPLES.map(([x, y]) => <li key={x}>между {x} и {y}</li>)}</ul>
      </details>
      {a.items.map((c, i) => (
        <div key={c.id} className="item-card">
          <div className="item-head"><b>Противоречие {i + 1}</b>{a.items.length > 1 && <button type="button" className="btn sm" onClick={() => set({ items: a.items.filter(x => x.id !== c.id) })}>Удалить</button>}</div>
          <div className="contra-field">
            <span className="w">между</span>
            <div><label className="sr-only" htmlFor={`c-${c.id}-a`}>Первая сторона противоречия {i + 1}</label><textarea id={`c-${c.id}-a`} className="sm" value={c.a} onChange={e => upd(c.id, { a: e.target.value })} /></div>
            <span className="w">и</span>
            <div><label className="sr-only" htmlFor={`c-${c.id}-b`}>Вторая сторона противоречия {i + 1}</label><textarea id={`c-${c.id}-b`} className="sm" value={c.b} onChange={e => upd(c.id, { b: e.target.value })} /></div>
          </div>
          <fieldset>
            <legend className="small" style={{ fontWeight: 600 }}>Какие факторы из 2.2 оно порождает</legend>
            {factors.length === 0 && <p className="small muted">Сначала заполните карточки факторов в задании 2.2.</p>}
            {factors.map((f, j) => (
              <label key={f.id} className="check">
                <input type="checkbox" checked={c.factorIds.includes(f.id)} onChange={e => upd(c.id, { factorIds: e.target.checked ? [...c.factorIds, f.id] : c.factorIds.filter(x => x !== f.id) })} />
                <span>№{j + 1} {f.text} <span className="muted small">({f.type || '?'}{f.kind === 'weak' ? ', слабый сигнал' : ''})</span></span>
              </label>
            ))}
          </fieldset>
        </div>
      ))}
      {a.items.length < 3 && <button type="button" className="btn sm" onClick={() => set({ items: [...a.items, { id: uid(), a: '', b: '', factorIds: [] }] })}>Добавить противоречие</button>}
    </div>
  );
}

export function T2_4() {
  const [a, set] = useTask('2.4');
  return (
    <div className="stack">
      <label className="check"><input type="checkbox" checked={a.done} onChange={e => set({ done: e.target.checked })} /><span>Обсудил(а) карту с коллегой или экспертом</span></label>
      <TextArea label="Что изменилось после обсуждения" value={a.changes} onChange={changes => set({ changes })} />
    </div>
  );
}
