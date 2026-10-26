// Переносит массивы контента из source/forsight-navigator.html в src/content/*.ts без изменений текста.
// Запуск: npm run content
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../source/forsight-navigator.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const dataScript = scripts[0];
const viewScript = scripts[1];

const names = ['ZONES', 'STAGES', 'RGROUPS', 'INFRA', 'CONDITIONS', 'MODULES', 'REQUIREMENTS', 'LEVELS', 'RESULTS', 'DIAG_Q', 'PROMPTS', 'TEMPLATES', 'LECTURES'];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(dataScript + `\n;globalThis.__out={${names.join(',')}};`, ctx);
const data = JSON.parse(JSON.stringify(ctx.__out));

// Тексты интерпретации экспресс-диагностики — из функции POST.diagnostics
const desc = JSON.parse(JSON.stringify(vm.runInNewContext(viewScript.match(/const desc=(\[[\s\S]*?\]);/)[1])));
const attNames = JSON.parse(JSON.stringify(vm.runInNewContext(viewScript.match(/const names=(\[[\s\S]*?\]);/)[1])));
const tieText = viewScript.match(/\$\{tie\?'([^']+)':desc\[dom\]\}/)[1];

const out = new URL('../src/content/', import.meta.url);
const header = '// Сгенерировано scripts/extract-content.mjs из source/forsight-navigator.html. Не редактировать вручную.\n';
const j = v => JSON.stringify(v, null, 2);
const files = {
  'model.ts': `import type { Zone, Stage, Requirement } from './types';\n\nexport const ZONES: Zone[] = ${j(data.ZONES)};\n\nexport const STAGES: Stage[] = ${j(data.STAGES)};\n\nexport const REQUIREMENTS: Requirement[] = ${j(data.REQUIREMENTS)};\n`,
  'resources.ts': `import type { RGroup } from './types';\n\nexport const RGROUPS: RGroup[] = ${j(data.RGROUPS)};\n\nexport const INFRA: [string, string][] = ${j(data.INFRA)};\n`,
  'support.ts': `import type { Condition } from './types';\n\nexport const CONDITIONS: Condition[] = ${j(data.CONDITIONS)};\n\nexport const MODULES: [string, string][] = ${j(data.MODULES)};\n`,
  'diagnostics.ts': `import type { Levels, DiagQuestion } from './types';\n\nexport const LEVELS: Levels = ${j(data.LEVELS)};\n\nexport const DIAG_Q: DiagQuestion[] = ${j(data.DIAG_Q)};\n\n/** Названия установок в порядке вариантов ответа */\nexport const ATTITUDE_NAMES: [string, string, string] = ${j(attNames)};\n\n/** Интерпретации доминирующей установки */\nexport const ATTITUDE_DESC: [string, string, string] = ${j(desc)};\n\n/** Интерпретация смешанного профиля */\nexport const ATTITUDE_MIXED = ${j(tieText)};\n`,
  'results.ts': `import type { ResultRow } from './types';\n\nexport const RESULTS: ResultRow[] = ${j(data.RESULTS)};\n`,
  'prompts.ts': `import type { PromptDef } from './types';\n\nexport const PROMPTS: PromptDef[] = ${j(data.PROMPTS)};\n`,
  'templates.ts': `import type { TemplateDef } from './types';\n\nexport const TEMPLATES: TemplateDef[] = ${j(data.TEMPLATES)};\n`,
  'lectures.ts': `import type { Lecture } from './types';\n\nexport const LECTURES: Lecture[] = ${j(data.LECTURES)};\n`,
};
for (const [name, body] of Object.entries(files)) fs.writeFileSync(new URL(name, out), header + body);
console.log('content: ' + Object.keys(files).join(', '));
