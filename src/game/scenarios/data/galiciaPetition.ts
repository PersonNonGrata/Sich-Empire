import { Scenario } from '../types.ts';

export const galiciaPetitionScenario: Scenario = {
  id: 'scenario_petition_galicia_land',
  title: 'Петиція: Вимога Галицьких Землевласників',
  year: 1849,
  location: 'Палата Сеймикових Послів, Хортиця',
  tags: ['петиція', 'земля', 'галичина', 'шляхта', 'політика'],
  priority: 92,
  sequenceOrder: 10,
  required: true,
  importance: 'standard',
  conditions: [
    {
      type: 'YEAR',
      operator: '==',
      value: 1849,
    },
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_tax_reform_1849',
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_petition_galicia_land',
    },
  ],
  characters: ['jan_korchak', 'maria_levytska', 'general_chaika', 'ostap_kovalenko'],
  speakerId: 'jan_korchak',
  speakerRole: 'Маршалок Галицького Земського Сеймику',
  speakerQuote:
    '«Ми не прийшли просити милості. Ми прийшли нагадати про угоду. Наше зерно годує полки, наші маєтки тримають дороги, а наші сеймики досі пам\'ятають власні права. Скажіть прямо: Січ їх визнає чи ні?»',
  introduction:
    'Весна 1849 року. До столиці прибуває делегація галицьких землевласників. Ян Корчак кладе на стіл товсту папку з підписами. За вікнами чекають представники громад, які вже чули, про що йдеться.',
  situation:
    'Петиція торкається землі, судів і грошей. Поступка зміцнить західне пограниччя, але може розлютити громади. Відмова покаже силу центру, але поставить під питання домовленості, на яких тримається місцева лояльність. Можна також спробувати розвести конфлікт через спільну комісію.',
  choices: [
    {
      id: 'choice_petition_agree',
      text: 'Погодитися: задовольнити петицію та закріпити недоторканність маєтків.',
      description: 'Видати гетьманський грамотний лист на користь галицької шляхти, закріпивши непорушність латифундій.',
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: 20,
          influenceChange: 10,
          label: 'Шляхта Галичини висловлює повну вірність Гетьману',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: -15,
          tensionChange: 15,
          label: 'Громади обурені поступками великим панам',
        },
        {
          type: 'REGION_CHANGE',
          regionId: 'region_galicia',
          loyaltyChange: 15,
          prosperityChange: 5,
          label: 'Галичина зміцнює зв’язок зі столицею',
        },
        {
          type: 'POLITICAL_COST',
          cost: {
            politicalCost: {
              faction_communities: -15,
              faction_old_sich: -10,
            },
            capitalCost: 5,
          },
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'COUNCIL_DECISION',
          title: 'Ухвалення Галицької Земельної Грамоти',
          description: 'Гетьман підтвердив привілеї галицьких землевласників, закріпивши союз з аграрною елітою.',
          importance: 'standard',
          tags: ['петиція', 'земля', 'шляхта'],
        },
      ],
    },
    {
      id: 'choice_petition_refuse',
      text: 'Відмовити: оголосити, що земля є надбанням усього народу Січі.',
      description: 'Рішуче відхилити петицію, попередивши шляхту про неприпустимість сепаратизму та шантажу.',
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: -25,
          tensionChange: 30,
          label: 'Землевласники ображені та розривають зв’язки з урядом',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: 15,
          label: 'Селяни та громади вітають захист народних прав',
        },
        {
          type: 'REGION_CHANGE',
          regionId: 'region_galicia',
          unrestChange: 20,
          loyaltyChange: -15,
          label: 'У Галичині назріває податковий страйк',
        },
        {
          type: 'POLITICAL_COST',
          cost: {
            politicalCost: {
              faction_landed_aristocracy: -25,
            },
            capitalCost: 8,
          },
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'COUNCIL_DECISION',
          title: 'Відхилення Шляхетської Петиції про Землю',
          description: 'Гетьман суворо відмовив галицьким магнатам, підтвердивши народну основу земельного устрою.',
          importance: 'standard',
          tags: ['відмова', 'громади', 'земля'],
        },
      ],
    },
    {
      id: 'choice_petition_commission',
      text: 'Створити Паритетну Земельну Комісію для вивчення питання.',
      description: 'Призначити змішану комісію з представників шляхти Яна Корчака та київських юристів Марії Левицької з терміном роботи 2 роки.',
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'stability',
          value: 3,
          label: 'Зняття гостроти конфлікту через правову процедуру',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: 10,
          label: 'Реформатори схвалюють інституційний підхід',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: 4,
          label: 'Дипломатична витримка зберігає політичний простір',
        },
        {
          type: 'CREATE_PROMISE',
          promise: {
            text: 'Завершити розгляд земельної реформи комісією та ухвалити справедливий закон',
            targetFaction: 'faction_landed_aristocracy',
            deadlineYear: 1851,
            importance: 'standard',
          },
          label: 'Дано обіцянку завершити реформу до 1851 року',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Створення Генеральної Земельної Комісії Січі',
          description: 'Гетьман передав суперечку щодо земель у руки фахових правників та сеймикових послів.',
          importance: 'standard',
          tags: ['комісія', 'право', 'обіцянка'],
        },
      ],
    },
    {
      id: 'choice_petition_compromise',
      text: 'Запропонувати компроміс: знизити експортні мита взамін на продаж надлишків селянам.',
      description: 'Шляхта отримує безмитний експорт зерна до Чорного Моря, але зобов’язується продавати вільні наділи селянським громадам у кредит.',
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'prosperity',
          value: 5,
          label: 'Стимулювання аграрного експорту',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: 12,
          label: 'Землевласники приймають компроміс заради вигоди',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: 10,
          label: 'Громади раді можливості викупу землі',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: 6,
          label: 'Блискучий державний компроміс посилює владу',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'DIPLOMATIC_PACT',
          title: 'Галицько-Дніпровський Аграрний Компроміс',
          description: 'Гетьман поєднав торговельний зиск великих латифундистів із земельними потребами вільних селян.',
          importance: 'major',
          tags: ['компроміс', 'аграрна_угода', 'розквіт'],
        },
      ],
    },
  ],
  reflection:
    'Петиція Корчака показала ціну домовленостей минулого року. Союзник, якого ви підняли рішенням Ради, тепер прийшов по свою частину угоди. Держава вчиться: кожен компроміс має продовження.',
};
