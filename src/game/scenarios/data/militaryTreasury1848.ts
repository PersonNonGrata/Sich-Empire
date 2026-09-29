import { Scenario } from '../types.ts';

export const militaryTreasury1848Scenario: Scenario = {
  id: 'scenario_military_treasury_1848',
  title: 'Військовий Бюджет: Баланс Ресурсів 1848 року',
  year: 1848,
  location: 'Скарбнича Палата та Ливарний Двір, Хортиця',
  tags: ['економіка', 'військо', 'бюджет', 'рада', '1848'],
  priority: 90,
  sequenceOrder: 30,
  required: true,
  importance: 'major',
  conditions: [
    {
      type: 'YEAR',
      operator: '==',
      value: 1848,
    },
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_voices_of_the_council',
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_military_treasury_1848',
    },
  ],
  characters: ['general_chaika', 'maria_levytska', 'jan_korchak', 'ostap_kovalenko', 'mykola_berest'],
  speakerId: 'general_chaika',
  speakerRole: 'Генерал Кордонних Корпусів Січі',
  speakerQuote:
    '«Ясновельможний Гетьмане! Осінь 1848 року підступає до порогів. Попередні рішення Ради розставили акценти, але скарбниці потрібен чіткий розпис на зиму. Якщо полки не отримають фуражу і теплого сукна, жодна промова не втримає прикордонні пости!»',
  introduction:
    'Заключні місяці 1848 року на Хортиці. Державний підскарбій та генеральний обозний розгорнули перед Гетьманом реєстрові книги. Попередні ухвали уряду вже змінили баланс коштів і впливу, і тепер перед завершенням року належить затвердити остаточний військовий розпис.',

  problem:
    'Перед зимою потрібно визначити, як забезпечити армію та прикордонні форпости, не виснаживши фінансовий резерв держави.',
  context:
    'Попередні рішення 1848 року вже змінили баланс між військовими витратами, скарбницею та впливом різних станів. Тепер наближення зими змушує Гетьмана визначити остаточний розпис ресурсів.',
  actors: [
    {
      id: 'general_chaika',
      name: 'Данило Чайка',
      role: 'Генерал Кордонних Корпусів Січі',
      interest: 'Надійне фінансування армії, зимове постачання та готовність прикордонних полків.',
    },
    {
      id: 'maria_levytska',
      name: 'Марія Левицька',
      role: 'Представниця міських громад',
      interest: 'Не допустити надмірного виснаження скарбниці та перекладання військових витрат на цивільне населення.',
    },
    {
      id: 'jan_korchak',
      name: 'Ян Корчак',
      role: 'Представник земської шляхти та торгових інтересів',
      interest: 'Зберегти передбачувані правила торгівлі та не допустити надзвичайних зборів, що б’ють по господарству.',
    },
    {
      id: 'ostap_kovalenko',
      name: 'Остап Коваленко',
      role: 'Представник козацьких громад',
      interest: 'Зберегти обороноздатність держави без руйнування громадського добробуту.',
    },
  ],
  knowledge: {
    known: [
      'Скарбниця вже відчуває навантаження після попередніх рішень року.',
      'До зими армії потрібні фураж, спорядження та кошти на утримання форпостів.',
      'Кожен спосіб фінансування зачепить інтереси окремих станів.',
    ],
    uncertain: [
      'Наскільки довго триватиме прикордонна напруга.',
      'Якою буде політична реакція купців на надзвичайні митні збори.',
      'Чи знадобиться скарбниці великий резерв для нової кризи протягом наступного року.',
    ],
  },
  inaction:
    'Відкладання рішення може послабити зимове постачання, погіршити стан прикордонних частин і відкрити новий політичний конфлікт між військом, громадами та торговими станами.',
  situation:
    'Після попередніх рішень скарбниця відчуває навантаження. Гетьман мусить визначити, звідки взяти кошти на перезимівлю полків і забезпечення форпостів: запровадити екстрене портове мито, виділити кошти з резервів чи спрямувати ресурси на зміцнення народного ополчення.',
  narrativePressures: [
    {
      id: 'pressure_treasury_military_focus',
      sourcePatternOrTag: 'Спирався на зброю генералітету',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Спирався на зброю генералітету',
      },
      impactDescription: 'Минулий вибір на користь військових: Генералітет спирається на вашу підтримку на першій Раді та очікує нових траншів.',
      speakerModifier: {
        speakerQuote:
          '«Ясновельможний Гетьмане! На першій Раді ви вже підтвердили твердість своєї руки, відкривши скарбницю для рубежів. Полки вдячні вам за довіру. Тепер перед зимою ми повинні закріпити успіх та не зупиняти постачання ливарень!»',
      },
    },
    {
      id: 'pressure_treasury_refused_military',
      sourcePatternOrTag: 'Зберіг скарбницю',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Зберіг скарбницю',
      },
      impactDescription: 'Минула відмова генералу Чайці: Офіцери пам’ятають вашу ощадливість і вимагають компенсації перед зимою.',
      speakerModifier: {
        speakerQuote:
          '«Ясновельможний Гетьмане! Навесні ви притримали золото заради мануфактур і доріг. Полки терпіли і несли службу в холоді. Але тепер підступає зима: якщо армія знову залишиться на сухому пайку, прикордонна варта розпадеться!»',
      },
    },
  ],
  choices: [
    {
      id: 'choice_port_customs_levy',
      text: 'Запровадити надзвичайний чорноморський митний збір.',
      description: 'Стягнути з купецьких валок і хлібних караванів 8 мільйонів карбованців для повного наповнення скарбниці без тиску на простий люд.',
      memoryTags: ['Запровадив чорноморське мито'],
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: -15,
          faction_communities: 6,
          faction_military_command: 8,
        },
        capitalCost: 4,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'support', note: 'Задоволення надійним постачанням гарнізонів' },
        { factionId: 'faction_merchants', reaction: 'opposition', note: 'Обурення несподіваним фіскальним тягарем на порти' },
        { factionId: 'faction_communities', reaction: 'support', note: 'Полегшення, що податок оминув звичайних міщан' },
      ],
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'treasury',
          value: 8,
          label: 'Державна скарбниця (митні надходження)',
        },
        {
          type: 'STATE_CHANGE',
          metric: 'militaryStrength',
          value: 3,
          label: 'Зимове постачання полків забезпечено',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: -12,
          tensionChange: 15,
          label: 'Купецькі гільдії невдоволені зборами',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 8,
          label: 'Військові впевнені у провіанті',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'general_chaika',
          trustChange: 6,
          respectChange: 6,
          label: 'Генерал Чайка схвалює практичну турботу про армію',
        },
        {
          type: 'TENSION',
          key: 'tension_might_prosperity',
          value: 8,
          label: 'СИЛА ↔ ДОБРОБУТ (використання комерції для армії)',
        },
        {
          type: 'FLAG',
          flag: 'emergency_customs_1848_levied',
          value: true,
          label: 'Стягнуто надзвичайний митний збір 1848 року',
        },
        {
          type: 'PSYCHOLOGICAL_SIGNAL',
          dimension: 'ECONOMY',
          value: 1,
          contextNote: 'Фіскальна мобілізація комерційного сектору',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'ECONOMIC_MEASURE',
          title: 'Універсал про Надзвичайний Митний Збір 1848 року',
          description: 'Гетьман наповнив скарбницю через збори з чорноморських купецьких валок, гарантувавши безперебійне постачання полків перед зимою.',
          importance: 'major',
          tags: ['бюджет', 'мито', 'армія', '1848'],
        },
      ],
      historyEvent: {
        type: 'ECONOMIC_MEASURE',
        title: 'Універсал про Митний Збір 1848 року',
        description: 'Гетьман спрямував купецькі мита на забезпечення армії.',
        importance: 'standard',
        tags: ['мито', 'скарбниця'],
      },
    },
    {
      id: 'choice_reserve_mobilization',
      text: 'Виділити 15 мільйонів зі скарбниці на капітальне переозброєння гарнізонів.',
      description: 'Не шкодувати золотого запасу заради абсолютної військової могутності: замовити нові гармати у Києві та порох на заводах Сіверська.',
      memoryTags: ['Спирався на зброю генералітету'],
      politicalCost: {
        economicCost: 15,
        politicalCost: {
          faction_military_command: 15,
          faction_communities: -10,
        },
        capitalCost: 5,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'support', note: 'Блискучий тріумф оборонного бюджету' },
        { factionId: 'faction_communities', reaction: 'concern', note: 'Занепокоєння стрімким таненням резервів' },
      ],
      scheduledConsequences: [
        {
          triggerYear: 1851,
          title: 'Військова вага: ціна сильної армії',
          description:
            'Переозброєння 1848 року дало Січі сильніші гарнізони, але разом із ними зросли вплив генералітету, очікування нових асигнувань та політична вага війська.',
          kind: 'self_created_problem',
          unlockScenarioId: 'scenario_military_influence_1851',
          conditions: [
            {
              type: 'HAS_FLAG',
              flag: 'garrisons_fully_rearmed_1848',
              value: true,
            },
          ],
          consequences: [
            {
              type: 'FACTION_CHANGE',
              factionId: 'faction_military_command',
              influenceChange: 8,
              tensionChange: 8,
              label: 'Зростання політичної ваги генералітету',
            },
            {
              type: 'POLITICAL_WILL_CHANGE',
              value: -4,
              label: 'Політична воля витрачається на стримування військового впливу',
            },
            {
              type: 'TENSION',
              key: 'tension_might_prosperity',
              value: 8,
              label: 'Посилення напруги між військовою силою та цивільними пріоритетами',
            },
          ],
        },
      ],
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'treasury',
          value: -15,
          label: 'Державна скарбниця (масштабні витрати на артилерію)',
        },
        {
          type: 'STATE_CHANGE',
          metric: 'militaryStrength',
          value: 8,
          label: 'Стрімкий злет боєздатності регулярних частин',
        },
        {
          type: 'STATE_CHANGE',
          metric: 'stability',
          value: 4,
          label: 'Впевненість у захисті кордонів',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 15,
          influenceChange: 10,
          label: 'Військове командування беззастережно підтримує уряд',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'general_chaika',
          trustChange: 12,
          respectChange: 10,
          loyaltyChange: 10,
          label: 'Генерал Чайка відданий волі Гетьмана',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'maria_levytska',
          trustChange: -6,
          label: 'Марія Левицька застерігає від порожніх скринь',
        },
        {
          type: 'TENSION',
          key: 'tension_might_prosperity',
          value: 14,
          label: 'СИЛА ↔ ДОБРОБУТ (рішучий мілітарний пріоритет)',
        },
        {
          type: 'FLAG',
          flag: 'garrisons_fully_rearmed_1848',
          value: true,
          label: 'Гарнізони Січі повністю переозброєні',
        },
        {
          type: 'PSYCHOLOGICAL_SIGNAL',
          dimension: 'POWER',
          value: 1,
          contextNote: 'Максимальна ставка на силу зброї',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'MILITARY_ACT',
          title: 'Повний Військовий Перерозподіл 1848 року',
          description: 'Гетьман кинув значні ресурси скарбниці на модернізацію гарнізонів рубежів, створивши залізний заслін перед зимовими загрозами.',
          importance: 'major',
          tags: ['військо', 'озброєння', '1848'],
        },
      ],
      historyEvent: {
        type: 'MILITARY_ACT',
        title: 'Повний Військовий Перерозподіл',
        description: 'Гетьман рішуче посилив обороноздатність держави ціною значних витрат.',
        importance: 'major',
        tags: ['військо', 'артилерія'],
      },
    },
    {
      id: 'choice_civic_concord_budget',
      text: 'Ухвалити Соборний Баланс: помірні витрати з пріоритетом злагоди станів.',
      description: 'Виділити 5 мільйонів на нагальні потреби війська, але залучити земські осередки Галичини та Поділля до продовольчого постачання.',
      memoryTags: ['Продовжив традицію попередників'],
      politicalCost: {
        economicCost: 5,
        politicalCost: {
          faction_communities: 8,
          faction_landed_aristocracy: 8,
          faction_military_command: 6,
        },
        capitalCost: 3,
      },
      politicalReactions: [
        { factionId: 'faction_communities', reaction: 'support', note: 'Схвалення поміркованості та мудрості' },
        { factionId: 'faction_landed_aristocracy', reaction: 'support', note: 'Задоволення повагою до балансу сил' },
        { factionId: 'faction_military_command', reaction: 'neutral', note: 'Прийнятно за умови вчасної платні' },
      ],
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'treasury',
          value: -5,
          label: 'Державна скарбниця (помірний компромісний розпис)',
        },
        {
          type: 'STATE_CHANGE',
          metric: 'unity',
          value: 8,
          label: 'Соборна єдність та довіра між станами',
        },
        {
          type: 'STATE_CHANGE',
          metric: 'stability',
          value: 6,
          label: 'Громадянський спокій у всіх воєводствах',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: 10,
          label: 'Громади цінують зваженість влади',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: 8,
          label: 'Землевласники вітають стабільність',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'maria_levytska',
          trustChange: 10,
          label: 'Марія Левицька захоплюється державницькою рівновагою',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'jan_korchak',
          trustChange: 8,
          label: 'Ян Корчак бачить надійного володаря',
        },
        {
          type: 'TENSION',
          key: 'tension_unity_diversity',
          value: -10,
          label: 'ЄДНІСТЬ ↔ РІЗНОМАНІТТЯ (гармонізація інтересів станів)',
        },
        {
          type: 'FLAG',
          flag: 'concord_budget_1848_passed',
          value: true,
          label: 'Ухвалено Соборний Баланс 1848 року',
        },
        {
          type: 'PSYCHOLOGICAL_SIGNAL',
          dimension: 'RESPONSIBILITY',
          value: 1,
          contextNote: 'Мудра рівновага інтересів без крайнощів',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'COUNCIL_DECISION',
          title: 'Ухвалення Соборного Бюджетного Балансу 1848 року',
          description: 'Гетьман узгодив інтереси генералітету, шляхти та міських громад, забезпечивши стабільне завершення першого року правління.',
          importance: 'major',
          tags: ['соборність', 'баланс', 'рада_1848'],
        },
      ],
      historyEvent: {
        type: 'COUNCIL_DECISION',
        title: 'Соборний Бюджетний Баланс 1848 року',
        description: 'Гетьман завершив справи року встановленням злагоди між станами.',
        importance: 'major',
        tags: ['єдність', 'баланс'],
      },
    },
  ],
  reflection:
    'Три рішення 1848 року сформували непорушний фундамент першого року гетьманування. Держава витримала випробування перших місяців, ресурси знайшли своє призначення, а стани усвідомили волю володаря. Час підбити підсумки 1848 року.',
};
