// Реестр заданий маршрута и правила их выполнения. Формулировки — из ТЗ, раздел 5.
import type { StageN } from '../content/types';
import { ans, filled, HORIZONS, JOURNEY_PHASES } from './answers';
import type { Run, TaskId } from './types';

export type TaskDef = {
  id: TaskId;
  stage: 0 | StageN;
  title: string;
  required: boolean;
  /** Промпт из PROMPTS, который открывает кнопка «Использовать с ИИ». */
  promptId?: number;
  complete: (run: Run) => boolean;
};

export const DEFICITS: { id: string; label: string }[] = [
  { id: 'scan', label: 'горизонтальное сканирование' },
  { id: 'weak', label: 'выявление слабых сигналов' },
  { id: 'contra', label: 'выход на системные противоречия' },
  { id: 'scen', label: 'сценарное мышление' },
  { id: 'delphi', label: 'Дельфи-оценка' },
  { id: 'roadmap', label: 'дорожное картирование' },
  { id: 'proto', label: 'прототипирование образовательной инновации' },
  { id: 'peer', label: 'коллегиальная экспертиза' },
  { id: 'refl', label: 'трёхуровневая рефлексия' },
  { id: 'digital', label: 'работа с цифровыми ресурсами' },
];

/** Сколько позиций чек-листа 1.1 отмечено слабыми; цифровые ресурсы считаются одной позицией по вложенному списку. */
export function deficitCount(run: Run): number {
  const c = ans(run, '1.1').checked;
  const top = DEFICITS.filter(d => d.id !== 'digital' && c.includes(d.id)).length;
  const digital = c.includes('digital') || c.some(x => x.startsWith('rg'));
  return top + (digital ? 1 : 0);
}

const crit = (c: { score: number | null; arg: string }) => c.score !== null && filled(c.arg);

export const TASKS: TaskDef[] = [
  { id: '0.1', stage: 0, title: 'Профиль', required: true, complete: r => filled(r.profile.discipline) && [5, 10, 15].includes(r.profile.horizon) },
  { id: '0.2', stage: 0, title: 'Экспресс-диагностика установки', required: true, complete: r => !!r.entry?.attitude && ans(r, '0.2').answers.every(x => x !== null) },
  { id: '0.3', stage: 0, title: 'Самооценка S', required: true, complete: r => !!r.entry?.selfScore },

  { id: '1.1', stage: 1, title: 'Дефициты форсайт-компетенции', required: true, complete: r => deficitCount(r) >= 3 },
  { id: '1.2', stage: 1, title: 'Проблема профессионального развития', required: true, promptId: 2, complete: r => {
    const a = ans(r, '1.2'); if (!a.lead) return false; const lead = a[`h${a.lead}` as 'h5'];
    return filled(lead[0]) && filled(lead[1]);
  } },
  { id: '1.3', stage: 1, title: 'Персональная ресурсная карта', required: true, promptId: 1, complete: r => {
    const a = ans(r, '1.3'); return filled(a.tasks) && filled(a.assets) && a.vectors.filter(filled).length >= 2;
  } },
  { id: '1.4', stage: 1, title: 'Делегируемые задачи', required: false, complete: r => ans(r, '1.4').rows.filter(x => filled(x.task) && filled(x.help)).length >= 3 },

  { id: '2.1', stage: 2, title: 'Источники', required: true, complete: r => ans(r, '2.1').sources.filter(s => filled(s.title)).length >= 3 },
  { id: '2.2', stage: 2, title: 'Факторы и слабые сигналы', required: true, promptId: 3, complete: r => {
    const f = ans(r, '2.2').factors.filter(x => filled(x.text) && x.type);
    return f.length >= 6 && f.filter(x => x.kind === 'weak').length >= 2;
  } },
  { id: '2.3', stage: 2, title: 'Генетически исходные противоречия', required: true, promptId: 4, complete: r => ans(r, '2.3').items.some(x => filled(x.a) && filled(x.b)) },
  { id: '2.4', stage: 2, title: 'Верификация', required: false, complete: r => ans(r, '2.4').discussed },

  { id: '3.1', stage: 3, title: 'Сценарные оси', required: true, complete: r => {
    const a = ans(r, '3.1'); return [a.a, a.b].every(x => filled(x.factor) && filled(x.plus) && filled(x.minus));
  } },
  { id: '3.2', stage: 3, title: 'Четыре сценария', required: true, promptId: 5, complete: r => ans(r, '3.2').q.every(s => filled(s.title) && filled(s.content) && filled(s.role) && filled(s.indicator)) },
  { id: '3.3', stage: 3, title: 'Развилка', required: true, promptId: 6, complete: r => {
    const a = ans(r, '3.3');
    const cells = (i: 0 | 1) => Object.values(a.paths[i].cells).flat().filter(filled).length;
    return a.scenario !== null && filled(a.fork) && cells(0) >= 3 && cells(1) >= 3;
  } },
  { id: '3.4', stage: 3, title: 'Мини-Дельфи', required: true, complete: r => ans(r, '3.4').votes.every(v => v.p !== null && v.d !== null) },
  { id: '3.5', stage: 3, title: 'Прикладная задача: нарративная концепция курса', required: false, complete: r => {
    const a = ans(r, '3.5'); return filled(a.idea) && filled(a.role) && filled(a.plot);
  } },

  { id: '4.1', stage: 4, title: 'Целевой сценарий и стратегическая цель', required: true, complete: r => {
    const a = ans(r, '4.1'); return a.scenario !== null && filled(a.goal);
  } },
  { id: '4.2', stage: 4, title: 'Дорожная карта', required: true, promptId: 7, complete: r => {
    const rows = ans(r, '4.2').rows.filter(x => filled(x.point) && filled(x.indicator));
    return HORIZONS.slice(0, 3).every(h => rows.some(x => x.horizon === h.id));
  } },
  { id: '4.3', stage: 4, title: 'Стратегии в остальных сценариях', required: true, complete: r => {
    const t = ans(r, '4.1').scenario; if (t === null) return false;
    const o = ans(r, '4.3').others; return [0, 1, 2, 3].filter(i => i !== t).every(i => filled(o[i]));
  } },
  { id: '4.4', stage: 4, title: 'Прототип образовательной инновации', required: true, complete: r => {
    const a = ans(r, '4.4');
    return filled(a.title) && filled(a.format) && filled(a.model) && a.outcomes.filter(filled).length >= 2
      && a.align.some(x => filled(x.outcome) && filled(x.mechanic)) && JOURNEY_PHASES.every(p => filled(a.journey[p]));
  } },
  { id: '4.5', stage: 4, title: 'Доска задач', required: true, complete: r => ans(r, '4.5').tasks.filter(t => filled(t.text) && filled(t.date)).length >= 5 },

  { id: '5.1', stage: 5, title: 'Самоэкспертиза', required: true, complete: r => {
    const a = ans(r, '5.1'); return Object.values(a.criteria).every(crit) && a.risks.filter(filled).length >= 3;
  } },
  { id: '5.2', stage: 5, title: 'Экспертиза карты коллеги', required: true, promptId: 9, complete: r => {
    const a = ans(r, '5.2'); return filled(a.peerMap) && Object.values(a.criteria).every(crit) && a.questions.some(filled) && filled(a.condition);
  } },
  { id: '5.3', stage: 5, title: 'Полученная обратная связь', required: true, complete: r => {
    const it = ans(r, '5.3').items; return it.length > 0 && it.every(x => filled(x.text) && x.decision && filled(x.reason));
  } },
  { id: '5.4', stage: 5, title: 'Корректировка карты', required: true, promptId: 8, complete: r => ans(r, '5.4').saved },
  { id: '5.5', stage: 5, title: 'Согласование приоритетов', required: false, promptId: 10, complete: r => filled(ans(r, '5.5').priorities) && filled(ans(r, '5.5').result) },

  { id: '6.1', stage: 6, title: 'Рефлексивный протокол трёх типов', required: true, promptId: 11, complete: r => {
    const a = ans(r, '6.1'); return filled(a.content) && filled(a.process) && filled(a.premise);
  } },
  { id: '6.2', stage: 6, title: 'Динамика', required: true, complete: r => !!r.exit?.attitude && ans(r, '6.2').answers.every(x => x !== null) },
  { id: '6.3', stage: 6, title: 'Ценностное самоопределение', required: true, complete: r => {
    const a = ans(r, '6.3'); return a.selected.length > 0 && filled(a.why);
  } },
  { id: '6.4', stage: 6, title: 'Мини-портфолио цифровых решений с ИИ', required: false, complete: r => filled(ans(r, '6.4').conclusion) },
  { id: '6.5', stage: 6, title: 'Запрос на новый виток', required: true, promptId: 12, complete: r => {
    const a = ans(r, '6.5'); return filled(a.problem) && filled(a.diff) && a.critical !== null && (filled(a.date) || filled(a.occasion));
  } },
];

export const tasksOf = (stage: number) => TASKS.filter(t => t.stage === stage);
export const taskById = (id: TaskId) => TASKS.find(t => t.id === id);
