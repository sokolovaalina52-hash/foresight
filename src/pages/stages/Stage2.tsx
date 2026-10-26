// Этап II — Сканирование (позиция: исследователь трендов).
import { Checkbox, EditButton, RadioGroup, SelectField, setAt, TextArea, TextField } from '../../components/fields';
import { TaskCard } from '../../components/TaskCard';
import { CONTRADICTION_EXAMPLES, SOURCE_HINTS, SOURCE_TYPES } from '../../content/route';
import { FACTOR_TYPES, filled, uid, type Factor } from '../../lib/answers';
import { useReadOnly } from '../../store/store';
import { useAns, useOpenTask } from './common';

const emptyFactor = (): Factor => ({ id: uid(), type: '', text: '', evidence: '', kind: '', impact: '' });

export function Stage2() {
  const t = useOpenTask(2);
  const ro = useReadOnly();
  const [a1, set1] = useAns('2.1');
  const [a2, set2] = useAns('2.2');
  const [a3, set3] = useAns('2.3');
  const [a4, set4] = useAns('2.4');
  const factors = a2.factors.length ? a2.factors : ro ? [] : Array.from({ length: 6 }, emptyFactor);
  const weak = factors.filter(f => f.kind === 'weak' && filled(f.text)).length;
  const valid = factors.filter(f => filled(f.text) && f.type).length;
  const sources = a1.sources.length ? a1.sources : ro ? [] : [0, 1, 2].map(() => ({ id: uid(), title: '', type: '', url: '' }));

  return (
    <>
      <TaskCard {...t.props('2.1')} instruction={<>Список из 3 и более источников: название, тип, ссылка. Подходят: {SOURCE_HINTS}.</>}>
        {sources.map((s, i) => (
          <div className="repeat-item" key={s.id}>
            <div className="repeat-head"><b className="small">Источник {i + 1}</b>
              <EditButton onClick={() => set1({ sources: sources.filter(x => x.id !== s.id) })}>Удалить</EditButton></div>
            <div className="grid g3">
              <TextField label="Название" required={i < 3} value={s.title} onChange={v => set1({ sources: setAt(sources, i, { ...s, title: v }) })} placeholder="например, eLibrary: публикации за 3 года" />
              <SelectField label="Тип" value={s.type} onChange={v => set1({ sources: setAt(sources, i, { ...s, type: v }) })} options={SOURCE_TYPES.map(x => ({ value: x, label: x }))} />
              <TextField label="Ссылка" type="url" value={s.url} onChange={v => set1({ sources: setAt(sources, i, { ...s, url: v }) })} hint="Необязательно." />
            </div>
          </div>
        ))}
        <div><EditButton onClick={() => set1({ sources: [...sources, { id: uid(), title: '', type: '', url: '' }] })}>Добавить источник</EditButton></div>
      </TaskCard>

      <TaskCard {...t.props('2.2')} instruction={<>Карточки факторов, минимум 6, из них минимум 2 помечены как слабый сигнал. Слабый сигнал — неочевидная, ещё не оформившаяся тенденция, упомянутая редко, но потенциально определяющая.</>}
        aside={<TextArea label="Фрагменты источников для промпта" hint="Необязательно. Вставьте аннотации, новости, выдержки из документов — промпт 3 подставит их в запрос." value={a2.fragments} onChange={v => set2({ fragments: v })} rows={3} />}>
        <p className="small muted" role="status">Карточек: {valid} (нужно не менее 6) · слабых сигналов: {weak} (нужно не менее 2).</p>
        {factors.map((f, i) => {
          const upd = (p: Partial<Factor>) => set2({ factors: setAt(factors, i, { ...f, ...p }) });
          return (
            <div className="repeat-item" key={f.id}>
              <div className="repeat-head"><b className="small">Фактор {i + 1}</b><EditButton onClick={() => set2({ factors: factors.filter(x => x.id !== f.id) })}>Удалить</EditButton></div>
              <RadioGroup legend="Тип" required inline value={f.type || null} onChange={v => upd({ type: v })}
                options={FACTOR_TYPES.map(x => ({ value: x.id, label: <><b>{x.id}</b> — {x.name}</> }))} />
              <TextArea label="Формулировка" required rows={2} value={f.text} onChange={v => upd({ text: v })} />
              <div className="grid g2">
                <TextArea label="Свидетельство" rows={2} value={f.evidence} onChange={v => upd({ evidence: v })} hint="Источник, цитата или наблюдение." />
                <TextArea label="На что влияет в моей дисциплине" rows={2} value={f.impact} onChange={v => upd({ impact: v })} />
              </div>
              <RadioGroup legend="Тренд или слабый сигнал" inline value={f.kind || null} onChange={v => upd({ kind: v })}
                options={[{ value: 'trend', label: 'тренд' }, { value: 'weak', label: 'слабый сигнал' }]} />
            </div>
          );
        })}
        <div><EditButton onClick={() => set2({ factors: [...factors, emptyFactor()] })}>Добавить фактор</EditButton></div>
      </TaskCard>

      <TaskCard {...t.props('2.3')} instruction={<>1–3 формулировки «между … и …»; к каждой отметьте карточки из 2.2, которые это противоречие порождает.</>}
        aside={<div className="aside-box"><b>Примеры противоречий:</b><ul>{CONTRADICTION_EXAMPLES.map(x => <li key={x}>{x}</li>)}</ul></div>}>
        {a3.items.map((c, i) => {
          const upd = (p: Partial<typeof c>) => set3({ items: setAt(a3.items, i, { ...c, ...p }) });
          return (
            <div className="repeat-item" key={c.id}>
              <div className="repeat-head"><b className="small">Противоречие {i + 1}</b><EditButton onClick={() => set3({ items: a3.items.filter(x => x.id !== c.id) })}>Удалить</EditButton></div>
              <div className="grid g2">
                <TextArea label="Между…" required rows={2} value={c.a} onChange={v => upd({ a: v })} />
                <TextArea label="…и" required rows={2} value={c.b} onChange={v => upd({ b: v })} />
              </div>
              <fieldset>
                <legend>Какие факторы порождает</legend>
                {factors.filter(f => filled(f.text)).length === 0 && <p className="small muted">Сначала добавьте факторы в задании 2.2.</p>}
                {factors.filter(f => filled(f.text)).map(f => (
                  <Checkbox key={f.id} label={<>{f.text} <span className="muted small">({f.type || '?'}{f.kind === 'weak' ? ', слабый сигнал' : ''})</span></>}
                    checked={c.factorIds.includes(f.id)} onChange={v => upd({ factorIds: v ? [...c.factorIds, f.id] : c.factorIds.filter(x => x !== f.id) })} />
                ))}
              </fieldset>
            </div>
          );
        })}
        {a3.items.length < 3 && <div><EditButton onClick={() => set3({ items: [...a3.items, { id: uid(), a: '', b: '', factorIds: [] }] })}>Добавить противоречие</EditButton></div>}
      </TaskCard>

      <TaskCard {...t.props('2.4')} instruction={<>Обсудите карту с коллегой или экспертом и зафиксируйте, что изменилось.</>}>
        <Checkbox label="Обсудил(а) карту с коллегой или экспертом" checked={a4.discussed} onChange={v => set4({ discussed: v })} />
        <TextArea label="Что изменилось после обсуждения" value={a4.changes} onChange={v => set4({ changes: v })} />
      </TaskCard>
    </>
  );
}
