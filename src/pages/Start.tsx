import { Link, useNavigate } from 'react-router-dom';
import { AttitudeView, DiagForm, SelfScoreForm } from '../components/Diagnostics';
import { Field, TextInput } from '../components/ui';
import { ans } from '../lib/answers';
import { attitudeName, attitudeText, fmt2, LEVEL_NAMES, levelIndex, sInt } from '../lib/diagnostics';
import { entryDone, profileDone, taskDone } from '../lib/rules';
import type { Horizon } from '../lib/types';
import { useActiveRun, useReadOnly, useStore } from '../store/store';

export default function Start() {
  const run = useActiveRun();
  const readOnly = useReadOnly();
  const startFirstRun = useStore(s => s.startFirstRun);
  const setProfile = useStore(s => s.setProfile);
  const patchAnswer = useStore(s => s.patchAnswer);
  const openStage = useStore(s => s.openStage);
  const nav = useNavigate();

  if (!run) return (
    <div className="wrap"><div className="card stack"><h1>Вход в цикл</h1><p>Проход ещё не начат.</p>
      <div className="row"><button type="button" className="btn primary" onClick={startFirstRun}>Начать новый проход</button><Link to="/" className="btn">На главную</Link></div></div></div>
  );

  const p = run.profile;
  const diag = ans(run, '0.2');
  const self = ans(run, '0.3');
  const done = entryDone(run);
  const status = (ok: boolean) => <span className={`pill ${ok ? 'ok' : ''}`}>{ok ? 'выполнено' : 'не выполнено'}</span>;

  return (
    <div className="wrap">
      <header className="view-head">
        <div className="eyebrow">Этап 0 · Виток {run.number}</div>
        <h1>Вход в цикл</h1>
        <p className="lead">Профиль, экспресс-диагностика установки по отношению к будущему и самооценка. Это точка отсчёта: в конце витка вы пройдёте диагностику ещё раз и увидите динамику.</p>
        {run.number > 1 && <p className="note">Это виток {run.number}: диагностика и самооценка предзаполнены данными выхода предыдущего витка — проверьте и при необходимости измените.</p>}
      </header>

      <fieldset disabled={readOnly} className="stack-lg">
        <legend className="sr-only">Вход в цикл</legend>
        <section className="card stack-lg" aria-labelledby="s01">
          <div className="row between"><h2 id="s01" style={{ fontSize: '1.15rem' }}>0.1 Профиль</h2>{status(profileDone(run))}</div>
          <div className="inline-fields">
            <TextInput label="Дисциплина" required value={p.discipline} onChange={discipline => setProfile({ discipline })} placeholder="например: Органическая химия" hint="Курс, с которым вы пойдёте по циклу; подставляется в промпты" />
            <TextInput label="Вуз" value={p.university} onChange={university => setProfile({ university })} hint="Необязательно" />
            <Field label="Стаж, лет">
              {id => <input id={id} type="number" min={0} max={60} inputMode="numeric" value={p.experienceYears || ''} onChange={e => setProfile({ experienceYears: Math.max(0, Number(e.target.value) || 0) })} />}
            </Field>
          </div>
          <fieldset className="f">
            <legend className="lbl" style={{ fontWeight: 600 }}>Горизонт работы с будущим<span className="req" aria-hidden="true">*</span></legend>
            <div className="row">
              {([5, 10, 15] as Horizon[]).map(h => (
                <label key={h} className="opt" style={{ minWidth: 110 }}><input type="radio" name="horizon" checked={p.horizon === h} onChange={() => setProfile({ horizon: h })} /><span>{h} лет</span></label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card stack-lg" aria-labelledby="s02">
          <div className="row between"><h2 id="s02" style={{ fontSize: '1.15rem' }}>0.2 Экспресс-диагностика установки</h2>{status(taskDone(run, '0.2'))}</div>
          <p className="small muted">Экспресс-проверка для входа в цикл. Полный диагностический комплекс программы включает анкеты с трёхуровневой шкалой, опросник профессиональной мотивации, экспертные рубрики проектных продуктов и рефлексивные карты; здесь — ориентировочная самооценка, результат которой не передаётся никуда.</p>
          <DiagForm name="entry" picks={diag.picks} onChange={picks => patchAnswer('0.2', { picks })} />
          <AttitudeView picks={diag.picks} />
        </section>

        <section className="card stack-lg" aria-labelledby="s03">
          <div className="row between"><h2 id="s03" style={{ fontSize: '1.15rem' }}>0.3 Самооценка S</h2>{status(taskDone(run, '0.3'))}</div>
          <SelfScoreForm prefix="entry" value={{ mc: self.mc, kp: self.kp, od: self.od }} onChange={v => patchAnswer('0.3', { ...v, confirmed: true })} />
          {!self.confirmed && <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => patchAnswer('0.3', { confirmed: true })}>Зафиксировать самооценку</button>}
        </section>
      </fieldset>

      <section className="card stack" aria-labelledby="mystart">
        <h2 id="mystart" style={{ fontSize: '1.2rem' }}>Ваш старт</h2>
        {done && run.entry.attitude && run.entry.selfScore ? (
          <>
            <div className="kpis">
              <div className="kpi"><b>{attitudeName(run.entry.attitude)}</b><span>установка</span></div>
              <div className="kpi"><b className="num">{fmt2(sInt(run.entry.selfScore))}</b><span>Sинт — {LEVEL_NAMES[levelIndex(sInt(run.entry.selfScore))]} уровень</span></div>
              <div className="kpi"><b className="num">{p.horizon} лет</b><span>горизонт</span></div>
            </div>
            <p className="small">{attitudeText(run.entry.attitude)}</p>
          </>
        ) : <p className="small muted">Заполните дисциплину и горизонт, ответьте на все вопросы диагностики и зафиксируйте самооценку.</p>}
        <div className="row">
          <button type="button" className="btn primary" disabled={!done && !readOnly} onClick={() => nav('/stage/1')}>К этапу I</button>
          {!done && !readOnly && <button type="button" className="btn link" onClick={() => { openStage(1); nav('/stage/1'); }}>Открыть этап I досрочно</button>}
        </div>
      </section>
    </div>
  );
}
