import { Scenario } from '../types.ts';

export const militaryReformInspectionScenario: Scenario = {
  id: 'scenario_military_reform_inspection',
  title: 'Огляд Нових Ливарень: Нарізний Полк',
  year: 1849,
  location: 'Хортицький Арсенал та Ливарний Двір',
  tags: ['арсенал', 'реформа', 'наука', 'гармати'],
  priority: 90,
  importance: 'standard',
  conditions: [
    {
      type: 'SCENARIO_COMPLETED',
      scenarioId: 'scenario_first_council',
    },
    {
      type: 'HAS_DECISION',
      choiceId: 'choice_reform_army',
    },
  ],
  characters: ['rector_ostrozka', 'general_chaika'],
  speakerId: 'rector_ostrozka',
  speakerRole: 'Ректорка Політехнічної Академії',
  speakerQuote:
    '«Ясновельможний Гетьмане! Перші шість батарей нарізних гармат готові до стрільб. Проте ми стоїмо перед дилемою: передати креслення у вільні цехи для масового виробництва чи залишити у таємній монополії Січового Арсеналу?»',
  introduction:
    'Рік потому після історичного засідання Ради. Парові молоти Хортицького арсеналу б’ють у ритмі нового століття. Професор Софія Острозька демонструє новітній артилерійський парк.',
  situation:
    'Військовий інноваційний проєкт дав перші зразки. Тепер стоїть питання про масштаб: відкрити ліцензії вільним промисловцям для здешевлення, або залишити виробництво суто під наглядом Гетьманської розвідки.',
  choices: [
    {
      id: 'choice_free_guild_production',
      text: 'Залучити вільні мануфактури до масового випуску.',
      description: 'Дати замовлення приватним купецьким цехам, збільшуючи темпи виробництва та збагачуючи промислові регіони.',
      consequences: [
        {
          type: 'EMPIRE_METRIC_CHANGE',
          metric: 'prosperity',
          value: 6,
          label: 'Промислове процвітання',
        },
        {
          type: 'EMPIRE_METRIC_CHANGE',
          metric: 'militaryStrength',
          value: 4,
          label: 'Військова міць',
        },
        {
          type: 'PSYCHOLOGICAL_SIGNAL',
          dimension: 'FREEDOM',
          value: 1,
          contextNote: 'Довіра до вільних промислових сил',
        },
        {
          type: 'ADD_HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Комерційне розширення оборонних мануфактур',
          description: 'Гетьман дозволив приватним гільдіям виробляти деталі для імперського артилерійського парку.',
          importance: 'standard',
          tags: ['промисловість', 'арсенал'],
        },
      ],
      relationshipChanges: [
        { characterId: 'rector_ostrozka', delta: 10, label: 'Ректорка вітає масштаб впровадження' },
      ],
    },
    {
      id: 'choice_secret_state_monopoly',
      text: 'Зберегти сувору державну монополію та військову таємницю.',
      description: 'Виробляти гармати виключно в закритих цитаделях Січі, щоб унеможливити витік технологій шпигунам сусідніх монархій.',
      consequences: [
        {
          type: 'EMPIRE_METRIC_CHANGE',
          metric: 'militaryStrength',
          value: 6,
          label: 'Військова міць (секретність)',
        },
        {
          type: 'EMPIRE_METRIC_CHANGE',
          metric: 'stability',
          value: 3,
          label: 'Стабільність контролю',
        },
        {
          type: 'PSYCHOLOGICAL_SIGNAL',
          dimension: 'CENTRALIZATION',
          value: 1,
          contextNote: 'Збереження військової таємниці та державного монополізму',
        },
        {
          type: 'ADD_HISTORY_EVENT',
          eventType: 'MILITARY_ACT',
          title: 'Одержавлення та секретність нарізної зброї',
          description: 'Новітні технології взято під особисту охорону гетьманських сердюків.',
          importance: 'standard',
          tags: ['безпека', 'таємниця'],
        },
      ],
      relationshipChanges: [
        { characterId: 'general_chaika', delta: 8, label: 'Генерал схвалює заходи безпеки' },
      ],
    },
  ],
  reflection:
    'Вибір між відкритим ринковим зростанням та захищеною державною монополією визначає характер промислової революції в Імперії Січ.',
};
