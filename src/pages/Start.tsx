// Этап 0 — вход в цикл: профиль, экспресс-диагностика установки, самооценка S, экран «Ваш старт».
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AttitudeForm, AttitudeResultView, LevelCriteria, SelfScoreForm, SelfScoreResult } from '../components/Diagnostics';
import { NumberField, RadioGroup, TextField } from '../components/fields';
import { ans } from '../lib/answers';
import { attitudeName, fmt, LEVEL_NAMES, levelIndex, sInt, computeAttitude } from '../lib/diag';
import { stageComplete } from '../lib/progress';
import { isTaskDone } from '../lib/progress';
import { useReadOnly, useRun, useStore } from '../store/store';

export function Start() {
  const ensureRun = useStore(s => s.ensureRun);
  const demo = useStore(s => s.demo);
  useEffect(() => { if (!demo) ensureRun(); }, [demo, ensureRun]);
  const run = useRun();
  const updateRun = useStore(s => s.updateRun);
  const setAnswer = useStore(s => s.setAnswer);
  const ro = useReadOnly();
  if (!run) return null;

  const p = run.profile;
  const setProfile = (patch: Partial<typeof p>) => updateRun(r => ({ ...r, profile: { ...r.profile, ...patch } }));
  const diag = ans(run, '0.2').answers;
  const self = ans(run, '0.3');
  const attitude = computeAttitude(diag);
  const answered = diag.filter(x => x !== null).length;
  const ready = stageComplete(run, 0);
  const fromPrev = run.number > 1 && run.entry?.attitude;

  return (
    <>
      <div className="view-head">
        <div className="eyebrow">Этап 0 · Вход в цикл · виток {run.number}</div>
        <h1>Ваш старт</h1>
        <p className="lead">Три коротких шага перед этапом I: профиль, экспресс-диагностика установки по отношению к будущему и самооценка по трём компонентам. Данные хранятся только в этом браузере.</p>
        {fromPrev && <p className="note">Данные предзаполнены по итогам выхода из витка {run.number - 1}. Проверьте их и при необходимости измените.</p>}
      </div>

      <section className="card stack-lg" aria-labelledby="s01">
        <div className="row between"><h2 id="s01">0.1 Профиль</h2>{isTaskDone(run, '0.1') && <span className="pill ok">заполнено</span>}</div>
        <div className="grid g2">
          <TextField label="Дисциплина" required value={p.discipline} onChange={v => setProfile({ discipline: v })}
            placeholder="например, Органическая химия" hint="Курс, на материале которого вы будете проходить цикл." />
          <TextField label="Вуз" value={p.university} onChange={v => setProfile({ university: v })} hint="Необязательно." />
          <NumberField label="Стаж, лет" value={p.experienceYears || null} min={0} max={70} onChange={v => setProfile({ experienceYears: v ?? 0 })} hint="Стаж преподавания в вузе." />
        </div>
        <RadioGroup legend="Горизонт работы с будущим" required inline value={p.horizon} onChange={v => setProfile({ horizon: v })}
          hint="На какой срок вперёд вы будете строить сценарии и дорожную карту."
          options={[{ value: 5, label: '5 лет' }, { value: 10, label: '10 лет' }, { value: 15, label: '15 лет' }]} />
      </section>

      <section className="card stack-lg" aria-labelledby="s02">
        <div className="row between"><h2 id="s02">0.2 Экспресс-диагностика установки</h2>{attitude && <span className="pill ok">пройдено</span>}</div>
        <p className="small muted">Выберите в каждом утверждении вариант, который ближе к вашей практике. Ответы не оцениваются как «хорошие» или «плохие».</p>
        <AttitudeForm prefix="entry" answers={diag} onChange={a => {
          setAnswer('0.2', { answers: a });
          const res = computeAttitude(a);
          updateRun(r => ({ ...r, entry: { ...r.entry, attitude: res ?? undefined } }));
        }} />
        <AttitudeResultView result={attitude} answered={answered} />
      </section>

      <section className="card stack-lg" aria-labelledby="s03">
        <div className="row between"><h2 id="s03">0.3 Самооценка S</h2>{run.entry?.selfScore && <span className="pill ok">зафиксировано</span>}</div>
        <p className="small muted">Оцените себя по десятибалльной шкале по каждому компоненту. <span className="mono">S<sub>инт</sub> = (S<sub>мц</sub> + S<sub>кп</sub> + S<sub>од</sub>) / 3</span>.</p>
        <SelfScoreForm value={self} onChange={v => {
          setAnswer('0.3', v);
          updateRun(r => ({ ...r, entry: { ...r.entry, selfScore: { mc: v.mc, kp: v.kp, od: v.od } } }));
        }} />
        <SelfScoreResult value={self} />
        {!ro && !run.entry?.selfScore && (
          <div className="row"><button type="button" className="btn" onClick={() => updateRun(r => ({ ...r, entry: { ...r.entry, selfScore: { mc: self.mc, kp: self.kp, od: self.od } } }))}>Зафиксировать самооценку</button></div>
        )}
        <LevelCriteria />
      </section>

      <section className="card stack" aria-labelledby="s04" style={{ borderColor: ready ? 'var(--accent)' : undefined }}>
        <h2 id="s04">Ваш старт</h2>
        {ready && run.entry?.attitude && run.entry.selfScore ? (
          <>
            <dl className="defl">
              <dt>Установка</dt><dd><b>{attitudeName(run.entry.attitude.dominant)}</b></dd>
              <dt>Уровень</dt><dd><span className="num">S<sub>инт</sub> = {fmt(sInt(run.entry.selfScore))}</span> — {LEVEL_NAMES[levelIndex(sInt(run.entry.selfScore))]}</dd>
              <dt>Горизонт</dt><dd>{p.horizon} лет</dd>
              <dt>Дисциплина</dt><dd>{p.discipline}</dd>
            </dl>
            <div className="row"><Link className="btn primary" to="/stage/1">К этапу I</Link></div>
          </>
        ) : (
          <p className="muted">Заполните дисциплину и горизонт, ответьте на все утверждения диагностики и зафиксируйте самооценку — здесь появится сводка и переход к этапу I.</p>
        )}
      </section>
    </>
  );
}
