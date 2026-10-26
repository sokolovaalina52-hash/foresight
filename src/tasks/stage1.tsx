import { RGROUPS } from '../content/resources';
import { DEFICITS } from '../content/tasks';
import { TextArea } from '../components/ui';
import { useTask } from '../components/TaskShell';

export function T1_1() {
  const [a, set] = useTask('1.1');
  const toggle = (id: string, on: boolean) => {
    const items = on ? [...a.items, id] : a.items.filter(x => x !== id);
    set({ items, resources: id === 'digital' && !on ? [] : a.resources });
  };
  const toggleRes = (n: number, on: boolean) => {
    const resources = on ? [...a.resources, n] : a.resources.filter(x => x !== n);
    const items = resources.length && !a.items.includes('digital') ? [...a.items, 'digital'] : a.items;
    set({ resources, items });
  };
  return (
    <div className="stack">
      <p className="small muted">Отмечено слабых позиций: <b className="num">{a.items.length}</b> (нужно не менее 3).</p>
      <div>
        {DEFICITS.map(d => (
          <div key={d.id}>
            <label className="check">
              <input type="checkbox" checked={a.items.includes(d.id)} onChange={e => toggle(d.id, e.target.checked)} />
              <span>{d.label}</span>
            </label>
            {d.id === 'digital' && (
              <div role="group" aria-label="Работа с цифровыми ресурсами — по шести группам">
                {RGROUPS.map(g => (
                  <label key={g.n} className="check sub">
                    <input type="checkbox" checked={a.resources.includes(g.n)} onChange={e => toggleRes(g.n, e.target.checked)} />
                    <span>{g.name} ресурсы <span className="muted small">— {g.fn.toLowerCase()}</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function T1_2() {
  const [a, set, run] = useTask('1.2');
  const rows = [[5, 'h5'], [10, 'h10'], [15, 'h15']] as const;
  return (
    <div className="stack-lg">
      {run.number > 1 && <p className="note">Предзаполнено из запроса на новый виток (6.5 предыдущего витка) — переформулируйте как противоречие.</p>}
      {rows.map(([h, k]) => (
        <div key={k} className="item-card">
          <div className="item-head">
            <b>Горизонт {h} лет</b>
            <label className="check" style={{ padding: 0 }}>
              <input type="radio" name="lead-problem" checked={a.lead === h} onChange={() => set({ lead: h })} />
              <span>ведущая формулировка</span>
            </label>
          </div>
          <div className="contra-field">
            <span className="w">Противоречие между</span>
            <div><label className="sr-only" htmlFor={`p-${k}-a`}>Что происходит в высшем образовании / моей области, {h} лет</label>
              <textarea id={`p-${k}-a`} className="sm" value={a[k][0]} onChange={e => set({ [k]: [e.target.value, a[k][1]] } as never)} placeholder="что происходит в высшем образовании / моей области" /></div>
            <span className="w">и</span>
            <div><label className="sr-only" htmlFor={`p-${k}-b`}>Как устроена моя практика, {h} лет</label>
              <textarea id={`p-${k}-b`} className="sm" value={a[k][1]} onChange={e => set({ [k]: [a[k][0], e.target.value] } as never)} placeholder="как устроена моя практика" /></div>
          </div>
        </div>
      ))}
      <p className="hint small muted">Левое поле — что происходит в высшем образовании или вашей области; правое — как устроена ваша практика. Выберите одну формулировку как ведущую: с ней вы пойдёте по циклу.</p>
    </div>
  );
}

export function T1_3() {
  const [a, set] = useTask('1.3');
  return (
    <div className="stack-lg">
      <TextArea label="Образовательные задачи" required hint="Что нужно освоить, чтобы работать с проблемой" value={a.tasks} onChange={tasks => set({ tasks })} />
      <TextArea label="Возможности и ресурсы" required hint="Опыт, сообщества, платформы, время, поддержка" value={a.assets} onChange={assets => set({ assets })} />
      <TextArea label="Векторы движения" required hint="2–3 направления в форсайт-пространстве" value={a.vectors} onChange={vectors => set({ vectors })} />
    </div>
  );
}

export function T1_4() {
  const [a, set] = useTask('1.4');
  const upd = (i: number, k: 'task' | 'help', v: string) => set({ rows: a.rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)) });
  return (
    <div className="stack">
      <p className="hint small muted">Типовые задачи проектирования: формулировка целей, составление заданий, адаптация содержания, генерация кейсов, оценочные инструменты. Что даёт делегирование: время, вариативность, адаптивность, индивидуализация.</p>
      <div className="tbl-wrap">
        <table className="t">
          <thead><tr><th>Задача проектирования курса</th><th>Как может помочь языковая модель</th><th><span className="sr-only">Действия</span></th></tr></thead>
          <tbody>
            {a.rows.map((r, i) => (
              <tr key={i}>
                <td><label className="sr-only" htmlFor={`dl-t-${i}`}>Задача {i + 1}</label><textarea id={`dl-t-${i}`} className="sm" value={r.task} onChange={e => upd(i, 'task', e.target.value)} /></td>
                <td><label className="sr-only" htmlFor={`dl-h-${i}`}>Как поможет модель, задача {i + 1}</label><textarea id={`dl-h-${i}`} className="sm" value={r.help} onChange={e => upd(i, 'help', e.target.value)} /></td>
                <td>{a.rows.length > 3 && <button type="button" className="btn sm" onClick={() => set({ rows: a.rows.filter((_, j) => j !== i) })}>Удалить</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {a.rows.length < 4 && <button type="button" className="btn sm" onClick={() => set({ rows: [...a.rows, { task: '', help: '' }] })}>Добавить строку</button>}
    </div>
  );
}
