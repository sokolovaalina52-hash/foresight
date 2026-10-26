// Мини-Дельфи: четыре сценария на плоскости «вероятность × желательность».
import { SCENARIO_LABELS } from '../lib/answers';

export function DelphiPlot({ votes, titles }: { votes: { p: number | null; d: number | null }[]; titles: string[] }) {
  const W = 360, H = 300, L = 44, B = 40, T = 12, R = 16;
  const x = (v: number) => L + ((v - 1) / 9) * (W - L - R);
  const y = (v: number) => H - B - ((v - 1) / 9) * (H - B - T);
  const colors = ['var(--z1)', 'var(--z2)', 'var(--z3)', 'var(--accent)'];
  const pts = votes.map((v, i) => ({ ...v, i })).filter(v => v.p !== null && v.d !== null);
  return (
    <figure className="stack" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '30rem', height: 'auto' }} role="img"
        aria-label={`Диаграмма Дельфи: ${pts.map(p => `${titles[p.i] || SCENARIO_LABELS[p.i]} — вероятность ${p.p}, желательность ${p.d}`).join('; ') || 'оценок пока нет'}`}>
        <rect x={L} y={T} width={W - L - R} height={H - B - T} fill="var(--surface-2)" rx={6} />
        <line x1={x(5.5)} x2={x(5.5)} y1={T} y2={H - B} stroke="var(--line)" strokeDasharray="4 4" />
        <line x1={L} x2={W - R} y1={y(5.5)} y2={y(5.5)} stroke="var(--line)" strokeDasharray="4 4" />
        {[1, 5, 10].map(v => <text key={`x${v}`} x={x(v)} y={H - B + 16} textAnchor="middle" fontSize={11} fill="var(--muted)">{v}</text>)}
        {[1, 5, 10].map(v => <text key={`y${v}`} x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{v}</text>)}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill="var(--fg)">вероятность</text>
        <text x={12} y={(T + H - B) / 2} textAnchor="middle" fontSize={12} fill="var(--fg)" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>желательность</text>
        {pts.map(p => (
          <g key={p.i}>
            <circle cx={x(p.p!)} cy={y(p.d!)} r={11} fill={colors[p.i]} stroke="var(--surface)" strokeWidth={2} />
            <text x={x(p.p!)} y={y(p.d!) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" fontFamily="var(--mono)">{p.i + 1}</text>
          </g>
        ))}
      </svg>
      <figcaption className="legend">{titles.map((t, i) => <span key={i}><i style={{ background: colors[i] }} />{i + 1}. {t || SCENARIO_LABELS[i]}</span>)}</figcaption>
    </figure>
  );
}
