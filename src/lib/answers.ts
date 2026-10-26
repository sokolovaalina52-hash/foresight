// Схемы ответов по заданиям и безопасные геттеры с пустыми значениями по умолчанию.
import type { Run, RoadmapRow } from './types';

export type FactorType = 'Т' | 'С' | 'Э' | 'Д' | 'К';
export type Factor = { id: string; type: FactorType | ''; text: string; evidence: string; kind: 'trend' | 'weak' | ''; impact: string };
export type Contradiction = { id: string; a: string; b: string; factorIds: string[] };
export type Scenario = { title: string; content: string; role: string; indicator: string };
export type Criterion = { score: number | null; arg: string };
export type Criteria = { real: Criterion; innov: Criterion; anthro: Criterion };
export type Subject = 'student' | 'teacher' | 'university';
export type ForkPath = { label: string; cells: Record<Subject, [string, string, string]> };

export type A = {
  '0.2': { answers: (number | null)[] };
  '0.3': { mc: number; kp: number; od: number };
  '1.1': { checked: string[] };
  '1.2': { h5: [string, string]; h10: [string, string]; h15: [string, string]; lead: 5 | 10 | 15 | null };
  '1.3': { tasks: string; assets: string; vectors: string[] };
  '1.4': { rows: { task: string; help: string }[] };
  '2.1': { sources: { id: string; title: string; type: string; url: string }[] };
  '2.2': { factors: Factor[]; fragments: string };
  '2.3': { items: Contradiction[] };
  '2.4': { discussed: boolean; changes: string };
  '3.1': { a: { factor: string; plus: string; minus: string }; b: { factor: string; plus: string; minus: string } };
  '3.2': { q: [Scenario, Scenario, Scenario, Scenario] };
  '3.3': { scenario: number | null; fork: string; paths: [ForkPath, ForkPath] };
  '3.4': { votes: { p: number | null; d: number | null }[]; panel: string };
  '3.5': { base: string; idea: string; role: string; plot: string; drama: string; benefit: string; canon: string; canonOther: string };
  '4.1': { scenario: number | null; goal: string };
  '4.2': { rows: RoadmapRow[] };
  '4.3': { others: Record<string, string> };
  '4.4': {
    title: string; format: string; model: string; outcomes: string[];
    align: { outcome: string; strategy: string; assessment: string; mechanic: string }[];
    journey: Record<string, string>;
  };
  '4.5': { tasks: { text: string; date: string }[] };
  '5.1': { criteria: Criteria; risks: [string, string, string] };
  '5.2': { peerMap: string; criteria: Criteria; questions: [string, string, string]; condition: string };
  '5.3': { feedback: string; items: { id: string; text: string; decision: 'accepted' | 'rejected' | ''; reason: string }[] };
  '5.4': { rows: RoadmapRow[]; saved: boolean; savedAt: string };
  '5.5': { groupSize: string; priorities: string; result: string };
  '6.1': { content: string; process: string; premise: string };
  '6.2': { answers: (number | null)[]; mc: number; kp: number; od: number };
  '6.3': { selected: string[]; why: string };
  '6.4': { prompts: number[]; generated: string; conclusion: string };
  '6.5': { problem: string; diff: string; critical: number | null; date: string; occasion: string };
};
export type AnswerId = keyof A;

const emptyFork = (): ForkPath => ({ label: '', cells: { student: ['', '', ''], teacher: ['', '', ''], university: ['', '', ''] } });
const emptyCriteria = (): Criteria => ({ real: { score: null, arg: '' }, innov: { score: null, arg: '' }, anthro: { score: null, arg: '' } });
const emptyScenario = (): Scenario => ({ title: '', content: '', role: '', indicator: '' });

export const DEFAULTS: { [K in AnswerId]: () => A[K] } = {
  '0.2': () => ({ answers: Array(9).fill(null) }),
  '0.3': () => ({ mc: 5, kp: 5, od: 5 }),
  '1.1': () => ({ checked: [] }),
  '1.2': () => ({ h5: ['', ''], h10: ['', ''], h15: ['', ''], lead: null }),
  '1.3': () => ({ tasks: '', assets: '', vectors: ['', '', ''] }),
  '1.4': () => ({ rows: [{ task: '', help: '' }, { task: '', help: '' }, { task: '', help: '' }] }),
  '2.1': () => ({ sources: [] }),
  '2.2': () => ({ factors: [], fragments: '' }),
  '2.3': () => ({ items: [] }),
  '2.4': () => ({ discussed: false, changes: '' }),
  '3.1': () => ({ a: { factor: '', plus: '', minus: '' }, b: { factor: '', plus: '', minus: '' } }),
  '3.2': () => ({ q: [emptyScenario(), emptyScenario(), emptyScenario(), emptyScenario()] }),
  '3.3': () => ({ scenario: null, fork: '', paths: [emptyFork(), emptyFork()] }),
  '3.4': () => ({ votes: [0, 1, 2, 3].map(() => ({ p: null, d: null })), panel: '' }),
  '3.5': () => ({ base: '', idea: '', role: '', plot: '', drama: '', benefit: '', canon: '', canonOther: '' }),
  '4.1': () => ({ scenario: null, goal: '' }),
  '4.2': () => ({ rows: [] }),
  '4.3': () => ({ others: {} }),
  '4.4': () => ({ title: '', format: '', model: '', outcomes: ['', '', ''], align: [], journey: {} }),
  '4.5': () => ({ tasks: [0, 1, 2, 3, 4].map(() => ({ text: '', date: '' })) }),
  '5.1': () => ({ criteria: emptyCriteria(), risks: ['', '', ''] }),
  '5.2': () => ({ peerMap: '', criteria: emptyCriteria(), questions: ['', '', ''], condition: '' }),
  '5.3': () => ({ feedback: '', items: [] }),
  '5.4': () => ({ rows: [], saved: false, savedAt: '' }),
  '5.5': () => ({ groupSize: '', priorities: '', result: '' }),
  '6.1': () => ({ content: '', process: '', premise: '' }),
  '6.2': () => ({ answers: Array(9).fill(null), mc: 5, kp: 5, od: 5 }),
  '6.3': () => ({ selected: [], why: '' }),
  '6.4': () => ({ prompts: [], generated: '', conclusion: '' }),
  '6.5': () => ({ problem: '', diff: '', critical: null, date: '', occasion: '' }),
};

/** Ответ задания с подставленными значениями по умолчанию для отсутствующих полей. */
export function ans<K extends AnswerId>(run: Run | undefined, id: K): A[K] {
  const d = DEFAULTS[id]();
  const v = run?.answers?.[id];
  return v && typeof v === 'object' ? { ...d, ...v } : d;
}

export const filled = (s: unknown): boolean => typeof s === 'string' ? s.trim().length > 0 : s !== null && s !== undefined;
export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const SCENARIO_LABELS = ['Сценарий 1 (А+, Б+)', 'Сценарий 2 (А+, Б−)', 'Сценарий 3 (А−, Б+)', 'Сценарий 4 (А−, Б−)'];
export const FACTOR_TYPES: { id: FactorType; name: string }[] = [
  { id: 'Т', name: 'технологический' }, { id: 'С', name: 'социальный' }, { id: 'Э', name: 'экономический' },
  { id: 'Д', name: 'демографический' }, { id: 'К', name: 'культурный' },
];
export const SUBJECTS: { id: Subject; name: string }[] = [
  { id: 'student', name: 'Студент' }, { id: 'teacher', name: 'Преподаватель' }, { id: 'university', name: 'Университет' },
];
export const HORIZONS: { id: RoadmapRow['horizon']; name: string }[] = [
  { id: '1', name: '1 год' }, { id: '3', name: '3 года' }, { id: '5', name: '5 лет' }, { id: '10-15', name: '10–15 лет — ориентир' },
];
export const JOURNEY_PHASES = ['ориентация', 'погружение', 'консолидация', 'вызов', 'трансформация', 'завершение'];
export const CRITERIA: { id: keyof Criteria; name: string; hint: string }[] = [
  { id: 'real', name: 'Реалистичность', hint: 'оценка 1–10 и аргументы: сроки, ресурсы, измеримость' },
  { id: 'innov', name: 'Инновационность', hint: 'оценка 1–10 и аргументы: новизна проектных решений' },
  { id: 'anthro', name: 'Антропологическая состоятельность', hint: 'оценка 1–10 и аргументы: работает ли карта на развитие человека, а не только на показатели' },
];

/** Сценарий по индексу 0–3 из задания 3.2 с запасным названием. */
export function scenarioTitle(run: Run | undefined, i: number | null): string {
  if (i === null || i === undefined) return '';
  const s = ans(run, '3.2').q[i];
  return s?.title?.trim() || SCENARIO_LABELS[i];
}
