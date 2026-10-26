import { DIAG_Q, LEVELS } from '../content/diagnostics';
import { attitudeName, attitudeText, computeAttitude, fmt2, LEVEL_NAMES, levelIndex, sInt } from '../lib/diagnostics';
import type { AttitudeResult, ScoreTriple } from '../lib/types';

export function DiagForm({ picks, onChange, name }: { picks: (number | null)[]; onChange: (p: (number | null)[]) => void; name: string }) {
  const answered = picks.filter(p => p != null).length;
  return (
    <div className="stack">
      <p className="small muted">Отвечено: <b className="num">{answered}</b> из {DIAG_Q.length}.</p>
      {DIAG_Q.map((q, i) => (
        <fieldset key={i} className="stack" style={{ borderTop: i ? '1px solid var(--line)' : 0, paddingTop: i ? 12 : 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 6 }}>{i + 1}. {q.q}</legend>
          <div className="opts">
            {q.o.map((o, j) => (
              <label key={j} className="opt">
                <input type="radio" name={`${name}-q${i}`} checked={picks[i] === j} onChange={() => { const p = [...picks]; p[i] = j; onChange(p); }} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function AttitudeView({ picks }: { picks: (number | null)[] }) {
  const a = computeAttitude(picks);
  if (!a) return <p className="small muted">Результат появится, когда вы ответите на все {DIAG_Q.length} утверждений.</p>;
  return (
    <div className="stack">
      <div className="result">
        <div className="eyebrow">Доминирующая установка</div>
        <h3 style={{ margin: '4px 0 8px' }}>{attitudeName(a)}</h3>
        <p className="small">Ретроспективная: {a.retro} · адаптивная: {a.adaptive} · проспективная: {a.prospective} из {DIAG_Q.length}</p>
      </div>
      <p>{attitudeText(a)}</p>
    </div>
  );
}

const COMPONENTS: [keyof ScoreTriple, string, string][] = [
  ['mc', 'Sмц', 'мотивационно-ценностный'],
  ['kp', 'Sкп', 'когнитивно-прогностический'],
  ['od', 'Sод', 'операционально-деятельностный'],
];

export function SelfScoreForm({ value, onChange, prefix }: { value: ScoreTriple; onChange: (v: ScoreTriple) => void; prefix: string }) {
  const s = sInt(value);
  return (
    <div className="stack-lg">
      <p className="note small">Ориентировочная самооценка; экспертное оценивание — в программе.</p>
      {COMPONENTS.map(([k, sym, name]) => (
        <div key={k} className="f">
          <label className="lbl" htmlFor={`${prefix}-${k}`}>{sym} — {name}</label>
          <div className="slider-row">
            <input id={`${prefix}-${k}`} type="range" min={1} max={10} step={1} value={value[k]} aria-valuetext={`${value[k]} из 10, уровень ${LEVEL_NAMES[levelIndex(value[k])]}`}
              onChange={e => onChange({ ...value, [k]: Number(e.target.value) })} />
            <b className="num" aria-hidden="true">{value[k]}</b>
          </div>
          <span className="hint">Уровень: {LEVEL_NAMES[levelIndex(value[k])]}</span>
        </div>
      ))}
      <div className="result" aria-live="polite">
        <div className="eyebrow">Sинт = ({value.mc} + {value.kp} + {value.od}) / 3</div>
        <h3 className="num" style={{ margin: '4px 0 6px' }}>{fmt2(s)} — {LEVEL_NAMES[levelIndex(s)]} уровень</h3>
        <p className="small">Пороги: 8–10 — оптимальный, 5–7 — допустимый, 4 и менее — критический.</p>
      </div>
      <details>
        <summary className="small" style={{ cursor: 'pointer' }}>Критерии уровней по компонентам</summary>
        <div className="stack" style={{ marginTop: 8 }}>
          {COMPONENTS.map(([k, , name]) => (
            <div key={k} className="stack"><h4 style={{ textTransform: 'capitalize' }}>{name} компонент</h4>
              <div className="scale">
                <div className="lvl-crit"><b>Критический</b><br />{LEVELS[k][0]}</div>
                <div className="lvl-adm"><b>Допустимый</b><br />{LEVELS[k][1]}</div>
                <div className="lvl-opt"><b>Оптимальный</b><br />{LEVELS[k][2]}</div>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/** Экран «до / после»: установки рядом, компоненты и Sинт столбиками «вход / выход» */
export function DynamicsView({ entry, exit }: { entry: { attitude: AttitudeResult | null; selfScore: ScoreTriple | null }; exit?: { attitude: AttitudeResult | null; selfScore: ScoreTriple | null } }) {
  const rows: [string, string, number | undefined, number | undefined][] = [
    ...COMPONENTS.map(([k, sym, name]) => [sym, name, entry.selfScore?.[k], exit?.selfScore?.[k]] as [string, string, number | undefined, number | undefined]),
    ['Sинт', 'интегральный показатель', entry.selfScore ? sInt(entry.selfScore) : undefined, exit?.selfScore ? sInt(exit.selfScore) : undefined],
  ];
  return (
    <div className="stack-lg">
      <div className="grid g2">
        <div className="card stack"><div className="eyebrow">Вход</div><h3>{attitudeName(entry.attitude)}</h3>
          {entry.attitude && <p className="small muted">Р {entry.attitude.retro} · А {entry.attitude.adaptive} · П {entry.attitude.prospective}</p>}</div>
        <div className="card stack"><div className="eyebrow">Выход</div><h3>{attitudeName(exit?.attitude)}</h3>
          {exit?.attitude && <p className="small muted">Р {exit.attitude.retro} · А {exit.attitude.adaptive} · П {exit.attitude.prospective}</p>}</div>
      </div>
      <div className="stack">
        <div className="legend"><span><i style={{ background: 'var(--muted)' }} />вход</span><span><i style={{ background: 'var(--accent)' }} />выход</span></div>
        <div className="bars">
          {rows.map(([sym, name, a, b]) => (
            <div key={sym} className="bar-row">
              <div className="lab">{name}<small>{sym}</small></div>
              <div className="track">
                <div className="bar in" role="img" aria-label={`${sym} на входе: ${a != null ? fmt2(a) : 'нет данных'}`}><i style={{ width: `${(a ?? 0) * 10}%` }} /><b className="num">{a != null ? fmt2(a) : '—'}</b></div>
                <div className="bar out" role="img" aria-label={`${sym} на выходе: ${b != null ? fmt2(b) : 'нет данных'}`}><i style={{ width: `${(b ?? 0) * 10}%` }} /><b className="num">{b != null ? fmt2(b) : '—'}</b></div>
              </div>
            </div>
          ))}
        </div>
        <p className="small muted">Самооценка, не экспертное измерение. Шкала 1–10.</p>
      </div>
    </div>
  );
}
