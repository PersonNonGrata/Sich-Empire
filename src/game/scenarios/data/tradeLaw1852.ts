import { Scenario } from '../types.ts';

export const tradeLaw1852Scenario: Scenario = {
  id: 'scenario_trade_law_1852',
  title: 'Закон про торгівлю: Свобода гільдій чи державний контроль',
  year: 1852,
  location: 'Велика Рада Старшини, Хортиця',
  tags: ['закон', 'торгівля', 'контроль', 'монополія', '1852'],
  priority: 95,
  importance: 'standard',
  conditions: [
    {
      type: 'YEAR',
      operator: '==',
      value: 1852,
    },
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_port_customs_1851',
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_trade_law_1852',
    },
  ],
  characters: ['lev_ostrozkyi', 'maria_levytska', 'general_chaika', 'ostap_kovalenko'],
  speakerId: 'general_chaika',
  speakerRole: 'Генерал Кордонних Корпусів Січі',
  speakerQuote:
    '«Ясновельможний Гетьмане! Якщо ми віддамо торгівлю порохом, селітрою, сіллю та залізом у приватні руки лихварів, держава втратить контроль над обороною! Стратегічні товари мають залишатися виключною монополією Гетьманського уряду!»',
  introduction:
    'Осінь 1852 року. Велика Рада розглядає новий Торговельний Статут Імперії Січ. Питання руба: чи повинна держава утримувати монополію на хлібний експорт, сіль та метал, чи надати повну свободу ярмаркам і купецьким палатам.',
  situation:
    'Ухваліть остаточний Торговельний Статут: затвердити широкий Кодекс вільної торгівлі, закріпити жорстку державну монополію на стратегічні ресурси, або запровадити цехову кооперацію на користь міських громад.',
  choices: [
    {
      id: 'choice_free_trade_code',
      text: 'Затвердити Кодекс вільної торгівлі та скасувати казенні монополії.',
      description: 'Дозволити вільний обіг солі, руди та збіжжя. Торговельна свобода сягне піку (+25), купецтво отримає провідну роль, проте державний контроль над стратегічними складами послабшає.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: 20,
          faction_communities: 8,
          faction_military_command: -14,
        },
        capitalCost: 5,
      },
      politicalReactions: [
        { factionId: 'faction_merchants', reaction: 'support', note: 'Повна економічна свобода' },
        { factionId: 'faction_military_command', reaction: 'opposition', note: 'Втрата монополії на арсенальні матеріали' },
      ],
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeFreedom',
          value: 25,
          label: 'Торговельна свобода (ліквідація монополій)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeVolume',
          value: 15,
          label: 'Зростання ярмаркового товарообігу',
        },
        {
          type: 'TENSION',
          key: 'tension_autonomy_centralization',
          value: -15,
          label: 'АВТОНОМІЯ ↔ ЦЕНТРАЛІЗАЦІЯ (послаблення державного контролю)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: 20,
          politicalPowerChange: 15,
          label: 'Купецький стан набуває значної ваги в державі',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -12,
          label: 'Генерали нарікають на спекуляцію порохом і свинцем',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Ухвалення Кодексу Вільної Торгівлі',
          description: 'Січ відкрила всі ринки для вільної конкуренції, покінчивши з феодальними монополіями на товари першої необхідності.',
          importance: 'major',
          tags: ['торгівля', 'кодекс', 'воля', '1852'],
        },
      ],
    },
    {
      id: 'choice_state_monopoly',
      text: 'Встановити залізну державну монополію на сіль, метал та зерновий експорт.',
      description: 'Усі прибутки від експорту підуть прямо до гетьманської скарбниці (+10 млн). Контроль держави зміцніє, проте купецькі гільдії затаять люту образу.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_military_command: 15,
          faction_merchants: -25,
          faction_communities: -10,
        },
        capitalCost: 6,
      },
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: 10,
          label: 'Скарбниця (доходи від казенних монополій)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeFreedom',
          value: -25,
          label: 'Жорстке обмеження приватної комерції',
        },
        {
          type: 'TENSION',
          key: 'tension_autonomy_centralization',
          value: 20,
          label: 'АВТОНОМІЯ ↔ ЦЕНТРАЛІЗАЦІЯ (посилення державного контролю)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: -25,
          tensionChange: 25,
          label: 'Купці відкрито переходять в економічну опозицію',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 15,
          label: 'Військові гарантовано отримують казенне залізо та харчі',
        },
      ],
    },
  ],
  reflection:
    'Держава і ринок — вічні суперники. Торговельний статут 1852 року визначив, хто тримає ключі від економічного пульсу Січі: вільна ініціатива купецтва чи центральна рука Гетьмана.',
};
