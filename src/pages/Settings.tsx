// Настройки: резервная копия JSON, импорт, сброс, тема, режим презентации, демо-режим.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/toast';
import { download, exportJSON, importJSON } from '../lib/run';
import { useStore, type Theme } from '../store/store';

export function Settings() {
  const { runs, templates, theme, presentation, demo, setTheme, setPresentation, setDemo, replaceAll, reset } = useStore();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onImport = async (file: File | undefined) => {
    setError('');
    if (!file) return;
    try {
      const data = importJSON(await file.text());
      if (runs.length && !window.confirm(`Импорт заменит текущие данные (${runs.length} вит.) данными из файла (${data.runs.length} вит.). Продолжить?`)) return;
      replaceAll(data.runs, data.templates);
      toast('Данные восстановлены');
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <>
      <div className="view-head"><div className="eyebrow">Настройки</div><h1>Данные и отображение</h1>
        <p className="lead">Все данные хранятся только в этом браузере. Чтобы перенести их на другое устройство или сохранить резервную копию, используйте экспорт в JSON.</p></div>

      <section className="card stack" aria-labelledby="h-backup">
        <h2 id="h-backup">Резервная копия</h2>
        <p className="small muted">В копию входят все витки, ответы, версии дорожной карты, рефлексивные паузы и шаблоны библиотеки.</p>
        <div className="row">
          <button type="button" className="btn primary" disabled={!runs.length} onClick={() => download(`forsight-navigator-${new Date().toISOString().slice(0, 10)}.json`, exportJSON(runs, templates), 'application/json')}>Экспорт JSON</button>
          <label className="btn" style={{ position: 'relative' }}>
            Импорт JSON
            <input type="file" accept="application/json,.json" className="sr-only" onChange={e => { onImport(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
        {error && <p role="alert" style={{ color: 'var(--bad)' }}>{error}</p>}
      </section>

      <section className="card stack" aria-labelledby="h-theme">
        <h2 id="h-theme">Тема</h2>
        <fieldset><legend className="sr-only">Тема оформления</legend>
          <div className="opts inline">
            {([['system', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']] as [Theme, string][]).map(([v, l]) => (
              <label className="opt" key={v}><input type="radio" name="theme" checked={theme === v} onChange={() => setTheme(v)} /><span>{l}</span></label>
            ))}
          </div>
        </fieldset>
        <label className="check"><input type="checkbox" checked={presentation} onChange={e => setPresentation(e.target.checked)} />
          <span>Режим презентации<span className="hint small muted" style={{ display: 'block' }}>Увеличенный масштаб: основной текст 20 px — читается с проектора.</span></span></label>
      </section>

      <section className="card stack" aria-labelledby="h-demo">
        <h2 id="h-demo">Демонстрационный пример</h2>
        <p className="small muted">Заранее заполненный виток условного преподавателя. Учебный пример, не данные апробации. Открывается только для просмотра; ваши данные не меняются.</p>
        <div className="row">
          {demo ? <button type="button" className="btn" onClick={() => setDemo(false)}>Выйти из примера</button>
            : <button type="button" className="btn" onClick={() => { setDemo(true); navigate('/start'); }}>Открыть пример</button>}
          {demo && <button type="button" className="btn" onClick={() => {
            if (runs.length && !window.confirm('Копия примера заменит ваши сохранённые витки. Продолжить?')) return;
            useStore.getState().copyDemo(); toast('Создана копия для редактирования');
          }}>Сделать копию и редактировать</button>}
        </div>
      </section>

      <section className="card stack" aria-labelledby="h-reset">
        <h2 id="h-reset">Сброс</h2>
        <p className="small muted">Удаляет все витки и шаблоны из этого браузера. Действие необратимо — сначала сделайте экспорт.</p>
        <div><button type="button" className="btn danger" disabled={!runs.length && !Object.keys(templates).length} onClick={() => {
          if (window.confirm('Удалить все данные Форсайт-навигатора из этого браузера?')) { reset(); toast('Данные удалены'); navigate('/'); }
        }}>Сбросить все данные</button></div>
      </section>
    </>
  );
}
