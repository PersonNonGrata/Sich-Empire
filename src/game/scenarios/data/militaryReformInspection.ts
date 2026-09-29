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
    '«Ось перші гармати. Вони працюють. Тепер небезпечніше питання: кому дозволити навчитися їх робити? Якщо креслення вийдуть за ворота арсеналу, ми отримаємо тисячі стволів. І тисячі людей, які знатимуть, як їх будувати.»',
  introduction:
    '1849 рік. У ливарні стоїть перша батарея гармат нового зразка. Парові молоти не змовкають, а Софія Острозька тримає в руках креслення, за які іноземні держави заплатили б чимало.',
  situation:
    'Можна відкрити виробництво приватним цехам і швидко збільшити випуск. Або залишити технологію під державною охороною, прийнявши повільніший темп заради контролю.',
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
    'Перша військова реформа поставила питання, яке повторюватиметься ще не раз: що небезпечніше для держави — повільність чи втрата контролю над власною силою.',
};
