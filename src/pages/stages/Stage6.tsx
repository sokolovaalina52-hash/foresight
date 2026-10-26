// Этап VI — Интеграция (позиция: рефлексивный практик).
import { Link } from 'react-router-dom';
import { AttitudeForm, AttitudeResultView, SelfScoreForm, SelfScoreResult } from '../../components/Diagnostics';
import { Dynamics } from '../../components/Dynamics';
import { Checkbox, RadioGroup, SelectField, TextArea, TextField } from '../../components/fields';
import { TaskCard } from '../../components/TaskCard';
import { STAGES } from '../../content/model';
import { PROMPTS } from '../../content/prompts';
import { PREMISE_QUESTIONS, RETURN_OCCASIONS } from '../../content/route';
import { ans, filled } from '../../lib/answers';
import { computeAttitude } from '../../lib/diag';
import { PRODUCT_KEYS, PRODUCT_TITLES } from '../../lib/products';
import { horizonName, sortRows } from '../../lib/roadmap';
import { useRun, useStore } from '../../store/store';
import { useAns, useOpenTask } from './common';

export function Stage6() {
  const run = useRun()!;
  const updateRun = useStore(s => s.updateRun);
  const t = useOpenTask(6);
  const [a1, set1] = useAns('6.1');
  const [a2, set2] = useAns('6.2');
  const [a3, set3] = useAns('6.3');
  const [a4, set4] = useAns('6.4');
  const [a5, set5] = useAns('6.5');
  const v2 = ans(run, '5.4');
  const mapRows = sortRows(v2.saved ? v2.rows : ans(run, '4.2').rows).filter(r => filled(r.point));
  const used = [...new Set(run.promptLog.map(p => p.promptId))];
  const lead = ans(run, '1.2');
  const leadText = lead.lead ? `Противоречие между ${lead[`h${lead.lead}` as 'h5'][0]} и ${lead[`h${lead.lead}` as 'h5'][1]}` : '';
  const self = { mc: a2.mc, kp: a2.kp, od: a2.od };

  return (
    <>
      <TaskCard {...t.props('6.1')} instruction={<>Рефлексивный протокол трёх типов. Он заменяет рефлексивную паузу на этом этапе.</>}>
        <div className="aside-box"><b>Продукты витка:</b> <ul>{PRODUCT_KEYS.map(k => <li key={k}><Link to={`/portfolio?p=${k}`}>{PRODUCT_TITLES[k]}</Link></li>)}</ul></div>
        <TextArea label="Содержательная рефлексия" required rows={4} value={a1.content} onChange={v => set1({ content: v })} hint="Что сделано и узнано: какие тренды выявлены, какие сценарии сконструированы, какие стратегии разработаны." />
        <div className="aside-box"><b>Ваши рефлексивные паузы I–V:</b>
          <ul>{STAGES.slice(0, 5).map(s => { const p = run.reflections[s.n]; return <li key={s.n}><b>{s.roman}.</b> {p && (filled(p.content) || filled(p.process)) ? [p.content, p.process].filter(filled).join(' / ') : <span className="muted">не заполнена</span>}</li>; })}</ul>
        </div>
        <TextArea label="Процессуальная рефлексия" required rows={4} value={a1.process} onChange={v => set1({ process: v })} hint="Как получены результаты: методы, трудности, взаимодействие в группе, эффективность цифровых инструментов." />
        <div className="aside-box"><b>Вопросы-подсказки:</b><ul>{PREMISE_QUESTIONS.map(q => <li key={q}>{q}</li>)}</ul></div>
        <TextArea label="Рефлексия предпосылок" required rows={4} value={a1.premise} onChange={v => set1({ premise: v })} hint="Какие базовые допущения о природе образования, роли преподавателя и ценности развития пересмотрены." />
      </TaskCard>

      <TaskCard {...t.props('6.2')} instruction={<>Повторная экспресс-диагностика установки и повторная самооценка S. Ниже — экран «до / после».</>}>
        <AttitudeForm prefix="exit" answers={a2.answers} onChange={a => {
          set2({ answers: a });
          const res = computeAttitude(a);
          updateRun(r => ({ ...r, exit: { ...r.exit, attitude: res ?? undefined } }));
        }} />
        <AttitudeResultView result={computeAttitude(a2.answers)} answered={a2.answers.filter(x => x !== null).length} />
        <SelfScoreForm value={self} onChange={v => { set2(v); updateRun(r => ({ ...r, exit: { ...r.exit, selfScore: v } })); }} />
        <SelfScoreResult value={self} />
        <Dynamics run={run.exit?.selfScore ? run : { ...run, exit: { ...run.exit, selfScore: self } }} />
      </TaskCard>

      <TaskCard {...t.props('6.3')} instruction={<>Отметьте точки карты {v2.saved ? 'v2' : 'v1'}, которые вы отбираете как антропологически состоятельные, и одним предложением ответьте, ради чего вы идёте по этой карте.</>}>
        <fieldset>
          <legend>Антропологически состоятельные точки <span className="req" aria-hidden="true">*</span></legend>
          {mapRows.length === 0 && <p className="small muted">Точки появятся после заполнения карты на этапе IV.</p>}
          {mapRows.map(r => <Checkbox key={r.id} label={<><span className="muted small">{horizonName(r.horizon)}:</span> {r.point}</>} checked={a3.selected.includes(r.id)}
            onChange={v => set3({ selected: v ? [...a3.selected, r.id] : a3.selected.filter(x => x !== r.id) })} />)}
        </fieldset>
        <TextField label="Ради чего я иду по этой карте" required value={a3.why} onChange={v => set3({ why: v })} hint="Одно предложение." />
      </TaskCard>

      <TaskCard {...t.props('6.4')} instruction={<>Перечень делегируемых задач (из 1.4), три удачных промпта из использованных в витке, одно задание, сгенерированное моделью и доработанное, вывод о потенциале и ограничениях.</>}>
        <div className="aside-box"><b>Делегируемые задачи из 1.4:</b>
          {ans(run, '1.4').rows.some(r => filled(r.task)) ? <ul>{ans(run, '1.4').rows.filter(r => filled(r.task)).map((r, i) => <li key={i}>{r.task} — {r.help}</li>)}</ul> : <p className="muted small">Задание 1.4 не заполнено.</p>}
        </div>
        <fieldset>
          <legend>Три удачных промпта</legend>
          {used.length === 0 && <p className="small muted">Здесь появятся промпты, которые вы копировали кнопкой «Использовать с ИИ».</p>}
          {used.map(id => {
            const p = PROMPTS.find(x => x.id === id)!;
            const on = a4.prompts.includes(id);
            return <Checkbox key={id} label={`Промпт ${id}. ${p.title}`} checked={on} onChange={v => {
              if (v && a4.prompts.length >= 3) return;
              set4({ prompts: v ? [...a4.prompts, id] : a4.prompts.filter(x => x !== id) });
            }} />;
          })}
        </fieldset>
        <TextArea label="Задание, сгенерированное моделью и доработанное" rows={4} value={a4.generated} onChange={v => set4({ generated: v })} />
        <TextArea label="Вывод о потенциале и ограничениях нейросетей в своём курсе" rows={3} value={a4.conclusion} onChange={v => set4({ conclusion: v })} />
      </TaskCard>

      <TaskCard {...t.props('6.5')} instruction={<>Новая проблема развития; чем она отличается от исходной; критический этап следующего витка; дата и повод возвращения к карте.</>}
        aside={leadText ? <div className="aside-box"><b>Исходная проблема (1.2):</b> {leadText}</div> : undefined}>
        <TextArea label="Новая проблема развития" required rows={3} value={a5.problem} onChange={v => set5({ problem: v })} placeholder="Противоречие между … и …" />
        <TextArea label="Чем она отличается от исходной" required rows={3} value={a5.diff} onChange={v => set5({ diff: v })} />
        <RadioGroup legend="Критический этап следующего витка" required inline value={a5.critical} onChange={v => set5({ critical: v })}
          options={STAGES.map(s => ({ value: s.n as number, label: `${s.roman}. ${s.name}` }))} />
        <div className="grid g2">
          <TextField label="Дата возвращения к карте" type="date" value={a5.date} onChange={v => set5({ date: v })} />
          <SelectField label="Повод" value={a5.occasion} onChange={v => set5({ occasion: v })} options={RETURN_OCCASIONS.map(o => ({ value: o, label: o }))} />
        </div>
      </TaskCard>
    </>
  );
}
