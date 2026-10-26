import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadButton, useToast } from '../components/ui';
import { dateStamp, ImportError, parseImport } from '../lib/io';
import { useStore, type Theme } from '../store/store';

export default function Settings() {
  const s = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const file = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const own = s.runs;

  const onImport = async (f: File) => {
    setErr('');
    try {
      const data = parseImport(await f.text());
      if (own.length && !confirm(`Заменить текущие данные (${own.length} вит${own.length === 1 ? 'ок' : 'ка/ов'}) данными из файла (${data.runs.length})?`)) return;
      s.importData(data);
      toast('Резервная копия восстановлена');
    } catch (e) {
      setErr(e instanceof ImportError ? e.message : 'Не удалось прочитать файл.');
    } finally {
      if (file.current) file.current.value = '';
    }
  };

  return (
    <div className="wrap">
      <header className="view-head"><div className="eyebrow">Настройки</div><h1>Данные и отображение</h1>
        <p className="lead">Все ответы хранятся только в этом браузере. Чтобы не потерять их и перенести на другое устройство, сохраняйте резервную копию.</p></header>

      <section className="card stack-lg" aria-labelledby="st-data">
        <h2 id="st-data" style={{ fontSize: '1.15rem' }}>Резервная копия</h2>
        <p className="small">Витков: {own.length}. Файл .json содержит все витки, ответы, продукты, версии дорожной карты, журнал промптов и шаблоны библиотеки.</p>
        <div className="row">
          <DownloadButton className="btn primary" name={`forsight-navigator-${dateStamp()}.json`} type="application/json" content={() => JSON.stringify(s.exportData(), null, 2)} label="Экспорт JSON" />
          <button type="button" className="btn" onClick={() => file.current?.click()}>Импорт JSON</button>
          <input ref={file} type="file" accept="application/json,.json" className="sr-only" aria-label="Файл резервной копии" onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); }} />
        </div>
        {err && <p className="note" role="alert">{err}</p>}
        <hr className="sep" />
        <div className="stack">
          <h3 style={{ fontSize: '1rem' }}>Сброс</h3>
          <p className="small muted">Удаляет все витки и шаблоны из этого браузера. Перед сбросом сохраните резервную копию.</p>
          <div><button type="button" className="btn danger" onClick={() => { if (confirm('Удалить все данные Форсайт-навигатора из этого браузера? Действие необратимо.')) { s.resetAll(); toast('Данные удалены'); nav('/'); } }}>Сбросить все данные</button></div>
        </div>
      </section>

      <section className="card stack-lg" aria-labelledby="st-view">
        <h2 id="st-view" style={{ fontSize: '1.15rem' }}>Отображение</h2>
        <fieldset className="f">
          <legend className="lbl" style={{ fontWeight: 600 }}>Тема</legend>
          <div className="row">
            {([['system', 'как в системе'], ['light', 'светлая'], ['dark', 'тёмная']] as [Theme, string][]).map(([k, l]) => (
              <label key={k} className="opt"><input type="radio" name="theme" checked={s.theme === k} onChange={() => s.setTheme(k)} /><span>{l}</span></label>
            ))}
          </div>
        </fieldset>
        <label className="check"><input type="checkbox" checked={s.present} onChange={e => s.setPresent(e.target.checked)} /><span>Режим презентации — увеличенный шрифт для показа на проекторе (в демо-режиме включается автоматически)</span></label>
      </section>

      <section className="card stack" aria-labelledby="st-demo">
        <h2 id="st-demo" style={{ fontSize: '1.15rem' }}>Демо-режим</h2>
        <p className="small">Заранее заполненный учебный виток для показа за 5–7 минут: старт → диагностика → этап II → этап III → этап IV → этап V → этап VI → портфолио → «Начать виток 2». Ваши данные при этом не меняются.</p>
        <div className="row">
          {s.mode === 'demo'
            ? <button type="button" className="btn" onClick={() => s.exitDemo()}>Выйти из демо</button>
            : <button type="button" className="btn primary" onClick={() => { s.enterDemo().then(() => nav('/start')); }}>Открыть демонстрационный пример</button>}
        </div>
      </section>
    </div>
  );
}
