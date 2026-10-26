import { ROADMAP_HORIZONS } from '../content/tasks';
import type { RoadmapPoint } from './types';

export type RoadmapDiff = {
  added: RoadmapPoint[];
  removed: RoadmapPoint[];
  changed: { before: RoadmapPoint; after: RoadmapPoint; fields: (keyof RoadmapPoint)[] }[];
  unchanged: RoadmapPoint[];
};

const FIELDS: (keyof RoadmapPoint)[] = ['horizon', 'title', 'todo', 'resources', 'indicator'];
export const FIELD_LABELS: Record<string, string> = {
  horizon: 'горизонт', title: 'точка', todo: 'что должно быть сделано', resources: 'ресурсы', indicator: 'индикатор',
};

/** Сравнение версий карты: точки сопоставляются по id (копия v1 → v2 сохраняет id) */
export function diffRoadmap(before: RoadmapPoint[], after: RoadmapPoint[]): RoadmapDiff {
  const norm = (s: string) => (s || '').trim();
  const bMap = new Map(before.map(p => [p.id, p]));
  const aIds = new Set(after.map(p => p.id));
  const res: RoadmapDiff = { added: [], removed: [], changed: [], unchanged: [] };
  for (const p of after) {
    const b = bMap.get(p.id);
    if (!b) { res.added.push(p); continue; }
    const fields = FIELDS.filter(f => norm(b[f]) !== norm(p[f]));
    if (fields.length) res.changed.push({ before: b, after: p, fields });
    else res.unchanged.push(p);
  }
  for (const b of before) if (!aIds.has(b.id)) res.removed.push(b);
  return res;
}

export const horizonLabel = (h: string) => ROADMAP_HORIZONS.find(x => x.k === h)?.label ?? h;
const ORDER = ['1', '3', '5', '10-15'];
export const sortPoints = (pts: RoadmapPoint[]) =>
  [...pts].sort((a, b) => ORDER.indexOf(a.horizon) - ORDER.indexOf(b.horizon));

export function diffMarkdown(d: RoadmapDiff): string {
  const lines: string[] = [];
  if (d.changed.length) {
    lines.push('**Изменено:**');
    d.changed.forEach(c => lines.push(`- ${c.after.title || c.before.title} — ${c.fields.map(f => `${FIELD_LABELS[f]}: «${c.before[f] || '—'}» → «${c.after[f] || '—'}»`).join('; ')}`));
  }
  if (d.added.length) { lines.push('**Добавлено:**'); d.added.forEach(p => lines.push(`- [${horizonLabel(p.horizon)}] ${p.title}`)); }
  if (d.removed.length) { lines.push('**Удалено:**'); d.removed.forEach(p => lines.push(`- [${horizonLabel(p.horizon)}] ${p.title}`)); }
  if (!lines.length) lines.push('Изменений нет.');
  return lines.join('\n');
}
