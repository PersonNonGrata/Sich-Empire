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
      operator: '==',
      value: 1851,
    },
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_border_echoes_1851',
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
    '«Одеса може стати воротами держави або її касою. Вільна гавань приведе кораблі й капітал, але скарбниця втратить частину мита. Високий тариф дасть золото зараз. І може змусити кораблі обійти нас стороною.»',
  introduction:
    'Літо 1851 року. У чорноморських портах зростає рух суден. Купці вимагають свободи торгівлі, скарбниця рахує кожен карбованець, а після прикордонної кризи Гетьманові потрібен простір для нового курсу.',
  situation:
    'Вирішується доля морських воріт Січі. Відкрити гавань і поставити на майбутній товарообіг. Або підняти мито й отримати більше грошей від кожного вантажу. Обидва рішення змінять силу купецтва.',
  narrativePressures: [
    {
      id: 'pressure_port_taxed_aristocracy',
      sourcePatternOrTag: 'Оподаткував маєтки магнатів',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Оподаткував маєтки магнатів',
      },
      impactDescription: 'Після поземельного оподаткування магнатів чорноморські купці шукають захисту: режим вільної гавані розглядається як гарантія недоторканності комерції.',
      speakerModifier: {
        speakerQuote:
          '«Ясновельможний Гетьмане! Після того, як ви змусили шляхту платити поземельний податок, Одеська гавань залишилася головним місцем, де приватний капітал може дихати вільно! Не душіть порти важкими зборами — проголосіть порто-франко!»',
      },
    },
    {
      id: 'pressure_port_central_vertical',
      sourcePatternOrTag: 'Встановив столичний нагляд',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Встановив столичний нагляд',
      },
      impactDescription: 'Столичний нагляд змушує іноземних капітанів вимагати чітких свобод: заморські купці остерігаються надмірного контролю комендантів.',
      speakerModifier: {
        speakerQuote:
          '«Гетьмане! Ваша дисципліна тримає воєводства, але море вимагає свободи вітрів. Іноземні капітани підуть у порти султана, якщо відчують зашморг столичних інспекторів на митниці!»',
      },
    },
    {
      id: 'pressure_port_railway_credit',
      sourcePatternOrTag: 'Залучив купецькі кредити',
      condition: {
        type: 'HAS_MEMORY_TAG',
        memoryTag: 'Залучив купецькі кредити',
      },
      impactDescription: 'Успішне партнерство щодо залізниці створило взаємну довіру: вільна гавань стане природним завершенням великої магістралі.',
    },
  ],
  choices: [
    {
      id: 'choice_free_port',
      text: 'Запровадити режим вільної гавані (порто-франко) в Одесі.',
      description: 'Знизити тарифи з 25% до 10%, підвищити торговельну свободу до 75%. Митні надходження тимчасово знизяться, але вантажообіг, добробут краю та купецький капітал різко підскочать.',
      memoryTags: ['Відкрив порти для вільного світу'],
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
      memoryTags: ['Запровадив протекціоністські мита'],
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
    'Портова політика показала, чи довіряє Гетьман майбутньому торгового потоку більше, ніж гарантованому збору сьогодні.',
};
