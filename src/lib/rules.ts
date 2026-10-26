import { TASKS, tasksOf } from '../content/tasks';
import { DIAG_Q } from '../content/diagnostics';
import { ans, CELLS, PHASES, SUBJECTS, filled, t, type TaskId } from './answers';
import type { Run, StageN } from './types';

const scoreOk = (s: { score: number | null; arg: string }) => s.score != null && filled(s.arg);

/** Автоматическая проверка: заполнены ли обязательные поля задания */
export function taskAutoComplete(run: Run, id: TaskId): boolean {
  switch (id) {
    case '0.2': return ans(run, '0.2').picks.filter(p => p != null).length === DIAG_Q.length;
    case '0.3': return ans(run, '0.3').confirmed;
    case '1.1': return ans(run, '1.1').items.length >= 3;
    case '1.2': {
      const a = ans(run, '1.2');
      return a.lead != null && [a.h5, a.h10, a.h15].every(([x, y]) => filled(x, y));
    }
    case '1.3': { const a = ans(run, '1.3'); return filled(a.tasks, a.assets, a.vectors); }
    case '1.4': return ans(run, '1.4').rows.filter(r => filled(r.task, r.help)).length >= 3;
    case '2.1': return ans(run, '2.1').sources.filter(s => filled(s.title)).length >= 3;
    case '2.2': {
      const f = ans(run, '2.2').factors.filter(x => filled(x.text) && x.type && x.kind);
      return f.length >= 6 && f.filter(x => x.kind === 'weak').length >= 2;
    }
    case '2.3': return ans(run, '2.3').items.some(c => filled(c.a, c.b));
    case '2.4': { const a = ans(run, '2.4'); return a.done && filled(a.changes); }
    case '3.1': { const a = ans(run, '3.1'); return filled(a.a.factor, a.a.plus, a.a.minus, a.b.factor, a.b.plus, a.b.minus); }
    case '3.2': { const a = ans(run, '3.2'); return CELLS.every(c => filled(a[c].title, a[c].content, a[c].role, a[c].indicator)); }
    case '3.3': {
      const a = ans(run, '3.3');
      return a.scenario != null && filled(a.fork) && a.paths.every(p => filled(p.name) &&
        SUBJECTS.every(s => [p.cells[s].y1, p.cells[s].y3, p.cells[s].y5].some(x => filled(x))));
    }
    case '3.4': { const a = ans(run, '3.4'); return CELLS.every(c => a.own[c].p != null && a.own[c].d != null); }
    case '3.5': { const a = ans(run, '3.5'); return filled(a.baseFrame, a.ideaFrame, a.role, a.plot) && !!a.canon; }
    case '4.1': { const a = ans(run, '4.1'); return a.scenario != null && filled(a.goal); }
    case '4.2': {
      const pts = ans(run, '4.2').points.filter(p => filled(p.title, p.indicator));
      return (['1', '3', '5'] as const).every(h => pts.some(p => p.horizon === h));
    }
    case '4.3': {
      const target = ans(run, '4.1').scenario;
      const a = ans(run, '4.3');
      return target != null && CELLS.filter(c => c !== target).every(c => filled(a[c]));
    }
    case '4.4': {
      const a = ans(run, '4.4');
      return filled(a.title, a.format, a.model) && a.outcomes.filter(o => filled(o)).length >= 2 &&
        a.alignment.some(r => filled(r.outcome, r.strategy, r.assessment)) && PHASES.every(p => filled(a.journey[p]));
    }
    case '4.5': return ans(run, '4.5').tasks.filter(x => filled(x.text, x.date)).length >= 5;
    case '5.1': {
      const a = ans(run, '5.1');
      return scoreOk(a.real) && scoreOk(a.innov) && scoreOk(a.anthro) && a.risks.every(r => filled(r));
    }
    case '5.2': {
      const a = ans(run, '5.2');
      return filled(a.map, a.condition) && scoreOk(a.real) && scoreOk(a.innov) && scoreOk(a.anthro) && a.questions.every(q => filled(q));
    }
    case '5.3': {
      const items = ans(run, '5.3').items.filter(i => filled(i.text));
      return items.length > 0 && items.every(i => i.decision && filled(i.reason));
    }
    case '5.4': return !!ans(run, '5.4').savedAt;
    case '5.5': { const a = ans(run, '5.5'); return filled(a.priorities, a.result); }
    case '6.1': { const a = ans(run, '6.1'); return filled(a.content, a.process, a.premise); }
    case '6.2': { const a = ans(run, '6.2'); return a.confirmed && a.picks.filter(p => p != null).length === DIAG_Q.length; }
    case '6.3': { const a = ans(run, '6.3'); return a.pointIds.length > 0 && filled(a.why); }
    case '6.4': { const a = ans(run, '6.4'); return filled(a.conclusion) && (a.promptIds.length > 0 || filled(a.generatedTask)); }
    case '6.5': {
      const a = ans(run, '6.5');
      return filled(a.problem, a.difference) && a.criticalStage != null && (filled(a.date) || filled(a.occasion));
    }
  }
}

/** Выполнено с учётом ручной отметки (пользователь может снять автоматическую отметку) */
export function taskDone(run: Run, id: TaskId): boolean {
  if (run.taskMarks[id] === false) return false;
  return taskAutoComplete(run, id);
}

/** Есть ли в задании хоть какие-то данные */
export function taskTouched(run: Run, id: TaskId): boolean {
  return run.answers[id] !== undefined;
}

export const profileDone = (run: Run) => filled(run.profile.discipline) && run.profile.horizon != null;
export const entryDone = (run: Run) => profileDone(run) && taskDone(run, '0.2') && taskDone(run, '0.3');

export function requiredDone(run: Run, stage: number): boolean {
  if (stage === 0) return entryDone(run);
  return tasksOf(stage).filter(x => x.required).every(x => taskDone(run, x.id));
}

export function reflectionDone(run: Run, stage: StageN): boolean {
  if (stage === 6) return taskDone(run, '6.1');
  const r = run.reflections[stage];
  return !!r && filled(r.content, r.process);
}

/** Можно ли переходить к следующему этапу без пометки «досрочно» */
export function canAdvance(run: Run, stage: number): boolean {
  if (stage === 0) return entryDone(run);
  return requiredDone(run, stage) && reflectionDone(run, stage as StageN);
}

export type StageStatus = 'locked' | 'open' | 'done' | 'partial';

/** Открыт ли этап: по правилу (предыдущий завершён) или досрочно */
export function stageOpen(run: Run, stage: number): boolean {
  if (stage <= 1 && stage >= 0) return stage === 0 || canAdvance(run, 0) || run.opened.includes(1);
  return canAdvance(run, stage - 1) || run.opened.includes(stage);
}

export function stageStatus(run: Run, stage: number): StageStatus {
  if (canAdvance(run, stage)) return 'done';
  const laterOpened = run.opened.some(n => n > stage) || (stage === 0 && run.opened.length > 0);
  if (laterOpened && stage < 6) return 'partial';
  return stageOpen(run, stage) ? 'open' : 'locked';
}

/** Текущий этап: первый незавершённый из открытых */
export function currentStage(run: Run): number {
  for (let n = 0; n <= 6; n++) if (!canAdvance(run, n)) return n;
  return 6;
}

export function stageProgress(run: Run, stage: number) {
  const list = tasksOf(stage);
  return { done: list.filter(x => taskDone(run, x.id)).length, total: list.length };
}

export const allRequiredDone = (run: Run) => [0, 1, 2, 3, 4, 5, 6].every(n => canAdvance(run, n));

export const ALL_TASK_IDS = TASKS.map(x => x.id);
export { t };
