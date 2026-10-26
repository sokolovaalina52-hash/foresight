import { Link, useSearchParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { portfolioMarkdown } from '../lib/run';
import type { ProductId } from '../lib/types';
import { activeOf, useRuns } from '../store/store';

/** Версия для печати: браузер сохраняет её в PDF через «Печать → Сохранить как PDF» */
export default function PrintView() {
  const runs = useRuns();
  const [params] = useSearchParams();
  const run = runs.find(r => r.id === params.get('run')) ?? activeOf(runs);
  const pid = params.get('p') as ProductId | null;
  if (!run) return <div className="main"><p>Нет данных для печати. <Link to="/">На старт</Link></p></div>;
  const text = pid && run.products[pid] ? run.products[pid].markdown : portfolioMarkdown(run);
  return (
    <div className="main" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="row no-print" style={{ marginBottom: 16 }}>
        <button type="button" className="btn primary" onClick={() => window.print()}>Печать / сохранить в PDF</button>
        <Link className="btn" to={pid ? `/portfolio?p=${pid}` : '/portfolio'}>← Назад в портфолио</Link>
      </div>
      <article className="product"><div className="pb full"><Markdown text={text} /></div></article>
    </div>
  );
}
