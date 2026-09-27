import { Scenario } from '../types.ts';

export const portTariffs1851Scenario: Scenario = {
  id: 'scenario_port_customs_1851',
  title: 'Портовий збір та вільні чорноморські гавані',
  year: 1851,
  location: 'Адміралтейська Колегія, Одеса',
  tags: ['торгівля', 'мита', 'порти', 'чорне_море', '1851'],
  priority: 95,
  importance: 'standard',
  conditions: [
    {
      type: 'YEAR',
      operator: '>=',
      value: 1851,
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_port_customs_1851',
    },
  ],
  characters: ['lev_ostrozkyi', 'jan_korchak', 'general_chaika'],
  speakerId: 'lev_ostrozkyi',
  speakerRole: 'Голова Купецької Гільдії Чорноморських Портів',
  speakerQuote:
    '«Ясновельможний Гетьмане! До Одеської гавані прибувають каравели з Марселя, Трієста та Стамбула. Якщо ми встановимо вільну гавань (порто-франко) зі зниженими митами, Одеса стане торговельною перлиною півдня! Але якщо ви обкладете кожну бочку вина й зерна важким збором — іноземні капітани підуть у турецькі порти.»',
  introduction:
    'Літо 1851 року. Гетьман інспектує чорноморські форпости та верфі. Чорноморська торгівля переживає піднесення. Скарбниця наполягає на збільшенні мит для латання бюджету, а гільдії купців вимагають режиму найбільшого сприяння.',
  situation:
    'Оберіть морську митну політику: проголосити безмитний режим «порто-франко» для залучення міжнародного купецтва, посилити митні збори на користь скарбниці, або запровадити збалансоване мито з інвестиціями у верфі.',
  choices: [
    {
      id: 'choice_free_port',
      text: 'Запровадити режим вільної гавані (порто-франко) в Одесі.',
      description: 'Знизити тарифи з 25% до 10%, підвищити торговельну свободу до 75%. Митні надходження тимчасово знизяться, але вантажообіг, добробут краю та купецький капітал різко підскочать.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: 18,
          faction_landed_aristocracy: 10,
          faction_military_command: -6,
        },
        capitalCost: 4,
      },
      politicalReactions: [
        { factionId: 'faction_merchants', reaction: 'support', note: 'Торговельне свято одеських гільдій' },
        { factionId: 'faction_landed_aristocracy', reaction: 'support', note: 'Зручний збут галицького і подільського зерна' },
      ],
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeFreedom',
          value: 20,
          label: 'Торговельна свобода (режим порто-франко)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeVolume',
          value: 16,
          label: 'Стрімкий наплив іноземних суден',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tariffsRate',
          value: -15,
          label: 'Зниження митних тарифів до 10%',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'portEfficiency',
          value: 12,
          label: 'Оновлення портових пакгаузів та кранів',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'publicProsperity',
          value: 6,
          label: 'Здешевлення заморських товарів для містян',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: 18,
          wealthChange: 15,
          label: 'Купецькі капітали примножуються',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'lev_ostrozkyi',
          trustChange: 16,
          respectChange: 10,
          label: 'Лев Острозький обіцяє щедрі пожертви на флот',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Універсал про Одеське Порто-Франко',
          description: 'Гетьман відкрив південну морську браму Імперії Січ для вільної міжнародної торгівлі, знизивши мита до мінімуму.',
          importance: 'major',
          tags: ['порти', 'торгівля', 'одеса', '1851'],
        },
      ],
    },
    {
      id: 'choice_high_tariffs',
      text: 'Встановити високий митний тариф на весь закордонний імпорт.',
      description: 'Підвищити тарифи до 45%. Зібрати додаткові +8 млн карбованців мита на рік для державної скарбниці, захищаючи місцевих ремісників.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_merchants: -18,
          faction_reformers: 5,
          faction_military_command: 8,
        },
        capitalCost: 4,
      },
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tariffsRate',
          value: 20,
          label: 'Підвищення мита до 45%',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: 8,
          label: 'Скарбниця (нові надходження від митниць)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'tradeFreedom',
          value: -15,
          label: 'Протекціоністські обмеження на імпорт',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_merchants',
          loyaltyChange: -18,
          tensionChange: 20,
          label: 'Купецтво обурене митним грабунком',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'lev_ostrozkyi',
          trustChange: -14,
          label: 'Лев Острозький попереджає про відтік торговельних караванів',
        },
      ],
    },
  ],
  reflection:
    'Морські гавані — це пульс зовнішнього світу. Рішення 1851 року показало дилему: збирати золото з мита сьогодні чи дати розквітнути торговому обігу на роки вперед.',
};
