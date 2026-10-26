// Экспресс-диагностика установки (DIAG_Q) и самооценка S — общие для входа (0.2, 0.3) и выхода (6.2).
import { DIAG_Q, LEVELS } from '../content/model';
import { attitudeName, attitudeText, COMPONENTS, fmt, LEVEL_NAMES, levelIndex, sInt } from '../lib/diag';
import type { AttitudeResult, SelfScore } from '../lib/types';
import { useReadOnly } from '../store/store';
import { Slider } from './fields';

export function AttitudeForm({ answers, onChange, prefix }: { answers: (number | null)[]; onChange: (a: (number | null)[]) => void; prefix: string }) {
  const ro = useReadOnly();
  return (
    <div className="stack-lg">
      {DIAG_Q.map((q, i) => (
        <fieldset key={i}>
          <legend><b>{i + 1}. {q.q}</b></legend>
          <div className="opts">
            {q.o.map((o, j) => (
              <label className="opt" key={j}>
                <input type="radio" name={`${prefix}-q${i}`} checked={answers[i] === j} disabled={ro}
                  onChange={() => { const next = [...answers]; next[i] = j; onChange(next); }} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function AttitudeResultView({ result, answered }: { result: AttitudeResult | null | undefined; answered: number }) {
  if (!result) return <div className="result" role="status">Ответьте на все {DIAG_Q.length} утверждений — пропущено {DIAG_Q.length - answered}.</div>;
  return (
    <div className="stack" role="status">
      <div className="result">
        <div className="eyebrow">Доминирующая установка</div>
        <h3 style={{ margin: '.25rem 0 .5rem' }}>{attitudeName(result.dominant)}</h3>
        <p className="small">Ретроспективная: {result.retro} · адаптивная: {result.adaptive} · проспективная: {result.prospective} из {DIAG_Q.length}</p>
      </div>
      <p>{attitudeText(result.dominant)}</p>
    </div>
  );
}

export function SelfScoreForm({ value, onChange }: { value: SelfScore; onChange: (v: SelfScore) => void }) {
  return (
    <div className="grid g3">
      {COMPONENTS.map(c => (
        <Slider key={c.k} label={<>S<sub>{c.sub}</sub> — {c.name}</>} value={value[c.k]} onChange={v => onChange({ ...value, [c.k]: v })} />
      ))}
    </div>
  );
}

export function SelfScoreResult({ value }: { value: SelfScore }) {
  const s = sInt(value);
  return (
    <div className="result" role="status">
      <div className="eyebrow">S<sub>инт</sub> = ({value.mc} + {value.kp} + {value.od}) / 3</div>
      <h3 style={{ margin: '.25rem 0 .4rem' }} className="num">{fmt(s)} — {LEVEL_NAMES[levelIndex(s)]} уровень</h3>
      <p className="small">По компонентам: {COMPONENTS.map(c => `${c.name} — ${LEVEL_NAMES[levelIndex(value[c.k])]}`).join('; ')}.</p>
      <p className="small muted" style={{ marginTop: '.4rem' }}>Ориентировочная самооценка; экспертное оценивание — в программе.</p>
    </div>
  );
}

export function LevelCriteria() {
  const titles: Record<'mc' | 'kp' | 'od', string> = { mc: 'Мотивационно-ценностный компонент', kp: 'Когнитивно-прогностический компонент', od: 'Операционально-деятельностный компонент' };
  return (
    <details className="basis">
      <summary>Критерии уровней по компонентам</summary>
      <div className="body">
        <p className="small">8–10 баллов — оптимальный уровень, 5–7 — допустимый, 4 и менее — критический.</p>
        {(['mc', 'kp', 'od'] as const).map(k => (
          <div className="stack" key={k}>
            <h4>{titles[k]}</h4>
            <div className="scale">{LEVELS[k].map((t, i) => <div key={i} className={`lvl-${i}`}><b>{LEVEL_NAMES[i][0].toUpperCase() + LEVEL_NAMES[i].slice(1)}</b><br />{t}</div>)}</div>
          </div>
        ))}
      </div>
    </details>
  );
}
