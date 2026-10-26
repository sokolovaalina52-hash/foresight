// Этап III — Сценарирование (позиция: сценарист-проектировщик).
import { Link } from 'react-router-dom';
import { DelphiPlot } from '../../components/DelphiPlot';
import { NumberField, RadioGroup, SelectField, setAt, TextArea, TextField } from '../../components/fields';
import { TaskCard } from '../../components/TaskCard';
import { NARRATIVE_CANONS } from '../../content/route';
import { filled, SCENARIO_LABELS, SUBJECTS, type ForkPath, type Scenario } from '../../lib/answers';
import { useReadOnly } from '../../store/store';
import { useAns, useOpenTask } from './common';

function ForkTable({ path, onChange, index }: { path: ForkPath; onChange: (p: ForkPath) => void; index: number }) {
  const ro = useReadOnly();
  return (
    <div className="stack">
      <TextField label={`Путь ${index + 1}`} required value={path.label} onChange={v => onChange({ ...path, label: v })} hint="Как может пойти развилка." />
      <div className="tbl-wrap">
        <table>
          <caption className="sr-only">Последствия пути {index + 1}: субъект × горизонт</caption>
          <thead><tr><th scope="col">Субъект</th><th scope="col">Через 1 год</th><th scope="col">Через 3 года</th><th scope="col">Через 5 лет</th></tr></thead>
          <tbody>
            {SUBJECTS.map(s => (
              <tr key={s.id}>
                <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '.9rem' }}>{s.name}</th>
                {[0, 1, 2].map(h => (
                  <td key={h}>
                    <textarea aria-label={`${s.name}, путь ${index + 1}, ${['1 год', '3 года', '5 лет'][h]}`} rows={2} readOnly={ro} value={path.cells[s.id][h]}
                      onChange={e => { const c = [...path.cells[s.id]] as [string, string, string]; c[h] = e.target.value; onChange({ ...path, cells: { ...path.cells, [s.id]: c } }); }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Stage3() {
  const t = useOpenTask(3);
  const [a1, set1] = useAns('3.1');
  const [a2, set2] = useAns('3.2');
  const [a3, set3] = useAns('3.3');
  const [a4, set4] = useAns('3.4');
  const [a5, set5] = useAns('3.5');
  const [contra] = useAns('2.3');
  const titles = a2.q.map((s, i) => s.title || SCENARIO_LABELS[i]);
  const axis = (k: 'a' | 'b', name: string) => (
    <fieldset className="stack" style={{ gap: '.5rem' }}>
      <legend><b>{name}</b></legend>
      <TextField label="Неопределённый фактор" required value={a1[k].factor} onChange={v => set1({ [k]: { ...a1[k], factor: v } } as never)} placeholder="например, автоматизация учебного процесса" />
      <div className="grid g2">
        <TextField label="Полюс +" required value={a1[k].plus} onChange={v => set1({ [k]: { ...a1[k], plus: v } } as never)} placeholder="высокая" />
        <TextField label="Полюс −" required value={a1[k].minus} onChange={v => set1({ [k]: { ...a1[k], minus: v } } as never)} placeholder="низкая" />
      </div>
    </fieldset>
  );
  const scen = (s: Scenario, i: number) => {
    const upd = (p: Partial<Scenario>) => set2({ q: setAt(a2.q, i, { ...s, ...p }) as typeof a2.q });
    return (
      <div className="quad" key={i}>
        <div className="qt">{SCENARIO_LABELS[i]}</div>
        <TextField label="Название" required value={s.title} onChange={v => upd({ title: v })} />
        <TextArea label="Что происходит с содержанием дисциплины" required rows={2} value={s.content} onChange={v => upd({ content: v })} />
        <TextArea label="Что происходит с ролью преподавателя" required rows={2} value={s.role} onChange={v => upd({ role: v })} />
        <TextField label="Ранний индикатор" required value={s.indicator} onChange={v => upd({ indicator: v })} hint="По чему вы поймёте, что этот сценарий реализуется." />
      </div>
    );
  };
  const scenarioOptions = a2.q.map((_, i) => ({ value: i, label: titles[i] }));

  return (
    <>
      <TaskCard {...t.props('3.1')} instruction={<>Ось А и ось Б — неопределённый фактор и два полюса каждой. Оси выбираются из противоречий 2.3.</>}
        aside={contra.items.some(c => filled(c.a)) ? <div className="aside-box"><b>Ваши противоречия из 2.3:</b><ul>{contra.items.filter(c => filled(c.a)).map(c => <li key={c.id}>между {c.a} и {c.b}</li>)}</ul></div> : undefined}>
        <div className="grid g2">{axis('a', 'Ось А')}{axis('b', 'Ось Б')}</div>
      </TaskCard>

      <TaskCard {...t.props('3.2')} instruction={<>Матрица 2×2: в каждой ячейке — название; что происходит с содержанием дисциплины; что происходит с ролью преподавателя; ранний индикатор. Сценарии должны быть альтернативами, а не градациями.</>}
        aside={filled(a1.a.factor) ? <p className="small muted">А: {a1.a.factor} ({a1.a.plus || '+'} ↔ {a1.a.minus || '−'}) · Б: {a1.b.factor} ({a1.b.plus || '+'} ↔ {a1.b.minus || '−'})</p> : undefined}>
        <div className="matrix">{a2.q.map(scen)}</div>
      </TaskCard>

      <TaskCard {...t.props('3.3')} instruction={<>Выберите один сценарий, опишите развилку и заполните две таблицы «субъект (студент / преподаватель / университет) × горизонт (1 / 3 / 5 лет)».</>}>
        <SelectField label="Сценарий" required value={a3.scenario} onChange={v => set3({ scenario: v })} options={scenarioOptions} />
        <TextArea label="Развилка" required value={a3.fork} onChange={v => set3({ fork: v })} hint="Событие или решение, которое может пойти двумя путями." />
        {a3.paths.map((p, i) => <ForkTable key={i} index={i} path={p} onChange={np => set3({ paths: setAt(a3.paths, i, np) as typeof a3.paths })} />)}
      </TaskCard>

      <TaskCard {...t.props('3.4')} instruction={<>Для каждого из четырёх сценариев — вероятность 1–10 и желательность 1–10 (свой голос). Если проходите в группе — внесите средние по туру в поле «оценки панели».</>}>
        <div className="grid g2">
          {a4.votes.map((v, i) => (
            <fieldset key={i} className="stack" style={{ gap: '.4rem' }}>
              <legend><b>{i + 1}. {titles[i]}</b></legend>
              <div className="grid g2">
                <NumberField label="Вероятность" min={1} max={10} value={v.p} onChange={x => set4({ votes: setAt(a4.votes, i, { ...v, p: x }) })} />
                <NumberField label="Желательность" min={1} max={10} value={v.d} onChange={x => set4({ votes: setAt(a4.votes, i, { ...v, d: x }) })} />
              </div>
            </fieldset>
          ))}
        </div>
        <DelphiPlot votes={a4.votes} titles={titles} />
        <TextArea label="Оценки панели" value={a4.panel} onChange={v => set4({ panel: v })} hint="Необязательно. Средние по туру, если проходите в группе." />
      </TaskCard>

      <TaskCard {...t.props('3.5')} instruction={<>Тренажёр сценарирования на материале собственного курса. Если задание заполнено, концепция входит в продукт этапа. <Link to="/library/lectures?l=l-narr">Лекция «Нарративный дизайн курса»</Link> · <Link to="/library/lectures?l=l-craft">CRAFT</Link></>}>
        <div className="grid g2">
          <TextArea label="Базовый фрейм" rows={2} value={a5.base} onChange={v => set5({ base: v })} hint="Статус-кво, привычная логика курса." />
          <TextArea label="Идея-фрейм" rows={2} value={a5.idea} onChange={v => set5({ idea: v })} hint="Переопределённый контекст, в который погружается студент." />
          <TextField label="Роль студента" value={a5.role} onChange={v => set5({ role: v })} placeholder="исследователь, герой, агент изменений" />
          <TextArea label="Сюжетная линия" rows={2} value={a5.plot} onChange={v => set5({ plot: v })} hint="Начало, препятствия, кульминация, развязка." />
          <TextArea label="Драма" rows={2} value={a5.drama} onChange={v => set5({ drama: v })} />
          <TextArea label="Польза" rows={2} value={a5.benefit} onChange={v => set5({ benefit: v })} />
        </div>
        <RadioGroup legend="Канон" inline value={a5.canon || null} onChange={v => set5({ canon: v })} options={NARRATIVE_CANONS.map(c => ({ value: c, label: c }))} />
        {a5.canon === 'свой' && <TextField label="Свой канон" value={a5.canonOther} onChange={v => set5({ canonOther: v })} />}
      </TaskCard>
    </>
  );
}
