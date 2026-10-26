import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PROMPTS } from '../content/prompts';
import { LECTURES } from '../content/lectures';
import type { TaskDef } from '../content/tasks';
import { ans, type Answers, type TaskId } from '../lib/answers';
import { fillPrompt, fillPromptSegments } from '../lib/prompts';
import { taskAutoComplete, taskDone } from '../lib/rules';
import type { Run } from '../lib/types';
import { useActiveRun, useReadOnly, useStore } from '../store/store';
import { CopyButton, Modal } from './ui';

/** Ответ задания активного витка и функция частичного обновления */
export function useTask<K extends TaskId>(id: K): [Answers[K], (p: Partial<Answers[K]>) => void, Run] {
  const run = useActiveRun()!;
  const patchAnswer = useStore(s => s.patchAnswer);
  return [ans(run, id), (p: Partial<Answers[K]>) => patchAnswer(id, p), run];
}

export function PromptModal({ promptId, taskId, onClose }: { promptId: number; taskId?: string; onClose: () => void }) {
  const run = useActiveRun();
  const p = PROMPTS.find(x => x.id === promptId)!;
  const seg = fillPromptSegments(promptId, run, { taskId });
  const missing = seg.filter(s => s.kind === 'missing').length;
  return (
    <Modal title={`Промпт ${p.id}. ${p.title}`} onClose={onClose}
      footer={<><CopyButton className="btn primary" text={() => fillPrompt(promptId, run, { taskId })} label="Копировать" /><button type="button" className="btn" onClick={onClose}>Закрыть</button></>}>
      <p className="small">Вставьте в YandexGPT, GigaChat или ChatGPT; ответ модели — черновик, решение за вами.</p>
      {missing > 0 && <p className="note">Квадратные скобки остались там, где данных ещё нет ({missing}). Допишите их сами после вставки или заполните поля задания.</p>}
      <pre className="prompt">{seg.map((s, i) => s.kind === 'label' ? <b key={i}>{s.value}</b> : s.kind === 'fill' ? <mark key={i}>{s.value}</mark> : s.kind === 'missing' ? <span key={i} className="miss">{s.value}</span> : <span key={i}>{s.value}</span>)}</pre>
      <p className="small muted">Подсвечены подставленные ваши ответы.</p>
    </Modal>
  );
}

export function AiButton({ promptId, taskId, label }: { promptId: number; taskId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const logAi = useStore(s => s.logAi);
  return (
    <>
      <button type="button" className="btn sm" onClick={() => { logAi(promptId, taskId); setOpen(true); }}>
        {label ?? `Использовать с ИИ · промпт ${promptId}`}
      </button>
      {open && <PromptModal promptId={promptId} taskId={taskId} onClose={() => setOpen(false)} />}
    </>
  );
}

export function TaskShell({ def, open, onToggle, children, aside }: { def: TaskDef; open: boolean; onToggle: () => void; children: ReactNode; aside?: ReactNode }) {
  const run = useActiveRun()!;
  const readOnly = useReadOnly();
  const setTaskMark = useStore(s => s.setTaskMark);
  const setAiResponse = useStore(s => s.setAiResponse);
  const done = taskDone(run, def.id);
  const auto = taskAutoComplete(run, def.id);
  const touched = run.answers[def.id] !== undefined;
  const bodyId = `task-${def.id}`;
  const lectures = (def.lectures || []).map(id => LECTURES.find(l => l.id === id)!).filter(Boolean);
  return (
    <section className={`task${open ? ' open' : ''}${done ? ' done' : ''}`} aria-labelledby={`${bodyId}-h`} id={`t-${def.id}`}>
      <h2 style={{ margin: 0, font: 'inherit' }} id={`${bodyId}-h`}>
        <button type="button" className="task-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
          <span className="n">{def.id}</span>
          <span className="tt">{def.title}</span>
          <span className="meta">
            {!def.required && <span className="pill hide-sm">необязательно</span>}
            <span className={`pill ${done ? 'ok' : touched ? 'warn' : ''}`}>{done ? 'выполнено' : touched ? 'в работе' : 'не начато'}</span>
          </span>
        </button>
      </h2>
      {open && (
        <div className="task-body" id={bodyId}>
          <p className="instr">{def.instruction}</p>
          {(def.prompts?.length || lectures.length || aside) ? (
            <div className="row">
              {def.prompts?.map(p => <AiButton key={p} promptId={p} taskId={def.id} />)}
              {lectures.map(l => <Link key={l.id} className="btn sm" to={`/library/lectures?open=${l.id}`}>Лекция: {l.title}</Link>)}
              {aside}
            </div>
          ) : null}
          <fieldset disabled={readOnly} className="stack-lg">
            <legend className="sr-only">{def.title}</legend>
            {children}
            {def.prompts?.length ? (
              <details>
                <summary className="small" style={{ cursor: 'pointer' }}>Вставить ответ модели (необязательно){run.aiResponses[def.id] ? ' · сохранён' : ''}</summary>
                <div style={{ marginTop: 8 }}>
                  <label className="sr-only" htmlFor={`${bodyId}-ai`}>Ответ модели</label>
                  <textarea id={`${bodyId}-ai`} value={run.aiResponses[def.id] || ''} onChange={e => setAiResponse(def.id, e.target.value)} placeholder="Например: таблица из ответа YandexGPT — как черновик для сравнения со своим вариантом" />
                </div>
              </details>
            ) : null}
          </fieldset>
          <div className="task-foot">
            <label className="check" style={{ padding: 0 }}>
              <input type="checkbox" checked={done} disabled={readOnly || !auto}
                onChange={e => setTaskMark(def.id, e.target.checked ? undefined : false)} />
              <span>Выполнено{!auto && <span className="muted small"> — отметка появится, когда заполнены обязательные поля</span>}{auto && !done && <span className="muted small"> — отметка снята вручную</span>}</span>
            </label>
            <button type="button" className="btn sm" onClick={onToggle}>Свернуть</button>
          </div>
        </div>
      )}
    </section>
  );
}
