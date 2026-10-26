// Переносит массивы контента из source/forsight-navigator.html в src/content/*.ts без переформулирования.
// Запуск: npm run extract-content. Сгенерированные файлы не правятся руками.
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../source/forsight-navigator.html', import.meta.url), 'utf8');
const dataScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const names = ['ZONES', 'STAGES', 'RGROUPS', 'INFRA', 'CONDITIONS', 'MODULES', 'REQUIREMENTS', 'LEVELS', 'RESULTS', 'DIAG_Q', 'PROMPTS', 'TEMPLATES', 'LECTURES'];
const ctx = {};
vm.runInNewContext(dataScript + `\n;globalThis.__out = {${names.join(',')}};`, ctx);
const data = ctx.__out;

// Тексты интерпретации экспресс-диагностики (функция POST.diagnostics).
const desc = vm.runInNewContext(html.match(/const desc=(\[[\s\S]*?\]);/)[1]);
const attNames = vm.runInNewContext(html.match(/const names=(\[[^\]]*\]);/)[1]);
const tie = html.match(/\?'(Ответы распределились[^']*)'/)[1];
data.DIAG_RESULT = { names: attNames, desc, tie };

const types = {
  ZONES: 'Zone[]', STAGES: 'Stage[]', RGROUPS: 'RGroup[]', INFRA: '[string, string][]', CONDITIONS: 'Condition[]',
  MODULES: '[string, string][]', REQUIREMENTS: '[string, string, string][]', LEVELS: 'Levels', RESULTS: 'ResultRow[]',
  DIAG_Q: 'DiagQ[]', PROMPTS: 'Prompt[]', TEMPLATES: 'Template[]', LECTURES: 'Lecture[]',
  DIAG_RESULT: '{ names: string[]; desc: string[]; tie: string }',
};
const files = {
  model: ['ZONES', 'STAGES', 'REQUIREMENTS', 'LEVELS', 'DIAG_Q', 'DIAG_RESULT'],
  resources: ['RGROUPS', 'INFRA'],
  support: ['CONDITIONS', 'MODULES', 'RESULTS'],
  prompts: ['PROMPTS'],
  templates: ['TEMPLATES'],
  lectures: ['LECTURES'],
};
for (const [file, keys] of Object.entries(files)) {
  const used = [...new Set(keys.flatMap(k => types[k].match(/[A-Z][A-Za-z]+/g) || []))];
  let out = `// Сгенерировано scripts/extract-content.mjs из source/forsight-navigator.html — не редактировать вручную.\n`;
  if (used.length) out += `import type { ${used.join(', ')} } from './types';\n`;
  for (const k of keys) out += `\nexport const ${k}: ${types[k]} = ${JSON.stringify(data[k], null, 1)};\n`;
  fs.writeFileSync(new URL(`../src/content/${file}.ts`, import.meta.url), out);
}
console.log('ok:', Object.keys(data).join(', '));
