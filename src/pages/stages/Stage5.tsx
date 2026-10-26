// Этап V — Экспертиза (позиция: эксперт-коммуникатор).
import { EditButton, NumberField, RadioGroup, setAt, TextArea, TextField } from '../../components/fields';
import { AiButton } from '../../components/PromptDialog';
import { RoadmapDiffView, RoadmapEditor } from '../../components/Roadmap';
import { TaskCard } from '../../components/TaskCard';
import { toast } from '../../components/toast';
import { DEMO_RUN } from '../../demo/demoRun';
import { ans, CRITERIA, filled, uid, type Criteria } from '../../lib/answers';
import { roadmapText } from '../../lib/prompts';
import { copyText } from '../../lib/run';
import { useReadOnly, useRun } from '../../store/store';
import { useAns, useOpenTask } from './common';

function CriteriaForm({ value, onChange }: { value: Criteria; onChange: (c: Criteria) => void }) {
  return (
    <div className="stack-lg">
      {CRITERIA.map(c => (
        <fieldset key={c.id} className="stack" style={{ gap: '.4rem' }}>
          <legend><b>{c.name}</b> <span className="req" aria-hidden="true">*</span></legend>
          <p className="hint small muted">{c.hint}</p>
          <div className="grid" style={{ gridTemplateColumns: 'minmax(6rem,8rem) minmax(0,1fr)' }}>
            <NumberField label="Оценка 1–10" min={1} max={10} value={value[c.id].score} onChange={v => onChange({ ...value, [c.id]: { ...value[c.id], score: v } })} />
            <TextArea label="Аргумент" rows={2} value={value[c.id].arg} onChange={v => onChange({ ...value, [c.id]: { ...value[c.id], arg: v } })} />
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Карта v1 демо-витка как текст для «Взять демонстрационную карту». */
function demoMapText() {
  const goal = ans(DEMO_RUN, '4.1').goal;
  return `Учебный пример. Цель: ${goal}\n${roadmapText(ans(DEMO_RUN, '4.2').rows)}`;
}

export function Stage5() {
  const run = useRun()!;
  const ro = useReadOnly();
  const t = useOpenTask(5);
  const [a1, set1] = useAns('5.1');
  const [a2, set2] = useAns('5.2');
  const [a3, set3] = useAns('5.3');
  const [a4, set4] = useAns('5.4');
  const [a5, set5] = useAns('5.5');
  const v1 = ans(run, '4.2').rows;
  const ownMap = `Цель: ${ans(run, '4.1').goal || '—'}\n${roadmapText(v1) ?? '—'}`;
  const rows = a4.rows.length ? a4.rows : v1;
  const conclusion = () => [
    `Экспертное заключение на дорожную карту`,
    ...CRITERIA.map(c => `${c.name}: ${a2.criteria[c.id].score ?? '—'} / 10. ${a2.criteria[c.id].arg}`),
    `Вопросы автору:\n${a2.questions.filter(filled).map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
    `Главное условие реализуемости: ${a2.condition}`,
  ].join('\n\n');

  return (
    <>
      <TaskCard {...t.props('5.1')} instruction={<>Оцените свою карту v1 по трём критериям — оценка 1–10 и аргумент; назовите три самых рискованных допущения.</>}>
        <CriteriaForm value={a1.criteria} onChange={c => set1({ criteria: c })} />
        <fieldset className="stack">
          <legend>Три самых рискованных допущения <span className="req" aria-hidden="true">*</span></legend>
          {a1.risks.map((r, i) => <TextArea key={i} label={`Допущение ${i + 1}`} rows={2} value={r} onChange={v => set1({ risks: setAt(a1.risks, i, v) as typeof a1.risks })} />)}
        </fieldset>
      </TaskCard>

      <TaskCard {...t.props('5.2')} promptLabel="Черновик заключения" instruction={<>Вставьте текст карты коллеги или возьмите демонстрационную карту, заполните экспертный лист по трём критериям, задайте три вопроса автору и назовите главное условие реализуемости.</>}>
        <TextArea label="Карта коллеги" required rows={5} value={a2.peerMap} onChange={v => set2({ peerMap: v })} hint="Скопируйте текст карты, присланной коллегой." />
        <div><EditButton onClick={() => set2({ peerMap: demoMapText() })}>Взять демонстрационную карту</EditButton></div>
        <CriteriaForm value={a2.criteria} onChange={c => set2({ criteria: c })} />
        <fieldset className="stack">
          <legend>Вопросы автору <span className="req" aria-hidden="true">*</span></legend>
          {a2.questions.map((q, i) => <TextArea key={i} label={`Вопрос ${i + 1}`} rows={2} value={q} onChange={v => set2({ questions: setAt(a2.questions, i, v) as typeof a2.questions })} />)}
        </fieldset>
        <TextArea label="Главное условие реализуемости" required rows={2} value={a2.condition} onChange={v => set2({ condition: v })} hint="Одно предложение." />
        <div><button type="button" className="btn sm" onClick={async () => toast((await copyText(conclusion())) ? 'Заключение скопировано' : 'Не удалось скопировать')}>Скопировать заключение для коллеги</button></div>
      </TaskCard>

      <TaskCard {...t.props('5.3')} instruction={<>Вставьте замечания коллег или экспертов (если группы нет — текст ответа модели по промпту 9 на свою карту); по каждому замечанию отметьте «принято / отклонено» и обоснуйте.</>}
        aside={<div className="row"><AiButton promptId={9} taskId="5.3" extra={{ mapText: ownMap }} label="Промпт 9 на свою карту" /></div>}>
        <TextArea label="Полученные замечания" rows={4} value={a3.feedback} onChange={v => set3({ feedback: v })} hint="Вставьте текст целиком, затем разнесите замечания по строкам ниже." />
        {a3.items.map((x, i) => {
          const upd = (p: Partial<typeof x>) => set3({ items: setAt(a3.items, i, { ...x, ...p }) });
          return (
            <div className="repeat-item" key={x.id}>
              <div className="repeat-head"><b className="small">Замечание {i + 1}</b><EditButton onClick={() => set3({ items: a3.items.filter(y => y.id !== x.id) })}>Удалить</EditButton></div>
              <TextArea label="Замечание" required rows={2} value={x.text} onChange={v => upd({ text: v })} />
              <RadioGroup legend="Решение" required inline value={x.decision || null} onChange={v => upd({ decision: v })} options={[{ value: 'accepted', label: 'принято' }, { value: 'rejected', label: 'отклонено' }]} />
              <TextArea label="Обоснование" required rows={2} value={x.reason} onChange={v => upd({ reason: v })} />
            </div>
          );
        })}
        <div><EditButton onClick={() => set3({ items: [...a3.items, { id: uid(), text: '', decision: '', reason: '' }] })}>Добавить замечание</EditButton></div>
      </TaskCard>

      <TaskCard {...t.props('5.4')} promptLabel="Проверка согласованности v2" extra={{ rows }} instruction={<>Таблица 4.2 открыта в режиме правки. Внесите изменения по принятым замечаниям и сохраните карту как v2; рядом показано, что изменено, добавлено и удалено.</>}>
        <RoadmapEditor rows={rows} onChange={r => set4({ rows: r, saved: false })} caption="Дорожная карта v2" />
        <div className="stack">
          <h4>Изменения v1 → v2</h4>
          <RoadmapDiffView a={v1} b={rows} />
        </div>
        {!ro && (
          <div className="row">
            <button type="button" className="btn primary" disabled={!rows.length} onClick={() => { set4({ rows, saved: true, savedAt: new Date().toISOString() }); toast('Карта сохранена как v2'); }}>
              {a4.saved ? 'Сохранено как v2 — сохранить заново' : 'Сохранить как v2'}
            </button>
            {a4.saved && <span className="small muted">Сохранено {new Date(a4.savedAt).toLocaleString('ru-RU')}</span>}
          </div>
        )}
      </TaskCard>

      <TaskCard {...t.props('5.5')} instruction={<>Для работы в группе: список приоритетов участников → совпадения, расхождения, формулировки для голосования.</>}>
        <TextField label="Число участников" value={a5.groupSize} onChange={v => set5({ groupSize: v })} />
        <TextArea label="Приоритеты участников" rows={4} value={a5.priorities} onChange={v => set5({ priorities: v })} hint="Кратко: кто что считает приоритетом." />
        <TextArea label="Совпадения, расхождения, формулировки для голосования" rows={4} value={a5.result} onChange={v => set5({ result: v })} />
      </TaskCard>
    </>
  );
}
