// Редактируемая таблица ключевых точек дорожной карты и сравнение версий.
import { HORIZONS, uid } from '../lib/answers';
import { diffIsEmpty, diffRoadmaps, horizonName, ROW_FIELDS } from '../lib/roadmap';
import type { RoadmapRow } from '../lib/types';
import { useReadOnly } from '../store/store';
import { EditButton } from './fields';

export const emptyRow = (horizon: RoadmapRow['horizon'] = '1'): RoadmapRow => ({ id: uid(), horizon, point: '', todo: '', resources: '', indicator: '' });

export function RoadmapEditor({ rows, onChange, caption }: { rows: RoadmapRow[]; onChange: (rows: RoadmapRow[]) => void; caption: string }) {
  const ro = useReadOnly();
  const upd = (i: number, p: Partial<RoadmapRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  return (
    <div className="stack">
      <div className="tbl-wrap">
        <table style={{ minWidth: '52rem' }}>
          <caption className="sr-only">{caption}</caption>
          <thead><tr>{ROW_FIELDS.map(f => <th key={f.k} scope="col">{f.name}</th>)}{!ro && <th scope="col"><span className="sr-only">Действия</span></th>}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td style={{ width: '9rem' }}>
                  <select aria-label={`Горизонт, точка ${i + 1}`} value={r.horizon} disabled={ro} onChange={e => upd(i, { horizon: e.target.value as RoadmapRow['horizon'] })}>
                    {HORIZONS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </td>
                {(['point', 'todo', 'resources', 'indicator'] as const).map(k => (
                  <td key={k}><textarea aria-label={`${ROW_FIELDS.find(f => f.k === k)!.name}, точка ${i + 1}`} rows={2} readOnly={ro} value={r[k]} onChange={e => upd(i, { [k]: e.target.value })} /></td>
                ))}
                {!ro && <td><button type="button" className="btn sm" aria-label={`Удалить точку ${i + 1}`} onClick={() => onChange(rows.filter(x => x.id !== r.id))}>Удалить</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div><EditButton onClick={() => onChange([...rows, emptyRow(rows.length >= 3 ? '10-15' : (['1', '3', '5'] as const)[rows.length])])}>Добавить точку</EditButton></div>
    </div>
  );
}

export function RoadmapDiffView({ a, b }: { a: RoadmapRow[]; b: RoadmapRow[] }) {
  const d = diffRoadmaps(a, b);
  if (diffIsEmpty(d)) return <p className="small muted">Отличий между версиями пока нет.</p>;
  return (
    <ul className="stack" style={{ gap: '.35rem', listStyle: 'none', padding: 0 }} aria-label="Изменения v1 → v2">
      {d.changed.map(c => c.changes.map((ch, i) => (
        <li key={`${c.row.id}-${i}`}><span className="pill warn">изменено</span> <b>{c.row.point || '—'}</b> — {ch.field}: <span className="diff-del">{ch.from || '—'}</span> → <span className="diff-mod">{ch.to || '—'}</span></li>
      )))}
      {d.added.map(r => <li key={r.id}><span className="pill ok">добавлено</span> {horizonName(r.horizon)} — <span className="diff-add">{r.point || '—'}</span></li>)}
      {d.removed.map(r => <li key={r.id}><span className="pill">удалено</span> {horizonName(r.horizon)} — <span className="diff-del">{r.point || '—'}</span></li>)}
    </ul>
  );
}
