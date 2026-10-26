// Подстановка ответов пользователя в квадратные скобки промптов. Скобки без данных остаются как есть.
import { DIAG_Q } from '../content/model';
import { PROMPTS } from '../content/prompts';
import { STAGES } from '../content/model';
import { ans, filled, FACTOR_TYPES, scenarioTitle } from './answers';
import { horizonName, sortRows } from './roadmap';
import { DEFICITS } from './tasks';
import type { RoadmapRow, Run } from './types';

type Resolver = (run: Run, extra: PromptExtra) => string | undefined;
export type PromptExtra = { mapText?: string; rows?: RoadmapRow[] };
export type Segment = { text: string; filled?: boolean; bold?: boolean };

const val = (s: string | undefined | null) => (s && s.trim() ? s.trim() : undefined);
const list = (items: string[]) => (items.length ? items.map((x, i) => `${i + 1}. ${x}`).join('\n') : undefined);

export function deficitLabels(run: Run): string[] {
  const c = ans(run, '1.1').checked;
  return DEFICITS.filter(d => c.includes(d.id) || (d.id === 'digital' && c.some(x => x.startsWith('rg')))).map(d => d.label);
}

export function factorsText(run: Run): string | undefined {
  const f = ans(run, '2.2').factors.filter(x => filled(x.text));
  return list(f.map(x => `${x.text} (${x.type || '?'}; ${x.kind === 'weak' ? 'слабый сигнал' : 'тренд'})`));
}

export function contradictionsText(run: Run): string | undefined {
  return list(ans(run, '2.3').items.filter(x => filled(x.a) && filled(x.b)).map(x => `между ${x.a.trim()} и ${x.b.trim()}`));
}

export function roadmapText(rows: RoadmapRow[]): string | undefined {
  const r = sortRows(rows).filter(x => filled(x.point));
  if (!r.length) return undefined;
  return ['горизонт | ключевая точка | ресурсы | индикатор', ...r.map(x => `${horizonName(x.horizon)} | ${x.point} | ${x.resources || '—'} | ${x.indicator || '—'}`)].join('\n');
}

function scenarioDescription(run: Run, i: number | null): string | undefined {
  if (i === null) return undefined;
  const s = ans(run, '3.2').q[i];
  if (!s || !filled(s.title)) return undefined;
  return `${s.title}${filled(s.content) ? ` — ${s.content.trim()}` : ''}${filled(s.role) ? ` Роль преподавателя: ${s.role.trim()}` : ''}`;
}

function diagAnswersText(run: Run): string | undefined {
  const a = ans(run, '0.2').answers;
  const items = DIAG_Q.map((q, i) => (a[i] !== null && a[i] !== undefined ? `${q.q} ${q.o[a[i] as number]}` : null)).filter(Boolean) as string[];
  return list(items);
}

function pausesText(run: Run): string | undefined {
  const parts = STAGES.slice(0, 5).map(s => {
    const p = run.reflections[s.n];
    if (!p || (!filled(p.content) && !filled(p.process))) return null;
    return `${s.roman}. ${s.name}: ${[p.content, p.process].filter(filled).map(x => x.trim()).join(' / ')}`;
  }).filter(Boolean) as string[];
  return parts.length ? parts.join('\n') : undefined;
}

const discipline: Resolver = r => val(r.profile.discipline);

const MAP: Record<number, Record<string, Resolver>> = {
  1: {
    'дисциплина': discipline,
    'N': r => (r.profile.experienceYears ? String(r.profile.experienceYears) : undefined),
    'вставьте 5–7 ответов своими словами': diagAnswersText,
  },
  2: {
    'дисциплина': discipline,
    'тип вуза': r => val(r.profile.university),
    '3–4 задачи': r => val(ans(r, '1.3').tasks),
    '2–3 тревоги или дефицита': r => val(deficitLabels(r).join('; ')),
  },
  3: {
    'область': discipline,
    '5–10': r => String(r.profile.horizon),
    'вставьте фрагменты аннотаций, новостей, документов или перечислите источники': r =>
      val(ans(r, '2.2').fragments) ?? list(ans(r, '2.1').sources.filter(s => filled(s.title)).map(s => `${s.title}${s.url ? ` (${s.url})` : ''}`)),
  },
  4: { 'список 6–10 позиций': factorsText },
  5: {
    '2–3 противоречия': contradictionsText,
    'год': r => String(new Date(r.startedAt).getFullYear() + r.profile.horizon),
  },
  6: {
    'название и краткое описание': r => scenarioDescription(r, ans(r, '3.3').scenario),
    'событие или решение, которое может пойти двумя путями': r => val(ans(r, '3.3').fork),
  },
  7: {
    'название': r => (ans(r, '4.1').scenario !== null ? scenarioTitle(r, ans(r, '4.1').scenario) : undefined),
    'цель': r => val(ans(r, '4.1').goal),
    'компетенции, ресурсы, ограничения': r => {
      const assets = val(ans(r, '1.3').assets); const d = deficitLabels(r);
      return val([assets && `ресурсы — ${assets}`, d.length && `дефициты — ${d.join(', ')}`].filter(Boolean).join('; '));
    },
  },
  8: {
    'вставьте таблицу горизонт | ключевая точка | ресурсы | индикатор': (r, x) => roadmapText(x.rows ?? ans(r, '4.2').rows),
    'описание': r => scenarioDescription(r, ans(r, '4.1').scenario),
  },
  9: { 'вставьте карту': (r, x) => val(x.mapText) ?? val(ans(r, '5.2').peerMap) },
  10: {
    'N': r => val(ans(r, '5.5').groupSize),
    'перечислите кратко, кто что считает приоритетом': r => val(ans(r, '5.5').priorities),
  },
  11: { 'вставьте заметки по этапам': pausesText },
  12: {
    'краткое описание': r => {
      const goal = val(ans(r, '4.1').goal); const v = ans(r, '5.4');
      const rows = v.saved ? v.rows : ans(r, '4.2').rows;
      const pts = sortRows(rows).filter(x => filled(x.point)).map(x => `${horizonName(x.horizon)}: ${x.point}`);
      return val([goal && `цель — ${goal}`, pts.length && `ключевые точки — ${pts.join('; ')}`].filter(Boolean).join('; '));
    },
    'вывод': r => val(ans(r, '6.1').content),
    'допущение': r => val(ans(r, '6.1').premise),
    'аттестация, новый семестр, новая технология': r => {
      const a = ans(r, '6.5'); return val([a.occasion, a.date].filter(filled).join(', '));
    },
  },
  13: { 'дисциплина': discipline },
};

/** Разбивает текст промпта на сегменты: жирные метки, подставленные значения и обычный текст. */
export function fillPromptSegments(promptId: number, run: Run | undefined, extra: PromptExtra = {}): Segment[] {
  const p = PROMPTS.find(x => x.id === promptId);
  if (!p) return [];
  const map = MAP[promptId] ?? {};
  const out: Segment[] = [];
  for (const part of p.text.split(/(<b>.*?<\/b>)/)) {
    if (!part) continue;
    const b = part.match(/^<b>(.*)<\/b>$/);
    if (b) { out.push({ text: b[1], bold: true }); continue; }
    let last = 0;
    for (const m of part.matchAll(/\[([^\]]+)\]/g)) {
      const value = run && map[m[1]] ? map[m[1]](run, extra) : undefined;
      if (m.index! > last) out.push({ text: part.slice(last, m.index) });
      out.push(value ? { text: value, filled: true } : { text: m[0] });
      last = m.index! + m[0].length;
    }
    if (last < part.length) out.push({ text: part.slice(last) });
  }
  return out;
}

/** Текст промпта для копирования: с подставленными ответами, без разметки. */
export function fillPrompt(promptId: number, run: Run | undefined, extra: PromptExtra = {}): string {
  return fillPromptSegments(promptId, run, extra).map(s => s.text).join('');
}

/** Исходный текст промпта без разметки, со скобками. */
export const rawPrompt = (promptId: number) => (PROMPTS.find(x => x.id === promptId)?.text ?? '').replace(/<\/?b>/g, '');

export const factorTypeName = (t: string) => FACTOR_TYPES.find(x => x.id === t)?.name ?? '';
