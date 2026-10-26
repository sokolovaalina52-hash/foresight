// Спиральная модель (геометрия из spiralSVG в forsight-navigator.html). Узлы ведут на /stage/n.
import { useNavigate } from 'react-router-dom';
import { STAGES } from '../content/model';

export type NodeState = 'done' | 'current' | 'partial' | 'todo';

export function Spiral({ size = 520, compact = false, states }: { size?: number; compact?: boolean; states?: Record<number, NodeState> }) {
  const navigate = useNavigate();
  const cx = size / 2, cy = size / 2, th0 = 0.55 * Math.PI, turns = 2.35;
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
  const go = (n: number) => navigate(`/stage/${n}`);

  return (
    <svg className="sp" viewBox={`0 0 ${size} ${size}`} role="group" aria-label="Спиральная ситуационно-позиционная модель: шесть этапов форсайт-цикла">
      <path d={path(th0, thMax)} fill="none" stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
      {([[0, 1, 'z1'], [2, 3, 'z2'], [4, 5, 'z3']] as const).map(([a, b, z]) => (
        <path key={z} d={path(nodes[a].th - 0.12, nodes[b].th + 0.12)} fill="none" stroke={`var(--${z})`} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
      ))}
      <path d={`M${a1x.toFixed(1)} ${a1y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${a2x.toFixed(1)} ${a2y.toFixed(1)}`} fill="none" stroke="var(--muted)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {!compact && <text x={(ex - 10).toFixed(1)} y={(ey + 26).toFixed(1)} className="pos" textAnchor="end">новый виток спирали →</text>}
      <circle cx={cx} cy={cy} r={compact ? 34 : 46} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
      <text x={cx} y={cy - (compact ? 4 : 8)} textAnchor="middle" className="center-t">Проспективная</text>
      <text x={cx} y={cy + (compact ? 8 : 6)} textAnchor="middle" className="center-t">субъектность</text>
      {!compact && <text x={cx} y={cy + 22} textAnchor="middle" className="center-s">целевой ориентир</text>}
      {nodes.map(({ s, th }) => {
        const [x, y] = pt(th); const R = compact ? 16 : 19;
        const ox = Math.cos(th), oy = Math.sin(th);
        const lx = x + ox * (R + 10), ly = y + oy * (R + 10);
        const anchor = ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle';
        const dy = oy > 0.5 ? 14 : oy < -0.5 ? -4 : 4;
        const st = states?.[s.n];
        const hollow = states && st !== 'done';
        return (
          <g key={s.n} className="node" tabIndex={0} role="link" aria-label={`${s.roman} этап — ${s.name}, позиция: ${s.position}`}
            onClick={() => go(s.n)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(s.n); } }}>
            {st === 'current' && <circle cx={x} cy={y} r={R + 6} fill="none" stroke="var(--accent)" strokeWidth={3} />}
            <circle className="main" cx={x.toFixed(1)} cy={y.toFixed(1)} r={R} fill={hollow ? 'var(--surface)' : `var(--${s.zone})`}
              stroke={hollow ? `var(--${s.zone})` : 'var(--bg)'} strokeWidth={3} strokeDasharray={st === 'partial' ? '4 3' : undefined} />
            <text x={x.toFixed(1)} y={(y + 4).toFixed(1)} textAnchor="middle" fontSize={compact ? 10 : 11} fontWeight={700}
              fill={hollow ? `var(--${s.zone})` : '#fff'} fontFamily="var(--mono)">{s.roman}</text>
            {!compact && <>
              <text x={lx.toFixed(1)} y={(ly + dy).toFixed(1)} textAnchor={anchor} className="lbl">{s.name}</text>
              <text x={lx.toFixed(1)} y={(ly + dy + 13).toFixed(1)} textAnchor={anchor} className="pos">{s.position.toLowerCase()}</text>
            </>}
          </g>
        );
      })}
    </svg>
  );
}
