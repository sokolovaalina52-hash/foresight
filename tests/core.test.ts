import { describe, expect, it } from 'vitest';
import { DEMO_RUN } from '../src/demo/demoRun';
import { deriveRun, newRun, portfolioMarkdown } from '../src/lib/run';
import { buildP1, buildP2, buildP3, buildP4, buildP5, buildP6, rubricItems } from '../src/lib/products';
import { canAdvance, currentStage, requiredDone, stageOpen, stageStatus, taskDone } from '../src/lib/rules';
import { fillPrompt, fillPromptSegments } from '../src/lib/prompts';
import { diffRoadmap } from '../src/lib/roadmap';
import { buildExport, parseImport, ImportError } from '../src/lib/io';
import { computeAttitude } from '../src/lib/diagnostics';
import type { Run } from '../src/lib/types';

const demo = () => deriveRun(structuredClone(DEMO_RUN), new Date('2026-10-25T00:00:00Z'));
const NOW = new Date('2026-10-26T00:00:00Z');

describe('диагностика установки', () => {
  it('доминирующая установка и смешанный профиль', () => {
    expect(computeAttitude([1, 1, 0, 1, 2, 1, 1, 0, 1])).toMatchObject({ adaptive: 6, retro: 2, prospective: 1, dominant: 'adaptive' });
    expect(computeAttitude([0, 0, 0, 1, 1, 1, 2, 2, 2])?.dominant).toBe('mixed');
    expect(computeAttitude([0, 0, null, 1, 1, 1, 2, 2, 2])).toBeNull();
  });
  it('вход и выход демо-витка: адаптивная → проспективная', () => {
    const r = demo();
    expect(r.entry.attitude?.dominant).toBe('adaptive');
    expect(r.exit?.attitude?.dominant).toBe('prospective');
  });
});

describe('сборка продуктов p1–p6 из ответов', () => {
  const r = demo();
  it('p1 — ведущая проблема, дефициты, ресурсная карта, делегируемые задачи', () => {
    const md = buildP1(r);
    expect(md).toContain('**Ведущая формулировка (10 лет):** Противоречие между запросом работодателей');
    expect(md).toContain('- сценарное мышление');
    expect(md).toContain('аналитические ресурсы');
    expect(md).toContain('| Генерация вариантов проектных кейсов |');
    expect(md).toContain('Исходная установка:** Адаптивная');
  });
  it('p2 — таблица факторов, слабые сигналы, противоречия с привязкой, рубрика', () => {
    const md = buildP2(r);
    expect(md).toContain('| Т — технологический | ИИ-ассистенты пишут проектную документацию |');
    expect(md).toMatch(/### Слабые сигналы\n\n- \*\*Ценность «сделано вместе с ИИ»/);
    expect(md).toContain('порождает: №1 ИИ-ассистенты');
    expect(rubricItems(2)).toEqual(['полнота охвата предметной области', 'корректность идентификации слабых сигналов', 'выход на системные противоречия', 'методологическая обоснованность']);
    expect(md).toContain('- [ ] полнота охвата предметной области');
  });
  it('p3 — оси, сценарии, Дельфи с панелью, развилка, нарратив', () => {
    const md = buildP3(r);
    expect(md).toContain('#### Сценарий 1 (А+, Б+): Студия заказов');
    expect(md).toContain('| Студия заказов | 6 | 9 | 5 | 8 |');
    expect(md).toContain('**Путь 1: Засчитывать**');
    expect(md).toContain('- **Канон:** симуляция');
  });
  it('p4 — цель, карта v1, стратегии, прототип, путь студента, доска', () => {
    const md = buildP4(r);
    expect(md).toContain('**Целевой сценарий:** Студия заказов');
    expect(md).toContain('| 1 год | Пилот: два проекта по заказу партнёров |');
    expect(md).toContain('- **Тренажёр с ИИ:** Сохранить рубрику');
    expect(md).toContain('| вызов | заказчик меняет требования');
    expect(md).toContain('- [x] Написать письма двум компаниям-партнёрам — до 2026-11-10');
    expect(rubricItems(4)).toHaveLength(4);
  });
  it('p5 — экспертиза, обратная связь, карта v2 и изменения', () => {
    const md = buildP5(r);
    expect(md).toContain('- **Реалистичность:** 6 / 10');
    expect(md).toContain('| Откажитесь от внешних заказчиков, начните с внутренних кафедр. | отклонено |');
    expect(md).toContain('**Удалено:**\n- [3 года] ИИ-ассистент команды в LMS');
    expect(md).toContain('**Добавлено:**');
  });
  it('p6 — протокол, динамика, ценности, ИИ-портфолио, запрос', () => {
    const md = buildP6(r);
    expect(md).toContain('| Установка | Адаптивная | Проспективная |');
    expect(md).toContain('| Sинт | 4,67 (критический) | 7,33 (допустимый) |');
    expect(md).toContain('- [1 год] Пилот: два проекта по заказу партнёров');
    expect(md).toContain('- 9. Черновик экспертного заключения');
    expect(md).toContain('**Критический этап следующего витка:** III. Сценарирование');
  });
  it('пустой виток собирается без ошибок; экспорт .md содержит все продукты', () => {
    const e = newRun(1, NOW);
    for (const b of [buildP1, buildP2, buildP3, buildP4, buildP5, buildP6]) expect(typeof b(e)).toBe('string');
    const md = portfolioMarkdown(r);
    for (const h of ['Персональная ресурсная карта', 'Карта трендов', 'Сценарная матрица', 'Дорожная карта опережающего', 'Экспертный лист', 'Рефлексивное портфолио', 'Рефлексивные паузы']) expect(md).toContain(h);
    expect(md).toContain('Учебный пример');
  });
  it('дата обновления продукта меняется только при изменении содержимого', () => {
    const a = deriveRun(r, new Date('2027-01-01T00:00:00Z'));
    expect(a.products.p1.updatedAt).toBe(r.products.p1.updatedAt);
    const b = deriveRun({ ...a, answers: { ...a.answers, '1.3': { tasks: 'новое', assets: 'x', vectors: 'y' } } }, new Date('2027-01-02T00:00:00Z'));
    expect(b.products.p1.updatedAt).toBe('2027-01-02T00:00:00.000Z');
    expect(b.products.p2.updatedAt).toBe(a.products.p2.updatedAt);
  });
});

describe('правила открытия этапов', () => {
  it('новый виток: открыт только вход; этап I открывается после входа', () => {
    const r = newRun(1, NOW);
    expect(stageOpen(r, 0)).toBe(true);
    expect(stageOpen(r, 1)).toBe(false);
    expect(stageStatus(r, 1)).toBe('locked');
    const r2 = deriveRun({ ...r, profile: { ...r.profile, discipline: 'История', horizon: 5 }, answers: { '0.2': { picks: [0, 0, 0, 0, 0, 0, 0, 0, 0] }, '0.3': { mc: 3, kp: 3, od: 3, confirmed: true } } });
    expect(canAdvance(r2, 0)).toBe(true);
    expect(stageOpen(r2, 1)).toBe(true);
    expect(currentStage(r2)).toBe(1);
  });
  it('следующий этап требует обязательных заданий и рефлексивной паузы', () => {
    const r = demo();
    expect(canAdvance(r, 1)).toBe(true);
    const noPause = deriveRun({ ...r, reflections: { ...r.reflections, 1: { content: 'x', process: '', done: false } }, opened: [] });
    expect(requiredDone(noPause, 1)).toBe(true);
    expect(canAdvance(noPause, 1)).toBe(false);
    expect(stageOpen(noPause, 2)).toBe(false);
    const noTask = deriveRun({ ...r, answers: { ...r.answers, '1.1': { items: ['scan'], resources: [] } }, opened: [] });
    expect(canAdvance(noTask, 1)).toBe(false);
  });
  it('необязательные задания не блокируют переход', () => {
    const r = demo();
    const a = { ...r.answers }; delete a['1.4'];
    expect(canAdvance(deriveRun({ ...r, answers: a }), 1)).toBe(true);
  });
  it('досрочное открытие: этап доступен, предыдущий помечается «пройден не полностью»', () => {
    const r = newRun(1, NOW);
    const early = deriveRun({ ...r, opened: [1, 2] });
    expect(stageOpen(early, 2)).toBe(true);
    expect(stageStatus(early, 1)).toBe('partial');
    expect(stageStatus(early, 2)).toBe('open');
  });
  it('снятая вручную отметка «выполнено» учитывается', () => {
    const r = demo();
    expect(taskDone(r, '1.3')).toBe(true);
    const m = deriveRun({ ...r, taskMarks: { '1.3': false } });
    expect(taskDone(m, '1.3')).toBe(false);
    expect(canAdvance(m, 1)).toBe(false);
  });
});

describe('подстановка ответов в промпты', () => {
  it('промпт 2: дисциплина, вуз, задачи, дефициты', () => {
    const txt = fillPrompt(2, demo(), { now: NOW });
    expect(txt).toContain('Я преподаватель Введение в проектную деятельность');
    expect(txt).toContain('Учебный пример — вуз не указан');
    expect(txt).toContain('горизонтальное сканирование, выявление слабых сигналов');
    expect(txt).not.toContain('<b>');
    expect(txt).not.toMatch(/\[[^\]]+\]/);
  });
  it('квадратные скобки остаются там, где данных ещё нет', () => {
    const r = newRun(1, NOW);
    const r2 = deriveRun({ ...r, profile: { ...r.profile, discipline: 'Химия' } });
    const txt = fillPrompt(2, r2);
    expect(txt).toContain('Я преподаватель Химия в [тип вуза]');
    expect(txt).toContain('[3–4 задачи]');
    const seg = fillPromptSegments(2, r2);
    expect(seg.filter(s => s.kind === 'missing').map(s => s.value)).toEqual(['[тип вуза]', '[3–4 задачи]', '[2–3 тревоги или дефицита]']);
  });
  it('промпт 5: противоречия и год горизонта; промпт 8 — таблица карты', () => {
    const r = demo();
    const p5 = fillPrompt(5, r, { now: NOW });
    expect(p5).toContain('Противоречие между доступностью ИИ');
    expect(p5).toContain('Горизонт — 2036 год');
    const p8 = fillPrompt(8, r, { now: NOW });
    expect(p8).toContain('1 год | Пилот: два проекта по заказу партнёров | партнёры кафедры, 4 часа в неделю |');
    expect(p8).toContain('«Студия заказов» — содержание дисциплины');
  });
  it('промпт 9: карта коллеги в 5.2 и своя карта в 5.3', () => {
    const r = demo();
    expect(fillPrompt(9, r, { taskId: '5.2' })).toContain('Академическое письмо');
    expect(fillPrompt(9, r, { taskId: '5.3' })).toContain('Пилот: два проекта');
  });
  it('промпт 11 — рефлексивные паузы, промпт 4 — список факторов', () => {
    const r = demo();
    expect(fillPrompt(11, r)).toContain('I. Проблематизация — что сделано:');
    expect(fillPrompt(4, r)).toContain('1) ИИ-ассистенты пишут проектную документацию (Т — технологический; тренд)');
  });
  it('без витка (библиотека) — исходный текст со скобками', () => {
    expect(fillPrompt(1, null)).toContain('[дисциплина]');
  });
});

describe('сравнение версий карты', () => {
  it('изменено / добавлено / удалено', () => {
    const r = demo();
    const d = diffRoadmap(r.roadmapVersions[0].points, r.roadmapVersions[1].points);
    expect(d.added.map(p => p.id)).toEqual(['r6', 'r7']);
    expect(d.removed.map(p => p.id)).toEqual(['r4']);
    expect(d.changed.map(c => c.after.id)).toEqual(['r2']);
    expect(d.changed[0].fields).toEqual(['title', 'todo', 'indicator']);
    expect(d.unchanged.map(p => p.id)).toEqual(['r1', 'r3', 'r5']);
  });
  it('версии карты: v1 после IV этапа, v2 после сохранения корректировки', () => {
    const r = demo();
    expect(r.roadmapVersions.map(v => v.label)).toEqual(['v1', 'v2']);
    const noV2 = deriveRun({ ...r, answers: { ...r.answers, '5.4': { points: [], savedAt: null } } });
    expect(noV2.roadmapVersions.map(v => v.label)).toEqual(['v1']);
  });
});

describe('экспорт / импорт', () => {
  it('экспорт → импорт восстанавливает всё, включая версии карты', () => {
    const runs: Run[] = [demo(), newRun(2, NOW, demo())];
    const file = buildExport(runs, { t1: { problem: 'x' } }, NOW);
    const back = parseImport(JSON.stringify(file));
    expect(back.runs).toEqual(runs);
    expect(back.runs[0].roadmapVersions[1].points).toHaveLength(6);
    expect(back.libraryTemplates).toEqual({ t1: { problem: 'x' } });
  });
  it('новый виток предзаполняется данными выхода', () => {
    const next = newRun(2, NOW, demo());
    expect(next.number).toBe(2);
    expect(next.entry.attitude?.dominant).toBe('prospective');
    expect(next.entry.selfScore).toEqual({ mc: 8, kp: 7, od: 7 });
    expect((next.answers['1.2'] as { h10: string[] }).h10[0]).toContain('ростом проектов по внешнему заказу');
  });
  it('ошибки импорта', () => {
    expect(() => parseImport('не json')).toThrow(ImportError);
    expect(() => parseImport('{"app":"other"}')).toThrow('Это не резервная копия');
    expect(() => parseImport('{"app":"forsight-navigator","format":1,"runs":[{"id":1}]}')).toThrow('повреждены');
  });
});
