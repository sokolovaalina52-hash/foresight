// Кнопка «Использовать с ИИ»: промпт с подставленными ответами в модальном окне.
import { useRef } from 'react';
import { PROMPTS } from '../content/prompts';
import { fillPrompt, fillPromptSegments, type PromptExtra } from '../lib/prompts';
import { copyText } from '../lib/run';
import { useRun, useStore } from '../store/store';
import { toast } from './toast';

export function AiButton({ promptId, taskId, extra, label = 'Использовать с ИИ' }: { promptId: number; taskId: string; extra?: PromptExtra; label?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const run = useRun();
  const logPrompt = useStore(s => s.logPrompt);
  const p = PROMPTS.find(x => x.id === promptId)!;
  const segs = fillPromptSegments(promptId, run, extra);
  const missing = segs.filter(s => !s.filled && /^\[.*\]$/.test(s.text)).length;
  const copy = async () => {
    const ok = await copyText(fillPrompt(promptId, run, extra));
    toast(ok ? 'Промпт скопирован' : 'Выделите текст и скопируйте вручную');
    if (ok) logPrompt(promptId, taskId);
  };
  return (
    <>
      <button type="button" className="btn sm" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">{label} · промпт {promptId}</button>
      <dialog ref={ref} aria-labelledby={`pd-${taskId}-${promptId}`} onClick={e => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="dlg">
          <div className="dlg-head">
            <div className="stack" style={{ gap: '.2rem' }}>
              <span className="eyebrow">Промпт {p.id}</span>
              <h3 id={`pd-${taskId}-${promptId}`}>{p.title}</h3>
            </div>
            <button type="button" className="btn sm" onClick={() => ref.current?.close()}>Закрыть</button>
          </div>
          <div className="dlg-body">
            <p className="small muted">Подсвечены ваши ответы, подставленные в промпт. {missing ? `Квадратные скобки остались там, где данных ещё нет (${missing}) — замените их вручную после вставки.` : 'Все поля промпта заполнены вашими ответами.'}</p>
            <pre className="prompt">{segs.map((s, i) => s.bold ? <b key={i}>{s.text}</b> : s.filled ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>)}</pre>
          </div>
          <div className="dlg-foot">
            <p className="small muted" style={{ maxWidth: '34rem' }}>Вставьте в YandexGPT, GigaChat или ChatGPT; ответ модели — черновик, решение за вами.</p>
            <button type="button" className="btn primary" onClick={copy}>Копировать</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
