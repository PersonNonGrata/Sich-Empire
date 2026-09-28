import {
  PsychologicalDimension,
  DecisionContext,
  AscensionStage,
  BehaviorPattern,
  Contradiction,
  PsychologicalTensionRecord,
  Reflection,
  Insight,
  StressTest,
  TransformationEvent,
} from '../types.ts';
import { ArchetypeCode } from '../../archetypes/types.ts';

export interface ArchetypeDefinition {
  code: ArchetypeCode;
  title: string;
  summaryQuote: string;
  coreDimensions: PsychologicalDimension[];
  strength: string;
  shadow: string;
  defaultUnresolvedQuestion: string;
  historicalPrecedents: string[];
}

export const ARCHETYPE_CATALOG: Record<ArchetypeCode, ArchetypeDefinition> = {
  ARCHITECT: {
    code: 'ARCHITECT',
    title: 'АРХІТЕКТОР',
    summaryQuote: '«Держава тримається не на слові, а на непорушній кладці інституцій.»',
    coreDimensions: ['ORDER', 'CREATION', 'KNOWLEDGE'],
    strength: 'Здатність створювати самодостатні закони, фабрики та системи, що працюють безперебійно крізь десятиліття.',
    shadow: 'Небезпека сприймати людей як частини державного механізму, жертвуючи живим духом заради ідеального креслення.',
    defaultUnresolvedQuestion: 'Чи можна збудувати досконалу державну машину, не розчавивши живу гідність людини?',
    historicalPrecedents: ['Іван Мазепа (1700)', 'Ян де Вітт (1660)', 'Жан-Батіст Кольбер (1675)'],
  },
  GUARDIAN: {
    code: 'GUARDIAN',
    title: 'ОХОРОНЕЦЬ',
    summaryQuote: '«Не ми цей лад починали — не нам його й ламати. Рубежі повинні стояти твердо.»',
    coreDimensions: ['TRADITION', 'ORDER', 'RESPONSIBILITY'],
    strength: 'Непохитний захист рубежів, вірність предківським обітницям та здатність тримати оборону проти переважаючих сил.',
    shadow: 'Страх перед будь-яким паростком оновлення, що може замурувати державу у власному минулому.',
    defaultUnresolvedQuestion: 'Як уберегти святині та спадщину пращурів, не перетворивши вітчизну на глухий форпост, що боїться власного майбутнього?',
    historicalPrecedents: ['Петро Сагайдачний (1618)', 'Костянтин Острозький (1514)', 'Кость Гордієнко (1709)'],
  },
  REFORMER: {
    code: 'REFORMER',
    title: 'РЕФОРМАТОР',
    summaryQuote: '«Зотліле дерево падає під першим вітром. Час вдихнути у стару Січ новий вогонь.»',
    coreDimensions: ['CREATION', 'KNOWLEDGE', 'FREEDOM'],
    strength: 'Сміливість рішуче ламати застарілі догми, впроваджувати передові технології та виводити народ у світовий авангард.',
    shadow: 'Ризик підірвати традиційний фундамент нації та посіяти глибокий розбрат серед тих, хто звик до звичаю.',
    defaultUnresolvedQuestion: 'Де проходить тонка грань між рятівним оновленням держави та руйнуванням її духовного осердя?',
    historicalPrecedents: ['Петро Могила (1632)', 'Густав II Адольф (1630)', 'Кавур (1855)'],
  },
  UNIFIER: {
    code: 'UNIFIER',
    title: 'ОБ\'ЄДНУВАЧ',
    summaryQuote: '«Розбрат — це бенкет для чужинців. Міць нації — у соборній злагоді її станів.»',
    coreDimensions: ['RESPONSIBILITY', 'COMPASSION', 'WILL'],
    strength: 'Мистецтво зшивати розколоті воєводства, примиряти ворожі фракції та гуртувати народ навколо єдиної долі.',
    shadow: 'Небезпека потонути у вічних компромісах і втратити рішучість перед лицем смертельної небезпеки.',
    defaultUnresolvedQuestion: 'Чи можлива абсолютна єдність без примусу, коли історичний розлом вимагає безкомпромісного меча?',
    historicalPrecedents: ['Богдан Хмельницький (1648)', 'Данило Галицький (1253)', 'Вільгельм Мовчазний (1572)'],
  },
  SOVEREIGN: {
    code: 'SOVEREIGN',
    title: 'ВОЛОДАР',
    summaryQuote: '«У годину грози народ чекає не суперечок, а єдиної волі, твердої як криця.»',
    coreDimensions: ['POWER', 'DOMINANCE', 'WILL'],
    strength: 'Здатність брати на себе повний тягар верховного рішення і непохитно діяти там, де інші впадають у сумнів.',
    shadow: 'Спокуса ототожнити державу з власною персоною та зневажити голоси тих, хто надав булаву.',
    defaultUnresolvedQuestion: 'Чи здатна велич самовладного володаря пережити його самого, залишивши по собі міцні інституції, а не пустку?',
    historicalPrecedents: ['Петро Дорошенко (1665)', 'Людовік XI (1470)', 'Юлій Цезар (48 до н.е.)'],
  },
  CONQUEROR: {
    code: 'CONQUEROR',
    title: 'ЗАВОЙОВНИК',
    summaryQuote: '«Кордони нації окреслюються там, де стоїть її переможний прапор.»',
    coreDimensions: ['POWER', 'WILL', 'ORDER'],
    strength: 'Нестримний експансивний порив, військовий геній та здатність диктувати свою волю сусіднім імперіям.',
    shadow: 'Ненаситний мілітаризм, що випалює скарбницю та виснажує життєві соки власного народу.',
    defaultUnresolvedQuestion: 'Коли настає час скласти шаблю в піхви, аби завойоване не перетворилося на надгробний камінь імперії?',
    historicalPrecedents: ['Святослав Хоробрий (965)', 'Карл X Густав (1655)', 'Олександр Македонський (330 до н.е.)'],
  },
  LEGISLATOR: {
    code: 'LEGISLATOR',
    title: 'ЗАКОНОДАВЕЦЬ',
    summaryQuote: '«Над Гетьманом — тільки Бог і Закон. Усі стани рівні перед непорушним кодексом.»',
    coreDimensions: ['ORDER', 'RESPONSIBILITY', 'KNOWLEDGE'],
    strength: 'Утвердження верховенства права, конституційного ладу та надійного захисту громадян від свавілля влади.',
    shadow: 'Сухий формалізм і буквоїдство, коли буква параграфа засліплює живу правду та справедливість.',
    defaultUnresolvedQuestion: 'Чи можна управляти виключно буквою зводу, коли жива історія руйнує будь-які встановлені рамки?',
    historicalPrecedents: ['Пилип Орлик (1710)', 'Солон (594 до н.е.)', 'Ярослав Мудрий (1036)'],
  },
  SAGE: {
    code: 'SAGE',
    title: 'МУДРЕЦЬ',
    summaryQuote: '«Справжній правитель сіє насіння дубів, у затінку яких спочиватимуть його правнуки.»',
    coreDimensions: ['KNOWLEDGE', 'RESPONSIBILITY', 'TRADITION'],
    strength: 'Глибинна далекоглядність, розуміння причинно-наслідкових зв’язків та вміння керувати без гучного крику.',
    shadow: 'Інтелектуальна відстороненість та параліч дії, коли прагнення всеосяжного розуміння заважає діяти негайно.',
    defaultUnresolvedQuestion: 'Як поєднати високу споглядальну мудрість із кривавою та брудною нагальністю політичного моменту?',
    historicalPrecedents: ['Марк Аврелій (170)', 'Володимир Мономах (1113)', 'Конфуцій (500 до н.е.)'],
  },
};

export const BASE_PSYCHOLOGICAL_TENSIONS: Array<{
  id: string;
  poleA: PsychologicalDimension;
  poleB: PsychologicalDimension;
  labelA: string;
  labelB: string;
  descriptionA: string;
  descriptionB: string;
}> = [
  {
    id: 'tension_freedom_order',
    poleA: 'FREEDOM',
    poleB: 'ORDER',
    labelA: 'Свобода',
    labelB: 'Порядок',
    descriptionA: 'Козацька вольниця, голос куренів та децентралізоване самоврядування.',
    descriptionB: 'Залізна дисципліна, непорушна ієрархія та централізоване командування.',
  },
  {
    id: 'tension_tradition_creation',
    poleA: 'TRADITION',
    poleB: 'CREATION',
    labelA: 'Традиція',
    labelB: 'Творення',
    descriptionA: 'Збереження звичаїв предків, клейнодів Хортиці та станового устрою.',
    descriptionB: 'Модернізація, передові ливарні, парові машини та оновлення держави.',
  },
  {
    id: 'tension_knowledge_action',
    poleA: 'KNOWLEDGE',
    poleB: 'POWER',
    labelA: 'Знання',
    labelB: 'Дія',
    descriptionA: 'Раціональний розрахунок, наукові експертизи Академії та перевірені принципи.',
    descriptionB: 'Рішучий удар, миттєве використання сили та здатність диктувати умови.',
  },
  {
    id: 'tension_power_responsibility',
    poleA: 'DOMINANCE',
    poleB: 'RESPONSIBILITY',
    labelA: 'Влада',
    labelB: 'Відповідальність',
    descriptionA: 'Концентрація повноважень, авторитет гетьманської булави та приборкання опозиції.',
    descriptionB: 'Тверезе усвідомлення наслідків, підзвітність Раді та захист майбутніх поколінь.',
  },
  {
    id: 'tension_compassion_dominance',
    poleA: 'COMPASSION',
    poleB: 'DOMINANCE',
    labelA: 'Співчуття',
    labelB: 'Домінування',
    descriptionA: 'Полегшення податкового тягаря, амністія та турбота про простий люд.',
    descriptionB: 'Безкомпромісна воля володаря, придушення непокори та суворий фіскальний збір.',
  },
  {
    id: 'tension_stability_change',
    poleA: 'ORDER',
    poleB: 'CREATION',
    labelA: 'Стабільність',
    labelB: 'Зміна',
    descriptionA: 'Обережна рівновага, збереження status quo та передбачуваність.',
    descriptionB: 'Економічні стрибки, інфраструктурний прорив та перекроювання устоїв.',
  },
];

export interface PatternRule {
  id: string;
  dimension: PsychologicalDimension;
  title: string;
  description: string;
  minFrequency: number;
  contexts?: DecisionContext[];
}

export const PATTERN_RULES: PatternRule[] = [
  {
    id: 'pattern_order_in_crisis',
    dimension: 'ORDER',
    title: 'Тяжіння до залізного ладу в часи небезпеки',
    description: 'Коли держава опиняється перед загрозою або кризою, ти схильний вимагати суворої дисципліни та непохитної ієрархії.',
    minFrequency: 2,
    contexts: ['crisis', 'war', 'political'],
  },
  {
    id: 'pattern_freedom_defense',
    dimension: 'FREEDOM',
    title: 'Захист самоврядної волі та прав громад',
    description: 'Ти послідовно борониш свободу місцевих рад, магістратів і козацьких куренів від тиску столичної бюрократії.',
    minFrequency: 2,
    contexts: ['political', 'peace', 'regional'],
  },
  {
    id: 'pattern_creation_reforms',
    dimension: 'CREATION',
    title: 'Ставка на структурні перетворення та розвиток',
    description: 'Замість консервації старого або простих витрат ти шукаєш інженерні, технічні та інституційні рішення.',
    minFrequency: 2,
    contexts: ['economic', 'peace', 'war'],
  },
  {
    id: 'pattern_power_restraint',
    dimension: 'RESPONSIBILITY',
    title: 'Свідоме самообмеження особистої влади',
    description: 'Ти неодноразово відмовлявся від концентрації надзвичайних повноважень, зберігаючи повноваження Ради та законність.',
    minFrequency: 2,
    contexts: ['political', 'crisis', 'moral'],
  },
  {
    id: 'pattern_fiscal_prudence',
    dimension: 'ECONOMY',
    title: 'Непохитний захист державного скарбу',
    description: 'Ти твердо стоїш на варті золотих резервів, відмовляючи генералітету чи іншим станам у спустошенні казни.',
    minFrequency: 2,
    contexts: ['economic', 'political'],
  },
  {
    id: 'pattern_traditional_ancestry',
    dimension: 'TRADITION',
    title: 'Вірність звичаєвому козацькому праву',
    description: 'У вирішальні моменти ти звертаєшся до вікових клейнодів, звичаїв пращурів та честі козацького товариства.',
    minFrequency: 2,
    contexts: ['political', 'moral', 'regional'],
  },
];

export interface ContradictionRule {
  id: string;
  poleA: PsychologicalDimension;
  poleB: PsychologicalDimension;
  title: string;
  description: string;
  unresolvedQuestion: string;
}

export const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    id: 'contra_strong_center_restrained_ruler',
    poleA: 'ORDER',
    poleB: 'FREEDOM',
    title: 'Міцна держава без особистої тиранії',
    description: 'Ти дедалі частіше обираєш зміцнення державного ладу, але водночас відмовляєшся від розширення власної одноосібної влади.',
    unresolvedQuestion: 'Чи можна збудувати незламну державу, не створивши владу, яка зрештою стане сильнішою за сам закон?',
  },
  {
    id: 'contra_tradition_modernization',
    poleA: 'TRADITION',
    poleB: 'CREATION',
    title: 'Синтез козацького звичаю та індустріальної сталі',
    description: 'Ти глибоко поважаєш старовинні права Низової Січі, але одночасно відкриваєш шлях до фабрик, нарізних гармат і залізниць.',
    unresolvedQuestion: 'Чи зможе живий дух козацького степу пережити дим доменних печей і ритм залізних машин?',
  },
  {
    id: 'contra_compassion_armed_fist',
    poleA: 'COMPASSION',
    poleB: 'POWER',
    title: 'Турбота про мир під залізним панциром',
    description: 'Ти полегшуєш податки для бідних громад, але без вагань озброюєш гарнізони та вимагаєш готовності до війни.',
    unresolvedQuestion: 'Як довго можна берегти совість і милосердя, коли кордони вимагають постійної готовності вбивати?',
  },
  {
    id: 'contra_fiscal_caution_grand_ambition',
    poleA: 'ECONOMY',
    poleB: 'CREATION',
    title: 'Ощадливий скарбник із розмахом великого будівничого',
    description: 'Ти ревниво бережеш кожну копійку в скарбниці, але водночас мрієш про проєкти, що вимагають колосальних витрат.',
    unresolvedQuestion: 'Чи настане мить, коли задля великого стрибка доведеться ризикнути всім золотом держави?',
  },
];

export interface ReflectionCatalogItem {
  id: string;
  title: string;
  conditionType: 'contradiction' | 'pattern' | 'stress_test_passed' | 'high_order_restrained_power';
  conditionKey: string;
  observation: string;
}

export const REFLECTIONS_CATALOG: ReflectionCatalogItem[] = [
  {
    id: 'refl_order_and_power_refusal',
    title: 'Державний порядок чи особиста влада?',
    conditionType: 'high_order_restrained_power',
    conditionKey: 'contra_strong_center_restrained_ruler',
    observation:
      'За останні роки ти дедалі частіше обираєш порядок, коли держава входить у кризу. Але в питаннях особистої влади ти відмовлявся від спрощених надзвичайних повноважень. Схоже, тобі потрібна сильна держава, але не обов’язково сильний особистий правитель.',
  },
  {
    id: 'refl_tradition_and_reforms',
    title: 'Клейноди предків та парові гармати',
    conditionType: 'contradiction',
    conditionKey: 'contra_tradition_modernization',
    observation:
      'Ти не дозволяєш образити звичаї Старої Січі, але постійно довіряєш інженерам і політехнікам. Ти шукаєш не заміну традиції, а спосіб вдягнути давню козацьку волю у сучасну броню.',
  },
  {
    id: 'refl_liberty_under_threat',
    title: 'Свобода під прикриттям мурів',
    conditionType: 'pattern',
    conditionKey: 'pattern_freedom_defense',
    observation:
      'Ти послідовно захищаєш самоврядування воєводств і міст, навіть коли генералітет вимагає все підпорядкувати казармам. Ти віриш, що імперія без вільних людей перетворюється на порожню шкаралупу.',
  },
  {
    id: 'refl_transformation_sovereign_pact',
    title: 'Перелом влади: від наказу до соборної згоди',
    conditionType: 'stress_test_passed',
    conditionKey: 'stresstest_1849_old_sich_crisis',
    observation:
      'У мить, коли гармати стояли націлені на Хортицю, ти відмовився від легкого шляху картечі й заклав інституційну соборну угоду. Твоє правління перейшло від звичайної сили до високого державотворення.',
  },
];

export interface InsightCatalogItem {
  id: string;
  title: string;
  triggerReflectionId: string;
  text: string;
  basis: string;
}

export const INSIGHTS_CATALOG: InsightCatalogItem[] = [
  {
    id: 'insight_institutions_over_autocracy',
    title: 'Усвідомлення: Інституції сильніші за булаву',
    triggerReflectionId: 'refl_order_and_power_refusal',
    text: 'Ти усвідомив: справжня велич держави вимірюється не тим, скільки наказів може віддати володар за день, а тим, як працюють закони, коли володар мовчить.',
    basis: 'Породжено послідовним вибором законності та підтвердженим дзеркальним спостереженням.',
  },
  {
    id: 'insight_synthesis_of_epochs',
    title: 'Усвідомлення: Синтез Епох',
    triggerReflectionId: 'refl_tradition_and_reforms',
    text: 'Ти побачив, що традиція без реформи помирає у музеї, а реформа без традиції розриває душу народу. Твоє покликання — бути мостом між віками.',
    basis: 'Породжено балансом рішень між інженерами Береста та отаманами Хортиці.',
  },
  {
    id: 'insight_sovereign_concord',
    title: 'Усвідомлення: Сила у Злагоді',
    triggerReflectionId: 'refl_transformation_sovereign_pact',
    text: 'Ти зрозумів, що зброя може примусити до мовчання, але тільки взаємна присяга і гідність здатні збудувати нездоланну імперію.',
    basis: 'Породжено подоланням бунту Старої Січі через установлення Палати Отаманів.',
  },
];
