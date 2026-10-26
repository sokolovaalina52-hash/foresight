import { CANONS, CELL_LABELS, SUBJECT_LABELS } from '../content/tasks';
import { Field, ScoreSelect, TextArea, TextInput } from '../components/ui';
import { useTask } from '../components/TaskShell';
import { ans, CELLS, SUBJECTS, type Cell, type Subject } from '../lib/answers';
import { contradictionText, delphiRows } from '../lib/products';
import type { Run } from '../lib/types';

export function T3_1() {
  const [a, set, run] = useTask('3.1');
  const contra = ans(run, '2.3').items.filter(c => c.a.trim() || c.b.trim());
  const axis = (k: 'a' | 'b', name: string) => (
    <div className="item-card">
      <b>Ось {name}</b>
      <TextInput label="Неопределённый фактор" required value={a[k].factor} onChange={v => set({ [k]: { ...a[k], factor: v } } as never)}
        placeholder={k === 'a' ? 'автоматизация учебного процесса' : 'открытость образования'} />
      <div className="inline-fields">
        <TextInput label={`Полюс ${name}+`} required value={a[k].plus} onChange={v => set({ [k]: { ...a[k], plus: v } } as never)} placeholder={k === 'a' ? 'высокая' : 'глобальная'} />
        <TextInput label={`Полюс ${name}−`} required value={a[k].minus} onChange={v => set({ [k]: { ...a[k], minus: v } } as never)} placeholder={k === 'a' ? 'низкая' : 'локальная'} />
      </div>
    </div>
  );
  return (
    <div className="stack">
      <div className="note">
        <b>Оси выбираются из противоречий 2.3:</b>
        {contra.length ? <ul>{contra.map(c => <li key={c.id}>{contradictionText(c)}</li>)}</ul> : <span> противоречия ещё не сформулированы.</span>}
      </div>
      {axis('a', 'А')}
      {axis('b', 'Б')}
    </div>
  );
}

const axisCaption = (run: Run, c: Cell) => {
  const ax = ans(run, '3.1');
  const A = c[0] === 'p' ? ax.a.plus : ax.a.minus;
  const B = c[1] === 'p' ? ax.b.plus : ax.b.minus;
  return [A, B].every(x => x.trim()) ? `${A} × ${B}` : '';
};

export function T3_2() {
  const [a, set, run] = useTask('3.2');
  const upd = (c: Cell, k: keyof (typeof a)['pp'], v: string) => set({ [c]: { ...a[c], [k]: v } } as never);
  return (
    <div className="stack">
      <p className="hint small muted">Сценарии должны быть альтернативами, а не градациями одного. Эталонные конфигурации: технологическая автоматизация, гуманитарный ренессанс, конвергентное развитие, деглобализация.</p>
      <div className="matrix">
        {CELLS.map(c => (
          <div key={c} className="quad">
            <div className="qt">{CELL_LABELS[c]}{axisCaption(run, c) && <> · {axisCaption(run, c)}</>}</div>
            <TextInput label="Название" required value={a[c].title} onChange={v => upd(c, 'title', v)} />
            <TextArea small label="Что происходит с содержанием дисциплины" required value={a[c].content} onChange={v => upd(c, 'content', v)} />
            <TextArea small label="Что происходит с ролью преподавателя" required value={a[c].role} onChange={v => upd(c, 'role', v)} />
            <TextInput label="Ранний индикатор" required value={a[c].indicator} onChange={v => upd(c, 'indicator', v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScenarioSelect({ run, value, onChange, label, exclude }: { run: Run; value: Cell | null; onChange: (c: Cell | null) => void; label: string; exclude?: Cell[] }) {
  const sc = ans(run, '3.2');
  return (
    <Field label={label} required>
      {id => (
        <select id={id} value={value ?? ''} onChange={e => onChange((e.target.value || null) as Cell | null)}>
          <option value="">— выберите сценарий</option>
          {CELLS.filter(c => !exclude?.includes(c)).map(c => <option key={c} value={c}>{sc[c].title.trim() || CELL_LABELS[c]}</option>)}
        </select>
      )}
    </Field>
  );
}

export function T3_3() {
  const [a, set, run] = useTask('3.3');
  const updCell = (i: 0 | 1, s: Subject, y: 'y1' | 'y3' | 'y5', v: string) => {
    const paths = [...a.paths] as typeof a.paths;
    paths[i] = { ...paths[i], cells: { ...paths[i].cells, [s]: { ...paths[i].cells[s], [y]: v } } };
    set({ paths });
  };
  const updName = (i: 0 | 1, v: string) => { const paths = [...a.paths] as typeof a.paths; paths[i] = { ...paths[i], name: v }; set({ paths }); };
  return (
    <div className="stack-lg">
      <ScenarioSelect run={run} label="Сценарий" value={a.scenario} onChange={scenario => set({ scenario })} />
      <TextArea label="Развилка" required hint="Событие или решение, которое может пойти двумя путями" value={a.fork} onChange={fork => set({ fork })} />
      {([0, 1] as const).map(i => (
        <div key={i} className="stack">
          <TextInput label={`Путь ${i + 1}`} required value={a.paths[i].name} onChange={v => updName(i, v)} placeholder={i === 0 ? 'например: решение принято' : 'например: решение отклонено'} />
          <div className="tbl-wrap">
            <table className="t">
              <thead><tr><th>Субъект</th><th>Через 1 год</th><th>Через 3 года</th><th>Через 5 лет</th></tr></thead>
              <tbody>
                {SUBJECTS.map(s => (
                  <tr key={s}>
                    <th scope="row" style={{ textTransform: 'none', fontSize: '.9rem', letterSpacing: 0 }}>{SUBJECT_LABELS[s]}</th>
                    {(['y1', 'y3', 'y5'] as const).map(y => (
                      <td key={y}><label className="sr-only" htmlFor={`f-${i}-${s}-${y}`}>{`Путь ${i + 1}, ${SUBJECT_LABELS[s]}, ${y.slice(1)} г.`}</label>
                        <textarea id={`f-${i}-${s}-${y}`} className="sm" value={a.paths[i].cells[s][y]} onChange={e => updCell(i, s, y, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="hint small muted">Для каждого пути заполните хотя бы одну ячейку по каждому субъекту.</p>
    </div>
  );
}

/** Плоскость «вероятность × желательность» */
export function DelphiChart({ run, highlight }: { run: Run; highlight?: Cell | null }) {
  const rows = delphiRows(run);
  const S = 300, P = 36, W = S - P - 12;
  const x = (v: number) => P + ((v - 1) / 9) * W;
  const y = (v: number) => 12 + W - ((v - 1) / 9) * W;
  const colors: Record<Cell, string> = { pp: 'var(--z1)', pm: 'var(--z2)', mp: 'var(--z3)', mm: 'var(--accent)' };
  const hasPanel = rows.some(r => r.panelP != null && r.panelD != null);
  return (
    <figure className="stack" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: '100%', maxWidth: 420 }} role="img"
        aria-label={`Мини-Дельфи: ${rows.map(r => `${r.title} — вероятность ${r.p ?? 'не задана'}, желательность ${r.d ?? 'не задана'}`).join('; ')}`}>
        <rect x={P} y={12} width={W} height={W} fill="var(--surface-2)" rx={4} />
        <line x1={x(5.5)} y1={12} x2={x(5.5)} y2={12 + W} stroke="var(--line)" strokeDasharray="4 4" />
        <line x1={P} y1={y(5.5)} x2={P + W} y2={y(5.5)} stroke="var(--line)" strokeDasharray="4 4" />
        {[1, 5, 10].map(v => <text key={`x${v}`} x={x(v)} y={S - 8} fontSize={10} textAnchor="middle" fill="var(--muted)">{v}</text>)}
        {[1, 5, 10].map(v => <text key={`y${v}`} x={P - 6} y={y(v) + 3} fontSize={10} textAnchor="end" fill="var(--muted)">{v}</text>)}
        {rows.map((r, i) => (
          <g key={r.cell}>
            {r.panelP != null && r.panelD != null && <circle cx={x(r.panelP)} cy={y(r.panelD)} r={7} fill="none" stroke={colors[r.cell]} strokeWidth={2} strokeDasharray="3 2" />}
            {r.p != null && r.d != null && <>
              <circle cx={x(r.p)} cy={y(r.d)} r={highlight === r.cell ? 11 : 9} fill={colors[r.cell]} stroke={highlight === r.cell ? 'var(--fg)' : 'var(--bg)'} strokeWidth={2} />
              <text x={x(r.p)} y={y(r.d) + 4} fontSize={10} fontWeight={700} textAnchor="middle" fill="#fff">{i + 1}</text>
            </>}
          </g>
        ))}
      </svg>
      <figcaption className="small">
        <div className="muted">По горизонтали — вероятность, по вертикали — желательность (1–10).{hasPanel && ' Пунктирные кольца — оценки панели.'}</div>
        <ol style={{ marginTop: 4 }}>{rows.map(r => <li key={r.cell}><span style={{ color: colors[r.cell], fontWeight: 700 }}>●</span> {r.title}: {r.p ?? '—'} / {r.d ?? '—'}{r.panelP != null ? ` · панель ${r.panelP} / ${r.panelD ?? '—'}` : ''}</li>)}</ol>
      </figcaption>
    </figure>
  );
}

export function T3_4() {
  const [a, set, run] = useTask('3.4');
  const sc = ans(run, '3.2');
  const upd = (which: 'own' | 'panel', c: Cell, k: 'p' | 'd', v: number | null) => set({ [which]: { ...a[which], [c]: { ...a[which][c], [k]: v } } } as never);
  return (
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <div className="stack">
        {CELLS.map(c => (
          <div key={c} className="item-card">
            <b>{sc[c].title.trim() || CELL_LABELS[c]}</b>
            <div className="inline-fields">
              <ScoreSelect label="Вероятность" value={a.own[c].p} onChange={v => upd('own', c, 'p', v)} />
              <ScoreSelect label="Желательность" value={a.own[c].d} onChange={v => upd('own', c, 'd', v)} />
            </div>
          </div>
        ))}
        <details>
          <summary className="small" style={{ cursor: 'pointer' }}>Оценки панели (если проходите в группе)</summary>
          <div className="stack" style={{ marginTop: 8 }}>
            <p className="hint small muted">Внесите средние по туру.</p>
            {CELLS.map(c => (
              <div key={c} className="inline-fields">
                <ScoreSelect label={`${sc[c].title.trim() || CELL_LABELS[c]}: вероятность (панель)`} value={a.panel[c].p} onChange={v => upd('panel', c, 'p', v)} />
                <ScoreSelect label="желательность (панель)" value={a.panel[c].d} onChange={v => upd('panel', c, 'd', v)} />
              </div>
            ))}
            <TextArea small label="Комментарий к оценкам панели" value={a.panelNote} onChange={panelNote => set({ panelNote })} />
          </div>
        </details>
      </div>
      <DelphiChart run={run} />
    </div>
  );
}

export function T3_5() {
  const [a, set] = useTask('3.5');
  return (
    <div className="stack-lg">
      <TextArea small label="Базовый фрейм" required hint="Статус-кво, привычная логика взаимодействия в курсе" value={a.baseFrame} onChange={baseFrame => set({ baseFrame })} />
      <TextArea small label="Идея-фрейм" required hint="Переопределённый контекст, в который погружается студент" value={a.ideaFrame} onChange={ideaFrame => set({ ideaFrame })} />
      <TextInput label="Роль студента" required value={a.role} onChange={role => set({ role })} placeholder="исследователь, герой, агент изменений, архитектор" />
      <TextArea small label="Сюжетная линия" required hint="Начало, препятствия, кульминация, развязка" value={a.plot} onChange={plot => set({ plot })} />
      <TextInput label="Драма" value={a.drama} onChange={drama => set({ drama })} placeholder="что поставлено на карту" />
      <TextInput label="Польза" value={a.benefit} onChange={benefit => set({ benefit })} placeholder="что получает студент в конце" />
      <fieldset className="f">
        <legend className="lbl" style={{ fontWeight: 600 }}>Выбранный канон<span className="req" aria-hidden="true">*</span></legend>
        <div className="row">
          {CANONS.map(c => <label key={c} className="check" style={{ padding: 0 }}><input type="radio" name="canon" checked={a.canon === c} onChange={() => set({ canon: c })} /><span>{c}</span></label>)}
        </div>
        {a.canon === 'свой' && <TextInput label="Свой канон" value={a.canonOther} onChange={canonOther => set({ canonOther })} />}
      </fieldset>
    </div>
  );
}
