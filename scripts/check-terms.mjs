// Реестр ограничений ТЗ (раздел 1): запрещённых формулировок нет ни в исходниках, ни в сборке.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RULES = [
  { re: /проектно-технологическ/i, why: 'термин «проектно-технологическая деятельность» не используется' },
  { re: /Сдобняков/i, why: 'фамилия не упоминается' },
  { re: /развития преподавателей вуза(?![а-яё])/i, why: 'в названии технологии — «вузов», множественное число' },
];
const targets = ['src', 'index.html', 'README.md', 'dist'].map(p => path.join(root, p)).filter(p => fs.existsSync(p));
const files = [];
const walk = p => fs.statSync(p).isDirectory() ? fs.readdirSync(p).forEach(f => walk(path.join(p, f))) : /\.(tsx?|css|html|md|js|json)$/.test(p) && files.push(p);
targets.forEach(walk);

let bad = 0;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const r of RULES) if (r.re.test(text)) { bad++; console.error(`${path.relative(root, f)}: ${r.why}`); }
}
if (bad) { console.error(`Найдено нарушений: ${bad}`); process.exit(1); }
console.log(`Проверено файлов: ${files.length}. Запрещённых формулировок нет.`);
