// Библиотека: лекции, промпты, шаблоны, цифровые ресурсы — справочно, вне маршрута.
import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../components/toast';
import { LECTURES } from '../content/lectures';
import { STAGES } from '../content/model';
import { PROMPTS } from '../content/prompts';
import { INFRA, RGROUPS } from '../content/resources';
import { LECTURE_TASK } from '../content/route';
import { TEMPLATES } from '../content/templates';
import type { TemplateField } from '../content/types';
import { rawPrompt } from '../lib/prompts';
import { copyText, download } from '../lib/run';
import { useStore } from '../store/store';

const stageOf = (n: number) => STAGES.find(s => s.n === n);

function LibNav() {
  return (
    <nav className="tabs" aria-label="Разделы библиотеки">
      <NavLink className="chip" to="/library/lectures">Лекции</NavLink>
      <NavLink className="chip" to="/library/prompts">Промпты</NavLink>
      <NavLink className="chip" to="/library/templates">Шаблоны</NavLink>
      <NavLink className="chip" to="/library/resources">Цифровые ресурсы</NavLink>
    </nav>
  );
}

function StageFilter({ value, onChange, stages, extra }: { value: string; onChange: (v: string) => void; stages: number[]; extra?: { id: string; label: string } }) {
  return (
    <div className="tabs" role="group" aria-label="Фильтр по этапу">
      <button type="button" className="chip" aria-pressed={value === 'all'} onClick={() => onChange('all')}>Все</button>
      {stages.map(n => { const s = stageOf(n)!; return <button key={n} type="button" className="chip" aria-pressed={value === String(n)} onClick={() => onChange(String(n))}>{s.roman}. {s.name}</button>; })}
      {extra && <button type="button" className="chip" aria-pressed={value === extra.id} onClick={() => onChange(extra.id)}>{extra.label}</button>}
    </div>
  );
}

export function Library() {
  const items = [
    { to: '/library/lectures', t: 'Лекции', d: `${LECTURES.length} лекций прикладного слоя: геймификация, нарративный дизайн, CRAFT, модели педагогического дизайна, генеративный ИИ.` },
    { to: '/library/prompts', t: 'Промпты', d: `Все ${PROMPTS.length} промптов в исходном виде, с квадратными скобками.` },
    { to: '/library/templates', t: 'Шаблоны', d: `${TEMPLATES.length} пустых форм продуктов — для работы вне маршрута, например для коллег из группы.` },
    { to: '/library/resources', t: 'Цифровые ресурсы', d: 'Шесть групп ресурсов по этапам и три уровня цифровой инфраструктуры.' },
  ];
  return (
    <>
      <div className="view-head"><div className="eyebrow">Справочно</div><h1>Библиотека</h1>
        <p className="lead">Материалы вне основного маршрута. Все элементы библиотеки доступны и из заданий по ссылкам.</p></div>
      <div className="grid g2">{items.map(i => <Link key={i.to} to={i.to} className="card stack" style={{ textDecoration: 'none', color: 'inherit' }}><h3>{i.t}</h3><p className="small muted">{i.d}</p></Link>)}</div>
    </>
  );
}

export function LibraryLectures() {
  const [params] = useSearchParams();
  const focus = params.get('l');
  const [f, setF] = useState(focus ? String(LECTURES.find(l => l.id === focus)?.stage ?? 'all') : 'all');
  const setOpenTask = useStore(s => s.setOpenTask);
  const navigate = useNavigate();
  useEffect(() => { if (focus) document.getElementById(focus)?.scrollIntoView({ block: 'start' }); }, [focus]);
  const list = LECTURES.filter(l => f === 'all' || String(l.stage) === f);
  const toTask = (id: string) => { const task = LECTURE_TASK[id]; setOpenTask(task.split('.')[0], task); navigate(`/stage/${task.split('.')[0]}`); };
  return (
    <>
      <div className="view-head"><div className="eyebrow">Библиотека</div><h1>Лекции</h1><LibNav /></div>
      <StageFilter value={f} onChange={setF} stages={[2, 3, 4]} />
      <div className="stack">
        {list.map(l => { const s = stageOf(l.stage)!; return (
          <details key={l.id} id={l.id} className="basis" open={focus === l.id}>
            <summary><span><span className={`pill ${s.zone}`} style={{ marginRight: '.5rem' }}>{s.roman}. {s.name}</span>{l.title}</span></summary>
            <div className="body">
              <p className="lead" style={{ fontSize: '1rem' }}>{l.lead}</p>
              {l.sections.map(([h, b]) => <div key={h} className="stack" style={{ gap: '.3rem' }}><h3>{h}</h3><p>{b}</p></div>)}
              <div><button type="button" className="btn" onClick={() => toTask(l.id)}>К заданию, где это применяется — {LECTURE_TASK[l.id]}</button></div>
            </div>
          </details>
        ); })}
      </div>
    </>
  );
}

export function LibraryPrompts() {
  const [f, setF] = useState('all');
  const list = PROMPTS.filter(p => f === 'all' || String(p.stage) === f);
  return (
    <>
      <div className="view-head"><div className="eyebrow">Библиотека</div><h1>Промпты</h1>
        <p className="lead">Запросы по структуре «Контекст → Задание → Формат ответа → Требования» в исходном виде. Замените квадратные скобки своими данными; в заданиях маршрута они подставляются автоматически.</p><LibNav /></div>
      <StageFilter value={f} onChange={setF} stages={[1, 2, 3, 4, 5, 6]} extra={{ id: '0', label: 'Прикладные задачи курса' }} />
      <div className="grid g2">
        {list.map(p => { const s = stageOf(p.stage); return (
          <article key={p.id} className="card stack">
            <div className="row between"><span className={`pill ${s?.zone ?? ''}`}>{s ? `${s.roman}. ${s.name}` : 'сквозной модуль по ИИ'}</span>
              <button type="button" className="btn sm" onClick={async () => toast((await copyText(rawPrompt(p.id))) ? 'Скопировано' : 'Выделите текст и скопируйте вручную')}>Копировать</button></div>
            <h3>{p.id}. {p.title}</h3>
            <pre className="prompt">{p.text.split(/(<b>.*?<\/b>)/).map((part, i) => { const m = part.match(/^<b>(.*)<\/b>$/); return m ? <b key={i}>{m[1]}</b> : <span key={i}>{part}</span>; })}</pre>
          </article>
        ); })}
      </div>
    </>
  );
}

function TplField({ field, value, onChange }: { field: TemplateField; value: string; onChange: (v: string) => void }) {
  const id = useId(); const [, label, hint, kind] = field;
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      {kind === 'in' ? <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} aria-describedby={hint ? `${id}-h` : undefined} />
        : <textarea id={id} value={value} onChange={e => onChange(e.target.value)} aria-describedby={hint ? `${id}-h` : undefined} />}
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
    </div>
  );
}

export function LibraryTemplates() {
  const [tid, setTid] = useState('t1');
  const saved = useStore(s => s.templates[tid]) ?? {};
  const setTemplate = useStore(s => s.setTemplate);
  const t = TEMPLATES.find(x => x.id === tid)!;
  const s = stageOf(t.stage)!;
  const set = (k: string, v: string) => setTemplate(tid, { ...saved, [k]: v });
  const md = `# ${t.title}\n\n_Этап ${s.roman} — ${s.name}. Позиция: ${s.position}_\n\n` + t.fields.map(f => `## ${f[1]}\n\n${saved[f[0]]?.trim() || '—'}`).join('\n\n') + '\n';
  const fs = Object.fromEntries(t.fields.map(f => [f[0], f]));
  return (
    <>
      <div className="view-head"><div className="eyebrow">Библиотека</div><h1>Шаблоны</h1>
        <p className="lead">Пустые формы продуктов для работы вне маршрута. Сохраняются в этом браузере отдельно от витков и экспортируются в Markdown.</p><LibNav /></div>
      <div className="tabs" role="group" aria-label="Шаблон">{TEMPLATES.map(x => <button key={x.id} type="button" className="chip" aria-pressed={x.id === tid} onClick={() => setTid(x.id)}>{stageOf(x.stage)!.roman}. {x.title}</button>)}</div>
      <section className="card stack-lg">
        <div className="stack"><span className={`pill ${s.zone}`} style={{ alignSelf: 'flex-start' }}>этап {s.roman} — {s.position}</span><h2>{t.title}</h2><p>{t.intro}</p></div>
        {t.matrix ? (
          <>
            <div className="grid g2"><TplField field={fs.axisA} value={saved.axisA ?? ''} onChange={v => set('axisA', v)} /><TplField field={fs.axisB} value={saved.axisB ?? ''} onChange={v => set('axisB', v)} /></div>
            <div className="matrix">{['q1', 'q2', 'q3', 'q4'].map(q => <div className="quad" key={q}><TplField field={fs[q]} value={saved[q] ?? ''} onChange={v => set(q, v)} /></div>)}</div>
            <TplField field={fs.delphi} value={saved.delphi ?? ''} onChange={v => set('delphi', v)} />
          </>
        ) : t.fields.map(f => <TplField key={f[0]} field={f} value={saved[f[0]] ?? ''} onChange={v => set(f[0], v)} />)}
        <div className="row">
          <button type="button" className="btn primary" onClick={() => download(`shablon-${t.id}.md`, md)}>Скачать .md</button>
          <button type="button" className="btn" onClick={async () => toast((await copyText(md)) ? 'Скопировано' : 'Не удалось скопировать')}>Копировать</button>
          <button type="button" className="btn danger" onClick={() => { if (window.confirm('Очистить поля шаблона?')) setTemplate(tid, {}); }}>Очистить</button>
        </div>
      </section>
    </>
  );
}

export function LibraryResources() {
  const [g, setG] = useState(1);
  const grp = RGROUPS.find(x => x.n === g)!; const s = stageOf(grp.stage)!;
  return (
    <>
      <div className="view-head"><div className="eyebrow">Библиотека</div><h1>Цифровые ресурсы</h1>
        <p className="lead">Каждая группа соотнесена с этапом цикла и проектным требованием.</p><LibNav /></div>
      <div className="tabs" role="group" aria-label="Группа ресурсов">{RGROUPS.map(x => <button key={x.n} type="button" className="chip" aria-pressed={x.n === g} onClick={() => setG(x.n)}>{x.n}. {x.name}</button>)}</div>
      <section className="card stack">
        <div className="row"><span className={`pill ${s.zone}`}>этап {s.roman} — {s.name}</span><span className="pill">{s.position}</span></div>
        <h2>{grp.name} ресурсы</h2>
        <dl className="defl"><dt>Функция</dt><dd>{grp.fn}</dd><dt>Проектное требование</dt><dd>{grp.requirement}</dd></dl>
      </section>
      <div className="tbl-wrap"><table>
        <thead><tr><th scope="col">Тип ресурса</th><th scope="col">Назначение на этапе</th><th scope="col">Примеры платформ</th></tr></thead>
        <tbody>{grp.items.map(([a, b, c]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>)}</tbody>
      </table></div>
      <section className="stack"><div className="eyebrow">Трёхуровневая цифровая инфраструктура</div>
        <div className="grid g3">{INFRA.map(([t, d]) => <div key={t} className="card stack"><h4>{t}</h4><p className="small muted">{d}</p></div>)}</div>
        <p className="small muted">Платформы приведены как примеры из опыта апробации; технология не привязана к конкретному вендору — важна функция ресурса на этапе.</p>
      </section>
    </>
  );
}
