import { PROMPTS } from '../content/prompts';
import { STAGES } from '../content/model';
import { DEFICITS, FACTOR_TYPES } from '../content/tasks';
import { DIAG_Q } from '../content/diagnostics';
import { ans, CELLS, t } from './answers';
import { contradictionText, scenarioTitle } from './products';
import { horizonLabel, sortPoints } from './roadmap';
import type { Run, StageN } from './types';

type Resolver = (run: Run, ctx: { taskId?: string; now: Date }) => string;

const discipline: Resolver = r => t(r.profile.discipline);
const factorsList = (r: Run) => ans(r, '2.2').factors.filter(f => t(f.text))
  .map((f, i) => `${i + 1}) ${f.text} (${f.type || '?'}${f.type ? ` — ${FACTOR_TYPES.find(x => x.k === f.type)?.label}` : ''}; ${f.kind === 'weak' ? 'слабый сигнал' : 'тренд'})`).join('; ');
const contradictions = (r: Run) => ans(r, '2.3').items.filter(c => t(c.a) && t(c.b)).map(c => contradictionText(c)).join('; ');
const targetCell = (r: Run) => ans(r, '4.1').scenario;
const scenarioDescr = (r: Run, c: ReturnType<typeof targetCell>) => {
  if (!c) return '';
  const s = ans(r, '3.2')[c];
  const parts = [t(s.content) && `содержание дисциплины: ${t(s.content)}`, t(s.role) && `роль преподавателя: ${t(s.role)}`, t(s.indicator) && `ранний индикатор: ${t(s.indicator)}`].filter(Boolean);
  return `«${scenarioTitle(r, c)}»${parts.length ? ` — ${parts.join('; ')}` : ''}`;
};
const roadmapLines = (r: Run) => sortPoints(ans(r, '4.2').points.filter(p => t(p.title)))
  .map(p => `${horizonLabel(p.horizon)} | ${t(p.title)} | ${t(p.resources) || '—'} | ${t(p.indicator) || '—'}`).join('\n');
export const roadmapPlain = (r: Run) => {
  const g = ans(r, '4.1');
  const lines = roadmapLines(r);
  if (!lines) return '';
  return `Целевой сценарий: ${scenarioTitle(r, g.scenario)}. Цель: ${t(g.goal) || '—'}.\nгоризонт | ключевая точка | ресурсы | индикатор\n${lines}`;
};
const pauses = (r: Run) => ([1, 2, 3, 4, 5] as StageN[]).map(n => {
  const p = r.reflections[n];
  if (!p || (!t(p.content) && !t(p.process))) return '';
  return `${STAGES[n - 1].roman}. ${STAGES[n - 1].name} — что сделано: ${t(p.content) || '—'}; как это получалось: ${t(p.process) || '—'}`;
}).filter(Boolean).join('\n');

/** Подстановки по промптам: текст в квадратных скобках → ответ пользователя */
const MAP: Record<number, Record<string, Resolver>> = {
  1: {
    'дисциплина': discipline,
    'N': r => (r.profile.experienceYears ? String(r.profile.experienceYears) : ''),
    'вставьте 5–7 ответов своими словами': r => {
      const picks = ans(r, '0.2').picks;
      if (picks.some(p => p == null)) return '';
      return DIAG_Q.map((q, i) => `«${q.q} ${q.o[picks[i] as number]}»`).join('; ');
    },
  },
  2: {
    'дисциплина': discipline,
    'тип вуза': r => t(r.profile.university),
    '3–4 задачи': r => t(ans(r, '1.3').tasks),
    '2–3 тревоги или дефицита': r => DEFICITS.filter(d => ans(r, '1.1').items.includes(d.id)).map(d => d.label).join(', '),
  },
  3: {
    'область': discipline,
    '5–10': r => (r.profile.horizon ? String(r.profile.horizon) : ''),
    'вставьте фрагменты аннотаций, новостей, документов или перечислите источники': r => {
      const fr = t(ans(r, '2.2').fragments);
      if (fr) return fr;
      return ans(r, '2.1').sources.filter(s => t(s.title)).map(s => `${t(s.title)}${t(s.url) ? ` (${t(s.url)})` : ''}`).join('; ');
    },
  },
  4: { 'список 6–10 позиций': factorsList },
  5: {
    '2–3 противоречия': contradictions,
    'год': (r, { now }) => (r.profile.horizon ? `${now.getFullYear() + r.profile.horizon} год` : ''),
  },
  6: {
    'название и краткое описание': r => scenarioDescr(r, ans(r, '3.3').scenario),
    'событие или решение, которое может пойти двумя путями': r => t(ans(r, '3.3').fork),
  },
  7: {
    'название': r => { const c = targetCell(r); return c ? scenarioTitle(r, c) : ''; },
    'цель': r => t(ans(r, '4.1').goal),
    'компетенции, ресурсы, ограничения': r => {
      const def = DEFICITS.filter(d => ans(r, '1.1').items.includes(d.id)).map(d => d.label).join(', ');
      const assets = t(ans(r, '1.3').assets);
      return [assets && `ресурсы и возможности: ${assets}`, def && `дефициты: ${def}`].filter(Boolean).join('; ');
    },
  },
  8: {
    'вставьте таблицу горизонт | ключевая точка | ресурсы | индикатор': r => roadmapLines(r) && `\nгоризонт | ключевая точка | ресурсы | индикатор\n${roadmapLines(r)}\n`,
    'описание': r => scenarioDescr(r, targetCell(r)),
  },
  9: {
    'вставьте карту': (r, { taskId }) => (taskId === '5.3' ? roadmapPlain(r) : t(ans(r, '5.2').map)),
  },
  10: {
    'N': r => t(ans(r, '5.5').participants),
    'перечислите кратко, кто что считает приоритетом': r => t(ans(r, '5.5').priorities),
  },
  11: { 'вставьте заметки по этапам': pauses },
  12: {
    'краткое описание': r => {
      const g = ans(r, '4.1');
      return t(g.goal) ? `«${t(g.goal)}» (сценарий «${scenarioTitle(r, g.scenario)}»)` : '';
    },
    'вывод': r => t(ans(r, '6.1').content),
    'допущение': r => t(ans(r, '6.1').premise),
    'аттестация, новый семестр, новая технология': r => {
      const a = ans(r, '6.5');
      return [t(a.occasion), t(a.date)].filter(Boolean).join(', ');
    },
  },
  13: { 'дисциплина': discipline },
};

export type Segment = { kind: 'text' | 'label' | 'fill' | 'missing'; value: string };

/** Разбирает промпт на сегменты: подписи <b>, подставленные ответы и оставшиеся квадратные скобки */
export function fillPromptSegments(id: number, run: Run | null, opts: { taskId?: string; now?: Date } = {}): Segment[] {
  const p = PROMPTS.find(x => x.id === id);
  if (!p) return [];
  const map = MAP[id] || {};
  const ctx = { taskId: opts.taskId, now: opts.now ?? new Date() };
  const out: Segment[] = [];
  const re = /<b>(.*?)<\/b>|\[([^\]]+)\]/g;
  let last = 0;
  for (const m of p.text.matchAll(re)) {
    if (m.index! > last) out.push({ kind: 'text', value: p.text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: 'label', value: m[1] });
    else {
      const key = m[2];
      const val = run && map[key] ? map[key](run, ctx) : '';
      out.push(val ? { kind: 'fill', value: val } : { kind: 'missing', value: `[${key}]` });
    }
    last = m.index! + m[0].length;
  }
  if (last < p.text.length) out.push({ kind: 'text', value: p.text.slice(last) });
  return out;
}

/** Готовый к копированию текст промпта с подстановкой ответов */
export function fillPrompt(id: number, run: Run | null, opts: { taskId?: string; now?: Date } = {}): string {
  return fillPromptSegments(id, run, opts).map(s => s.value).join('');
}

export const stripTags = (s: string) => s.replace(/<\/?b>/g, '');
export const promptKeys = (id: number) => Object.keys(MAP[id] || {});
export const allPromptIds = () => PROMPTS.map(p => p.id);
export { CELLS };
