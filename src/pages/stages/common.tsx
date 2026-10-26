// Общие хуки экранов этапов: ответы задания и одно раскрытое задание.
import { ans, type A, type AnswerId } from '../../lib/answers';
import { isTaskDone } from '../../lib/progress';
import { tasksOf } from '../../lib/tasks';
import { useRun, useStore } from '../../store/store';

export function useAns<K extends AnswerId>(id: K): [A[K], (patch: Partial<A[K]>) => void] {
  const run = useRun();
  const setAnswer = useStore(s => s.setAnswer);
  return [ans(run, id), patch => setAnswer(id, patch)];
}

/** Задания раскрываются по одному; по умолчанию — первое невыполненное. */
export function useOpenTask(stage: number) {
  const run = useRun()!;
  const stored = useStore(s => s.openTask[String(stage)]);
  const setOpenTask = useStore(s => s.setOpenTask);
  const list = tasksOf(stage);
  const fallback = list.find(t => !isTaskDone(run, t.id))?.id ?? list[0]?.id;
  const open = stored === undefined ? fallback : stored;
  return {
    isOpen: (id: string) => open === id,
    toggle: (id: string) => setOpenTask(String(stage), open === id ? '' : id),
    props: (id: string) => ({ id, open: open === id, onToggle: () => setOpenTask(String(stage), open === id ? '' : id) }),
  };
}
