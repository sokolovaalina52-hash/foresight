import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';
import { STAGES, ZONES, REQUIREMENTS } from '../src/content/model';
import { RGROUPS, INFRA } from '../src/content/resources';
import { CONDITIONS, MODULES } from '../src/content/support';
import { LEVELS, DIAG_Q } from '../src/content/diagnostics';
import { RESULTS } from '../src/content/results';
import { PROMPTS } from '../src/content/prompts';
import { TEMPLATES } from '../src/content/templates';
import { LECTURES } from '../src/content/lectures';

// Контент перенесён из исходного HTML без переформулирования — сверяем с источником
describe('контент совпадает с forsight-navigator.html', () => {
  const html = fs.readFileSync(new URL('../source/forsight-navigator.html', import.meta.url), 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
  const ctx: Record<string, unknown> = {};
  vm.createContext(ctx);
  vm.runInContext(script + ';globalThis.__o={ZONES,STAGES,RGROUPS,INFRA,CONDITIONS,MODULES,REQUIREMENTS,LEVELS,RESULTS,DIAG_Q,PROMPTS,TEMPLATES,LECTURES};', ctx);
  const src = JSON.parse(JSON.stringify(ctx.__o));
  const ours = { ZONES, STAGES, RGROUPS, INFRA, CONDITIONS, MODULES, REQUIREMENTS, LEVELS, RESULTS, DIAG_Q, PROMPTS, TEMPLATES, LECTURES };
  for (const [k, v] of Object.entries(ours)) it(k, () => expect(v).toEqual(src[k]));
  it('порядок этапов I → VI смысловой', () => expect(STAGES.map(s => s.roman)).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI']));
  it('цифры апробации — дословно', () => {
    expect(RESULTS.map(r => [r.kg, r.eg])).toEqual([[16.4, 52.7], [18.2, 58.2], [24.5, 56.4], [20, 54.5]]);
    const about = fs.readFileSync(new URL('../src/pages/About.tsx', import.meta.url), 'utf8');
    for (const s of ['110 преподавателей', 'контрольная группа — 55, экспериментальная — 55', 'p &gt; 0,05', '0,287 · 0,412 · 0,173', 'в 2–3 раза']) expect(about).toContain(s);
  });
});
