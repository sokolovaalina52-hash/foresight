import { STAGES } from '../content/model';
import type { StageStatus } from '../lib/rules';

type NodeState = StageStatus | 'current';

/** Спираль модели — геометрия перенесена из spiralSVG() исходного навигатора; узлы показывают прогресс витка */
export function Spiral({ size = 520, compact = false, states, onSelect, label }: {
  size?: number; compact?: boolean; states?: Record<number, NodeState>; onSelect?: (n: number) => void; label?: string;
}) {
  // Геометрия всегда в координатах 520 × 520 (как в исходнике); размер на экране задаёт width
  const G = 520;
  const cx = G / 2, cy = G / 2, th0 = 0.55 * Math.PI, turns = 2.35;
  const r = (th: number) => 30 + 26 * (th - th0);
  const pt = (th: number): [number, number] => [cx + r(th) * Math.cos(th), cy + r(th) * Math.sin(th)];
  const path = (a: number, b: number, step = 0.05) => {
    let d = '';
    for (let t = a; t <= b + 1e-9; t += step) { const [x, y] = pt(Math.min(t, b)); d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    return d;
  };
  const thMax = th0 + turns * Math.PI;
  const nodes = STAGES.map((s, i) => ({ s, th: th0 + 0.42 * Math.PI + i * 0.37 * Math.PI }));
  const [ex, ey] = pt(thMax); const [px, py] = pt(thMax - 0.08); const ang = Math.atan2(ey - py, ex - px);
  const ah = (a: number, l: number) => [ex - l * Math.cos(ang + a), ey - l * Math.sin(ang + a)];
  const [a1x, a1y] = ah(0.5, 14), [a2x, a2y] = ah(-0.5, 14);
  const stateText: Record<NodeState, string> = { done: 'завершён', current: 'текущий', open: 'открыт', locked: 'не открыт', partial: 'пройден не полностью' };

  return (
    <svg className="sp" viewBox={compact ? `0 0 ${G} ${G}` : `-120 -8 ${G + 240} ${G + 16}`} style={{ maxWidth: size }} role="group" aria-label={label ?? 'Спиральная ситуационно-позиционная модель: шесть этапов форсайт-цикла'}>
      <path d={path(th0, thMax)} fill="none" stroke="var(--line)" strokeWidth={compact ? 6 : 3} strokeLinecap="round" />
      {([[0, 1, 'z1'], [2, 3, 'z2'], [4, 5, 'z3']] as const).map(([a, b, z]) => (
        <path key={z} d={path(nodes[a].th - 0.12, nodes[b].th + 0.12)} fill="none" stroke={`var(--${z})`} strokeWidth={compact ? 9 : 5} strokeLinecap="round" opacity={0.9} />
      ))}
      <path d={`M${a1x.toFixed(1)} ${a1y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${a2x.toFixed(1)} ${a2y.toFixed(1)}`} fill="none" stroke="var(--muted)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {!compact && <text x={(ex - 10).toFixed(1)} y={(ey + 30).toFixed(1)} className="pos" textAnchor="end">новый виток спирали →</text>}
      <circle cx={cx} cy={cy} r={compact ? 40 : 52} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
      {!compact && <>
        <text x={cx} y={cy - 8} textAnchor="middle" className="center-t">Проспективная</text>
        <text x={cx} y={cy + 6} textAnchor="middle" className="center-t">субъектность</text>
      </>}
      {!compact && <text x={cx} y={cy + 22} textAnchor="middle" className="center-s">целевой ориентир</text>}
      {nodes.map(({ s, th }) => {
        const [x, y] = pt(th); const z = s.zone;
        const st: NodeState = states?.[s.n] ?? 'done';
        const R = (compact ? 30 : 19) + (st === 'current' ? 3 : 0);
        const filled = st === 'done' || st === 'current';
        const ox = Math.cos(th), oy = Math.sin(th);
        const lx = x + ox * (R + 10), ly = y + oy * (R + 10);
        const anchor = ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle';
        const dy = oy > 0.5 ? 14 : oy < -0.5 ? -4 : 4;
        const go = () => onSelect?.(s.n);
        return (
          <g key={s.n} className="node" tabIndex={onSelect ? 0 : -1} role={onSelect ? 'link' : undefined}
            aria-label={`${s.roman} этап — ${s.name}, позиция: ${s.position}${states ? `; ${stateText[st]}` : ''}`}
            onClick={go} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}>
            {st === 'current' && <circle cx={x} cy={y} r={R + 6} fill="none" stroke="var(--accent)" strokeWidth={2.5} />}
            <circle className="main" cx={x.toFixed(1)} cy={y.toFixed(1)} r={R}
              fill={filled ? `var(--${z})` : st === 'partial' ? `var(--${z}-soft)` : 'var(--surface)'}
              stroke={filled ? 'var(--bg)' : `var(--${z})`} strokeWidth={filled ? 3 : 2.5}
              strokeDasharray={st === 'partial' ? '4 3' : undefined} opacity={st === 'locked' ? 0.6 : 1} />
            <text x={x.toFixed(1)} y={(y + 4).toFixed(1)} textAnchor="middle" fontSize={compact ? 19 : 11} fontWeight={700}
              fill={filled ? '#fff' : `var(--${z}-ink)`} fontFamily="var(--mono)">{s.roman}</text>
            {!compact && <>
              <text x={lx.toFixed(1)} y={(ly + dy).toFixed(1)} textAnchor={anchor} className="lbl">{s.name}</text>
              <text x={lx.toFixed(1)} y={(ly + dy + 16).toFixed(1)} textAnchor={anchor} className="pos">{s.position.toLowerCase()}</text>
            </>}
          </g>
        );
      })}
    </svg>
  );
}

/** Мобильная полоса прогресса: шесть узлов в строку */
export function SpiralStrip({ states, onSelect }: { states: Record<number, NodeState>; onSelect: (n: number) => void }) {
  return (
    <div className="row" style={{ gap: 0, flexWrap: 'nowrap' }} role="group" aria-label="Прогресс по этапам витка">
      {STAGES.map((s, i) => {
        const st = states[s.n];
        const filled = st === 'done' || st === 'current';
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
            <button type="button" onClick={() => onSelect(s.n)} aria-label={`${s.roman} этап — ${s.name}`}
              style={{
                width: 30, height: 30, borderRadius: '50%', flex: 'none', cursor: 'pointer', font: '700 11px var(--mono)',
                background: filled ? `var(--${s.zone})` : st === 'partial' ? `var(--${s.zone}-soft)` : 'var(--surface)',
                color: filled ? '#fff' : `var(--${s.zone}-ink)`, border: `2px ${st === 'partial' ? 'dashed' : 'solid'} var(--${s.zone})`,
                outline: st === 'current' ? '2px solid var(--accent)' : undefined, outlineOffset: 2,
              }}>{s.roman}</button>
            {i < 5 && <span style={{ flex: 1, height: 2, background: 'var(--line)', minWidth: 6 }} />}
          </div>
        );
      })}
    </div>
  );
}
