// Тексты экрана — дословно из forsight-navigator.html (разделы «Главная», «Концепция», «Результаты апробации», «Для организаторов»).
import { useNavigate } from 'react-router-dom';
import { REQUIREMENTS, STAGES, ZONES } from '../content/model';
import { RESULTS } from '../content/results';
import { CONDITIONS, MODULES } from '../content/support';
import { Spiral } from '../components/Spiral';

const FEATURES: [string, string][] = [
  ['Педагогическая технологичность', 'полнота технологического цикла с определёнными компонентами: целевым, содержательным, процессуальным, инструментально-цифровым, критериально-оценочным'],
  ['Проспективная направленность', 'ориентация на прогнозируемое будущее и формирование метакомпетенции стратегического профессионального предвидения'],
  ['Андрагогическая укоренённость', 'учёт специфики взрослого субъекта: опора на опыт, самодетерминация, проблемная ориентация'],
  ['Цифровая опосредованность', 'цифровые ресурсы как имманентное, а не факультативное условие реализации'],
];

const FORMATS: [string, string][] = [
  ['Программа повышения квалификации', '72–108 академических часов, смешанное обучение'],
  ['Модуль переподготовки', 'форсайт-модуль в составе программы профессиональной переподготовки'],
  ['Корпоративный форсайт-проект', 'в рамках стратегического развития университета'],
  ['Наставничество и обмен опытом', 'участник прошлого потока — эксперт для нового'],
];

const pct = (x: number) => x.toFixed(1).replace('.', ',');

export default function About() {
  const nav = useNavigate();
  return (
    <div className="wrap wide">
      <header className="view-head">
        <div className="eyebrow">О технологии</div>
        <h1>Форсайт-технология профессионального развития преподавателей вузов с использованием цифровых ресурсов</h1>
        <p className="lead">Форсайт-технология переводит императив опережающего образования из деклараций в последовательность процедур: преподаватель вуза сам сканирует тренды, строит сценарии, картирует собственную траекторию, проходит экспертизу коллег и интегрирует результат в систему профессиональных ценностей. Каждый шаг обеспечен цифровыми ресурсами и прикладной задачей из собственной практики.</p>
        <nav className="tabs" aria-label="Разделы страницы">
          <a className="chip" href="#concept" onClick={e => { e.preventDefault(); document.getElementById('concept')?.scrollIntoView(); }}>Концепция</a>
          <a className="chip" href="#model" onClick={e => { e.preventDefault(); document.getElementById('model')?.scrollIntoView(); }}>Модель</a>
          <a className="chip" href="#results" onClick={e => { e.preventDefault(); document.getElementById('results')?.scrollIntoView(); }}>Результаты апробации</a>
          <a className="chip" href="#support" onClick={e => { e.preventDefault(); document.getElementById('support')?.scrollIntoView(); }}>Система обеспечения</a>
        </nav>
      </header>

      <section className="grid g3">
        <div className="card stack"><div className="eyebrow">Что это</div><h2 className="h3">Технология, а не курс</h2><p className="small">Содержательно и процессуально определённая система форсайт-процедур, андрагогических форматов и цифровых ресурсов. Четыре сущностных признака: педагогическая технологичность, проспективная направленность, андрагогическая укоренённость, цифровая опосредованность.</p></div>
        <div className="card stack"><div className="eyebrow">Для кого</div><h2 className="h3">Преподаватель любого вуза</h2><p className="small">Цикл проходится индивидуально или в группе 12–20 человек междисциплинарного состава. Весь процесс — от входной диагностики до итоговой рефлексии — реализуем в цифровой среде, независимо от географии участников.</p></div>
        <div className="card stack"><div className="eyebrow">Что получится</div><h2 className="h3">Двойной результат</h2><p className="small">Дорожная карта собственного развития на 3–5 лет и комплект прикладных продуктов для своих курсов: карта трендов, сценарная матрица, карта пути студента, прототип модуля, набор промптов, геймификационная схема.</p></div>
      </section>

      {/* ---------- Концепция ---------- */}
      <section id="concept" className="stack-lg" style={{ scrollMarginTop: 80 }}>
        <div className="view-head"><div className="eyebrow">Концепция</div><h2>Двойное опережение и проспективная субъектность</h2>
          <p className="lead">Преподаватель вуза одновременно занимает две позиции: он взрослый субъект собственного развития и педагог, проектирующий обучение для студентов в условиях упреждаемых изменений. Одномерного опережения здесь недостаточно.</p></div>
        <div className="grid g2">
          <div className="card stack"><div className="eyebrow">Линия 1</div><h3>Опережение содержания</h3><p>Предметом развития становится не наличное состояние высшего образования, а упреждаемые тренды и слабые сигналы его трансформации, выявляемые методами форсайта. Преподаватель работает с альтернативными образами будущего и сценариями его развёртывания.</p></div>
          <div className="card stack"><div className="eyebrow">Линия 2</div><h3>Опережение профессиональной позиции</h3><p>Предметом становится сам преподаватель как автор собственной перспективы: он не получает образ будущего извне, а порождает его, последовательно осваивая позиции аналитика, исследователя, сценариста, стратега, эксперта и рефлексивного практика.</p></div>
        </div>
        <div className="card"><p>Согласованность двух линий обеспечивает единый форсайт-цикл: каждый этап продвигает содержание (расширяет горизонт упреждаемого) и позицию (переводит преподавателя в очередную модальность работы с будущим). Двойное опережение выступает принципом проектирования технологии, критерием её отграничения от стратегического прогнозирования и отдельных форсайт-сессий, и онтологическим основанием проспективной профессиональной субъектности.</p></div>

        <div className="stack">
          <div className="eyebrow">Целевой результат</div>
          <h2>Проспективная профессиональная субъектность</h2>
          <p className="lead">Интегративное качество: осознанная направленность на профессиональное будущее, способность к самоопределению в горизонте упреждаемых изменений и готовность к деятельному, рефлексивно опосредованному проектированию собственной перспективы средствами форсайт-инструментария и цифровых ресурсов.</p>
          <div className="grid g3">
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>S<sub>мц</sub></span><h3>Мотивационно-ценностный</h3><p className="small">Характер установок по отношению к будущему, ценностные ориентации, внутренняя мотивация участия в форсайт-деятельности.</p></div>
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>S<sub>кп</sub></span><h3>Когнитивно-прогностический</h3><p className="small">Понятийный аппарат форсайта, сценарное мышление, горизонтальное сканирование, дорожное картирование.</p></div>
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>S<sub>од</sub></span><h3>Операционально-деятельностный</h3><p className="small">Самостоятельное проектирование профессионального пути в логике цикла, владение методами и шестью группами цифровых ресурсов.</p></div>
          </div>
          <div className="card"><b>Сквозное рефлексивное основание.</b> Трансформативная рефлексия не выделена в четвёртый компонент: она имманентное условие каждого из трёх, что обеспечивает структурный изоморфизм диагностики и модели. Интегральный показатель: <span className="mono">S<sub>инт</sub> = (S<sub>мц</sub> + S<sub>кп</sub> + S<sub>од</sub>) / 3</span>; уровни — критический, допустимый, оптимальный.</div>
        </div>

        <div className="stack">
          <div className="eyebrow">Четыре сущностных признака</div>
          <div className="grid g4">{FEATURES.map(([t, d]) => <div key={t} className="card stack"><h3 className="h4">{t}</h3><p className="small muted">{d}</p></div>)}</div>
        </div>

        <div className="stack">
          <div className="eyebrow">Методологическая триада — иерархия обязательна</div>
          <div className="grid g3">
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>1</span><h3>Деятельностный подход</h3><p className="small">Задаёт архитектуру форсайт-деятельности: Л.С. Выготский, В.В. Давыдов, А.Н. Леонтьев, С.Л. Рубинштейн, Г.П. Щедровицкий.</p></div>
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>2</span><h3>Андрагогический подход</h3><p className="small">Определяет требования к организации: М.Ш. Ноулз, С.И. Змеёв, М.Т. Громкова, Дж. Мезироу.</p></div>
            <div className="card stack"><span className="pill" style={{ alignSelf: 'flex-start' }}>3</span><h3>Антропологический подход</h3><p className="small">Обосновывает ценностно-смысловой горизонт: В.И. Слободчиков, Б.М. Бим-Бад, Е.И. Исаев; форсайт как антропопрактика.</p></div>
          </div>
        </div>

        <div className="stack">
          <div className="eyebrow">Семь проектных требований — методологическое техническое задание</div>
          <div className="tbl-wrap"><table className="t"><thead><tr><th>Требование</th><th>Содержание</th><th>Где реализуется</th></tr></thead>
            <tbody>{REQUIREMENTS.map(([t, d, w]) => <tr key={t}><td><b>{t}</b></td><td>{d}</td><td>{w}</td></tr>)}</tbody></table></div>
        </div>

        <div className="stack">
          <div className="eyebrow">Три зоны модели</div>
          <div className="grid g3">{ZONES.map(z => (
            <div key={z.id} className="card stack"><span className={`pill ${z.id}`} style={{ alignSelf: 'flex-start' }}><span className="dot" />этапы {z.stages.map(n => STAGES[n - 1].roman).join('–')}</span><h3>{z.name}</h3><p className="small">{z.text}</p></div>
          ))}</div>
          <div className="card"><b>Почему спираль.</b> Ситуационная — развитие идёт через организованные образовательные ситуации (Г.А. Игнатьева), а не через информирование. Позиционная — в каждой ситуации преподаватель занимает профессиональную позицию, и развитие есть их смена. Спиральная — каждый полный цикл завершается выходом на качественно новый уровень субъектности, а результаты предыдущего витка становятся отправной точкой следующего.</div>
        </div>
      </section>

      {/* ---------- Модель ---------- */}
      <section id="model" className="stack-lg" style={{ scrollMarginTop: 80 }}>
        <div className="view-head"><div className="eyebrow">Модель</div><h2>Шесть этапов, шесть позиций, один цикл работы с профессиональным будущим</h2>
          <p className="small muted">Нажмите на узел спирали, чтобы перейти к этапу.</p></div>
        <div className="grid g2" style={{ alignItems: 'center' }}>
          <div className="stack">
            <Spiral size={520} onSelect={n => nav(`/stage/${n}`)} />
            <div className="zone-legend">{ZONES.map(z => <span key={z.id}><i style={{ background: `var(--${z.id})` }} />{z.short}</span>)}</div>
          </div>
          <div className="kpis">
            <div className="kpi"><b className="num">3</b><span>зоны модели</span></div>
            <div className="kpi"><b className="num">6</b><span>этапов цикла</span></div>
            <div className="kpi"><b className="num">6</b><span>профессиональных позиций</span></div>
            <div className="kpi"><b className="num">6</b><span>групп цифровых ресурсов</span></div>
          </div>
        </div>
        <div className="tbl-wrap"><table className="t"><thead><tr><th>Этап</th><th>Позиция преподавателя</th><th>Проектное требование</th><th>Проектный продукт</th></tr></thead>
          <tbody>{STAGES.map(s => <tr key={s.n}><td><b>{s.roman}. {s.name}</b></td><td>{s.position}</td><td>{s.requirement}</td><td>{s.product}</td></tr>)}</tbody></table></div>
      </section>

      {/* ---------- Результаты апробации ---------- */}
      <section id="results" className="stack-lg" style={{ scrollMarginTop: 80 }}>
        <div className="view-head"><div className="eyebrow">Опытно-экспериментальная работа</div><h2>Результаты апробации</h2>
          <p className="lead">Самарский национальный исследовательский университет имени академика С.П. Королёва. 110 преподавателей: контрольная группа — 55, экспериментальная — 55. Программа повышения квалификации в формате смешанного обучения; апробация инструментария также с участием преподавателей НИУ ВШЭ, Университета ИТМО, УрФУ и ЮФУ.</p></div>
        <div className="grid g4">
          <div className="card stack"><div className="eyebrow">Исходная эквивалентность</div><b className="num" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 500 }}>p &gt; 0,05</b><p className="small muted">U-критерий Манна–Уитни: различия между группами на констатирующем этапе незначимы</p></div>
          <div className="card stack"><div className="eyebrow">Корреляции компонентов</div><b className="num" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 500 }}>0,287 · 0,412 · 0,173</b><p className="small muted">ранговая корреляция Спирмена: МЦ–КП; КП–ОД; МЦ–ОД (n = 110)</p></div>
          <div className="card stack"><div className="eyebrow">Темп выхода на оптимум</div><b className="num" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 500 }}>в 2–3 раза</b><p className="small muted">экспериментальная группа достигает оптимального уровня быстрее контрольной</p></div>
          <div className="card stack"><div className="eyebrow">Интегральный показатель</div><b className="num" style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 500 }}>54,5 %</b><p className="small muted">доля ЭГ на оптимальном уровне после ОЭР против 20,0 % в КГ</p></div>
        </div>
        <div className="card stack">
          <div><div className="eyebrow">Доля преподавателей на оптимальном уровне после опытно-экспериментальной работы, %</div><h3>Контрольная и экспериментальная группы</h3></div>
          <div className="legend"><span><i style={{ background: 'var(--muted)' }} />КГ, n = 55</span><span><i style={{ background: 'var(--accent)' }} />ЭГ, n = 55</span></div>
          <div className="bars">{RESULTS.map(r => (
            <div key={r.k} className="bar-row"><div className="lab">{r.name}<small>{r.k}</small></div>
              <div className="track">
                <div className="bar kg" role="img" aria-label={`КГ: ${pct(r.kg)} %`}><i style={{ width: `${r.kg}%` }} /><b className="num">{pct(r.kg)}</b></div>
                <div className="bar eg" role="img" aria-label={`ЭГ: ${pct(r.eg)} %`}><i style={{ width: `${r.eg}%` }} /><b className="num">{pct(r.eg)}</b></div>
              </div>
            </div>
          ))}</div>
          <p className="small muted">Шкала 0–100 %. Источник: итоговая таблица диагностики уровня сформированности форсайт-компетенции (диссертация, глава 3).</p>
        </div>
        <div className="grid g2">
          <div className="card stack"><h3 className="h4">Почему операционально-деятельностный компонент растёт и в контрольной группе</h3><p className="small">Инструменты осваиваются сами по себе: контрольная группа проходила курс цифровой дидактики. Но только в экспериментальной группе они осваивались как средства форсайт-деятельности — отсюда рост мотивационно-ценностного и когнитивно-прогностического компонентов.</p></div>
          <div className="card stack"><h3 className="h4">Что измерялось</h3><p className="small">Анкеты с полустандартизированными шкалами и рефлексивные карты (мотивационно-ценностный компонент); экспертная оценка сценарных моделей и дорожных карт в цифровых конструкторах (когнитивно-прогностический); экспертные карты анализа проектных продуктов (операционально-деятельностный). Сквозное рефлексивное основание встроено в каждый компонент.</p></div>
        </div>
      </section>

      {/* ---------- Система обеспечения ---------- */}
      <section id="support" className="stack-lg" style={{ scrollMarginTop: 80 }}>
        <div className="view-head"><div className="eyebrow">Система обеспечения</div><h2>Как развернуть технологию в своём вузе</h2>
          <p className="lead">Три блока: педагогические условия, цифровая инфраструктура, четыре модуля сопровождения. Программа повышения квалификации — запуск цикла, а не технология целиком: цикл продолжается в неформальных форматах и в повседневной практике.</p></div>
        <div className="stack"><div className="eyebrow">Форматы реализации</div>
          <div className="grid g4">{FORMATS.map(([t, d]) => <div key={t} className="card stack"><h3 className="h4">{t}</h3><p className="small muted">{d}</p></div>)}</div></div>
        <div className="stack"><div className="eyebrow">Четыре модуля педагогического сопровождения</div>
          <div className="grid g2">{MODULES.map(([t, d]) => <div key={t} className="card stack"><h3>{t}</h3><p className="small">{d}</p></div>)}</div></div>
        <div className="stack"><div className="eyebrow">Педагогические условия</div>
          {CONDITIONS.map(c => (
            <details key={c.g} className="opora"><summary><span>{c.g} <span className="small muted">· {c.basis}</span></span></summary>
              <div className="body"><div className="tbl-wrap"><table className="t"><thead><tr><th>Условие</th><th>Механизм реализации</th></tr></thead>
                <tbody>{c.items.map(([a, b]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td></tr>)}</tbody></table></div></div>
            </details>
          ))}
        </div>
        <div className="grid g2">
          <div className="card stack"><div className="eyebrow">Группа</div><h3 className="h4">12–20 человек, междисциплинарный состав</h3><p className="small">Открытый характер ситуаций и ритуализация ключевых моментов: стартовая проблематизация, защита дорожных карт, итоговая рефлексия. Рефлексивные паузы — на каждом этапе.</p></div>
          <div className="card stack"><div className="eyebrow">После программы</div><h3 className="h4">Три слоя непрерывности</h3><p className="small">Форсайт-мастерская кафедры раз в семестр — пересмотр карт друг друга (V этап вне программы). Сообщество выпускников в общем цифровом пространстве, куда добавляются новые сигналы. Дорожная карта как носитель непрерывности: создана в программе, пересматривается на мастерской, реализуется и корректируется в повседневной практике.</p></div>
        </div>
        <div className="card stack"><div className="eyebrow">Комплект методических материалов этапов</div>
          <ul className="small"><li>Сценарные карты: матрица факторов, шкала вероятности и желательности, поле нарративного описания</li><li>Шаблоны дорожных карт с временной линией, ключевыми точками, ресурсами и условиями перехода</li><li>Протоколы Дельфи-опросов с правилами агрегирования и визуализации</li><li>Руководства по горизонтальному сканированию с использованием цифровых аналитических платформ</li><li>Рефлексивные протоколы трёх типов</li></ul>
        </div>
      </section>

      <p className="footer-note">Автор технологии — Соколова Алина Сергеевна, Самарский национальный исследовательский университет имени академика С.П. Королёва. Научный руководитель — доктор педагогических наук, профессор Левченко Виктория Вячеславовна. Диссертация по специальности 5.8.7 «Методология и технология профессионального образования» (педагогические науки).</p>
    </div>
  );
}
