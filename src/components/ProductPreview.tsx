// Живой предпросмотр продукта этапа с копированием, скачиванием и переходом в портфолио.
import { Link } from 'react-router-dom';
import { copyText, download } from '../lib/run';
import type { Product, ProductKey } from '../lib/types';
import { Markdown } from './Markdown';
import { toast } from './toast';

export function ProductActions({ product, pkey, toPortfolio = true }: { product: Product; pkey: ProductKey; toPortfolio?: boolean }) {
  return (
    <div className="row no-print">
      <button type="button" className="btn sm" onClick={async () => toast((await copyText(product.markdown)) ? 'Скопировано' : 'Выделите текст и скопируйте вручную')}>Копировать</button>
      <button type="button" className="btn sm" onClick={() => download(`${pkey}-${product.title.replace(/\s+/g, '-')}.md`, product.markdown)}>Скачать .md</button>
      {toPortfolio && <Link className="btn sm" to={`/portfolio?p=${pkey}`}>Открыть в портфолио</Link>}
    </div>
  );
}

export function ProductPreview({ product, pkey, children }: { product: Product; pkey: ProductKey; children?: React.ReactNode }) {
  return (
    <section className="product" aria-labelledby={`pp-${pkey}`}>
      <div className="product-head">
        <div><div className="eyebrow">Продукт этапа · обновляется по мере заполнения</div><h3 id={`pp-${pkey}`}>{product.title}</h3></div>
        <ProductActions product={product} pkey={pkey} />
      </div>
      <div className="product-body"><Markdown text={product.markdown.replace(/^# .*\n+/, '')} /></div>
      {children && <div style={{ padding: '0 1.1rem 1rem' }}>{children}</div>}
    </section>
  );
}
