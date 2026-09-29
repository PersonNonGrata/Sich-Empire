import { Scenario } from '../types.ts';

export const budgetCrisisScenario: Scenario = {
  id: 'scenario_crisis_budget_deficit',
  title: 'Бюджетна криза: Порожня скарбниця та загроза дефолту',
  year: 1851,
  location: 'Золота Палата Гетьманського Палацу, Хортиця',
  tags: ['криза', 'скарбниця', 'дефіцит', 'дефолт'],
  priority: 150,
  importance: 'critical',
  conditions: [
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_crisis_budget_deficit',
    },
  ],
  characters: ['lev_ostrozkyi', 'general_chaika', 'maria_levytska', 'jan_korchak'],
  speakerId: 'lev_ostrozkyi',
  speakerRole: 'Голова Купецької Гільдії',
  speakerQuote:
    '«Гетьмане, цифри вже не сперечаються. Відсотки треба платити цього місяця, а в скарбниці їх немає. Ще один позичений рік і кредитори почнуть диктувати нам умови.»',
  introduction:
    '1851 рік. Після кількох дорогих сезонів державний борг і витрати зійшлися в одній точці. Скарбник кладе перед вами останню відомість: часу на красиве рішення більше немає.',
  situation:
    'Потрібно врятувати платоспроможність держави. Взяти гроші з великих маєтків і купецьких складів. Різко урізати військові витрати. Або ризикнути останнім резервом заради силового виходу з кризи.',
  choices: [
    {
      id: 'choice_emergency_tax_on_wealth',
      text: 'Накласти надзвичайну контрибуцію на багаті маєтки та купецькі склади.',
      description: 'Зібрати екстрені 20 млн карбованців з магнатів і купців для порятунку скарбниці, ризикуючи політичним заколотом еліт.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_landed_aristocracy: -25,
          faction_merchants: -20,
          faction_communities: 10,
        },
        capitalCost: 8,
      },
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: 20,
          label: 'Екстрений збір золота з багатіїв (+20 млн)',
        },
        {
          type: 'RESOLVE_ECONOMIC_CRISIS',
          crisisId: 'crisis_budget_insolvency',
          resolutionNote: 'Дефолт відвернуто екстреним оподаткуванням великих маєтків.',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: -25,
          tensionChange: 30,
          label: 'Шляхта заявляє про тиранію та грабунок',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'CRISIS_RESOLVED',
          title: 'Подолання Бюджетної Кризи: Екстрена Контрибуція',
          description: 'Гетьман урятував державні фінанси ціною різкого конфлікту з олігархічними верхівками землевласників та купців.',
          importance: 'critical',
          tags: ['криза', 'фінанси', 'дефолт'],
        },
      ],
    },
    {
      id: 'choice_cut_military_to_bone',
      text: 'Радикально скоротити витрати армії та розпустити наймані полки.',
      description: 'Зменшити військовий бюджет з 16 до 10 млн. Скарбниця отримає полегшення, але боєздатність рубежів зазнає нищівного удару.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_military_command: -30,
          faction_communities: 10,
        },
        capitalCost: 6,
      },
      consequences: [
        {
          type: 'MILITARY_METRIC_CHANGE',
          metric: 'militaryExpenses',
          value: -6,
          label: 'Скорочення військового бюджету',
        },
        {
          type: 'MILITARY_METRIC_CHANGE',
          metric: 'readiness',
          value: -20,
          label: 'Падіння бойової готовності армії',
        },
        {
          type: 'RESOLVE_ECONOMIC_CRISIS',
          crisisId: 'crisis_budget_insolvency',
          resolutionNote: 'Бюджет збалансовано ціною послаблення оборони.',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -30,
          tensionChange: 35,
          label: 'Офіцерський корпус на межі військового путчу',
        },
      ],
    },
  ],
  reflection:
    'Бюджетна криза не сперечається з Гетьманом. Вона просто виставляє рахунок за попередні рішення. Те, що здавалося сміливістю три роки тому, тепер має ціну.',
};

export const tradeCollapseScenario: Scenario = {
  id: 'scenario_crisis_trade_collapse',
  title: 'Торговельний параліч: Блокада гаваней та спустошення ринків',
  year: 1851,
  location: 'Одеський Портовий Магістрат',
  tags: ['криза', 'торгівля', 'порти', 'блокада'],
  priority: 140,
  importance: 'critical',
  conditions: [
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_crisis_trade_collapse',
    },
  ],
  characters: ['lev_ostrozkyi', 'general_chaika', 'mykola_berest'],
  speakerId: 'lev_ostrozkyi',
  speakerRole: 'Голова Купецької Гільдії',
  speakerQuote:
    '«Гетьмане, кораблі не приходять. Зерно лежить у складах, ціни падають, купці закривають контори. Нам можна пояснювати це блокадою скільки завгодно. Але якщо гавань мовчить ще місяць, місто почне голодувати.»',
  introduction:
    'Чорноморська торгівля раптово захлинулася. Частина маршрутів небезпечна, частина купців обходить наші порти через мита та страх. На складах накопичується зерно, а в гаванях стає неприродно тихо.',
  situation:
    'Повернути рух можна силою флоту, відкрити торговий коридор або підтримати купців державними коштами. Кожен день без рішення збільшує втрати.',
  choices: [
    {
      id: 'choice_naval_escort',
      text: 'Кинути козацький військовий флот на повну зачистку морських трас.',
      description: 'Виділити 5 млн карбованців на спорядження бойових чайок і фрегатів для конвоювання торговельних караванів.',
      politicalCost: {
        economicCost: 5,
        politicalCost: {
          faction_military_command: 15,
          faction_merchants: 20,
        },
        capitalCost: 4,
      },
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeFreedom',
          value: 20,
          label: 'Відновлення безпеки морських шляхів',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeVolume',
          value: 25,
          label: 'Повернення торговельних караванів',
        },
        {
          type: 'RESOLVE_ECONOMIC_CRISIS',
          crisisId: 'crisis_trade_collapse',
          resolutionNote: 'Флот Січі відновив безпеку судноплавства.',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: 20,
          label: 'Купці вдячні за надійний військовий захист гаваней',
        },
      ],
    },
  ],
  reflection:
    'Торговельна криза показує слабке місце відкритої економіки: без безпеки, довіри й доступного шляху до ринку навіть багаті землі можуть раптом залишитися без грошей.',
};
