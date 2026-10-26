// Глобальное состояние: витки пользователя в localStorage (zustand persist), демо-режим и настройки.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StageN } from '../content/types';
import type { AnswerId, A } from '../lib/answers';
import { activeRun, derive, newRun } from '../lib/run';
import type { ReflectionPause, Run, TaskId } from '../lib/types';
import { DEMO_RUN } from '../demo/demoRun';

export type Theme = 'system' | 'light' | 'dark';

type State = {
  runs: Run[];
  templates: Record<string, Record<string, string>>;
  theme: Theme;
  presentation: boolean;
  demo: boolean;
  /** Карта задания, раскрытого на экране этапа. */
  openTask: Record<string, TaskId>;

  updateRun: (fn: (r: Run) => Run) => void;
  setAnswer: <K extends AnswerId>(id: K, patch: Partial<A[K]>) => void;
  setRaw: (id: string, value: unknown) => void;
  setReflection: (stage: StageN, patch: Partial<ReflectionPause>) => void;
  toggleUndone: (id: TaskId) => void;
  logPrompt: (promptId: number, taskId: TaskId) => void;

  startFresh: () => void;
  ensureRun: () => void;
  startNextRun: () => void;
  copyDemo: () => void;
  replaceAll: (runs: Run[], templates: Record<string, Record<string, string>>) => void;
  reset: () => void;
  setTemplate: (id: string, values: Record<string, string>) => void;
  setTheme: (t: Theme) => void;
  setPresentation: (v: boolean) => void;
  setDemo: (v: boolean) => void;
  setOpenTask: (stage: string, id: TaskId) => void;
};

export const useStore = create<State>()(persist((set, get) => {
  /** Изменяет активный виток; в демо-режиме данные только для чтения. */
  const mutate = (fn: (r: Run) => Run) => {
    if (get().demo) return;
    const runs = get().runs;
    const cur = activeRun(runs);
    if (!cur) return;
    set({ runs: runs.map(r => (r.id === cur.id ? derive(fn(r)) : r)) });
  };
  return {
    runs: [], templates: {}, theme: 'system', presentation: false, demo: false, openTask: {},

    updateRun: mutate,
    setAnswer: (id, patch) => mutate(r => ({ ...r, answers: { ...r.answers, [id]: { ...(r.answers[id] ?? {}), ...patch, _at: new Date().toISOString() } } })),
    setRaw: (id, value) => mutate(r => ({ ...r, answers: { ...r.answers, [id]: value } })),
    setReflection: (stage, patch) => mutate(r => {
      const cur = r.reflections[stage] ?? { content: '', process: '', done: false };
      const next = { ...cur, ...patch };
      next.done = next.content.trim().length > 0 && next.process.trim().length > 0;
      return { ...r, reflections: { ...r.reflections, [stage]: next } };
    }),
    toggleUndone: id => mutate(r => ({ ...r, undone: r.undone.includes(id) ? r.undone.filter(x => x !== id) : [...r.undone, id] })),
    logPrompt: (promptId, taskId) => mutate(r => ({ ...r, promptLog: [...r.promptLog, { promptId, taskId, at: new Date().toISOString() }] })),

    startFresh: () => set({ runs: [newRun(1)], demo: false }),
    ensureRun: () => { if (!get().runs.length) set({ runs: [newRun(1)] }); },
    startNextRun: () => {
      const runs = get().runs; const last = runs[runs.length - 1];
      if (!last) return;
      set({ runs: [...runs, newRun(last.number + 1, last)], demo: false });
    },
    copyDemo: () => set({ runs: [{ ...structuredClone(DEMO_RUN), id: Math.random().toString(36).slice(2, 9) }], demo: false }),
    replaceAll: (runs, templates) => set({ runs, templates, demo: false }),
    reset: () => set({ runs: [], templates: {}, demo: false, openTask: {} }),
    setTemplate: (id, values) => set({ templates: { ...get().templates, [id]: values } }),
    setTheme: theme => set({ theme }),
    setPresentation: presentation => set({ presentation }),
    setDemo: demo => set({ demo }),
    setOpenTask: (stage, id) => set({ openTask: { ...get().openTask, [stage]: id } }),
  };
}, {
  name: 'forsight-navigator',
  version: 1,
  storage: createJSONStorage(() => localStorage),
  partialize: s => ({ runs: s.runs, templates: s.templates, theme: s.theme, presentation: s.presentation, demo: s.demo }),
}));

/** Виток, который сейчас показывается: демонстрационный или активный пользовательский. */
export function useRun(): Run | undefined {
  const demo = useStore(s => s.demo);
  const runs = useStore(s => s.runs);
  return demo ? DEMO_RUN : activeRun(runs);
}
export const useReadOnly = () => useStore(s => s.demo);
