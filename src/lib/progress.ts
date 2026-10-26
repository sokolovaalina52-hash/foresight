// Правила выполнения заданий и открытия этапов (ТЗ, раздел 5: «Общая структура экрана этапа», п. 6).
import { TASKS, taskById, tasksOf } from './tasks';
import type { Run, TaskId } from './types';

export function isTaskDone(run: Run, id: TaskId): boolean {
  const t = taskById(id);
  return !!t && t.complete(run) && !run.undone.includes(id);
}

export function requiredDone(run: Run, stage: number): boolean {
  return tasksOf(stage).filter(t => t.required).every(t => isTaskDone(run, t.id));
}

/** Рефлексивная пауза заполнена; на VI этапе её заменяет протокол 6.1. */
export function reflectionDone(run: Run, stage: number): boolean {
  if (stage === 0) return true;
  if (stage === 6) return isTaskDone(run, '6.1');
  const p = run.reflections[stage as 1];
  return !!p && p.content.trim().length > 0 && p.process.trim().length > 0;
}

export function stageComplete(run: Run, stage: number): boolean {
  return requiredDone(run, stage) && reflectionDone(run, stage);
}

/** Следующий этап открывается, когда выполнены обязательные задания текущего и заполнена рефлексивная пауза. */
export function canOpen(run: Run, stage: number): boolean {
  if (stage <= 0) return true;
  return stageComplete(run, stage - 1);
}

/** Досрочно открытый этап доступен всегда; предыдущий тогда считается «пройден не полностью». */
export function isAccessible(run: Run, stage: number): boolean {
  return canOpen(run, stage) || run.earlyOpened.includes(stage as 1) || stageProgress(run, stage).done > 0;
}

export function partiallyPassed(run: Run, stage: number): boolean {
  return run.earlyOpened.includes((stage + 1) as 1) && !stageComplete(run, stage);
}

/** Первый незавершённый этап (0–6); 7 — все этапы завершены. */
export function currentStage(run: Run): number {
  for (let n = 0; n <= 6; n++) if (!stageComplete(run, n)) return n;
  return 7;
}

export function stageProgress(run: Run, stage: number): { done: number; total: number } {
  const list = tasksOf(stage);
  return { done: list.filter(t => isTaskDone(run, t.id)).length, total: list.length };
}

export function overallProgress(run: Run): number {
  const list = TASKS.filter(t => t.stage > 0);
  return list.filter(t => isTaskDone(run, t.id)).length / list.length;
}
