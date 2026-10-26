import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Answers, TaskId } from '../lib/answers';
import { ans } from '../lib/answers';
import { buildExport } from '../lib/io';
import { deriveRun, newRun } from '../lib/run';
import type { ExportFile, Profile, ReflectionPause, Run, StageN } from '../lib/types';

export type Theme = 'system' | 'light' | 'dark';

type State = {
  runs: Run[];
  libraryTemplates: Record<string, Record<string, string>>;
  theme: Theme;
  present: boolean;
  mode: 'own' | 'demo';
  demoRuns: Run[];
};

type Actions = {
  startFirstRun: () => void;
  setAnswer: <K extends TaskId>(id: K, value: Answers[K]) => void;
  patchAnswer: <K extends TaskId>(id: K, patch: Partial<Answers[K]>) => void;
  setRaw: (key: string, value: unknown) => void;
  setProfile: (p: Partial<Profile>) => void;
  setReflection: (stage: StageN, p: Partial<ReflectionPause>) => void;
  openStage: (n: number) => void;
  setTaskMark: (id: TaskId, v: boolean | undefined) => void;
  logAi: (promptId: number, taskId: string) => void;
  setAiResponse: (taskId: string, text: string) => void;
  finishRun: () => void;
  startNextRun: () => void;
  setTemplate: (tplId: string, values: Record<string, string>) => void;
  setTheme: (t: Theme) => void;
  setPresent: (v: boolean) => void;
  enterDemo: () => Promise<void>;
  exitDemo: () => void;
  copyDemo: () => Promise<void>;
  importData: (f: ExportFile) => void;
  exportData: () => ExportFile;
  resetAll: () => void;
};

export type Store = State & Actions;

export const activeOf = (runs: Run[]): Run | null => {
  if (!runs.length) return null;
  for (let i = runs.length - 1; i >= 0; i--) if (!runs[i].finishedAt) return runs[i];
  return runs[runs.length - 1];
};

/** Демо-пример грузится отдельным чанком только по требованию */
const loadDemo = async () => [deriveRun(structuredClone((await import('../demo/demoRun')).DEMO_RUN))];

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Изменение активного витка; в демо-режиме ничего не меняет (просмотр) */
      const update = (fn: (r: Run) => Run) => {
        const s = get();
        if (s.mode === 'demo') return;
        const a = activeOf(s.runs);
        if (!a || a.finishedAt) return;
        set({ runs: s.runs.map(r => (r.id === a.id ? deriveRun(fn(r)) : r)) });
      };
      return {
        runs: [],
        libraryTemplates: {},
        theme: 'system',
        present: false,
        mode: 'own',
        demoRuns: [],

        startFirstRun: () => {
          if (get().runs.length) return;
          set({ runs: [newRun(1)], mode: 'own' });
        },
        setAnswer: (id, value) => update(r => ({ ...r, answers: { ...r.answers, [id]: value } })),
        patchAnswer: (id, patch) => update(r => ({ ...r, answers: { ...r.answers, [id]: { ...ans(r, id), ...patch } } })),
        setRaw: (key, value) => update(r => ({ ...r, answers: { ...r.answers, [key]: value } })),
        setProfile: p => update(r => ({ ...r, profile: { ...r.profile, ...p } })),
        setReflection: (stage, p) => update(r => ({ ...r, reflections: { ...r.reflections, [stage]: { ...r.reflections[stage], ...p } } })),
        openStage: n => update(r => (r.opened.includes(n) ? r : { ...r, opened: [...r.opened, n].sort() })),
        setTaskMark: (id, v) => update(r => {
          const m = { ...r.taskMarks };
          if (v === undefined) delete m[id]; else m[id] = v;
          return { ...r, taskMarks: m };
        }),
        logAi: (promptId, taskId) => update(r => ({ ...r, aiLog: [...r.aiLog, { promptId, taskId, at: new Date().toISOString() }] })),
        setAiResponse: (taskId, text) => update(r => ({ ...r, aiResponses: { ...r.aiResponses, [taskId]: text } })),
        finishRun: () => update(r => ({ ...r, finishedAt: new Date().toISOString() })),
        startNextRun: () => {
          const s = get();
          const list = s.mode === 'demo' ? s.demoRuns : s.runs;
          const last = list[list.length - 1];
          if (!last || !last.finishedAt) return;
          const next = newRun(last.number + 1, new Date(), last);
          if (s.mode === 'demo') set({ demoRuns: [...s.demoRuns, next] });
          else set({ runs: [...s.runs, next] });
        },
        setTemplate: (tplId, values) => set(s => ({ libraryTemplates: { ...s.libraryTemplates, [tplId]: values } })),
        setTheme: theme => set({ theme }),
        setPresent: present => set({ present }),
        enterDemo: async () => {
          const demoRuns = get().demoRuns.length ? get().demoRuns : await loadDemo();
          set({ mode: 'demo', demoRuns });
        },
        exitDemo: () => set({ mode: 'own', demoRuns: [] }),
        copyDemo: async () => {
          const s = get();
          const src = s.demoRuns[0] ?? (await loadDemo())[0];
          const num = (s.runs[s.runs.length - 1]?.number ?? 0) + 1;
          const copy: Run = { ...structuredClone(src), id: `run-copy-${Date.now().toString(36)}`, number: num, isDemoCopy: true, finishedAt: undefined };
          set({ runs: [...s.runs, deriveRun(copy)], mode: 'own', demoRuns: [] });
        },
        importData: f => set({ runs: f.runs, libraryTemplates: f.libraryTemplates, mode: 'own', demoRuns: [] }),
        exportData: () => buildExport(get().runs, get().libraryTemplates),
        resetAll: () => set({ runs: [], libraryTemplates: {}, mode: 'own', demoRuns: [] }),
      };
    },
    {
      name: 'forsight-navigator',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Витки текущего режима (свои или демонстрационные) */
export const useRuns = () => useStore(s => (s.mode === 'demo' ? s.demoRuns : s.runs));
export const useActiveRun = () => useStore(s => activeOf(s.mode === 'demo' ? s.demoRuns : s.runs));
export const useReadOnly = () => useStore(s => {
  if (s.mode === 'demo') return true;
  const a = activeOf(s.runs);
  return !a || !!a.finishedAt;
});
