// Минимальный рендер Markdown, которого достаточно для продуктов, собираемых приложением.
import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|_(.+?)_/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] !== undefined ? <b key={k++}>{m[1]}</b> : <em key={k++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0; let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4}) (.*)$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 4);
      const Tag = (`h${level}`) as 'h2';
      blocks.push(<Tag key={k++}>{inline(h[2])}</Tag>); i++; continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      blocks.push(
        <div className="tbl-wrap" key={k++}><table>
          <thead><tr>{cells(head).map((c, j) => <th key={j} scope="col">{inline(c)}</th>)}</tr></thead>
          <tbody>{body.map((r, j) => <tr key={j}>{cells(r).map((c, n) => <td key={n}>{inline(c)}</td>)}</tr>)}</tbody>
        </table></div>,
      );
      continue;
    }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      blocks.push(<ul key={k++}>{items.map((t, j) => {
        const box = t.match(/^\[( |x)\] (.*)$/);
        return <li key={j}>{box ? <label className="check" style={{ padding: 0 }}><input type="checkbox" checked={box[1] === 'x'} disabled readOnly /> <span>{inline(box[2])}</span></label> : inline(t)}</li>;
      })}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\d+\. /.test(lines[i]) || /^ {3}\S/.test(lines[i]))) {
        if (/^ {3}\S/.test(lines[i]) && items.length) items[items.length - 1] += '\n' + lines[i].trim();
        else items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{t.split('\n').map((p, n) => <span key={n} style={n ? { display: 'block', color: 'var(--muted)', fontSize: '.9em' } : undefined}>{inline(p)}</span>)}</li>)}</ol>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||- |\d+\. )/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{para.map((p, j) => <span key={j}>{j > 0 && <br />}{inline(p)}</span>)}</p>);
  }
  return <div className="md">{blocks}</div>;
}
