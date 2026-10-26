import type { Run, RoadmapPoint, ScoreTriple } from './types';

/** Ключи ячеек сценарной матрицы: А+Б+, А+Б−, А−Б+, А−Б− */
export type Cell = 'pp' | 'pm' | 'mp' | 'mm';
export const CELLS: Cell[] = ['pp', 'pm', 'mp', 'mm'];

export type FactorType = 'Т' | 'С' | 'Э' | 'Д' | 'К';
export type Factor = { id: string; type: FactorType | ''; text: string; evidence: string; kind: 'trend' | 'weak' | ''; impact: string };
export type Contradiction = { id: string; a: string; b: string; factorIds: string[] };
export type Scenario = { title: string; content: string; role: string; indicator: string };
export type Subject = 'student' | 'teacher' | 'university';
export const SUBJECTS: Subject[] = ['student', 'teacher', 'university'];
export type ForkPath = { name: string; cells: Record<Subject, { y1: string; y3: string; y5: string }> };
export type Score = { score: number | null; arg: string };
export type Phase = 'orientation' | 'immersion' | 'consolidation' | 'challenge' | 'transformation' | 'completion';
export const PHASES: Phase[] = ['orientation', 'immersion', 'consolidation', 'challenge', 'transformation', 'completion'];

export type Answers = {
  '0.2': { picks: (number | null)[] };
  '0.3': ScoreTriple & { confirmed: boolean };
  '1.1': { items: string[]; resources: number[] };
  '1.2': { h5: [string, string]; h10: [string, string]; h15: [string, string]; lead: 5 | 10 | 15 | null };
  '1.3': { tasks: string; assets: string; vectors: string };
  '1.4': { rows: { task: string; help: string }[] };
  '2.1': { sources: { title: string; type: string; url: string }[] };
  '2.2': { factors: Factor[]; fragments: string };
  '2.3': { items: Contradiction[] };
  '2.4': { done: boolean; changes: string };
  '3.1': { a: { factor: string; plus: string; minus: string }; b: { factor: string; plus: string; minus: string } };
  '3.2': Record<Cell, Scenario>;
  '3.3': { scenario: Cell | null; fork: string; paths: [ForkPath, ForkPath] };
  '3.4': { own: Record<Cell, { p: number | null; d: number | null }>; panel: Record<Cell, { p: number | null; d: number | null }>; panelNote: string };
  '3.5': { baseFrame: string; ideaFrame: string; role: string; plot: string; drama: string; benefit: string; canon: string; canonOther: string };
  '4.1': { scenario: Cell | null; goal: string };
  '4.2': { points: RoadmapPoint[] };
  '4.3': Partial<Record<Cell, string>>;
  '4.4': {
    title: string; format: string; model: string; outcomes: string[];
    alignment: { outcome: string; strategy: string; assessment: string; mechanic: string }[];
    journey: Record<Phase, string>;
  };
  '4.5': { tasks: { text: string; date: string; done: boolean }[] };
  '5.1': { real: Score; innov: Score; anthro: Score; risks: [string, string, string] };
  '5.2': { map: string; real: Score; innov: Score; anthro: Score; questions: [string, string, string]; condition: string };
  '5.3': { items: { id: string; text: string; decision: 'accepted' | 'rejected' | null; reason: string }[] };
  '5.4': { points: RoadmapPoint[]; savedAt: string | null };
  '5.5': { priorities: string; participants: string; result: string };
  '6.1': { content: string; process: string; premise: string };
  '6.2': { picks: (number | null)[]; mc: number; kp: number; od: number; confirmed: boolean };
  '6.3': { pointIds: string[]; why: string };
  '6.4': { promptIds: number[]; generatedTask: string; conclusion: string };
  '6.5': { problem: string; difference: string; criticalStage: number | null; date: string; occasion: string };
};
export type TaskId = keyof Answers;

const emptyScenario = (): Scenario => ({ title: '', content: '', role: '', indicator: '' });
const emptyPath = (): ForkPath => ({
  name: '',
  cells: { student: { y1: '', y3: '', y5: '' }, teacher: { y1: '', y3: '', y5: '' }, university: { y1: '', y3: '', y5: '' } },
});
const emptyScore = (): Score => ({ score: null, arg: '' });
const pd = () => ({ p: null, d: null });

export const EMPTY: { [K in TaskId]: () => Answers[K] } = {
  '0.2': () => ({ picks: Array(9).fill(null) }),
  '0.3': () => ({ mc: 5, kp: 5, od: 5, confirmed: false }),
  '1.1': () => ({ items: [], resources: [] }),
  '1.2': () => ({ h5: ['', ''], h10: ['', ''], h15: ['', ''], lead: null }),
  '1.3': () => ({ tasks: '', assets: '', vectors: '' }),
  '1.4': () => ({ rows: [{ task: '', help: '' }, { task: '', help: '' }, { task: '', help: '' }] }),
  '2.1': () => ({ sources: [{ title: '', type: '', url: '' }, { title: '', type: '', url: '' }, { title: '', type: '', url: '' }] }),
  '2.2': () => ({ factors: [], fragments: '' }),
  '2.3': () => ({ items: [{ id: 'c1', a: '', b: '', factorIds: [] }] }),
  '2.4': () => ({ done: false, changes: '' }),
  '3.1': () => ({ a: { factor: '', plus: '', minus: '' }, b: { factor: '', plus: '', minus: '' } }),
  '3.2': () => ({ pp: emptyScenario(), pm: emptyScenario(), mp: emptyScenario(), mm: emptyScenario() }),
  '3.3': () => ({ scenario: null, fork: '', paths: [emptyPath(), emptyPath()] }),
  '3.4': () => ({ own: { pp: pd(), pm: pd(), mp: pd(), mm: pd() }, panel: { pp: pd(), pm: pd(), mp: pd(), mm: pd() }, panelNote: '' }),
  '3.5': () => ({ baseFrame: '', ideaFrame: '', role: '', plot: '', drama: '', benefit: '', canon: '', canonOther: '' }),
  '4.1': () => ({ scenario: null, goal: '' }),
  '4.2': () => ({ points: [] }),
  '4.3': () => ({}),
  '4.4': () => ({
    title: '', format: '', model: '', outcomes: ['', '', ''],
    alignment: [{ outcome: '', strategy: '', assessment: '', mechanic: '' }, { outcome: '', strategy: '', assessment: '', mechanic: '' }],
    journey: { orientation: '', immersion: '', consolidation: '', challenge: '', transformation: '', completion: '' },
  }),
  '4.5': () => ({ tasks: Array.from({ length: 5 }, () => ({ text: '', date: '', done: false })) }),
  '5.1': () => ({ real: emptyScore(), innov: emptyScore(), anthro: emptyScore(), risks: ['', '', ''] }),
  '5.2': () => ({ map: '', real: emptyScore(), innov: emptyScore(), anthro: emptyScore(), questions: ['', '', ''], condition: '' }),
  '5.3': () => ({ items: [{ id: 'f1', text: '', decision: null, reason: '' }] }),
  '5.4': () => ({ points: [], savedAt: null }),
  '5.5': () => ({ priorities: '', participants: '', result: '' }),
  '6.1': () => ({ content: '', process: '', premise: '' }),
  '6.2': () => ({ picks: Array(9).fill(null), mc: 5, kp: 5, od: 5, confirmed: false }),
  '6.3': () => ({ pointIds: [], why: '' }),
  '6.4': () => ({ promptIds: [], generatedTask: '', conclusion: '' }),
  '6.5': () => ({ problem: '', difference: '', criticalStage: null, date: '', occasion: '' }),
};

/** Ответ задания с подстановкой пустых значений для отсутствующих полей */
export function ans<K extends TaskId>(run: Run, id: K): Answers[K] {
  const empty = EMPTY[id]();
  const v = run.answers[id] as Partial<Answers[K]> | undefined;
  if (!v) return empty;
  return { ...empty, ...v } as Answers[K];
}

export const t = (s: unknown): string => (typeof s === 'string' ? s.trim() : '');
export const filled = (...xs: unknown[]) => xs.every(x => t(x).length > 0);
export const uid = () => Math.random().toString(36).slice(2, 9);
