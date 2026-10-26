// Задание этапа: номер, название, инструкция, поля, «Использовать с ИИ», отметка «выполнено».
import type { ReactNode } from 'react';
import { isTaskDone } from '../lib/progress';
import type { PromptExtra } from '../lib/prompts';
import { taskById } from '../lib/tasks';
import { useReadOnly, useRun, useStore } from '../store/store';
import { TextArea } from './fields';
import { AiButton } from './PromptDialog';

export function TaskCard({ id, instruction, children, extra, promptLabel, aside, open, onToggle }: {
  id: string; instruction: ReactNode; children: ReactNode; extra?: PromptExtra; promptLabel?: string; aside?: ReactNode;
  open: boolean; onToggle: () => void;
}) {
  const run = useRun()!;
  const t = taskById(id)!;
  const ro = useReadOnly();
  const toggleUndone = useStore(s => s.toggleUndone);
  const updateRun = useStore(s => s.updateRun);
  const complete = t.complete(run);
  const done = isTaskDone(run, id);
  const note = run.aiNotes[id] ?? '';
  return (
    <section className={`task${open ? ' open' : ''}`} id={`task-${id}`} aria-labelledby={`tt-${id}`}>
      <button type="button" className="task-head" aria-expanded={open} aria-controls={`tb-${id}`} onClick={onToggle}>
        <span className={`task-num${done ? ' done' : ''}`} aria-hidden="true">{id}</span>
        <span>
          <span className="task-title" id={`tt-${id}`}>{t.title}</span>
          <span className="task-meta" style={{ display: 'block' }}>{t.required ? 'обязательное' : 'необязательное'}{done ? ' · выполнено' : ''}</span>
        </span>
        <span className="muted mono" aria-hidden="true">{open ? '–' : '+'}</span>
      </button>
      {open && (
        <div className="task-body" id={`tb-${id}`}>
          <div className="instr">{instruction}</div>
          {aside}
          {children}
          {t.promptId && (
            <div className="stack">
              <div className="row"><AiButton promptId={t.promptId} taskId={id} extra={extra} label={promptLabel} /></div>
              {(!ro || note) && <TextArea label="Вставить ответ модели" hint="Необязательно. Сохраняется рядом с заданием как черновик." value={note}
                onChange={v => updateRun(r => ({ ...r, aiNotes: { ...r.aiNotes, [id]: v } }))} rows={3} />}
            </div>
          )}
          <div className="task-foot">
            <label className="check">
              <input type="checkbox" checked={done} disabled={ro || !complete} onChange={() => toggleUndone(id)} />
              <span>Выполнено
                <span className="hint small muted" style={{ display: 'block' }}>
                  {complete ? 'Отметка ставится автоматически при заполнении обязательных полей; её можно снять.' : 'Отметка появится, когда будут заполнены обязательные поля (отмечены *).'}
                </span>
              </span>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
