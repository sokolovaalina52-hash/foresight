// Сборка проектных продуктов этапов p1–p6 из ответов (Markdown).
import { STAGES } from '../content/model';
import type { StageN } from '../content/types';
import {
  ans, CRITERIA, filled, FACTOR_TYPES, JOURNEY_PHASES, SCENARIO_LABELS, scenarioTitle, SUBJECTS, type Criteria,
} from './answers';
import { attitudeName, COMPONENTS, fmt, isFull, LEVEL_NAMES, levelIndex, sInt } from './diag';
import { deficitLabels } from './prompts';
import { diffIsEmpty, diffRoadmaps, horizonName, sortRows } from './roadmap';
import type { Product, ProductKey, RoadmapRow, Run } from './types';
import { RGROUPS } from '../content/resources';

export const PRODUCT_TITLES: Record<ProductKey, string> = {
  p1: 'Персональная ресурсная карта',
  p2: 'Карта трендов и слабых сигналов',
  p3: 'Сценарная матрица и банк сценариев',
  p4: 'Дорожная карта опережающего развития и прототип инновации',
  p5: 'Экспертный лист и дорожная карта v2',
  p6: 'Рефлексивное портфолио',
};
export const PRODUCT_KEYS: ProductKey[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];

const t = (s: string | undefined | null) => (s && s.trim() ? s.trim() : '—');
const cell = (s: string | undefined | null) => t(s).replace(/\|/g, '/').replace(/\n+/g, ' ');
const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const bullets = (items: string[]) => (items.length ? items.map(x => `- ${x}`).join('\n') : '—');
const section = (title: string, body: string) => `## ${title}\n\n${body}`;

export function roadmapTable(rows: RoadmapRow[]): string {
  const r = sortRows(rows).filter(x => filled(x.point) || filled(x.todo));
  return r.length ? table(['Горизонт', 'Ключевая точка', 'Что сделать', 'Ресурсы', 'Индикатор'], r.map(x => [horizonName(x.horizon), x.point, x.todo, x.resources, x.indicator])) : '—';
}

function criteriaTable(c: Criteria): string {
  return table(['Критерий', 'Оценка', 'Аргумент'], CRITERIA.map(k => [k.name, c[k.id].score !== null ? `${c[k.id].score} / 10` : '—', c[k.id].arg]));
}

/** Пункты рубрики самопроверки из STAGES[n].assessment (текст после двоеточия, до точки с запятой). */
export function rubricItems(stage: StageN): string[] {
  const a = STAGES.find(s => s.n === stage)!.assessment;
  const body = a.includes(':') ? a.slice(a.indexOf(':') + 1) : a;
  return body.split(';')[0].split(',').map(x => x.trim()).filter(Boolean);
}

/** Отметки рубрики самопроверки хранятся в answers['rubric.N'].checks. */
export const rubricChecks = (run: Run, stage: StageN): boolean[] => run.answers[`rubric.${stage}`]?.checks ?? [];

function rubricMd(run: Run, stage: StageN): string {
  const c = rubricChecks(run, stage);
  if (!c.some(Boolean)) return '';
  return section('Самопроверка по рубрике', bullets(rubricItems(stage).map((r, i) => `${c[i] ? '[x]' : '[ ]'} ${r}`)));
}

function p1(run: Run): string {
  const a2 = ans(run, '1.2'); const a3 = ans(run, '1.3');
  const checked = ans(run, '1.1').checked;
  const rg = RGROUPS.filter(g => checked.includes(`rg${g.n}`)).map(g => g.name.toLowerCase());
  const deficits = deficitLabels(run).map(d => (d === 'работа с цифровыми ресурсами' && rg.length ? `${d}: ${rg.join(', ')}` : d));
  const problems = ([5, 10, 15] as const).map(h => ({ h, v: a2[`h${h}`] as [string, string] })).filter(x => filled(x.v[0]) || filled(x.v[1]));
  const fmtP = (v: [string, string]) => `Противоречие между ${t(v[0])} и ${t(v[1])}`;
  const lead = problems.find(p => p.h === a2.lead);
  const rest = problems.filter(p => p.h !== a2.lead);
  const rows = ans(run, '1.4').rows.filter(r => filled(r.task));
  return [
    section('Ведущая проблема профессионального развития', lead ? `**Горизонт ${lead.h} лет.** ${fmtP(lead.v)}` : '—'),
    rest.length ? section('Другие формулировки', bullets(rest.map(p => `Горизонт ${p.h} лет: ${fmtP(p.v)}`))) : '',
    section('Дефициты форсайт-компетенции', bullets(deficits)),
    section('Образовательные задачи', t(a3.tasks)),
    section('Возможности и ресурсы', t(a3.assets)),
    section('Векторы движения', bullets(a3.vectors.filter(filled))),
    rows.length ? section('Задачи, которые можно делегировать языковой модели', table(['Задача проектирования курса', 'Как может помочь модель'], rows.map(r => [r.task, r.help]))) : '',
  ].filter(Boolean).join('\n\n');
}

function p2(run: Run): string {
  const f = ans(run, '2.2').factors.filter(x => filled(x.text));
  const byType = FACTOR_TYPES.map(ft => {
    const items = f.filter(x => x.type === ft.id);
    return items.length ? `### ${ft.id} — ${ft.name}\n\n${table(['Фактор', 'Свидетельство', 'Тип', 'Влияние на дисциплину'], items.map(x => [x.text, x.evidence, x.kind === 'weak' ? 'слабый сигнал' : 'тренд', x.impact]))}` : '';
  }).filter(Boolean);
  const weak = f.filter(x => x.kind === 'weak');
  const contra = ans(run, '2.3').items.filter(x => filled(x.a) || filled(x.b));
  const sources = ans(run, '2.1').sources.filter(s => filled(s.title));
  const v = ans(run, '2.4');
  return [
    section('Факторы по типам', byType.length ? byType.join('\n\n') : '—'),
    section('Слабые сигналы', bullets(weak.map(x => `**${x.text}** — ${t(x.evidence)}`))),
    section('Генетически исходные противоречия', contra.length ? contra.map((c, i) => {
      const linked = f.filter(x => c.factorIds.includes(x.id)).map(x => x.text);
      return `${i + 1}. Противоречие между ${t(c.a)} и ${t(c.b)}${linked.length ? `\n   Порождает: ${linked.join('; ')}` : ''}`;
    }).join('\n') : '—'),
    section('Источники', sources.length ? table(['Источник', 'Тип', 'Ссылка'], sources.map(s => [s.title, s.type, s.url])) : '—'),
    v.discussed ? section('Верификация', `Карта обсуждена с коллегой или экспертом. ${filled(v.changes) ? `Что изменилось: ${v.changes.trim()}` : ''}`.trim()) : '',
    rubricMd(run, 2),
  ].filter(Boolean).join('\n\n');
}

function p3(run: Run): string {
  const ax = ans(run, '3.1'); const q = ans(run, '3.2').q; const fork = ans(run, '3.3'); const d = ans(run, '3.4'); const n = ans(run, '3.5');
  const scen = q.map((s, i) => `### ${SCENARIO_LABELS[i]}: ${t(s.title)}\n\n- Содержание дисциплины: ${t(s.content)}\n- Роль преподавателя: ${t(s.role)}\n- Ранний индикатор: ${t(s.indicator)}`);
  const forkTable = (i: 0 | 1) => `**Путь ${i + 1}: ${t(fork.paths[i].label)}**\n\n${table(['Субъект', 'Через 1 год', 'Через 3 года', 'Через 5 лет'], SUBJECTS.map(s => [s.name, ...fork.paths[i].cells[s.id]]))}`;
  const narrative = filled(n.idea) || filled(n.plot) || filled(n.role);
  return [
    section('Сценарные оси', `- Ось А: ${t(ax.a.factor)} (${t(ax.a.plus)} ↔ ${t(ax.a.minus)})\n- Ось Б: ${t(ax.b.factor)} (${t(ax.b.plus)} ↔ ${t(ax.b.minus)})`),
    section('Банк сценариев', scen.join('\n\n')),
    section('Мини-Дельфи: вероятность и желательность', table(['Сценарий', 'Вероятность', 'Желательность'], q.map((s, i) => [s.title || SCENARIO_LABELS[i], d.votes[i]?.p != null ? String(d.votes[i].p) : '—', d.votes[i]?.d != null ? String(d.votes[i].d) : '—'])) + (filled(d.panel) ? `\n\nОценки панели: ${d.panel.trim()}` : '')),
    section('Развилка', `Сценарий: ${fork.scenario !== null ? scenarioTitle(run, fork.scenario) : '—'}\n\n${t(fork.fork)}\n\n${forkTable(0)}\n\n${forkTable(1)}`),
    narrative ? section('Нарративная концепция курса', bullets([
      `Базовый фрейм: ${t(n.base)}`, `Идея-фрейм: ${t(n.idea)}`, `Роль студента: ${t(n.role)}`, `Сюжетная линия: ${t(n.plot)}`,
      `Драма: ${t(n.drama)}`, `Польза: ${t(n.benefit)}`, `Канон: ${n.canon === 'свой' ? t(n.canonOther) : t(n.canon)}`,
    ])) : '',
  ].filter(Boolean).join('\n\n');
}

function p4(run: Run): string {
  const a1 = ans(run, '4.1'); const others = ans(run, '4.3').others; const pr = ans(run, '4.4'); const tasks = ans(run, '4.5').tasks.filter(x => filled(x.text));
  return [
    section('Целевой сценарий и стратегическая цель', `Сценарий: ${a1.scenario !== null ? scenarioTitle(run, a1.scenario) : '—'}\n\nЦель на 3–5 лет: ${t(a1.goal)}`),
    section('Дорожная карта (v1)', roadmapTable(ans(run, '4.2').rows)),
    section('Стратегии в остальных сценариях', bullets([0, 1, 2, 3].filter(i => i !== a1.scenario).map(i => `${scenarioTitle(run, i)}: ${t(others[i])}`))),
    section('Прототип образовательной инновации', [
      `**${t(pr.title)}**`, `Формат: ${t(pr.format)}. Модель проектирования: ${t(pr.model)}.`,
      `Образовательные результаты:\n${bullets(pr.outcomes.filter(filled))}`,
      pr.align.length ? table(['Результат', 'Учебная стратегия', 'Метод оценки', 'Игровая механика'], pr.align.map(x => [x.outcome, x.strategy, x.assessment, x.mechanic])) : '',
      `Карта пути студента:\n${bullets(JOURNEY_PHASES.map(p => `${p}: ${t(pr.journey[p])}`))}`,
    ].filter(Boolean).join('\n\n')),
    section('Доска задач', tasks.length ? table(['Задача', 'Срок'], tasks.map(x => [x.text, x.date])) : '—'),
    rubricMd(run, 4),
  ].filter(Boolean).join('\n\n');
}

function p5(run: Run): string {
  const s = ans(run, '5.1'); const p = ans(run, '5.2'); const fb = ans(run, '5.3').items; const v2 = ans(run, '5.4');
  const diff = diffRoadmaps(ans(run, '4.2').rows, v2.rows);
  const diffMd = diffIsEmpty(diff) ? 'Изменений нет.' : [
    ...diff.changed.flatMap(c => c.changes.map(ch => `- Изменено «${t(c.row.point)}» — ${ch.field}: «${t(ch.from)}» → «${t(ch.to)}»`)),
    ...diff.added.map(r => `- Добавлено: ${horizonName(r.horizon)} — ${t(r.point)}`),
    ...diff.removed.map(r => `- Удалено: ${horizonName(r.horizon)} — ${t(r.point)}`),
  ].join('\n');
  return [
    section('Самоэкспертиза карты v1', `${criteriaTable(s.criteria)}\n\nСамые рискованные допущения:\n${bullets(s.risks.filter(filled))}`),
    section('Экспертный лист: карта коллеги', `${criteriaTable(p.criteria)}\n\nВопросы автору:\n${bullets(p.questions.filter(filled))}\n\nГлавное условие реализуемости: ${t(p.condition)}`),
    section('Полученная обратная связь', fb.length ? table(['Замечание', 'Решение', 'Обоснование'], fb.map(x => [x.text, x.decision === 'accepted' ? 'принято' : x.decision === 'rejected' ? 'отклонено' : '—', x.reason])) : '—'),
    section('Дорожная карта v2', v2.saved ? roadmapTable(v2.rows) : 'Карта v2 ещё не сохранена.'),
    v2.saved ? section('Изменения v1 → v2', diffMd) : '',
  ].filter(Boolean).join('\n\n');
}

function p6(run: Run): string {
  const r = ans(run, '6.1'); const v = ans(run, '6.3'); const ai = ans(run, '6.4'); const next = ans(run, '6.5');
  const rows = ans(run, '5.4').saved ? ans(run, '5.4').rows : ans(run, '4.2').rows;
  const chosen = rows.filter(x => v.selected.includes(x.id));
  const a = run.entry, b = run.exit;
  const dyn = isFull(a) && isFull(b) ? table(['Показатель', 'Вход', 'Выход'], [
    ['Установка', attitudeName(a.attitude.dominant), attitudeName(b.attitude.dominant)],
    ...COMPONENTS.map(c => [`S${c.sub}`, String(a.selfScore[c.k]), String(b.selfScore[c.k])]),
    ['Sинт', `${fmt(sInt(a.selfScore))} (${LEVEL_NAMES[levelIndex(sInt(a.selfScore))]})`, `${fmt(sInt(b.selfScore))} (${LEVEL_NAMES[levelIndex(sInt(b.selfScore))]})`],
  ]) + '\n\n_Самооценка, не экспертное измерение._' : '—';
  const delegated = ans(run, '1.4').rows.filter(x => filled(x.task));
  const used = ai.prompts.map(id => `Промпт ${id}`);
  const hasAi = delegated.length || used.length || filled(ai.generated) || filled(ai.conclusion);
  return [
    section('Содержательная рефлексия', t(r.content)),
    section('Процессуальная рефлексия', t(r.process)),
    section('Рефлексия предпосылок', t(r.premise)),
    section('Динамика', dyn),
    section('Ценностное самоопределение', `${chosen.length ? `Антропологически состоятельные точки карты:\n${bullets(chosen.map(x => `${horizonName(x.horizon)}: ${x.point}`))}\n\n` : ''}Ради чего я иду по этой карте: ${t(v.why)}`),
    hasAi ? section('Мини-портфолио цифровых решений с ИИ', [
      delegated.length ? `Делегируемые задачи:\n${bullets(delegated.map(x => `${x.task} — ${t(x.help)}`))}` : '',
      used.length ? `Удачные промпты: ${used.join(', ')}` : '',
      filled(ai.generated) ? `Задание, сгенерированное моделью и доработанное:\n\n${ai.generated.trim()}` : '',
      filled(ai.conclusion) ? `Вывод о потенциале и ограничениях: ${ai.conclusion.trim()}` : '',
    ].filter(Boolean).join('\n\n')) : '',
    section('Запрос на новый виток', bullets([
      `Новая проблема развития: ${t(next.problem)}`, `Чем отличается от исходной: ${t(next.diff)}`,
      `Критический этап следующего витка: ${next.critical ? `${STAGES[next.critical - 1].roman}. ${STAGES[next.critical - 1].name}` : '—'}`,
      `Дата и повод возвращения к карте: ${[next.date, next.occasion].filter(filled).join(', ') || '—'}`,
    ])),
  ].filter(Boolean).join('\n\n');
}

const BUILDERS: Record<ProductKey, (run: Run) => string> = { p1, p2, p3, p4, p5, p6 };

export function buildProduct(run: Run, key: ProductKey): Product {
  const stage = (PRODUCT_KEYS.indexOf(key) + 1) as StageN;
  const s = STAGES[stage - 1];
  const head = `# ${PRODUCT_TITLES[key]}\n\n_Этап ${s.roman} — ${s.name}. Позиция: ${s.position}. ${t(run.profile.discipline)}, виток ${run.number}._`;
  return { title: PRODUCT_TITLES[key], stage, markdown: `${head}\n\n${BUILDERS[key](run)}\n`, updatedAt: new Date().toISOString() };
}
