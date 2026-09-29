import { Scenario } from '../types.ts';

export const railwayCredit1850Scenario: Scenario = {
  id: 'scenario_railway_credit_1850',
  title: 'Кредит на залізницю: Перша сталева артерія Січі',
  year: 1850,
  location: 'Купецька Колегія, Київ',
  tags: ['залізниця', 'кредит', 'інфраструктура', 'проєкт', '1850'],
  priority: 95,
  importance: 'critical',
  conditions: [
    {
      type: 'YEAR',
      operator: '==',
      value: 1850,
    },
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_cost_of_decision',
    },
    {
      type: 'HAS_FLAG',
      flag: 'railway_mandate_issued',
      value: true,
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_railway_credit_1850',
    },
  ],
  characters: ['mykola_berest', 'lev_ostrozkyi', 'general_chaika', 'maria_levytska'],
  speakerId: 'mykola_berest',
  speakerRole: 'Головний інженер Технічної Колегії',
  speakerQuote:
    '«Креслення готові. Робітники теж. Залишилося найпростіше питання: хто платить? Купці готові позичити. Скарбниця може заплатити сама. А можете сказати, що рейки почекають. Тільки тоді не дивуйтеся, якщо майбутнє поїде повз нас.»',
  introduction:
    '1850 рік. Після вашого універсалу про залізницю інженери принесли кошторис. На столі три папки: купецький кредит, казенні гроші та відмова від проєкту.',
  situation:
    'Залізниця вже стала політичним рішенням. Тепер вона стає фінансовим. Взяти позику й пустити будівництво одразу. Заплатити з резерву та не залежати від кредиторів. Або зупинити проєкт, поки держава ще може дозволити собі відступ.',
  narrativePressures: [
    {
      id: 'pressure_railway_order_dilemma',
      sourcePatternOrTag: 'Встановив столичний нагляд',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Встановив столичний нагляд',
      },
      impactDescription: 'Ти роками зміцнював столичний центр і залізну дисципліну. Тепер ти стикаєшся з наслідком власного стилю: купці остерігаються вкладати кошти у залізницю, бо бояться, що столичні чиновники конфіскують вантажі. Найпростіший для тебе шлях — підпорядкувати все військовому наказу, але це загострить напругу між Свободою та Порядком.',
      speakerModifier: {
        speakerQuote:
          '«Ясновельможний Гетьмане! Ми знаємо вашу схильність до центрального контролю. Але чавунна дорога вимагає вільного обігу капіталу. Ти вже знаєш, куди веде твій вибір на користь диктату. Тепер вирішуй, чи продовжиш його, чи довіришся вільній комерції!»',
      },
      additionalChoices: [
        {
          id: 'choice_militarize_railway',
          text: 'Підпорядкувати будівництво залізниці виключно військовому відомству.',
          description: 'Повна відмова від купецьких компромісів: звести сталеву магістраль силами саперних полків та військової повинності як суто оборонну артерію.',
          memoryTags: ['Посилив воєнний диктат'],
          politicalCost: {
            economicCost: 10,
            militaryCost: 0,
            politicalCost: {
              faction_military_command: 20,
              faction_merchants: -20,
              faction_communities: -15,
            },
            capitalCost: 8,
          },
          politicalReactions: [
            { factionId: 'faction_military_command', reaction: 'support', note: 'Повний контроль армії над магістраллю' },
            { factionId: 'faction_merchants', reaction: 'crisis', note: 'Витіснення цивільного капіталу' },
            { factionId: 'faction_communities', reaction: 'opposition', note: 'Трудова повинність викликає страх' },
          ],
          consequences: [
            {
              type: 'TENSION',
              key: 'tension_freedom_order',
              value: 20,
              label: 'СВОБОДА ↔ ПОРЯДОК (крайній ступінь мілітаризації)',
            },
            {
              type: 'TENSION',
              key: 'tension_autonomy_centralization',
              value: 20,
              label: 'АВТОНОМІЯ ↔ ЦЕНТРАЛІЗАЦІЯ (абсолютний диктат центру)',
            },
            {
              type: 'PSYCHOLOGICAL_SIGNAL',
              dimension: 'ORDER',
              value: 3,
              context: 'economic',
              contextNote: 'Поглиблення моделі тотального контролю у відповідь на кризу',
            },
            {
              type: 'PSYCHOLOGICAL_SIGNAL',
              dimension: 'DOMINANCE',
              value: 2,
              context: 'economic',
              contextNote: 'Військова монополія на транспортну мережу',
            },
            {
              type: 'HISTORY_EVENT',
              eventType: 'MILITARY_ACT',
              title: 'Мілітаризація Залізничного Будівництва 1850 року',
              description: 'Гетьман продовжив курс на тотальний контроль, перетворивши будівництво магістралі на стратегічну військову операцію саперних корпусів.',
              importance: 'critical',
              tags: ['залізниця', 'мілітаризм', 'контроль', '1850'],
            },
          ],
        },
      ],
    },
    {
      id: 'pressure_railway_civic_freedom',
      sourcePatternOrTag: 'Заступився за громади',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Заступився за громади',
      },
      impactDescription: 'Захист самоврядування громад створив міцну довіру: купецтво та магістрати готові щедро кредитувати залізницю.',
      speakerModifier: {
        speakerQuote:
          '«Ясновельможний Гетьмане! Оскільки ви захистили міське самоврядування, купецтво довіряє вашому слову! Ми вкладемо золото у державні облігації з найвищою відданістю!»',
      },
    },
  ],
  choices: [
    {
      id: 'choice_take_loan_railway',
      text: 'Взяти позику у купецтва та запустити будівництво магістралі.',
      description: 'Збільшити державний борг на +15 млн карбованців під 5% річних. Розпочати проєкт «Залізниця Київ — Одеса» з терміном завершення у 1853 році.',
      memoryTags: ['Залучив купецькі кредити'],
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: 15,
          faction_reformers: 18,
          faction_communities: 6,
        },
        capitalCost: 5,
      },
      politicalReactions: [
        { factionId: 'faction_merchants', reaction: 'support', note: 'Отримання відсотків та доступ до ринків' },
        { factionId: 'faction_reformers', reaction: 'support', note: 'Тріумф модерної інженерії' },
        { factionId: 'faction_military_command', reaction: 'neutral', note: 'Усвідомлення логістичної цінності залізниці' },
      ],
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'debt',
          value: 15,
          label: 'Державний борг (+15 млн крб)',
        },
        {
          type: 'START_STATE_PROJECT',
          project: {
            id: 'project_railway_kyiv_odesa',
            name: 'Будівництво магістралі Київ — Одеса',
            description: 'Прокладання 500 верст сталевої колії, зведення мостів через Інгул та Південний Буг, закупівля паротягів.',
            category: 'railways',
            cost: 15,
            duration: 3,
            yearsProgress: 0,
            completed: false,
            politicalCost: {
              faction_merchants: 10,
              faction_reformers: 10,
            },
            economicEffects: {
              tradeRevenueDelta: 12,
              taxRevenueDelta: 6,
              growthDelta: 1.8,
              prosperityDelta: 8,
            },
            militaryEffects: {
              readinessDelta: 10,
              logisticsDelta: 25,
            },
            regionalEffects: [
              { regionId: 'region_podillia', tradeChange: 20, prosperityChange: 10 },
              { regionId: 'region_black_sea', tradeChange: 25, prosperityChange: 12 },
            ],
            consequencesOnComplete: [
              {
                type: 'ECONOMY_METRIC_CHANGE',
                metric: 'tradeVolume',
                value: 18,
                label: 'Вантажообіг залізниці',
              },
              {
                type: 'ECONOMY_METRIC_CHANGE',
                metric: 'economicGrowth',
                value: 1.8,
                label: 'Прискорення росту промисловості',
              },
              {
                type: 'MILITARY_METRIC_CHANGE',
                metric: 'logistics',
                value: 20,
                label: 'Перекидання корпусів залізницею',
              },
              {
                type: 'ADD_DISCOVERY',
                discoveryId: 'sich_steam_express',
                label: 'Залізнична логістична мережа Січі',
              },
            ],
          },
          label: 'Розпочато будівництво великої магістралі (1850-1853 рр.)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: 18,
          influenceChange: 10,
          label: 'Реформатори натхненні довірою до великого проєкту',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: 15,
          label: 'Купецькі гільдії інвестують у державні облігації',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'mykola_berest',
          trustChange: 16,
          respectChange: 14,
          label: 'Микола Берест призначений головним будівничим залізниці',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'lev_ostrozkyi',
          trustChange: 12,
          label: 'Лев Острозький відкриває купецькі кредитні лінії',
        },
        {
          type: 'FLAG',
          flag: 'railway_project_underway',
          value: true,
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Універсал про Першу Залізничну Магістраль Січі',
          description: 'Гетьман уклав кредитну угоду з купецькими гільдіями та започаткував будівництво першої чавунної дороги від Дніпра до Чорного моря.',
          importance: 'critical',
          tags: ['залізниця', 'кредит', 'проєкт', '1850'],
        },
      ],
    },
    {
      id: 'choice_pay_cash_railway',
      text: 'Будувати залізницю виключно за готівку з казни, не беручи боргів.',
      description: 'Виплатити негайно 15 млн карбованців зі скарбниці. Боргу не буде, але золоті резерви держави впадуть до небезпечної межі.',
      memoryTags: ['Побудував залізницю без боргів'],
      politicalCost: {
        economicCost: 15,
        politicalCost: {
          faction_reformers: 15,
          faction_merchants: 5,
          faction_military_command: -15,
        },
        capitalCost: 6,
      },
      politicalReactions: [
        { factionId: 'faction_military_command', reaction: 'opposition', note: 'Обурення спустошенням резерву на рейки' },
        { factionId: 'faction_reformers', reaction: 'support', note: 'Будівництво розпочинається' },
      ],
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: -15,
          label: 'Скарбниця (пряме фінансування проєкту)',
        },
        {
          type: 'START_STATE_PROJECT',
          project: {
            id: 'project_railway_kyiv_odesa',
            name: 'Будівництво магістралі Київ — Одеса (казений кошт)',
            description: 'Будівництво колії коштом казни без зовнішнього боргу.',
            category: 'railways',
            cost: 15,
            duration: 3,
            yearsProgress: 0,
            completed: false,
            consequencesOnComplete: [
              {
                type: 'ECONOMY_METRIC_CHANGE',
                metric: 'tradeVolume',
                value: 18,
                label: 'Вантажообіг залізниці',
              },
              {
                type: 'MILITARY_METRIC_CHANGE',
                metric: 'logistics',
                value: 20,
                label: 'Залізничне перевезення полків',
              },
            ],
          },
          label: 'Розпочато будівництво залізниці (без боргу)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -15,
          tensionChange: 20,
          label: 'Генерали засуджують спустошення скарбниці',
        },
        {
          type: 'FLAG',
          flag: 'railway_project_underway',
          value: true,
        },
      ],
    },
    {
      id: 'choice_reject_railway',
      text: 'Відхилити проєкт залізниці: кошти потрібні на передові фортеці.',
      description: 'Зберегти капітали в скарбниці. Генерали підтримають ощадливість, але реформатори сприймуть це як зраду технологічного майбутнього.',
      memoryTags: ['Зберіг військові ресурси'],
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_reformers: -20,
          faction_merchants: -15,
          faction_military_command: 10,
        },
        capitalCost: 4,
      },
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: -20,
          tensionChange: 25,
          label: 'Реформатори розчаровані відмовою від прогресу',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: -15,
          label: 'Купці засуджують консервативне гальмування торгівлі',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'mykola_berest',
          trustChange: -18,
          label: 'Микола Берест у відчаї від відхилення креслень',
        },
        {
          type: 'TENSION',
          key: 'tension_tradition_reform',
          value: -15,
          label: 'ТРАДИЦІЯ ↔ РЕФОРМА (консервативний застій)',
        },
      ],
    },
  ],
  reflection:
    'Після рішення про саму залізницю настав момент відповісти на складніше питання: якою ціною ви готові купити майбутнє.',
};
