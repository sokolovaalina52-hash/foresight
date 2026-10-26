// Создание витков, пересборка производных данных, экспорт и импорт.
import { STAGES } from '../content/model';
import { ans, uid } from './answers';
import { attitudeName, fmt, isFull, sInt } from './diag';
import { buildProduct, PRODUCT_KEYS } from './products';
import { roadmapVersions } from './roadmap';
import type { Run } from './types';

export function newRun(number = 1, prev?: Run): Run {
  const run: Run = {
    id: uid(), number, startedAt: new Date().toISOString(),
    profile: prev ? { ...prev.profile } : { discipline: '', university: '', experienceYears: 0, horizon: 10 },
    answers: {}, products: {}, roadmapVersions: [], reflections: {}, aiNotes: {}, promptLog: [], undone: [], earlyOpened: [],
  };
  if (prev?.exit) {
    // Новый виток предзаполняется данными выхода предыдущего: установка, S, запрос на новый виток.
    run.entry = structuredClone(prev.exit);
    run.answers['0.2'] = { answers: [...ans(prev, '6.2').answers] };
    run.answers['0.3'] = { ...prev.exit.selfScore };
    const req = ans(prev, '6.5');
    if (req.problem.trim()) run.answers['1.2'] = { h5: ['', ''], h10: ['', ''], h15: ['', ''], lead: null, fromPrev: req.problem.trim() };
  }
  return derive(run);
}

/** Пересобирает продукты и версии карты из ответов. Вызывается после каждого изменения. */
export function derive(run: Run): Run {
  const products = { ...run.products };
  for (const k of PRODUCT_KEYS) {
    const p = buildProduct(run, k);
    products[k] = products[k]?.markdown === p.markdown ? products[k] : p;
  }
  const next = { ...run, products };
  next.roadmapVersions = roadmapVersions(next);
  return next;
}

export const activeRun = (runs: Run[]): Run | undefined => [...runs].reverse().find(r => !r.finishedAt) ?? runs[runs.length - 1];

/* ---------- JSON ---------- */

export type Backup = { app: 'forsight-navigator'; version: 1; exportedAt: string; runs: Run[]; templates: Record<string, Record<string, string>> };

export function exportJSON(runs: Run[], templates: Record<string, Record<string, string>>): string {
  const data: Backup = { app: 'forsight-navigator', version: 1, exportedAt: new Date().toISOString(), runs, templates };
  return JSON.stringify(data, null, 2);
}

export function importJSON(text: string): Backup {
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error('Файл не является корректным JSON.'); }
  if (!data || data.app !== 'forsight-navigator' || !Array.isArray(data.runs)) throw new Error('Это не резервная копия Форсайт-навигатора.');
  for (const r of data.runs) {
    if (!r || typeof r.id !== 'string' || typeof r.number !== 'number' || typeof r.answers !== 'object') throw new Error('В резервной копии повреждены данные витка.');
  }
  const runs: Run[] = data.runs.map((r: Run) => derive({
    ...r, products: r.products ?? {}, reflections: r.reflections ?? {}, aiNotes: r.aiNotes ?? {}, promptLog: r.promptLog ?? [],
    undone: r.undone ?? [], earlyOpened: r.earlyOpened ?? [], roadmapVersions: r.roadmapVersions ?? [],
  }));
  return { app: 'forsight-navigator', version: 1, exportedAt: data.exportedAt ?? '', runs, templates: data.templates ?? {} };
}

/* ---------- Markdown ---------- */

const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('ru-RU') : '—');

/** Портфолио витка: титул с профилем, продукты по порядку этапов, затем рефлексии. */
export function portfolioMarkdown(run: Run): string {
  const p = run.profile;
  const title = [
    `# Рефлексивное портфолио: виток ${run.number}`,
    run.example ? '_Учебный демонстрационный пример. Не является данными апробации._' : '',
    [`- Дисциплина: ${p.discipline || '—'}`, p.university ? `- Вуз: ${p.university}` : '', p.experienceYears ? `- Стаж: ${p.experienceYears} лет` : '',
      `- Горизонт работы с будущим: ${p.horizon} лет`, `- Начало витка: ${d(run.startedAt)}`, run.finishedAt ? `- Завершение витка: ${d(run.finishedAt)}` : '',
      isFull(run.entry) ? `- Установка на входе: ${attitudeName(run.entry.attitude.dominant)}; Sинт = ${fmt(sInt(run.entry.selfScore))}` : '',
      isFull(run.exit) ? `- Установка на выходе: ${attitudeName(run.exit.attitude.dominant)}; Sинт = ${fmt(sInt(run.exit.selfScore))}` : '',
    ].filter(Boolean).join('\n'),
  ].filter(Boolean).join('\n\n');
  const products = PRODUCT_KEYS.map(k => buildProduct(run, k).markdown.replace(/^(#+) /gm, '#$1 '));
  const refl = STAGES.slice(0, 5).map(s => {
    const r = run.reflections[s.n];
    return `### ${s.roman}. ${s.name}\n\n- Что сделано на этапе: ${r?.content?.trim() || '—'}\n- Как это получалось: ${r?.process?.trim() || '—'}`;
  });
  return `${title}\n\n${products.join('\n\n')}\n\n## Рефлексивные паузы\n\n${refl.join('\n\n')}\n`;
}

export function download(filename: string, text: string, type = 'text/markdown;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { return document.execCommand('copy'); } catch { return false; } finally { ta.remove(); }
  }
}
