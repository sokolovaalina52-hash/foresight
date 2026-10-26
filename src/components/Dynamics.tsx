// Экран «до / после»: установка на входе и выходе, три компонента и Sинт столбиками.
import { attitudeName, COMPONENTS, fmt, LEVEL_NAMES, levelIndex, sInt } from '../lib/diag';
import type { Run } from '../lib/types';

export function Dynamics({ run }: { run: Run }) {
  const a = run.entry, b = run.exit;
  if (!a?.attitude || !a.selfScore || !b?.attitude || !b.selfScore) return <p className="small muted">Динамика появится, когда будут пройдены диагностика и самооценка на входе и на выходе.</p>;
  const rows = [...COMPONENTS.map(c => ({ name: c.name, sub: `S${c.sub}`, x: a.selfScore![c.k], y: b.selfScore![c.k] })),
    { name: 'интегральный показатель', sub: 'Sинт', x: sInt(a.selfScore), y: sInt(b.selfScore) }];
  return (
    <div className="stack-lg">
      <div className="grid g2">
        <div className="card stack"><div className="eyebrow">Установка на входе</div><h3>{attitudeName(a.attitude.dominant)}</h3>
          <p className="small muted">ретроспективная {a.attitude.retro} · адаптивная {a.attitude.adaptive} · проспективная {a.attitude.prospective}</p></div>
        <div className="card stack" style={{ borderColor: 'var(--accent)' }}><div className="eyebrow">Установка на выходе</div><h3>{attitudeName(b.attitude.dominant)}</h3>
          <p className="small muted">ретроспективная {b.attitude.retro} · адаптивная {b.attitude.adaptive} · проспективная {b.attitude.prospective}</p></div>
      </div>
      <div className="stack">
        <div className="legend"><span><i style={{ background: 'var(--muted)' }} />вход</span><span><i style={{ background: 'var(--accent)' }} />выход</span></div>
        <div className="bars" role="table" aria-label="Самооценка на входе и выходе, шкала 1–10">
          {rows.map(r => (
            <div className="bar-row" role="row" key={r.sub}>
              <div className="lab" role="rowheader">{r.sub}<small>{r.name}</small></div>
              <div className="track" role="cell">
                <div className="bar a"><i style={{ width: `${r.x * 10}%` }} /><b className="num">{fmt(r.x, r.sub === 'Sинт' ? 2 : 0)}</b></div>
                <div className="bar b"><i style={{ width: `${r.y * 10}%` }} /><b className="num">{fmt(r.y, r.sub === 'Sинт' ? 2 : 0)}</b></div>
              </div>
            </div>
          ))}
        </div>
        <p className="small muted">Уровень S<sub>инт</sub>: {LEVEL_NAMES[levelIndex(sInt(a.selfScore))]} → {LEVEL_NAMES[levelIndex(sInt(b.selfScore))]}. Самооценка, не экспертное измерение.</p>
      </div>
    </div>
  );
}
