import { describe, expect, it } from 'vitest';
import { DEMO_RUN } from '../../demo/demoRun';
import { computeAttitude } from '../diag';
import { buildProduct, PRODUCT_KEYS, rubricItems } from '../products';
import { canOpen, currentStage, isTaskDone, stageComplete } from '../progress';
import { fillPrompt, rawPrompt } from '../prompts';
import { diffRoadmaps } from '../roadmap';
import { derive, exportJSON, importJSON, newRun, portfolioMarkdown } from '../run';
import type { Run } from '../types';

const withAnswers = (patch: Partial<Run>): Run => derive({ ...newRun(1), ...patch });

describe('сборка продуктов p1–p6', () => {
  it('каждый продукт демо-витка содержит введённые данные', () => {
    const md = Object.fromEntries(PRODUCT_KEYS.map(k => [k, buildProduct(DEMO_RUN, k).markdown]));
    expect(md.p1).toContain('Ведущая проблема');
    expect(md.p1).toContain('запросом работодателей на выпускников');
    expect(md.p1).toContain('Генерация кейсов для этапа поиска проблемы');
    expect(md.p2).toContain('Работодатели оценивают портфолио выше диплома');
    expect(md.p2).toMatch(/## Слабые сигналы[\s\S]*Культура коротких форматов/);
    expect(md.p2).toContain('Порождает:');
    expect(md.p3).toContain('Проектное бюро');
    expect(md.p3).toContain('| Ремесленная мастерская | 4 | 6 |');
    expect(md.p3).toContain('Нарративная концепция курса');
    expect(md.p4).toContain('Модуль «Проект с ИИ-ассистентом» в курсе');
    expect(md.p4).toContain('Инвесторский питч');
    expect(md.p5).toContain('Две сценарные мастерские со студентами');
    expect(md.p5).toContain('Добавлено: 3 года — Рефлексивное портфолио студента');
    expect(md.p6).toContain('Рефлексия предпосылок');
    expect(md.p6).toContain('Адаптивная');
    expect(md.p6).toContain('Проспективная');
    expect(md.p6).toContain('Критический этап следующего витка: V. Экспертиза');
  });

  it('пустой виток собирается без ошибок и без undefined', () => {
    const r = newRun(1);
    for (const k of PRODUCT_KEYS) expect(buildProduct(r, k).markdown).not.toContain('undefined');
  });

  it('рубрика самопроверки берётся из STAGES[n].assessment', () => {
    expect(rubricItems(2)).toEqual(['полнота охвата предметной области', 'корректность идентификации слабых сигналов', 'выход на системные противоречия', 'методологическая обоснованность']);
    expect(rubricItems(4)).toHaveLength(4);
  });
});

describe('правила открытия этапов', () => {
  it('этап I закрыт, пока не пройден вход', () => {
    const r = newRun(1);
    expect(canOpen(r, 1)).toBe(false);
    expect(currentStage(r)).toBe(0);
  });

  it('следующий этап открывается после обязательных заданий и рефлексивной паузы', () => {
    const base = withAnswers({
      profile: { discipline: 'Физика', university: '', experienceYears: 3, horizon: 5 },
      entry: { attitude: { retro: 3, adaptive: 3, prospective: 3, dominant: 'mixed' }, selfScore: { mc: 5, kp: 5, od: 5 } },
      answers: {
        '0.2': { answers: [0, 1, 2, 0, 1, 2, 0, 1, 2] },
        '1.1': { checked: ['scan', 'weak', 'rg1'] },
        '1.2': { h5: ['а', 'б'], h10: ['', ''], h15: ['', ''], lead: 5 },
        '1.3': { tasks: 'задачи', assets: 'ресурсы', vectors: ['один', 'два', ''] },
      },
    });
    expect(canOpen(base, 1)).toBe(true);
    expect(stageComplete(base, 1)).toBe(false);
    expect(canOpen(base, 2)).toBe(false);
    const withPause = derive({ ...base, reflections: { 1: { content: 'сделано', process: 'как', done: true } } });
    expect(canOpen(withPause, 2)).toBe(true);
    // Снятая вручную отметка «выполнено» снова закрывает этап.
    expect(canOpen({ ...withPause, undone: ['1.3'] }, 2)).toBe(false);
  });

  it('необязательные задания не блокируют переход', () => {
    expect(isTaskDone(DEMO_RUN, '1.4')).toBe(true);
    for (let n = 0; n <= 6; n++) expect(stageComplete(DEMO_RUN, n)).toBe(true);
    expect(currentStage(DEMO_RUN)).toBe(7);
  });
});

describe('подстановка ответов в промпты', () => {
  it('подставляет известные ответы и оставляет скобки там, где данных нет', () => {
    const r = withAnswers({ profile: { discipline: 'Химия', university: '', experienceYears: 12, horizon: 15 } });
    const t = fillPrompt(1, r);
    expect(t).toContain('дисциплина — Химия, стаж — 12 лет');
    expect(t).toContain('[вставьте 5–7 ответов своими словами]');
    expect(t).not.toContain('<b>');
  });

  it('промпт 4 получает список факторов, промпт 8 — таблицу карты', () => {
    const p4 = fillPrompt(4, DEMO_RUN);
    expect(p4).toContain('1. Генеративный ИИ берёт на себя часть исследования');
    expect(p4).not.toContain('[список 6–10 позиций]');
    const p8 = fillPrompt(8, DEMO_RUN);
    expect(p8).toContain('горизонт | ключевая точка | ресурсы | индикатор\n1 год | Модуль «Проект с ИИ-ассистентом» в курсе');
    expect(p8).toContain('Проектное бюро');
  });

  it('промпт 5 вычисляет год горизонта; исходный текст в библиотеке — со скобками', () => {
    expect(fillPrompt(5, DEMO_RUN)).toContain('Горизонт — 2036.');
    expect(rawPrompt(5)).toContain('[год]');
    expect(rawPrompt(5)).not.toContain('<b>');
  });

  it('без витка возвращается исходный текст', () => {
    expect(fillPrompt(2, undefined)).toBe(rawPrompt(2));
  });
});

describe('сравнение версий карты', () => {
  it('находит изменённые, добавленные и удалённые точки', () => {
    const a = [
      { id: '1', horizon: '1' as const, point: 'А', todo: '', resources: '', indicator: 'x' },
      { id: '2', horizon: '3' as const, point: 'Б', todo: '', resources: '', indicator: '' },
    ];
    const b = [
      { ...a[0], indicator: 'y' },
      { id: '3', horizon: '5' as const, point: 'В', todo: '', resources: '', indicator: '' },
    ];
    const d = diffRoadmaps(a, b);
    expect(d.changed).toHaveLength(1);
    expect(d.changed[0].changes[0]).toMatchObject({ field: 'Измеримый индикатор', from: 'x', to: 'y' });
    expect(d.added.map(r => r.id)).toEqual(['3']);
    expect(d.removed.map(r => r.id)).toEqual(['2']);
  });

  it('демо-виток хранит две различающиеся версии', () => {
    expect(DEMO_RUN.roadmapVersions.map(v => v.version)).toEqual([1, 2]);
    const d = diffRoadmaps(DEMO_RUN.roadmapVersions[0].rows, DEMO_RUN.roadmapVersions[1].rows);
    expect(d.added.length + d.changed.length).toBeGreaterThan(0);
  });
});

describe('экспорт и импорт', () => {
  it('JSON восстанавливает витки целиком, включая версии карты', () => {
    const runs = [DEMO_RUN, newRun(2, DEMO_RUN)];
    const back = importJSON(exportJSON(runs, { t1: { problem: 'черновик' } }));
    expect(back.runs).toHaveLength(2);
    expect(back.runs[0].answers).toEqual(DEMO_RUN.answers);
    expect(back.runs[0].roadmapVersions.map(v => v.rows)).toEqual(DEMO_RUN.roadmapVersions.map(v => v.rows));
    expect(back.templates.t1.problem).toBe('черновик');
  });

  it('отклоняет чужие и повреждённые файлы', () => {
    expect(() => importJSON('не json')).toThrow();
    expect(() => importJSON('{"app":"other","runs":[]}')).toThrow();
    expect(() => importJSON('{"app":"forsight-navigator","runs":[{"id":1}]}')).toThrow();
  });

  it('новый виток предзаполняется данными выхода предыдущего', () => {
    const next = newRun(2, DEMO_RUN);
    expect(next.number).toBe(2);
    expect(next.entry).toEqual(DEMO_RUN.exit);
    expect(next.answers['1.2'].fromPrev).toContain('оценки индивидуального вклада');
    expect(isTaskDone(next, '0.2')).toBe(true);
  });

  it('портфолио в Markdown: титул, шесть продуктов по порядку, рефлексии', () => {
    const md = portfolioMarkdown(DEMO_RUN);
    expect(md).toContain('Учебный демонстрационный пример');
    const order = ['Персональная ресурсная карта', 'Карта трендов и слабых сигналов', 'Сценарная матрица и банк сценариев',
      'Дорожная карта опережающего развития и прототип инновации', 'Экспертный лист и дорожная карта v2', 'Рефлексивное портфолио\n'];
    const pos = order.map(t => md.indexOf(`## ${t}`));
    expect(pos.every(p => p > 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    expect(md.indexOf('## Рефлексивные паузы')).toBeGreaterThan(pos[5]);
  });
});

describe('экспресс-диагностика', () => {
  it('определяет доминирующую установку и смешанный профиль', () => {
    expect(computeAttitude([1, 1, 0, 1, 2, 1, 0, 1, 2])?.dominant).toBe('adaptive');
    expect(computeAttitude([0, 1, 2, 0, 1, 2, 0, 1, 2])?.dominant).toBe('mixed');
    expect(computeAttitude([0, 1, null, 0, 1, 2, 0, 1, 2])).toBeNull();
  });
});
