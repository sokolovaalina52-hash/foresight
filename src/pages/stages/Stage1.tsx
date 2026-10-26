// Этап I — Проблематизация (позиция: аналитик собственной практики).
import { Checkbox, EditButton, RadioGroup, setAt, TextArea, TextField } from '../../components/fields';
import { TaskCard } from '../../components/TaskCard';
import { RGROUPS } from '../../content/resources';
import { DEFICITS, deficitCount } from '../../lib/tasks';
import { useRun } from '../../store/store';
import { useAns, useOpenTask } from './common';

export function Stage1() {
  const run = useRun()!;
  const t = useOpenTask(1);
  const [a1, set1] = useAns('1.1');
  const [a2, set2] = useAns('1.2');
  const [a3, set3] = useAns('1.3');
  const [a4, set4] = useAns('1.4');
  const toggle = (id: string, on: boolean) => set1({ checked: on ? [...a1.checked, id] : a1.checked.filter(x => x !== id) });
  const fromPrev = (run.answers['1.2'] as { fromPrev?: string } | undefined)?.fromPrev;

  return (
    <>
      <TaskCard {...t.props('1.1')} instruction={<>Чек-лист из 10 позиций: отметьте не менее 3 слабых. Работу с цифровыми ресурсами можно отметить отдельно по шести группам.</>}>
        <fieldset>
          <legend>Слабые позиции форсайт-компетенции <span className="req" aria-hidden="true">*</span></legend>
          {DEFICITS.map(d => d.id === 'digital' ? (
            <div key={d.id}>
              <Checkbox label={d.label} checked={a1.checked.includes(d.id)} onChange={v => toggle(d.id, v)} />
              <div className="sub-list">
                {RGROUPS.map(g => <Checkbox key={g.n} label={`${g.name} ресурсы`} hint={g.items.map(i => i[0]).join(', ')} checked={a1.checked.includes(`rg${g.n}`)} onChange={v => toggle(`rg${g.n}`, v)} />)}
              </div>
            </div>
          ) : <Checkbox key={d.id} label={d.label} checked={a1.checked.includes(d.id)} onChange={v => toggle(d.id, v)} />)}
        </fieldset>
        <p className="small muted" role="status">Отмечено слабых позиций: {deficitCount(run)} из 10 (нужно не менее 3).</p>
      </TaskCard>

      <TaskCard {...t.props('1.2')} instruction={<>Три формулировки по шаблону «Противоречие между [что происходит в высшем образовании / моей области] и [как устроена моя практика]» для горизонтов 5, 10 и 15 лет. Отметьте ведущую формулировку — с ней пойдёт работа.</>}
        aside={fromPrev ? <div className="aside-box"><b>Запрос с прошлого витка.</b> {fromPrev}</div> : undefined}>
        {([5, 10, 15] as const).map(h => {
          const key = `h${h}` as 'h5';
          const v = a2[key];
          return (
            <fieldset key={h} className="stack" style={{ gap: '.5rem' }}>
              <legend><b>Горизонт {h} лет</b>{a2.lead === h && <span className="pill" style={{ marginLeft: '.5rem' }}>ведущая</span>}</legend>
              <div className="grid g2">
                <TextArea label="Противоречие между…" required={a2.lead === h} rows={2} value={v[0]} onChange={x => set2({ [key]: [x, v[1]] } as never)}
                  hint="что происходит в высшем образовании / моей области" placeholder="например, распространением генеративного ИИ" />
                <TextArea label="…и" required={a2.lead === h} rows={2} value={v[1]} onChange={x => set2({ [key]: [v[0], x] } as never)}
                  hint="как устроена моя практика" placeholder="например, заданиями, которые модель выполняет за студента" />
              </div>
            </fieldset>
          );
        })}
        <RadioGroup legend="Ведущая формулировка" required inline value={a2.lead} onChange={v => set2({ lead: v })}
          options={[{ value: 5, label: '5 лет' }, { value: 10, label: '10 лет' }, { value: 15, label: '15 лет' }]} />
      </TaskCard>

      <TaskCard {...t.props('1.3')} promptLabel="Взгляд со стороны" instruction={<>Образовательные задачи, возможности и ресурсы, 2–3 вектора движения. Промпт 1 — по желанию, для взгляда со стороны на ваши установки.</>}>
        <TextArea label="Образовательные задачи" required value={a3.tasks} onChange={v => set3({ tasks: v })} hint="Что нужно освоить, чтобы работать с проблемой." />
        <TextArea label="Возможности и ресурсы" required value={a3.assets} onChange={v => set3({ assets: v })} hint="Опыт, сообщества, платформы, время, поддержка." />
        <fieldset className="stack">
          <legend>Векторы движения <span className="req" aria-hidden="true">*</span></legend>
          <p className="hint small muted">2–3 направления в форсайт-пространстве.</p>
          {a3.vectors.map((v, i) => <TextField key={i} label={`Вектор ${i + 1}`} value={v} onChange={x => set3({ vectors: setAt(a3.vectors, i, x) })} />)}
        </fieldset>
      </TaskCard>

      <TaskCard {...t.props('1.4')} instruction={<>Сквозной модуль по ИИ, задание 1. Таблица «задача проектирования курса → как может помочь языковая модель», 3–4 строки. Типовые задачи: формулировка целей, составление заданий, адаптация содержания, генерация кейсов, оценочные инструменты.</>}>
        <div className="stack">
          {a4.rows.map((r, i) => (
            <div className="repeat-item" key={i}>
              <div className="grid g2">
                <TextField label={`Задача проектирования курса ${i + 1}`} value={r.task} onChange={v => set4({ rows: setAt(a4.rows, i, { ...r, task: v }) })} />
                <TextField label="Как может помочь языковая модель" value={r.help} onChange={v => set4({ rows: setAt(a4.rows, i, { ...r, help: v }) })} hint="время, вариативность, адаптивность, индивидуализация" />
              </div>
            </div>
          ))}
          {a4.rows.length < 4 && <div><EditButton onClick={() => set4({ rows: [...a4.rows, { task: '', help: '' }] })}>Добавить строку</EditButton></div>}
        </div>
      </TaskCard>
    </>
  );
}
