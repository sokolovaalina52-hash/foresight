// Реестр ограничений ТЗ (раздел 1): запрещённые формулировки не должны попадать в исходники и сборку.
// Шаблоны собраны из частей, чтобы скрипт не находил сам себя.
import fs from 'node:fs';
import path from 'node:path';

const RULES = [
  { re: new RegExp(['проектно', 'технологическ'].join('-'), 'i'), why: 'термин не используется' },
  { re: new RegExp(['Сдобня', 'ков'].join(''), 'i'), why: 'фамилия не упоминается' },
  { re: new RegExp('развития преподавателей ' + 'вуза(?![а-яё])', 'i'), why: '«вузов» — множественное число в названии технологии' },
];
const ROOTS = ['src', 'index.html', 'README.md', 'dist'];
const EXT = /\.(tsx?|jsx?|mjs|css|html|md|json)$/;

const files = [];
const walk = p => {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) fs.readdirSync(p).forEach(f => walk(path.join(p, f)));
  else if (EXT.test(p)) files.push(p);
};
ROOTS.forEach(walk);

let bad = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => RULES.forEach(r => {
    if (r.re.test(line)) { bad++; console.error(`${f}:${i + 1}: ${r.why}`); }
  }));
}
if (bad) { console.error(`Найдено нарушений: ${bad}`); process.exit(1); }
console.log(`check-terms: ${files.length} файлов, нарушений нет`);
