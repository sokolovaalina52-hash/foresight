// Спиральная модель (геометрия из spiralSVG в forsight-navigator.html). Узлы ведут на /stage/n.
// Область рисунка подгоняется по фактическим границам спирали и подписей (getBBox), поэтому подписи
// не обрезаются по краям. Если подписи в рисунке получаются мельче читаемого, они переносятся в список под спиралью.
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAGES } from '../content/model';

export type NodeState = 'done' | 'current' | 'partial' | 'todo';

/** Размер подписи этапа в единицах рисунка (см. svg.sp .lbl в styles.css) */
const LABEL_SIZE = 14;
/** Минимальный экранный размер подписи, px: мельче — подписи уходят в список под спиралью */
const MIN_LABEL_PX = 10;
const PAD = 8;

/** legend=false — когда рядом со спиралью уже есть свой список этапов (страница «О технологии») */
export function Spiral({ size = 520, compact = false, legend = true, states }: { size?: number; compact?: boolean; legend?: boolean; states?: Record<number, NodeState> }) {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  /** Ширина рисунка с подписями — измеряется, пока подписи показаны */
  const labeledWidth = useRef<number | null>(null);
  const [inline, setInline] = useState(true);
  const [box, setBox] = useState<[number, number, number, number]>([0, 0, size, size]);

  const cx = size / 2, cy = size / 2, th0 = 0.55 * Math.PI, turns = 2.35;
  // Начальный радиус увеличен (30 → 42), чтобы узел I не заходил на центральный круг
  const r = (th: number) => 42 + 26 * (th - th0);
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
  const showLabels = !compact && inline;

  // Подгонка области рисунка под содержимое; пересчёт после загрузки шрифтов и при смене режима подписей
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      const g = groupRef.current;
      if (!alive || !g) return;
      const b = g.getBBox();
      if (!b.width || !b.height) return;
      if (showLabels) labeledWidth.current = b.width + PAD * 2;
      setBox([b.x - PAD, b.y - PAD, b.width + PAD * 2, b.height + PAD * 2]);
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    return () => { alive = false; };
  }, [showLabels, size]);

  // Подписи остаются в рисунке, только если на экране они не мельче MIN_LABEL_PX
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (compact || !svg || typeof ResizeObserver === 'undefined') return;
    const check = () => {
      const w = svg.getBoundingClientRect().width;
      const lw = labeledWidth.current;
      if (w && lw) setInline((w * LABEL_SIZE) / lw >= MIN_LABEL_PX);
    };
    const ro = new ResizeObserver(check);
    ro.observe(svg);
    check();
    return () => ro.disconnect();
  }, [compact, box]);

  return (
    <div className="sp-wrap">
      <svg ref={svgRef} className="sp" viewBox={box.map(v => v.toFixed(1)).join(' ')} role="group" aria-label="Спиральная ситуационно-позиционная модель: шесть этапов форсайт-цикла">
        <g ref={groupRef}>
          <path d={path(th0, thMax)} fill="none" stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
          {([[0, 1, 'z1'], [2, 3, 'z2'], [4, 5, 'z3']] as const).map(([a, b, z]) => (
            <path key={z} d={path(nodes[a].th - 0.12, nodes[b].th + 0.12)} fill="none" stroke={`var(--${z})`} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
          ))}
          <path d={`M${a1x.toFixed(1)} ${a1y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${a2x.toFixed(1)} ${a2y.toFixed(1)}`} fill="none" stroke="var(--muted)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {showLabels && <text x={(ex + 6).toFixed(1)} y={(ey - 14).toFixed(1)} className="pos" textAnchor="middle">новый виток</text>}
          <circle cx={cx} cy={cy} r={compact ? 34 : 50} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
          <text x={cx} y={cy - (compact ? 4 : 8)} textAnchor="middle" className="center-t">Проспективная</text>
          <text x={cx} y={cy + (compact ? 8 : 6)} textAnchor="middle" className="center-t">субъектность</text>
          {!compact && <text x={cx} y={cy + 22} textAnchor="middle" className="center-s">целевой ориентир</text>}
          {nodes.map(({ s, th }) => {
            const [x, y] = pt(th); const R = compact ? 16 : 19;
            const ox = Math.cos(th), oy = Math.sin(th);
            const lx = x + ox * (R + 10), ly = y + oy * (R + 10);
            const anchor = ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle';
            const dy = oy > 0.5 ? 16 : oy < -0.5 ? -20 : 0;
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
                {showLabels && <>
                  <text x={lx.toFixed(1)} y={(ly + dy).toFixed(1)} textAnchor={anchor} className="lbl">{s.name}</text>
                  <text x={lx.toFixed(1)} y={(ly + dy + 16).toFixed(1)} textAnchor={anchor} className="pos">{s.position.toLowerCase()}</text>
                </>}
              </g>
            );
          })}
        </g>
      </svg>
      {!compact && legend && !inline && (
        <ol className="sp-legend">
          {STAGES.map(s => (
            <li key={s.n}><button type="button" onClick={() => go(s.n)}><span className={`pill ${s.zone}`}>{s.roman}</span><span><b>{s.name}</b> <span className="muted">— {s.position.toLowerCase()}</span></span></button></li>
          ))}
        </ol>
      )}
    </div>
  );
}
