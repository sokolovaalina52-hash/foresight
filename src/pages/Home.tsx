// Старт: приветствие и выбор «Начать новый проход» / «Продолжить» / «Демонстрационный пример».
import { Link, useNavigate } from 'react-router-dom';
import { Spiral, type NodeState } from '../components/Spiral';
import { STAGES, ZONES } from '../content/model';
import { activeRun } from '../lib/run';
import { currentStage, overallProgress, partiallyPassed, stageComplete } from '../lib/progress';
import { useStore } from '../store/store';

export function Home() {
  const runs = useStore(s => s.runs);
  const startFresh = useStore(s => s.startFresh);
  const setDemo = useStore(s => s.setDemo);
  const navigate = useNavigate();
  const run = activeRun(runs);
  const cur = run ? currentStage(run) : 0;
  const states: Record<number, NodeState> | undefined = run ? Object.fromEntries(STAGES.map(s => [s.n,
    stageComplete(run, s.n) ? 'done' : partiallyPassed(run, s.n) ? 'partial' : s.n === cur ? 'current' : 'todo'])) : undefined;
  const continueTo = !run ? '/start' : run.finishedAt ? '/summary' : cur === 0 ? '/start' : cur === 7 ? '/stage/6' : `/stage/${cur}`;

  const fresh = () => {
    if (runs.length && !window.confirm('Новый проход заменит все сохранённые витки в этом браузере. Сначала сделайте резервную копию в «Настройках». Продолжить?')) return;
    startFresh(); setDemo(false); navigate('/start');
  };
  const demo = () => { setDemo(true); navigate('/start'); };

  return (
    <>
      <section className="grid g2" style={{ alignItems: 'center', gap: '1.75rem' }}>
        <div className="stack-lg">
          <div className="eyebrow">Рабочая среда преподавателя</div>
          <h1>Форсайт-цикл: шесть этапов, от проблемы до дорожной карты</h1>
          <p className="lead">Пройдите форсайт-цикл на материале собственного курса. На каждом этапе — задания с полями ввода; из ответов автоматически собирается проектный продукт. После шести этапов у вас будут дорожная карта собственного развития, пакет прикладных продуктов для курса и рефлексивное портфолио.</p>
          <div className="row">
            {run && <Link className="btn primary" to={continueTo}>Продолжить — {run.finishedAt ? `итог витка ${run.number}` : cur === 0 ? 'вход в цикл' : cur === 7 ? 'этап VI' : `этап ${STAGES[cur - 1].roman}`}</Link>}
            <button type="button" className={`btn${run ? '' : ' primary'}`} onClick={fresh}>Начать новый проход</button>
            <button type="button" className="btn" onClick={demo}>Демонстрационный пример</button>
          </div>
          {run && (
            <div className="stack" style={{ maxWidth: '26rem' }}>
              <div className="row between small"><span>Виток {run.number} · {run.profile.discipline || 'дисциплина не указана'}</span><span className="num muted">{Math.round(overallProgress(run) * 100)} %</span></div>
              <div className="progress"><i style={{ width: `${overallProgress(run) * 100}%` }} /></div>
            </div>
          )}
          <p className="small muted">Данные хранятся только в этом браузере и никуда не передаются. Резервная копия и перенос между устройствами — в «Настройках».</p>
        </div>
        <div>
          <Spiral size={520} states={states} />
          <div className="legend" style={{ justifyContent: 'center' }}>{ZONES.map(z => <span key={z.id}><i style={{ background: `var(--${z.id})` }} />{z.short}</span>)}</div>
        </div>
      </section>
      <section className="grid g3">
        <div className="card stack"><div className="eyebrow">Как устроен этап</div><p className="small">Короткая опора перед заданиями, задания по одному, живой предпросмотр продукта и рефлексивная пауза. Следующий этап открывается, когда выполнены обязательные задания.</p></div>
        <div className="card stack"><div className="eyebrow">Работа с ИИ</div><p className="small">Кнопка «Использовать с ИИ» копирует промпт, в который уже подставлены ваши ответы. Ответ модели — черновик: его можно вставить рядом с заданием.</p></div>
        <div className="card stack"><div className="eyebrow">Справочно</div><p className="small">Лекции, промпты, шаблоны и цифровые ресурсы — в <Link to="/library">Библиотеке</Link>; концепция и результаты апробации — в разделе <Link to="/about">«О технологии»</Link>.</p></div>
      </section>
    </>
  );
}
