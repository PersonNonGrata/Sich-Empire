import { Scenario } from '../types.ts';

export const railwayOpening1853Scenario: Scenario = {
  id: 'scenario_railway_opening_1853',
  title: 'Урочисте відкриття залізниці: Початок індустріальної доби',
  year: 1853,
  location: 'Головний Двірець, Київ',
  tags: ['залізниця', 'тріумф', 'індустрія', '1853'],
  priority: 100,
  importance: 'critical',
  conditions: [
    {
      type: 'YEAR',
      operator: '==',
      value: 1853,
    },
    {
      type: 'HAS_FLAG',
      flag: 'railway_project_underway',
      value: true,
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_railway_opening_1853',
    },
  ],
  characters: ['mykola_berest', 'lev_ostrozkyi', 'general_chaika', 'maria_levytska'],
  speakerId: 'mykola_berest',
  speakerRole: 'Головний інженер Імперії Січ',
  speakerQuote:
    '«Вона рушила, Гетьмане. Три роки креслень, боргів, суперечок і роботи. Тепер перший потяг стоїть перед нами. Питання вже не в тому, чи побудували ми дорогу. Питання — для чого вона служитиме.»',
  introduction:
    '1853 рік. На київському пероні свистить перший паротяг Січової магістралі. Уздовж колії стоять люди з міст і сіл, через які три роки проходило будівництво.',
  situation:
    'Залізниця нарешті стала реальною силою. Її можна віддати передусім торгівлі або поставити на військову логістику. Напрям першого руху стане символом вашого індустріального курсу.',
  choices: [
    {
      id: 'choice_grain_boom',
      text: 'Спрямувати колію на експорт зерна та максимальний торговельний прибуток.',
      description: 'Вантажні потяги цілодобово везуть хліб до одеських кораблів. Торговельні доходи скарбниці зростуть на +15 млн, добробут подільських господарств підніметься.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: 22,
          faction_landed_aristocracy: 15,
          faction_communities: 10,
        },
        capitalCost: 4,
      },
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeRevenue',
          value: 15,
          label: 'Торговельні доходи від залізничного експорту (+15 млн)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'publicProsperity',
          value: 10,
          label: 'Зростання добробуту міст уздовж магістралі',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'economicGrowth',
          value: 2.0,
          label: 'Індустріальне прискорення (+2.0%)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: 22,
          wealthChange: 20,
          label: 'Купецькі доми переживають золотий вік',
        },
        {
          type: 'REGION_CHANGE',
          regionId: 'region_podillia',
          prosperityChange: 15,
          label: 'Економічний розквіт Поділля та Києва',
        },
        {
          type: 'REGION_CHANGE',
          regionId: 'region_black_sea',
          prosperityChange: 18,
          label: 'Одеса стає найбільшим зерновим портом Східної Європи',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Тріумфальний Пуск Залізниці Київ — Одеса',
          description: '1853 рік увійшов до літопису як початок залізничної доби Січі. Магістраль кардинально змінила геополітичну та економічну вагу держави.',
          importance: 'critical',
          tags: ['залізниця', 'тріумф', '1853'],
        },
      ],
    },
    {
      id: 'choice_strategic_mobilization',
      text: 'Підпорядкувати колію військовому командуванню для швидкого перекидання дивізій.',
      description: 'Генералітет отримує пріоритет на перевезення полків, гармат та боєприпасів. Логістика та боєздатність армії сягнуть рекордної позначки.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_military_command: 25,
          faction_merchants: -8,
        },
        capitalCost: 4,
      },
      consequences: [
        {
          type: 'MILITARY_METRIC_CHANGE',
          metric: 'logistics',
          value: 25,
          label: 'Миттєве стратегічне перекидання військ колією',
        },
        {
          type: 'MILITARY_METRIC_CHANGE',
          metric: 'readiness',
          value: 15,
          label: 'Повна оперативна боєготовність армії',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 25,
          label: 'Генерал Чайка захоплений мілітарною швидкістю Січі',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'general_chaika',
          trustChange: 18,
          respectChange: 15,
          label: 'Генерал Чайка вважає Гетьмана генієм оборони',
        },
      ],
    },
  ],
  reflection:
    'Будівництво завершилося, але вибір починається знову. Інфраструктура сама по собі не має політичної волі. Її набуває той, хто визначає, кому вона служить.',
};
