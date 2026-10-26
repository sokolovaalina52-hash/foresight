import { STAGES } from '../content/model';
import { PROMPTS } from '../content/prompts';
import { PREMISE_QUESTIONS } from '../content/tasks';
import { Field, TextArea, TextInput } from '../components/ui';
import { useTask } from '../components/TaskShell';
import { AttitudeView, DiagForm, DynamicsView, SelfScoreForm } from '../components/Diagnostics';
import { ans } from '../lib/answers';
import { contradictionText } from '../lib/products';
import { horizonLabel } from '../lib/roadmap';
import { PRODUCT_IDS } from '../lib/products';
import { canAdvance } from '../lib/rules';
import type { StageN } from '../lib/types';
import { useReadOnly } from '../store/store';

export function T6_1() {
  const [a, set, run] = useTask('6.1');
  return (
    <div className="stack-lg">
      <div className="note small">
        <b>Продукты витка:</b>
        <ul>{PRODUCT_IDS.map((id, i) => <li key={id}>{STAGES[i].roman}. {run.products[id].title} — {canAdvance(run, i + 1) ? 'этап завершён' : 'в работе'}</li>)}</ul>
      </div>
      <TextArea label="Содержательная рефлексия" required hint="Что сделано и узнано: какие тренды выявлены, какие сценарии сконструированы, какие стратегии разработаны" value={a.content} onChange={content => set({ content })} rows={5} />
      <details className="note small">
        <summary style={{ cursor: 'pointer' }}><b>Рефлексивные паузы I–V этапов</b></summary>
        <ul>{([1, 2, 3, 4, 5] as StageN[]).map(n => <li key={n}><b>{STAGES[n - 1].roman}.</b> {run.reflections[n]?.content || '—'} <span className="muted">/ {run.reflections[n]?.process || '—'}</span></li>)}</ul>
      </details>
      <TextArea label="Процессуальная рефлексия" required hint="Как получены результаты: методы, трудности, взаимодействие в группе, эффективность цифровых инструментов" value={a.process} onChange={process => set({ process })} rows={5} />
      <TextArea label="Рефлексия предпосылок" required hint={<>Вопросы-подсказки: {PREMISE_QUESTIONS.join('; ')}.</>} value={a.premise} onChange={premise => set({ premise })} rows={5} />
    </div>
  );
}

export function T6_2() {
  const [a, set, run] = useTask('6.2');
  const exit = run.exit;
  const readOnly = useReadOnly();
  const forms = (
    <>
      <h4>Повторная экспресс-диагностика</h4>
      <DiagForm name="exit" picks={a.picks} onChange={picks => set({ picks })} />
      <AttitudeView picks={a.picks} />
      <h4>Повторная самооценка S</h4>
      <SelfScoreForm prefix="exit" value={{ mc: a.mc, kp: a.kp, od: a.od }} onChange={v => set({ ...v, confirmed: true })} />
      {!a.confirmed && <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => set({ confirmed: true })}>Зафиксировать самооценку</button>}
    </>
  );
  const dynamics = <><h4>До / после</h4><DynamicsView entry={run.entry} exit={exit} /></>;
  return readOnly ? (
    <div className="stack-lg">{dynamics}<details><summary className="small" style={{ cursor: 'pointer' }}>Ответы повторной диагностики и самооценки</summary><div className="stack-lg" style={{ marginTop: 10 }}>{forms}</div></details></div>
  ) : (
    <div className="stack-lg">{forms}{dynamics}</div>
  );
}

export function T6_3() {
  const [a, set, run] = useTask('6.3');
  const v2 = ans(run, '5.4').savedAt ? ans(run, '5.4').points : ans(run, '4.2').points;
  return (
    <div className="stack-lg">
      <fieldset>
        <legend className="lbl" style={{ fontWeight: 600 }}>Точки карты {ans(run, '5.4').savedAt ? 'v2' : 'v1'}, отобранные как антропологически состоятельные<span className="req" aria-hidden="true">*</span></legend>
        {v2.length === 0 && <p className="small muted">Карта ещё не заполнена (задания 4.2 и 5.4).</p>}
        {v2.map(p => (
          <label key={p.id} className="check">
            <input type="checkbox" checked={a.pointIds.includes(p.id)} onChange={e => set({ pointIds: e.target.checked ? [...a.pointIds, p.id] : a.pointIds.filter(x => x !== p.id) })} />
            <span><span className="pill">{horizonLabel(p.horizon)}</span> {p.title || '—'}</span>
          </label>
        ))}
      </fieldset>
      <TextInput label="Ради чего я иду по этой карте" required hint="Одно предложение" value={a.why} onChange={why => set({ why })} />
    </div>
  );
}

export function T6_4() {
  const [a, set, run] = useTask('6.4');
  const delegated = ans(run, '1.4').rows.filter(r => r.task.trim());
  const used = [...new Set(run.aiLog.map(l => l.promptId))].sort((x, y) => x - y);
  return (
    <div className="stack-lg">
      <div className="stack">
        <h4>Делегируемые задачи (из 1.4)</h4>
        {delegated.length ? <ul className="small">{delegated.map((r, i) => <li key={i}>{r.task} → {r.help || '—'}</li>)}</ul> : <p className="small muted">Задание 1.4 не заполнено.</p>}
      </div>
      <fieldset>
        <legend className="lbl" style={{ fontWeight: 600 }}>Три удачных промпта — из использованных в витке</legend>
        {used.length === 0 && <p className="small muted">В этом витке кнопка «Использовать с ИИ» ещё не нажималась.</p>}
        {used.map(id => (
          <label key={id} className="check">
            <input type="checkbox" checked={a.promptIds.includes(id)} disabled={!a.promptIds.includes(id) && a.promptIds.length >= 3}
              onChange={e => set({ promptIds: e.target.checked ? [...a.promptIds, id] : a.promptIds.filter(x => x !== id) })} />
            <span>{id}. {PROMPTS.find(p => p.id === id)?.title} <span className="muted small">· использован {run.aiLog.filter(l => l.promptId === id).length} раз</span></span>
          </label>
        ))}
      </fieldset>
      <TextArea label="Задание, сгенерированное моделью и доработанное" hint="Что предложила модель и что вы изменили" value={a.generatedTask} onChange={generatedTask => set({ generatedTask })} />
      <TextArea label="Вывод о потенциале и ограничениях" required value={a.conclusion} onChange={conclusion => set({ conclusion })} />
    </div>
  );
}

export function T6_5() {
  const [a, set, run] = useTask('6.5');
  const p = ans(run, '1.2');
  const lead = p.lead === 5 ? p.h5 : p.lead === 10 ? p.h10 : p.lead === 15 ? p.h15 : null;
  return (
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <div className="stack-lg">
        <TextArea label="Новая проблема развития" required value={a.problem} onChange={problem => set({ problem })} />
        <TextArea label="Чем она отличается от исходной" required value={a.difference} onChange={difference => set({ difference })} />
        <Field label="Критический этап следующего витка" required>
          {id => (
            <select id={id} value={a.criticalStage ?? ''} onChange={e => set({ criticalStage: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— выберите этап</option>
              {STAGES.map(s => <option key={s.n} value={s.n}>{s.roman}. {s.name}</option>)}
            </select>
          )}
        </Field>
        <div className="inline-fields">
          <TextInput label="Дата возвращения к карте" type="date" value={a.date} onChange={date => set({ date })} />
          <TextInput label="Повод" value={a.occasion} onChange={occasion => set({ occasion })} placeholder="аттестация, новый семестр, новая технология" />
        </div>
      </div>
      <div className="card stack">
        <div className="eyebrow">Исходная проблема (1.2)</div>
        <p>{lead ? contradictionText({ a: lead[0], b: lead[1] }) : '—'}</p>
      </div>
    </div>
  );
}
