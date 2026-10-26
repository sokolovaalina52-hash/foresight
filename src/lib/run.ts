import { PRODUCT_TITLES } from '../content/tasks';
import { STAGES } from '../content/model';
import { ans } from './answers';
import { computeAttitude } from './diagnostics';
import { BUILDERS, PRODUCT_IDS, productStage } from './products';
import { taskAutoComplete } from './rules';
import type { Product, ProductId, Roadmap, Run, StageN } from './types';

const emptyPause = () => ({ content: '', process: '', done: false });

export function newRun(number: number, now = new Date(), prev?: Run): Run {
  const run: Run = {
    id: `run-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    number,
    startedAt: now.toISOString(),
    profile: prev ? { ...prev.profile } : { discipline: '', university: '', experienceYears: 0, horizon: null },
    entry: { attitude: null, selfScore: null },
    answers: {},
    products: {} as Record<ProductId, Product>,
    roadmapVersions: [],
    reflections: { 1: emptyPause(), 2: emptyPause(), 3: emptyPause(), 4: emptyPause(), 5: emptyPause(), 6: emptyPause() },
    opened: [],
    taskMarks: {},
    aiLog: [],
    aiResponses: {},
  };
  if (prev) {
    // Новый виток: 0.2/0.3 — из выхода предыдущего, 1.2 — из запроса 6.5
    const dyn = ans(prev, '6.2');
    run.answers['0.2'] = { picks: [...dyn.picks] };
    run.answers['0.3'] = { mc: dyn.mc, kp: dyn.kp, od: dyn.od, confirmed: dyn.confirmed };
    const rq = ans(prev, '6.5');
    if (rq.problem.trim()) {
      const h = prev.profile.horizon ?? 5;
      const empty: [string, string] = ['', ''];
      const lead: [string, string] = [rq.problem.trim(), ''];
      run.answers['1.2'] = { h5: h === 5 ? lead : empty, h10: h === 10 ? lead : empty, h15: h === 15 ? lead : empty, lead: h };
    }
    if (prev.isDemoCopy) run.isDemoCopy = true;
  }
  return deriveRun(run, now);
}

function roadmapVersions(run: Run, now: string): Roadmap[] {
  const goal = ans(run, '4.1').goal;
  const cell = ans(run, '4.1').scenario;
  const scenario = cell ? (ans(run, '3.2')[cell].title || '') : '';
  const out: Roadmap[] = [];
  const v1 = ans(run, '4.2').points;
  const prevV1 = run.roadmapVersions[0];
  if (v1.length) out.push({ version: 1, label: 'v1', savedAt: prevV1 && JSON.stringify(prevV1.points) === JSON.stringify(v1) ? prevV1.savedAt : now, scenario, goal, points: v1 });
  const c = ans(run, '5.4');
  if (c.savedAt) out.push({ version: 2, label: 'v2', savedAt: c.savedAt, scenario, goal, points: c.points });
  return out;
}

/** Пересчитывает производные поля витка: установки, продукты, версии карты, протокол VI этапа */
export function deriveRun(run: Run, now = new Date()): Run {
  const iso = now.toISOString();
  const r: Run = { ...run };
  const s0 = ans(r, '0.3');
  r.entry = { attitude: computeAttitude(ans(r, '0.2').picks), selfScore: s0.confirmed ? { mc: s0.mc, kp: s0.kp, od: s0.od } : null };
  const d = ans(r, '6.2');
  const exitAtt = computeAttitude(d.picks);
  r.exit = exitAtt || d.confirmed ? { attitude: exitAtt, selfScore: d.confirmed ? { mc: d.mc, kp: d.kp, od: d.od } : null } : undefined;
  const pr = ans(r, '6.1');
  r.reflections = { ...r.reflections, 6: { content: pr.content, process: pr.process, done: taskAutoComplete(r, '6.1') } };
  for (const n of [1, 2, 3, 4, 5] as StageN[]) {
    const p = r.reflections[n] || emptyPause();
    r.reflections[n] = { ...p, done: !!(p.content.trim() && p.process.trim()) };
  }
  r.roadmapVersions = roadmapVersions(r, iso);
  const products = {} as Record<ProductId, Product>;
  for (const id of PRODUCT_IDS) {
    const md = BUILDERS[id](r);
    const old = run.products?.[id];
    products[id] = { title: PRODUCT_TITLES[id], stage: productStage(id), markdown: md, updatedAt: old && old.markdown === md ? old.updatedAt : iso };
  }
  r.products = products;
  return r;
}

export function portfolioMarkdown(run: Run): string {
  const p = run.profile;
  const head = [
    `# Рефлексивное портфолио форсайт-цикла — виток ${run.number}`,
    run.isDemoCopy ? '> Учебный пример. Не является данными апробации.' : '',
    `- **Дисциплина:** ${p.discipline || '—'}`,
    p.university ? `- **Вуз:** ${p.university}` : '',
    `- **Стаж:** ${p.experienceYears || '—'} лет`,
    `- **Горизонт работы с будущим:** ${p.horizon ?? '—'} лет`,
    `- **Начало витка:** ${new Date(run.startedAt).toLocaleDateString('ru-RU')}${run.finishedAt ? ` · **завершение:** ${new Date(run.finishedAt).toLocaleDateString('ru-RU')}` : ''}`,
  ].filter(Boolean).join('\n');
  const products = PRODUCT_IDS.map(id => run.products[id]?.markdown || '').join('\n\n---\n\n');
  const refl = ([1, 2, 3, 4, 5] as StageN[]).map(n => {
    const r = run.reflections[n];
    return `### ${STAGES[n - 1].roman}. ${STAGES[n - 1].name}\n\n- **Что сделано на этапе:** ${r?.content?.trim() || '—'}\n- **Как это получалось:** ${r?.process?.trim() || '—'}`;
  }).join('\n\n');
  return `${head}\n\n---\n\n${products}\n\n---\n\n## Рефлексивные паузы\n\n${refl}\n`;
}
