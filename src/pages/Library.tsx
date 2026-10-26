import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { LECTURES } from '../content/lectures';
import { STAGES } from '../content/model';
import { PROMPTS } from '../content/prompts';
import { INFRA, RGROUPS } from '../content/resources';
import { LECTURE_TASK } from '../content/tasks';
import { TEMPLATES } from '../content/templates';
import type { TemplateDef } from '../content/types';
import { CopyButton, DownloadButton } from '../components/ui';
import { stripTags } from '../lib/prompts';
import { useStore } from '../store/store';

const stageOf = (n: number) => STAGES.find(s => s.n === n);

function Lectures() {
  const [params, setParams] = useSearchParams();
  const openId = params.get('open');
  const f = params.get('stage') ?? (openId ? String(LECTURES.find(l => l.id === openId)?.stage ?? 'all') : 'all');
  const list = LECTURES.filter(l => f === 'all' || String(l.stage) === f);
  useEffect(() => { if (openId) document.getElementById(openId)?.scrollIntoView({ block: 'start' }); }, [openId]);
  return (
    <>
      <p className="lead">Технология построена двухслойно: первый слой — форсайт-методы этапов, второй — прикладные задачи преподавательской практики, на материале которых методы присваиваются. Геймификация — потому что это проектирование по сценарию; карта пути студента — потому что это картирование; генеративный ИИ — потому что это аналитический ресурс.</p>
      <div className="tabs" role="group" aria-label="Фильтр по этапу">
        <button type="button" className="chip" aria-pressed={f === 'all'} onClick={() => setParams({ stage: 'all' })}>Все</button>
        {[2, 3, 4].map(n => <button key={n} type="button" className="chip" aria-pressed={f === String(n)} onClick={() => setParams({ stage: String(n) })}>{stageOf(n)!.roman}. {stageOf(n)!.name}</button>)}
      </div>
      <div className="stack">
        {list.map(l => {
          const s = stageOf(l.stage)!;
          const task = LECTURE_TASK[l.id];
          return (
            <details key={l.id} id={l.id} className="opora" open={openId === l.id}>
              <summary><span><span className={`pill ${s.zone}`} style={{ marginRight: 8 }}>{s.roman}. {s.name}</span>{l.title}</span></summary>
              <div className="body">
                <p className="lead" style={{ fontSize: '1rem' }}>{l.lead}</p>
                {l.sections.map(([h, b]) => <div key={h} className="stack" style={{ gap: 4 }}><h2 className="h4">{h}</h2><p>{b}</p></div>)}
                {task && <div><Link className="btn sm primary" to={`/stage/${task[0]}?task=${task}`}>К заданию, где это применяется ({task})</Link></div>}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

function Prompts() {
  const [f, setF] = useState('all');
  const list = PROMPTS.filter(p => f === 'all' || String(p.stage) === f);
  return (
    <>
      <p className="lead">Запросы к генеративным языковым моделям (YandexGPT, GigaChat, ChatGPT) по структуре «Контекст → Задание → Формат ответа → Требования». Замените квадратные скобки своими данными. Модель — черновик и когнитивный посредник; экспертное суждение остаётся за преподавателем.</p>
      <p className="small muted">Здесь — исходный вид промптов. В заданиях кнопка «Использовать с ИИ» подставляет ваши ответы автоматически.</p>
      <div className="tabs" role="group" aria-label="Фильтр по этапу">
        <button type="button" className="chip" aria-pressed={f === 'all'} onClick={() => setF('all')}>Все</button>
        {STAGES.map(s => <button key={s.n} type="button" className="chip" aria-pressed={f === String(s.n)} onClick={() => setF(String(s.n))}>{s.roman}. {s.name}</button>)}
        <button type="button" className="chip" aria-pressed={f === '0'} onClick={() => setF('0')}>Прикладные задачи курса</button>
      </div>
      <div className="grid g2">
        {list.map(p => {
          const s = stageOf(p.stage);
          return (
            <article key={p.id} className="card stack">
              <div className="row between"><span className={`pill ${s?.zone ?? ''}`}>{s ? `${s.roman}. ${s.name}` : 'сквозной модуль по ИИ'}</span><CopyButton text={stripTags(p.text)} /></div>
              <h2 className="h3">{p.id}. {p.title}</h2>
              <pre className="prompt">{p.text.split(/(<b>.*?<\/b>)/).map((part, i) => part.startsWith('<b>') ? <b key={i}>{stripTags(part)}</b> : <span key={i}>{part}</span>)}</pre>
            </article>
          );
        })}
      </div>
    </>
  );
}

function templateMd(t: TemplateDef, v: Record<string, string>) {
  const s = stageOf(t.stage)!;
  return `## ${t.title}\n\n*Этап ${s.roman} — ${s.name}. Позиция: ${s.position}*\n\n${t.fields.map(f => `### ${f[1]}\n\n${v[f[0]]?.trim() || '—'}`).join('\n\n')}\n`;
}

function Templates() {
  const [id, setId] = useState(TEMPLATES[0].id);
  const saved = useStore(s => s.libraryTemplates);
  const setTemplate = useStore(s => s.setTemplate);
  const t = TEMPLATES.find(x => x.id === id)!;
  const s = stageOf(t.stage)!;
  const v = saved[t.id] || {};
  const set = (k: string, val: string) => setTemplate(t.id, { ...v, [k]: val });
  const field = ([fid, label, hint, kind]: TemplateDef['fields'][number]) => (
    <div key={fid} className="f">
      <label className="lbl" htmlFor={`tf-${t.id}-${fid}`}>{label}</label>
      {kind === 'in'
        ? <input id={`tf-${t.id}-${fid}`} type="text" value={v[fid] || ''} onChange={e => set(fid, e.target.value)} aria-describedby={hint ? `tf-${t.id}-${fid}-h` : undefined} />
        : <textarea id={`tf-${t.id}-${fid}`} value={v[fid] || ''} onChange={e => set(fid, e.target.value)} aria-describedby={hint ? `tf-${t.id}-${fid}-h` : undefined} />}
      {hint && <span className="hint" id={`tf-${t.id}-${fid}-h`}>{hint}</span>}
    </div>
  );
  const fs = Object.fromEntries(t.fields.map(f => [f[0], f]));
  return (
    <>
      <p className="lead">Шесть продуктов — по одному на этап — как пустые формы для работы вне маршрута, например для коллег из группы. Сохраняются в этом браузере отдельно от ваших витков.</p>
      <div className="tabs" role="group" aria-label="Шаблоны">
        {TEMPLATES.map(x => <button key={x.id} type="button" className="chip" aria-pressed={x.id === t.id} onClick={() => setId(x.id)}>{stageOf(x.stage)!.roman}. {x.title}</button>)}
      </div>
      <section className="card stack-lg">
        <span className={`pill ${s.zone}`} style={{ alignSelf: 'flex-start' }}>этап {s.roman} — {s.position}</span>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
        {t.matrix ? (
          <>
            <div className="inline-fields">{field(fs.axisA)}{field(fs.axisB)}</div>
            <div className="matrix">{['q1', 'q2', 'q3', 'q4'].map(q => (
              <div key={q} className="quad">
                <label className="qt" htmlFor={`tf-${t.id}-${q}`}>{fs[q][1]}</label>
                <textarea id={`tf-${t.id}-${q}`} value={v[q] || ''} placeholder={fs[q][2]} onChange={e => set(q, e.target.value)} />
              </div>
            ))}</div>
            {field(fs.delphi)}
          </>
        ) : t.fields.map(field)}
        <div className="row">
          <CopyButton className="btn primary" text={() => templateMd(t, v)} label="Копировать как текст" />
          <DownloadButton className="btn" name={`shablon-${t.id}.md`} content={() => templateMd(t, v)} />
          <button type="button" className="btn" onClick={() => setTemplate(t.id, {})}>Очистить</button>
        </div>
      </section>
    </>
  );
}

function Resources() {
  const [n, setN] = useState(1);
  const g = RGROUPS.find(x => x.n === n)!;
  const s = stageOf(g.stage)!;
  return (
    <>
      <p className="lead">Каждая группа соотнесена с этапом цикла и проектным требованием. Ресурсы — имманентный компонент технологии: без них цикл не воспроизводится. Ресурс, освоенный на собственной задаче, остаётся в практике; ресурс, показанный на лекции, забывается.</p>
      <div className="tabs" role="group" aria-label="Группы ресурсов">
        {RGROUPS.map(x => <button key={x.n} type="button" className="chip" aria-pressed={x.n === n} onClick={() => setN(x.n)}>{x.n}. {x.name}</button>)}
      </div>
      <section className="card stack">
        <div className="row"><span className={`pill ${s.zone}`}>этап {s.roman} — {s.name}</span><span className="pill">{s.position}</span></div>
        <h2>{g.name} ресурсы</h2>
        <dl className="defl"><dt>Функция</dt><dd>{g.fn}</dd><dt>Проектное требование</dt><dd>{g.requirement}</dd></dl>
      </section>
      <div className="tbl-wrap">
        <table className="t"><thead><tr><th>Тип ресурса</th><th>Назначение на этапе</th><th>Примеры платформ</th></tr></thead>
          <tbody>{g.items.map(([a, b, c]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>)}</tbody></table>
      </div>
      <section className="stack">
        <div className="eyebrow">Трёхуровневая цифровая инфраструктура</div>
        <div className="grid g3">{INFRA.map(([t, d]) => <div key={t} className="card stack"><h3 className="h4">{t}</h3><p className="small muted">{d}</p></div>)}</div>
        <p className="small muted">Платформы приведены как примеры из опыта апробации; технология не привязана к конкретному вендору — важна функция ресурса на этапе.</p>
      </section>
    </>
  );
}

const TABS: [string, string][] = [['lectures', 'Лекции'], ['prompts', 'Промпты'], ['templates', 'Шаблоны'], ['resources', 'Цифровые ресурсы']];

export default function Library() {
  const tab = useParams().tab;
  if (!TABS.some(([k]) => k === tab)) return <Navigate to="/library/lectures" replace />;
  return (
    <div className="wrap">
      <header className="view-head">
        <div className="eyebrow">Справочно, вне маршрута</div>
        <h1>Библиотека</h1>
      </header>
      <nav className="tabs" aria-label="Разделы библиотеки">
        {TABS.map(([k, l]) => <NavLink key={k} to={`/library/${k}`} className={({ isActive }) => `chip${isActive ? ' active' : ''}`}>{l}</NavLink>)}
      </nav>
      {tab === 'lectures' && <Lectures />}
      {tab === 'prompts' && <Prompts />}
      {tab === 'templates' && <Templates />}
      {tab === 'resources' && <Resources />}
    </div>
  );
}
