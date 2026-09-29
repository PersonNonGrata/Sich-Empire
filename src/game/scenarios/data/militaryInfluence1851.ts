import { Scenario } from '../types.ts';

export const militaryInfluence1851Scenario: Scenario = {
  id: 'scenario_military_influence_1851',
  title: 'Військова Вага: Межі Влади Генералітету',
  year: 1851,
  location: 'Золота Палата Гетьманського Палацу, Хортиця',
  tags: ['військо', 'політика', 'генералітет', 'наслідок', '1851'],
  priority: 135,
  sequenceOrder: 35,
  importance: 'critical',
  conditions: [
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_military_influence_1851',
    },
  ],
  characters: ['general_chaika', 'maria_levytska', 'lev_ostrozkyi', 'jan_korchak'],
  speakerId: 'general_chaika',
  speakerRole: 'Генерал Кордонних Корпусів Січі',
  speakerQuote:
    '«Ясновельможний Гетьмане! Ви дали нам гармати, яких чекали роками. Тепер армія може захистити державу. Але захист має ціну: полки потребують постійного утримання, а військо більше не погодиться бути лише виконавцем чужих рішень.»',
  introduction:
    'Через три роки після великого переозброєння армія Січі стала значно сильнішою. Разом із військовою спроможністю виросли витрати, очікування генералітету та його вплив на державні рішення.',
  problem:
    'Потрібно визначити межі політичної ваги війська, не зруйнувавши обороноздатність, яку держава сама створила.',
  context:
    'Переозброєння 1848 року принесло реальний результат: сильніші гарнізони та вищу готовність. Тепер генералітет очікує постійного фінансування і дедалі активніше втручається у цивільні справи.',
  actors: [
    {
      id: 'general_chaika',
      name: 'Данило Чайка',
      role: 'Генерал Кордонних Корпусів Січі',
      interest: 'Зберегти високі військові асигнування та право генералітету впливати на стратегічні рішення.',
    },
    {
      id: 'maria_levytska',
      name: 'Марія Левицька',
      role: 'Представниця міських громад',
      interest: 'Не допустити перетворення військової сили на окремий політичний центр.',
    },
    {
      id: 'lev_ostrozkyi',
      name: 'Лев Острозький',
      role: 'Представник реформаторського середовища',
      interest: 'Встановити цивільні правила контролю над військовими видатками та державними інституціями.',
    },
    {
      id: 'jan_korchak',
      name: 'Ян Корчак',
      role: 'Представник земської шляхти',
      interest: 'Зберегти передбачуваність бюджету та не допустити необмеженого зростання військових витрат.',
    },
  ],
  knowledge: {
    known: [
      'Армія стала сильнішою після переозброєння 1848 року.',
      'Військове командування отримало більший політичний вплив.',
      'Постійне утримання посиленої армії потребує значних ресурсів.',
    ],
    uncertain: [
      'Чи погодиться генералітет на формальні межі свого політичного впливу.',
      'Наскільки сильно скорочення військових асигнувань позначиться на готовності.',
      'Чи стане військовий вплив тимчасовою опорою Гетьмана або постійним центром влади.',
    ],
  },
  inaction:
    'Якщо нічого не змінювати, генералітет може поступово перетворити свою військову силу на політичний важіль, а цивільні інституції втратять частину контролю над державним курсом.',
  situation:
    'Перед Гетьманом три шляхи: зберегти особливі повноваження війська, встановити цивільний контроль або укласти новий політичний компроміс із генералітетом.',
  choices: [
    {
      id: 'choice_military_autonomy_1851',
      text: 'Зберегти особливі повноваження генералітету заради швидких рішень.',
      description:
        'Армія отримує ширшу свободу у визначенні оборонних витрат і оперативних рішень. Гетьман купує лояльність війська ціною посилення його політичної ваги.',
      politicalCost: {
        politicalCost: {
          faction_military_command: 12,
          faction_communities: -15,
          faction_reformers: -10,
        },
        politicalWillCost: 2,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'support', note: 'Генералітет отримує бажану свободу дій' },
        { factionId: 'faction_communities', reaction: 'opposition', note: 'Громади побоюються військового домінування' },
        { factionId: 'faction_reformers', reaction: 'opposition', note: 'Реформатори вимагають цивільного контролю' },
      ],
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 12,
          influenceChange: 10,
          label: 'Політичний вплив генералітету зростає',
        },
        {
          type: 'TENSION',
          key: 'tension_might_prosperity',
          value: 12,
          label: 'Зростає напруга між військовою силою та цивільним управлінням',
        },
        {
          type: 'POLITICAL_WILL_CHANGE',
          value: -3,
          label: 'Гетьману дедалі важче стримувати військову фракцію',
        },
      ],
      historyEvent: {
        type: 'MILITARY_ACT',
        title: 'Хартія Військової Свободи 1851 року',
        description:
          'Гетьман зберіг особливі повноваження генералітету, зробивши армію ще сильнішою політичною опорою влади.',
        importance: 'major',
        tags: ['військо', 'політика', 'генералітет'],
      },
    },
    {
      id: 'choice_civilian_control_1851',
      text: 'Встановити цивільний контроль над військовим бюджетом.',
      description:
        'Генеральний штаб зберігає оперативну автономію, але великі асигнування та довгострокові військові програми затверджує Рада.',
      politicalCost: {
        politicalCost: {
          faction_military_command: -18,
          faction_communities: 10,
          faction_reformers: 15,
        },
        politicalWillCost: 8,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'opposition', note: 'Генералітет вважає це обмеженням своєї автономії' },
        { factionId: 'faction_communities', reaction: 'support', note: 'Громади підтримують підзвітність армії' },
        { factionId: 'faction_reformers', reaction: 'support', note: 'Реформатори вітають інституційний контроль' },
      ],
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -15,
          influenceChange: -10,
          tensionChange: 10,
          label: 'Політична вага генералітету зменшується',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: 12,
          label: 'Реформатори підтримують цивільний контроль',
        },
        {
          type: 'INSTITUTION_CHANGE',
          institutionId: 'institution_council',
          authorityChange: 8,
          influenceChange: 5,
          label: 'Рада посилює контроль над державним бюджетом',
        },
        {
          type: 'POLITICAL_WILL_CHANGE',
          value: -4,
          label: 'Опір генералітету потребує політичної волі',
        },
      ],
      historyEvent: {
        type: 'REFORM',
        title: 'Акт Цивільного Контролю 1851 року',
        description:
          'Гетьман встановив інституційні межі військового впливу, залишивши армії оперативну автономію.',
        importance: 'major',
        tags: ['реформа', 'військо', 'рада'],
      },
    },
    {
      id: 'choice_military_compact_1851',
      text: 'Укласти новий військово-державний компроміс.',
      description:
        'Зберегти високі оборонні асигнування, але прив’язати їх до щорічного звіту генералітету перед Радою та визначених цілей.',
      politicalCost: {
        politicalCost: {
          faction_military_command: 5,
          faction_communities: 5,
          faction_reformers: 6,
        },
        politicalWillCost: 5,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'support', note: 'Армія зберігає фінансування та статус' },
        { factionId: 'faction_communities', reaction: 'concern', note: 'Громади вимагають контролю за виконанням угоди' },
        { factionId: 'faction_reformers', reaction: 'support', note: 'Реформатори приймають компроміс заради підзвітності' },
      ],
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 5,
          influenceChange: 3,
          label: 'Військо приймає нові правила гри',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: 6,
          label: 'Реформатори отримують механізм контролю',
        },
        {
          type: 'INSTITUTION_CHANGE',
          institutionId: 'institution_council',
          authorityChange: 4,
          label: 'Рада отримує право вимагати щорічний військовий звіт',
        },
        {
          type: 'POLITICAL_WILL_CHANGE',
          value: -2,
          label: 'Компроміс потребує політичного ресурсу для підтримки',
        },
      ],
      historyEvent: {
        type: 'COUNCIL_DECISION',
        title: 'Військово-Державний Компакт 1851 року',
        description:
          'Гетьман зберіг сильну армію, одночасно встановивши правила політичної підзвітності генералітету.',
        importance: 'major',
        tags: ['компроміс', 'військо', 'інституції'],
      },
    },
  ],
  reflection:
    'Сильна армія захищає державу, але разом із силою змінюється і сама політична система. Те, що Гетьман створив у 1848 році як інструмент оборони, тепер стало окремою політичною силою.',
};
