// Этап IV — Картирование (позиция: стратег-картограф).
import { Link } from 'react-router-dom';
import { DelphiPlot } from '../../components/DelphiPlot';
import { EditButton, RadioGroup, setAt, TextArea, TextField } from '../../components/fields';
import { emptyRow, RoadmapEditor } from '../../components/Roadmap';
import { AiButton } from '../../components/PromptDialog';
import { TaskCard } from '../../components/TaskCard';
import { DESIGN_MODELS, INNOVATION_FORMATS } from '../../content/route';
import { JOURNEY_PHASES, SCENARIO_LABELS, scenarioTitle } from '../../lib/answers';
import { useReadOnly, useRun } from '../../store/store';
import { useAns, useOpenTask } from './common';

const GAM_EXAMPLE = [
  ['студент умеет формулировать цель и задачи проекта', 'разбор кейсов и шаблоны', 'составление проектной карты', 'Миссия стартапа'],
  ['знает этапы проектного цикла', 'интерактивный лонгрид', 'тест на последовательность', 'Маршрут проекта'],
];

export function Stage4() {
  const run = useRun()!;
  const ro = useReadOnly();
  const t = useOpenTask(4);
  const [a1, set1] = useAns('4.1');
  const [a2, set2] = useAns('4.2');
  const [a3, set3] = useAns('4.3');
  const [a4, set4] = useAns('4.4');
  const [a5, set5] = useAns('4.5');
  const [delphi] = useAns('3.4');
  const [q] = useAns('3.2');
  const titles = q.q.map((s, i) => s.title || SCENARIO_LABELS[i]);
  const rows = a2.rows.length || ro ? a2.rows : [emptyRow('1'), emptyRow('3'), emptyRow('5')];
  const align = a4.align.length || ro ? a4.align : [{ outcome: '', strategy: '', assessment: '', mechanic: '' }];

  return (
    <>
      <TaskCard {...t.props('4.1')} instruction={<>Выберите целевой сценарий из четырёх (рядом — результаты Дельфи) и сформулируйте цель на 3–5 лет одной фразой.</>}>
        <div className="grid g2">
          <RadioGroup legend="Целевой сценарий" required value={a1.scenario} onChange={v => set1({ scenario: v })}
            options={titles.map((x, i) => ({ value: i, label: <>{x} <span className="small muted">— вероятность {delphi.votes[i]?.p ?? '—'}, желательность {delphi.votes[i]?.d ?? '—'}</span></> }))} />
          <DelphiPlot votes={delphi.votes} titles={titles} />
        </div>
        <TextField label="Стратегическая цель на 3–5 лет" required value={a1.goal} onChange={v => set1({ goal: v })} hint="Одна фраза." />
      </TaskCard>

      <TaskCard {...t.props('4.2')} promptLabel="Конфигурации карты" instruction={<>Редактируемая таблица ключевых точек: горизонт (1 год / 3 года / 5 лет / 10–15 лет — ориентир); формулировка точки; что должно быть сделано; ресурсы; измеримый индикатор. Минимум по одной точке на горизонты 1, 3 и 5 лет. Таблица сохраняется как карта v1.</>}
        extra={{ rows }}>
        <RoadmapEditor rows={rows} onChange={r => set2({ rows: r })} caption="Дорожная карта v1" />
        <div className="row"><AiButton promptId={8} taskId="4.2" extra={{ rows }} label="Проверка согласованности" /></div>
      </TaskCard>

      <TaskCard {...t.props('4.3')} instruction={<>Для каждого из трёх других сценариев — одно действие, которое страхует карту, если реализуется этот сценарий.</>}>
        {a1.scenario === null ? <p className="small muted">Сначала выберите целевой сценарий в задании 4.1.</p> :
          [0, 1, 2, 3].filter(i => i !== a1.scenario).map(i => (
            <TextArea key={i} label={`Если реализуется «${scenarioTitle(run, i)}»`} required rows={2} value={a3.others[i] ?? ''} onChange={v => set3({ others: { ...a3.others, [i]: v } })} />
          ))}
      </TaskCard>

      <TaskCard {...t.props('4.4')} instruction={<>Прототип образовательной инновации: название; формат; модель проектирования; 2–3 образовательных результата; таблица «результат → учебная стратегия → метод оценки → игровая механика»; карта пути студента по шести фазам. <Link to="/library/lectures?l=l-gam">Лекция «Геймификация курса»</Link> · <Link to="/library/lectures?l=l-id">Модели педагогического дизайна</Link></>}>
        <TextField label="Название" required value={a4.title} onChange={v => set4({ title: v })} />
        <RadioGroup legend="Формат" required inline value={a4.format || null} onChange={v => set4({ format: v })} options={INNOVATION_FORMATS.map(f => ({ value: f, label: f }))} />
        <RadioGroup legend="Модель проектирования" required value={a4.model || null} onChange={v => set4({ model: v })}
          options={DESIGN_MODELS.map(m => ({ value: m.id, label: <><b>{m.id}</b> <span className="small muted">— {m.hint}</span></> }))} />
        <fieldset className="stack">
          <legend>Образовательные результаты <span className="req" aria-hidden="true">*</span></legend>
          {a4.outcomes.map((o, i) => <TextField key={i} label={`Результат ${i + 1}`} value={o} onChange={v => set4({ outcomes: setAt(a4.outcomes, i, v) })} />)}
        </fieldset>
        <details className="basis">
          <summary>Образец из лекции по геймификации</summary>
          <div className="body"><div className="tbl-wrap"><table>
            <thead><tr><th>Результат</th><th>Учебная стратегия</th><th>Метод оценки</th><th>Игровая механика</th></tr></thead>
            <tbody>{GAM_EXAMPLE.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table></div></div>
        </details>
        <div className="tbl-wrap">
          <table style={{ minWidth: '46rem' }}>
            <caption className="sr-only">Результат → учебная стратегия → метод оценки → игровая механика</caption>
            <thead><tr><th scope="col">Результат</th><th scope="col">Учебная стратегия</th><th scope="col">Метод оценки</th><th scope="col">Игровая механика</th>{!ro && <th scope="col"><span className="sr-only">Действия</span></th>}</tr></thead>
            <tbody>{align.map((r, i) => (
              <tr key={i}>
                {(['outcome', 'strategy', 'assessment', 'mechanic'] as const).map(k => (
                  <td key={k}><textarea rows={2} readOnly={ro} aria-label={`${{ outcome: 'Результат', strategy: 'Учебная стратегия', assessment: 'Метод оценки', mechanic: 'Игровая механика' }[k]}, строка ${i + 1}`}
                    value={r[k]} onChange={e => set4({ align: setAt(align, i, { ...r, [k]: e.target.value }) })} /></td>
                ))}
                {!ro && <td><button type="button" className="btn sm" onClick={() => set4({ align: align.filter((_, j) => j !== i) })}>Удалить</button></td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div><EditButton onClick={() => set4({ align: [...align, { outcome: '', strategy: '', assessment: '', mechanic: '' }] })}>Добавить строку</EditButton></div>
        <fieldset className="stack">
          <legend>Карта пути студента <span className="req" aria-hidden="true">*</span></legend>
          <p className="hint small muted">По одной строке на фазу.</p>
          {JOURNEY_PHASES.map(p => <TextField key={p} label={p[0].toUpperCase() + p.slice(1)} value={a4.journey[p] ?? ''} onChange={v => set4({ journey: { ...a4.journey, [p]: v } })} />)}
        </fieldset>
      </TaskCard>

      <TaskCard {...t.props('4.5')} instruction={<>Пять ближайших задач с датами — первый горизонт карты, переведённый в действия.</>}>
        {a5.tasks.map((x, i) => (
          <div className="grid g2" key={i}>
            <TextField label={`Задача ${i + 1}`} required value={x.text} onChange={v => set5({ tasks: setAt(a5.tasks, i, { ...x, text: v }) })} />
            <TextField label="Дата" required type="date" value={x.date} onChange={v => set5({ tasks: setAt(a5.tasks, i, { ...x, date: v }) })} />
          </div>
        ))}
      </TaskCard>
    </>
  );
}
