import { STAGES } from '../content/model';
import { RGROUPS } from '../content/resources';
import { PROMPTS } from '../content/prompts';
import {
  CELL_LABELS, CRITERIA, DEFICITS, FACTOR_TYPES, PHASE_LABELS, PRODUCT_TITLES, SUBJECT_LABELS,
} from '../content/tasks';
import { ans, CELLS, PHASES, SUBJECTS, t, type Cell } from './answers';
import { attitudeName, fmt2, LEVEL_NAMES, levelIndex, sInt } from './diagnostics';
import { diffMarkdown, diffRoadmap, horizonLabel, sortPoints } from './roadmap';
import type { ProductId, RoadmapPoint, Run, StageN } from './types';

// ---------- markdown helpers ----------
const v = (s: unknown) => (typeof s === 'number' ? String(s) : t(s) || '—');
const cell = (s: unknown) => v(s).replace(/\|/g, '\\|').replace(/\n+/g, '<br>');
export function mdTable(head: string[], rows: unknown[][]): string {
  return [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.map(cell).join(' | ')} |`)].join('\n');
}
const para = (title: string, body: unknown) => `### ${title}\n\n${v(body)}`;
const join = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join('\n\n');
const stageLine = (n: number) => {
  const s = STAGES[n - 1];
  return `*Этап ${s.roman} — ${s.name}. Позиция: ${s.position}*`;
};

export const scenarioTitle = (run: Run, c: Cell | null | undefined) =>
  c ? (t(ans(run, '3.2')[c].title) || CELL_LABELS[c]) : '—';

export const contradictionText = (c: { a: string; b: string }) => `Противоречие между ${v(c.a)} и ${v(c.b)}`;

/** Пункты рубрики самопроверки из STAGES[n].assessment («… по рубрике: a, b, c, d; …») */
export function rubricItems(stage: number): string[] {
  const a = STAGES[stage - 1].assessment;
  const i = a.indexOf('по рубрике:');
  if (i < 0) return [];
  return a.slice(i + 'по рубрике:'.length).split(';')[0].split(',').map(x => x.trim()).filter(Boolean);
}
export const rubricChecks = (run: Run, p: ProductId): string[] => (run.answers[`rubric:${p}`] as string[]) || [];
function rubricBlock(run: Run, p: ProductId, stage: number) {
  const checks = rubricChecks(run, p);
  return `### Рубрика самопроверки\n\n${rubricItems(stage).map(x => `- [${checks.includes(x) ? 'x' : ' '}] ${x}`).join('\n')}`;
}

export function roadmapTable(points: RoadmapPoint[]): string {
  if (!points.length) return '—';
  return mdTable(['Горизонт', 'Ключевая точка', 'Что должно быть сделано', 'Ресурсы', 'Измеримый индикатор'],
    sortPoints(points).map(p => [horizonLabel(p.horizon), p.title, p.todo, p.resources, p.indicator]));
}

// ---------- p1 ----------
export function buildP1(run: Run): string {
  const d = ans(run, '1.1'), pr = ans(run, '1.2'), rm = ans(run, '1.3'), dl = ans(run, '1.4');
  const hs = [[5, pr.h5], [10, pr.h10], [15, pr.h15]] as const;
  const lead = hs.find(([h]) => h === pr.lead);
  const others = hs.filter(([h]) => h !== pr.lead && (t(pr[`h${h}` as 'h5'][0]) || t(pr[`h${h}` as 'h5'][1])));
  const deficits = DEFICITS.filter(x => d.items.includes(x.id)).map(x => {
    if (x.id === 'digital' && d.resources.length)
      return `- ${x.label}:\n${RGROUPS.filter(g => d.resources.includes(g.n)).map(g => `  - ${g.name.toLowerCase()} ресурсы`).join('\n')}`;
    return `- ${x.label}`;
  });
  const rows = dl.rows.filter(r => t(r.task) || t(r.help));
  return join(
    `## ${PRODUCT_TITLES.p1}`,
    stageLine(1),
    `**Дисциплина:** ${v(run.profile.discipline)} · **Горизонт работы с будущим:** ${run.profile.horizon ?? '—'} лет · **Исходная установка:** ${attitudeName(run.entry.attitude)}`,
    `### Проблема профессионального развития`,
    lead ? `**Ведущая формулировка (${lead[0]} лет):** ${contradictionText({ a: lead[1][0], b: lead[1][1] })}` : '**Ведущая формулировка:** —',
    others.length > 0 && `Другие формулировки:\n${others.map(([h, x]) => `- ${h} лет: ${contradictionText({ a: x[0], b: x[1] })}`).join('\n')}`,
    `### Дефициты форсайт-компетенции\n\n${deficits.length ? deficits.join('\n') : '—'}`,
    para('Образовательные задачи', rm.tasks),
    para('Возможности и ресурсы', rm.assets),
    para('Векторы движения', rm.vectors),
    rows.length > 0 && `### Делегируемые задачи\n\n${mdTable(['Задача проектирования курса', 'Как может помочь языковая модель'], rows.map(r => [r.task, r.help]))}`,
  );
}

// ---------- p2 ----------
export function buildP2(run: Run): string {
  const src = ans(run, '2.1').sources.filter(s => t(s.title));
  const factors = ans(run, '2.2').factors.filter(f => t(f.text));
  const contra = ans(run, '2.3').items.filter(c => t(c.a) || t(c.b));
  const ver = ans(run, '2.4');
  const typeLabel = (k: string) => FACTOR_TYPES.find(x => x.k === k)?.label ?? '—';
  const byType = [...factors].sort((a, b) => FACTOR_TYPES.findIndex(x => x.k === a.type) - FACTOR_TYPES.findIndex(x => x.k === b.type));
  const weak = factors.filter(f => f.kind === 'weak');
  const num = (id: string) => factors.findIndex(f => f.id === id) + 1;
  return join(
    `## ${PRODUCT_TITLES.p2}`,
    stageLine(2),
    `**Предметная область:** ${v(run.profile.discipline)} · **Горизонт:** ${run.profile.horizon ?? '—'} лет`,
    `### Источники\n\n${src.length ? src.map(s => `- ${s.title}${s.type ? ` (${s.type})` : ''}${t(s.url) ? ` — ${s.url}` : ''}`).join('\n') : '—'}`,
    `### Факторы по типам\n\n${factors.length ? mdTable(['№', 'Тип', 'Фактор', 'Свидетельство', 'Тренд / слабый сигнал', 'На что влияет в дисциплине'],
      byType.map(f => [String(num(f.id)), `${f.type || '—'} — ${typeLabel(f.type)}`, f.text, f.evidence, f.kind === 'weak' ? 'слабый сигнал' : f.kind === 'trend' ? 'тренд' : '—', f.impact])) : '—'}`,
    `### Слабые сигналы\n\n${weak.length ? weak.map(f => `- **${f.text}** — ${v(f.evidence)}; влияние: ${v(f.impact)}`).join('\n') : '—'}`,
    `### Генетически исходные противоречия\n\n${contra.length ? contra.map((c, i) => {
      const linked = c.factorIds.map(id => factors.find(f => f.id === id)).filter(Boolean).map(f => `№${num(f!.id)} ${f!.text}`);
      return `${i + 1}. ${contradictionText(c)}\n   - порождает: ${linked.length ? linked.join('; ') : '—'}`;
    }).join('\n') : '—'}`,
    (ver.done || t(ver.changes)) && `### Верификация\n\n${ver.done ? 'Карта обсуждена с коллегой или экспертом.' : 'Обсуждение не отмечено.'}${t(ver.changes) ? `\n\nЧто изменилось: ${ver.changes}` : ''}`,
    rubricBlock(run, 'p2', 2),
  );
}

// ---------- p3 ----------
export function delphiRows(run: Run) {
  const d = ans(run, '3.4');
  return CELLS.map(c => ({ cell: c, title: scenarioTitle(run, c), ...d.own[c], panelP: d.panel[c].p, panelD: d.panel[c].d }));
}

export function buildP3(run: Run): string {
  const ax = ans(run, '3.1'), sc = ans(run, '3.2'), fork = ans(run, '3.3'), d = ans(run, '3.4'), n = ans(run, '3.5');
  const hasPanel = CELLS.some(c => d.panel[c].p != null || d.panel[c].d != null);
  const narrativeFilled = Object.values(n).some(x => t(x));
  const forkTable = (i: 0 | 1) => {
    const p = fork.paths[i];
    return `**Путь ${i + 1}: ${v(p.name)}**\n\n${mdTable(['Субъект', 'Через 1 год', 'Через 3 года', 'Через 5 лет'],
      SUBJECTS.map(s => [SUBJECT_LABELS[s], p.cells[s].y1, p.cells[s].y3, p.cells[s].y5]))}`;
  };
  return join(
    `## ${PRODUCT_TITLES.p3}`,
    stageLine(3),
    `### Сценарные оси\n\n- **Ось А:** ${v(ax.a.factor)} (А+ ${v(ax.a.plus)} ↔ А− ${v(ax.a.minus)})\n- **Ось Б:** ${v(ax.b.factor)} (Б+ ${v(ax.b.plus)} ↔ Б− ${v(ax.b.minus)})`,
    `### Четыре сценария\n\n${CELLS.map(c => `#### ${CELL_LABELS[c]}: ${v(sc[c].title)}\n\n- Содержание дисциплины: ${v(sc[c].content)}\n- Роль преподавателя: ${v(sc[c].role)}\n- Ранний индикатор: ${v(sc[c].indicator)}`).join('\n\n')}`,
    `### Мини-Дельфи\n\n${mdTable(hasPanel ? ['Сценарий', 'Вероятность', 'Желательность', 'Панель: вероятность', 'Панель: желательность'] : ['Сценарий', 'Вероятность', 'Желательность'],
      delphiRows(run).map(r => hasPanel ? [r.title, r.p ?? '—', r.d ?? '—', r.panelP ?? '—', r.panelD ?? '—'] : [r.title, r.p ?? '—', r.d ?? '—'].map(String)))}${t(d.panelNote) ? `\n\nОценки панели: ${d.panelNote}` : ''}`,
    `### Развилка\n\n**Сценарий:** ${scenarioTitle(run, fork.scenario)}\n\n**Развилка:** ${v(fork.fork)}`,
    forkTable(0), forkTable(1),
    narrativeFilled && `### Нарративная концепция курса\n\n${[
      ['Базовый фрейм', n.baseFrame], ['Идея-фрейм', n.ideaFrame], ['Роль студента', n.role], ['Сюжетная линия', n.plot],
      ['Драма', n.drama], ['Польза', n.benefit], ['Канон', n.canon === 'свой' ? (t(n.canonOther) || 'свой') : n.canon],
    ].map(([k, x]) => `- **${k}:** ${v(x)}`).join('\n')}`,
  );
}

// ---------- p4 ----------
export function buildP4(run: Run): string {
  const tg = ans(run, '4.1'), rm = ans(run, '4.2'), st = ans(run, '4.3'), pr = ans(run, '4.4'), tb = ans(run, '4.5');
  const others = CELLS.filter(c => c !== tg.scenario);
  const align = pr.alignment.filter(r => t(r.outcome) || t(r.strategy));
  const tasks = tb.tasks.filter(x => t(x.text));
  return join(
    `## ${PRODUCT_TITLES.p4}`,
    stageLine(4),
    `**Целевой сценарий:** ${scenarioTitle(run, tg.scenario)}\n\n**Стратегическая цель на 3–5 лет:** ${v(tg.goal)}`,
    `### Дорожная карта (v1)\n\n${roadmapTable(rm.points)}`,
    tg.scenario != null && `### Стратегии в остальных сценариях\n\n${others.map(c => `- **${scenarioTitle(run, c)}:** ${v(st[c])}`).join('\n')}`,
    `### Прототип образовательной инновации\n\n- **Название:** ${v(pr.title)}\n- **Формат:** ${v(pr.format)}\n- **Модель проектирования:** ${v(pr.model)}\n- **Образовательные результаты:**\n${pr.outcomes.filter(o => t(o)).map(o => `  - ${o}`).join('\n') || '  - —'}`,
    align.length > 0 && mdTable(['Результат', 'Учебная стратегия', 'Метод оценки', 'Игровая механика'], align.map(r => [r.outcome, r.strategy, r.assessment, r.mechanic])),
    `#### Карта пути студента\n\n${mdTable(['Фаза', 'Что происходит'], PHASES.map(p => [PHASE_LABELS[p], pr.journey[p]]))}`,
    `### Доска задач\n\n${tasks.length ? tasks.map(x => `- [${x.done ? 'x' : ' '}] ${x.text}${t(x.date) ? ` — до ${x.date}` : ''}`).join('\n') : '—'}`,
    rubricBlock(run, 'p4', 4),
  );
}

// ---------- p5 ----------
const scoreLine = (label: string, s: { score: number | null; arg: string }) => `- **${label}:** ${s.score ?? '—'} / 10 — ${v(s.arg)}`;

export function peerConclusion(run: Run): string {
  const a = ans(run, '5.2');
  return join(
    '## Экспертное заключение на дорожную карту',
    CRITERIA.map(c => scoreLine(c.label, a[c.k])).join('\n'),
    `**Вопросы автору:**\n${a.questions.map((q, i) => `${i + 1}. ${v(q)}`).join('\n')}`,
    `**Главное условие реализуемости:** ${v(a.condition)}`,
  );
}

export function buildP5(run: Run): string {
  const se = ans(run, '5.1'), fb = ans(run, '5.3'), cor = ans(run, '5.4'), pri = ans(run, '5.5');
  const v1 = ans(run, '4.2').points;
  const items = fb.items.filter(i => t(i.text));
  return join(
    `## ${PRODUCT_TITLES.p5}`,
    stageLine(5),
    `### Самоэкспертиза карты v1\n\n${CRITERIA.map(c => scoreLine(c.label, se[c.k])).join('\n')}\n\n**Самые рискованные допущения:**\n${se.risks.map((r, i) => `${i + 1}. ${v(r)}`).join('\n')}`,
    `### Экспертный лист на карту коллеги\n\n${peerConclusion(run).split('\n').slice(2).join('\n')}`,
    `### Полученная обратная связь\n\n${items.length ? mdTable(['Замечание', 'Решение', 'Обоснование'], items.map(i => [i.text, i.decision === 'accepted' ? 'принято' : i.decision === 'rejected' ? 'отклонено' : '—', i.reason])) : '—'}`,
    `### Дорожная карта v2\n\n${cor.savedAt ? roadmapTable(cor.points) : 'Корректировка ещё не сохранена.'}`,
    cor.savedAt && `#### Изменения v1 → v2\n\n${diffMarkdown(diffRoadmap(v1, cor.points))}`,
    (t(pri.priorities) || t(pri.result)) && `### Согласование приоритетов\n\n${para('Приоритеты участников', pri.priorities)}\n\n${para('Совпадения, расхождения, формулировки для голосования', pri.result)}`,
  );
}

// ---------- p6 ----------
export function buildP6(run: Run): string {
  const pr = ans(run, '6.1'), dyn = ans(run, '6.2'), val = ans(run, '6.3'), ai = ans(run, '6.4'), rq = ans(run, '6.5');
  const v2 = ans(run, '5.4').savedAt ? ans(run, '5.4').points : ans(run, '4.2').points;
  const chosen = v2.filter(p => val.pointIds.includes(p.id));
  const dl = ans(run, '1.4').rows.filter(r => t(r.task));
  const entryS = run.entry.selfScore, exitS = dyn.confirmed ? { mc: dyn.mc, kp: dyn.kp, od: dyn.od } : null;
  const row = (label: string, a: number | null | undefined, b: number | null | undefined) => [label, a != null ? fmt2(a) : '—', b != null ? fmt2(b) : '—'];
  const aiFilled = ai.promptIds.length > 0 || t(ai.generatedTask) || t(ai.conclusion);
  return join(
    `## ${PRODUCT_TITLES.p6}`,
    stageLine(6),
    `### Рефлексивный протокол`,
    para('Содержательная рефлексия', pr.content),
    para('Процессуальная рефлексия', pr.process),
    para('Рефлексия предпосылок', pr.premise),
    `### Динамика (самооценка, не экспертное измерение)\n\n${mdTable(['', 'Вход', 'Выход'], [
      ['Установка', attitudeName(run.entry.attitude), attitudeName(run.exit?.attitude)],
      row('Sмц', entryS?.mc, exitS?.mc), row('Sкп', entryS?.kp, exitS?.kp), row('Sод', entryS?.od, exitS?.od),
      [...row('Sинт', entryS && sInt(entryS), exitS && sInt(exitS)).slice(0, 1),
        entryS ? `${fmt2(sInt(entryS))} (${LEVEL_NAMES[levelIndex(sInt(entryS))]})` : '—',
        exitS ? `${fmt2(sInt(exitS))} (${LEVEL_NAMES[levelIndex(sInt(exitS))]})` : '—'],
    ])}`,
    `### Ценностное самоопределение\n\n**Точки карты, отобранные как антропологически состоятельные:**\n${chosen.length ? chosen.map(p => `- [${horizonLabel(p.horizon)}] ${p.title}`).join('\n') : '—'}\n\n**Ради чего я иду по этой карте:** ${v(val.why)}`,
    aiFilled && `### Мини-портфолио цифровых решений с ИИ\n\n**Делегируемые задачи:**\n${dl.length ? dl.map(r => `- ${r.task} → ${v(r.help)}`).join('\n') : '—'}\n\n**Удачные промпты:**\n${ai.promptIds.length ? ai.promptIds.map(id => `- ${id}. ${PROMPTS.find(p => p.id === id)?.title ?? ''}`).join('\n') : '—'}\n\n**Задание, сгенерированное моделью и доработанное:** ${v(ai.generatedTask)}\n\n**Вывод о потенциале и ограничениях:** ${v(ai.conclusion)}`,
    `### Запрос на новый виток\n\n- **Новая проблема развития:** ${v(rq.problem)}\n- **Чем отличается от исходной:** ${v(rq.difference)}\n- **Критический этап следующего витка:** ${rq.criticalStage ? `${STAGES[rq.criticalStage - 1].roman}. ${STAGES[rq.criticalStage - 1].name}` : '—'}\n- **Дата и повод возвращения к карте:** ${[t(rq.date), t(rq.occasion)].filter(Boolean).join(' — ') || '—'}`,
  );
}

export const BUILDERS: Record<ProductId, (run: Run) => string> = { p1: buildP1, p2: buildP2, p3: buildP3, p4: buildP4, p5: buildP5, p6: buildP6 };
export const PRODUCT_IDS: ProductId[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
export const productStage = (p: ProductId) => (PRODUCT_IDS.indexOf(p) + 1) as StageN;
