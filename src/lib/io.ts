import type { ExportFile, Run } from './types';
import { deriveRun } from './run';

export function buildExport(runs: Run[], libraryTemplates: Record<string, Record<string, string>>, now = new Date()): ExportFile {
  return { app: 'forsight-navigator', format: 1, exportedAt: now.toISOString(), runs, libraryTemplates };
}

export class ImportError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

function validRun(r: unknown): r is Run {
  return isObj(r) && typeof r.id === 'string' && typeof r.number === 'number' && typeof r.startedAt === 'string' &&
    isObj(r.profile) && isObj(r.answers) && isObj(r.reflections);
}

/** Разбор файла резервной копии; бросает ImportError с понятным текстом */
export function parseImport(text: string): ExportFile {
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new ImportError('Файл не является корректным JSON.'); }
  if (!isObj(data) || data.app !== 'forsight-navigator') throw new ImportError('Это не резервная копия Форсайт-навигатора.');
  if (data.format !== 1) throw new ImportError('Неизвестная версия формата резервной копии.');
  if (!Array.isArray(data.runs) || !data.runs.every(validRun)) throw new ImportError('В файле повреждены данные витков.');
  // deriveRun сохраняет даты обновления продуктов и версий карты, если их содержимое не изменилось
  const runs = (data.runs as Run[]).map(r => deriveRun({
    ...r,
    opened: Array.isArray(r.opened) ? r.opened : [],
    taskMarks: isObj(r.taskMarks) ? r.taskMarks : {},
    aiLog: Array.isArray(r.aiLog) ? r.aiLog : [],
    aiResponses: isObj(r.aiResponses) ? r.aiResponses : {},
    roadmapVersions: Array.isArray(r.roadmapVersions) ? r.roadmapVersions : [],
    products: isObj(r.products) ? r.products : ({} as Run['products']),
  }));
  return {
    app: 'forsight-navigator', format: 1, exportedAt: String(data.exportedAt || ''),
    runs, libraryTemplates: isObj(data.libraryTemplates) ? (data.libraryTemplates as ExportFile['libraryTemplates']) : {},
  };
}

export function download(name: string, content: string, type = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export const dateStamp = (d = new Date()) => d.toISOString().slice(0, 10);
