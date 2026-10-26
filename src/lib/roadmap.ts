// Версии дорожной карты и сравнение v1 → v2.
import { ans, HORIZONS } from './answers';
import type { Roadmap, RoadmapRow, Run } from './types';

export const ROW_FIELDS: { k: keyof Omit<RoadmapRow, 'id'>; name: string }[] = [
  { k: 'horizon', name: 'Горизонт' }, { k: 'point', name: 'Ключевая точка' }, { k: 'todo', name: 'Что должно быть сделано' },
  { k: 'resources', name: 'Ресурсы' }, { k: 'indicator', name: 'Измеримый индикатор' },
];
export const horizonName = (h: string) => HORIZONS.find(x => x.id === h)?.name ?? h;

const order = (h: string) => HORIZONS.findIndex(x => x.id === h);
export const sortRows = (rows: RoadmapRow[]) => [...rows].sort((a, b) => order(a.horizon) - order(b.horizon));

/** Версии карты витка: v1 — задание 4.2, v2 — сохранённая корректировка 5.4. */
export function roadmapVersions(run: Run): Roadmap[] {
  const out: Roadmap[] = [];
  const v1 = ans(run, '4.2').rows;
  if (v1.length) out.push({ version: 1, label: 'v1 — после IV этапа', rows: v1, savedAt: run.products.p4?.updatedAt ?? run.startedAt });
  const v2 = ans(run, '5.4');
  if (v2.saved) out.push({ version: 2, label: 'v2 — после экспертизы', rows: v2.rows, savedAt: v2.savedAt });
  return out;
}

export type RowChange = { id: string; field: string; from: string; to: string };
export type RoadmapDiff = { added: RoadmapRow[]; removed: RoadmapRow[]; changed: { row: RoadmapRow; changes: RowChange[] }[] };

export function diffRoadmaps(a: RoadmapRow[], b: RoadmapRow[]): RoadmapDiff {
  const byId = new Map(a.map(r => [r.id, r]));
  const bIds = new Set(b.map(r => r.id));
  const added = b.filter(r => !byId.has(r.id));
  const removed = a.filter(r => !bIds.has(r.id));
  const changed = b.flatMap(r => {
    const old = byId.get(r.id); if (!old) return [];
    const changes = ROW_FIELDS.filter(f => (old[f.k] ?? '').trim() !== (r[f.k] ?? '').trim())
      .map(f => ({ id: r.id, field: f.name, from: f.k === 'horizon' ? horizonName(old[f.k]) : old[f.k], to: f.k === 'horizon' ? horizonName(r[f.k]) : r[f.k] }));
    return changes.length ? [{ row: r, changes }] : [];
  });
  return { added, removed, changed };
}

export const diffIsEmpty = (d: RoadmapDiff) => !d.added.length && !d.removed.length && !d.changed.length;
