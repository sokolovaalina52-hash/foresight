import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/** Рендер Markdown продуктов; HTML очищается — импортированный JSON не может внедрить разметку */
export function Markdown({ text, className = 'md' }: { text: string; className?: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text, { async: false }) as string), [text]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
