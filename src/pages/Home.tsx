import { Link, useNavigate } from 'react-router-dom';
import { STAGES, ZONES } from '../content/model';
import { Spiral } from '../components/Spiral';
import { nodeStates } from '../components/Layout';
import { currentStage, stageProgress, stageStatus } from '../lib/rules';
import { useActiveRun, useStore } from '../store/store';

export default function Home() {
  const run = useActiveRun();
  const mode = useStore(s => s.mode);
  const startFirstRun = useStore(s => s.startFirstRun);
  const enterDemo = useStore(s => s.enterDemo);
  const exitDemo = useStore(s => s.exitDemo);
  const startNextRun = useStore(s => s.startNextRun);
  const nav = useNavigate();
  const cur = run ? currentStage(run) : 0;
  const curLabel = cur === 0 ? 'вход в цикл' : `этап ${STAGES[cur - 1].roman}. ${STAGES[cur - 1].name}`;

  return (
    <div className="wrap wide">
      <section className="grid g2" style={{ alignItems: 'center' }}>
        <div className="stack-lg">
          <div className="eyebrow">Педагогическая технология нового типа</div>
          <h1>Шесть этапов, шесть позиций, один цикл работы с профессиональным будущим</h1>
          <p className="lead">Здесь вы проходите форсайт-цикл на материале собственного курса: на каждом этапе — задания, из ответов автоматически собирается проектный продукт. После шести этапов у вас — дорожная карта собственного развития, пакет прикладных продуктов для курса и рефлексивное портфолио.</p>
          <div className="row">
            {mode === 'demo' ? (
              <>
                <button type="button" className="btn primary" onClick={() => nav('/start')}>Начать показ примера</button>
                <button type="button" className="btn" onClick={() => exitDemo()}>Выйти из демо</button>
              </>
            ) : !run ? (
              <>
                <button type="button" className="btn primary" onClick={() => { startFirstRun(); nav('/start'); }}>Начать новый проход</button>
                <button type="button" className="btn" onClick={() => { enterDemo().then(() => nav('/start')); }}>Открыть демонстрационный пример</button>
              </>
            ) : run.finishedAt ? (
              <>
                <button type="button" className="btn primary" onClick={() => { startNextRun(); nav('/start'); }}>Начать виток {run.number + 1}</button>
                <Link className="btn" to="/summary">Итог витка {run.number}</Link>
                <button type="button" className="btn" onClick={() => { enterDemo().then(() => nav('/start')); }}>Демонстрационный пример</button>
              </>
            ) : (
              <>
                <button type="button" className="btn primary" onClick={() => nav(cur === 0 ? '/start' : `/stage/${cur}`)}>Продолжить: {curLabel}</button>
                <button type="button" className="btn" onClick={() => { enterDemo().then(() => nav('/start')); }}>Демонстрационный пример</button>
              </>
            )}
          </div>
          <p className="small muted">Ответы хранятся только в этом браузере и никуда не передаются. Резервная копия и перенос на другое устройство — в <Link to="/settings">настройках</Link>.</p>
        </div>
        <div className="stack">
          <Spiral size={460} states={run ? nodeStates(run) : undefined} onSelect={n => nav(`/stage/${n}`)} />
          <div className="zone-legend">{ZONES.map(z => <span key={z.id}><i style={{ background: `var(--${z.id})` }} />{z.short}</span>)}</div>
        </div>
      </section>

      {run && (
        <section className="card stack" aria-labelledby="turn-h">
          <div className="row between"><h2 id="turn-h" style={{ fontSize: '1.15rem' }}>Виток {run.number}{run.isDemoCopy ? ' · учебный пример' : ''}</h2>{run.finishedAt && <span className="pill ok">завершён</span>}</div>
          <div className="grid g3">
            {STAGES.map(s => {
              const p = stageProgress(run, s.n);
              const st = stageStatus(run, s.n);
              return (
                <Link key={s.n} to={`/stage/${s.n}`} className="stage-link">
                  <span className={`pill ${s.zone}`}>{s.roman}</span><span>{s.name}</span>
                  <span className="small muted num">{st === 'done' ? 'готово' : st === 'partial' ? 'не полностью' : `${p.done}/${p.total}`}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid g3">
        <div className="card stack"><div className="eyebrow">Как устроено</div><h2 className="h3">Опора → задания → продукт</h2><p className="small">Перед заданиями — короткая опора на один экран. Каждое задание сразу пополняет продукт этапа; его можно скопировать, скачать в .md и открыть в портфолио.</p></div>
        <div className="card stack"><div className="eyebrow">ИИ как черновик</div><h2 className="h3">Промпты с вашими ответами</h2><p className="small">Кнопка «Использовать с ИИ» подставляет уже введённые ответы в промпт. Вставьте его в YandexGPT, GigaChat или ChatGPT — решение остаётся за вами.</p></div>
        <div className="card stack"><div className="eyebrow">Без жёстких блокировок</div><h2 className="h3">Следующий этап — по готовности</h2><p className="small">Этап открывается после обязательных заданий и рефлексивной паузы. Можно открыть досрочно — этап будет помечен «пройден не полностью».</p></div>
      </section>

      <p className="footer-note">Приложение воспроизводит содержательно-процессуальную модель диссертационного исследования А.С. Соколовой «Форсайт-технология профессионального развития преподавателей вузов с использованием цифровых ресурсов» (специальность 5.8.7). <Link to="/about">О технологии →</Link></p>
    </div>
  );
}
