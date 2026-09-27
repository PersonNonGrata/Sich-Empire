import { Scenario } from '../types.ts';

export const taxReform1849Scenario: Scenario = {
  id: 'scenario_tax_reform_1849',
  title: 'Податкова реформа: Ціна наповнення скарбниці',
  year: 1849,
  location: 'Золота Палата Гетьманського Палацу, Хортиця',
  tags: ['економіка', 'податки', 'скарбниця', 'громади', '1849'],
  priority: 95,
  importance: 'critical',
  conditions: [
    {
      type: 'YEAR',
      operator: '>=',
      value: 1849,
    },
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_tax_reform_1849',
    },
  ],
  characters: ['maria_levytska', 'jan_korchak', 'general_chaika', 'lev_ostrozkyi'],
  speakerId: 'maria_levytska',
  speakerRole: 'Представниця київських міських громад',
  speakerQuote:
    '«Ясновельможний Гетьмане! Казна вимагає грошей, але дерти три шкури з ремісників та селян — це шлях до народного бунту. Люди ледве оговталися від рекрутських наборів. Якщо збільшите подимне та подушне — громади відмовляться платити, а ярмарки спорожніють!»',
  introduction:
    'Весна 1849 року. Державний скарбник кладе перед Гетьманом розрахунки: потреби армії та відбудови рубежів перевищують поточні надходження. Якщо не підвищити податки, держава ризикує увійти у боргову яму. Проте кожен статок вимагає пільг для себе.',
  situation:
    'Ви маєте обрати податковий курс Імперії Січ: підвищити збори для фінансування армії і реформ, полегшити фіскальний тиск заради добробуту людей, або ввести прогресивний податок на великі земельні маєтки шляхти.',
  choices: [
    {
      id: 'choice_raise_taxes',
      text: 'Підвищити загальний податковий тягар задля наповнення скарбниці.',
      description: 'Збільшити податковий тягар з 38% до 48%. Скарбниця отримає стабільний річний приплив +10 млн карбованців, але це вдарить по добробуту міщан і селян.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_communities: -15,
          faction_merchants: -10,
          faction_military_command: 8,
        },
        capitalCost: 5,
      },
      politicalReactions: [
        { factionId: 'faction_communities', reaction: 'opposition', note: 'Обурення зростанням поборів' },
        { factionId: 'faction_military_command', reaction: 'support', note: 'Задоволення надійним фінансуванням' },
        { factionId: 'faction_merchants', reaction: 'concern', note: 'Побоювання падіння купівельної спроможності' },
      ],
      consequences: [
        {
          type: 'TAX_POLICY_CHANGE',
          policy: 'high',
          burdenChange: 10,
          label: 'Підвищення фіскального тягаря до 48%',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: 12,
          label: 'Скарбниця (первинне поповнення від нових зборів)',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'publicProsperity',
          value: -6,
          label: 'Зниження народних статків через фіскальний тиск',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: -15,
          tensionChange: 15,
          label: 'Громади відкрито протестують проти податкового тиску',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 8,
          label: 'Військове командування спокійне за постачання',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'maria_levytska',
          trustChange: -12,
          respectChange: -4,
          label: 'Марія Левицька засуджує фіскальний визиск міщан',
        },
        {
          type: 'FLAG',
          flag: 'high_tax_policy_adopted',
          value: true,
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Універсал про Фіскальну Мобілізацію 1849 року',
          description: 'Гетьман підвищив податки для зміцнення скарбниці та оборони, попри глухе ремствування міських цехів та селянських громад.',
          importance: 'major',
          tags: ['податки', 'бюджет', '1849'],
        },
        {
          type: 'SCHEDULE_CONSEQUENCE',
          consequenceData: {
            triggerYear: 1852,
            title: 'Податкова втома провінцій',
            description: 'Три роки високих поборів виснажили дрібні ремесла Поділля та Київщини. Подальший збір податків гальмується через ухилення та борги громад.',
            conditions: [
              {
                type: 'HAS_FLAG',
                flag: 'high_tax_policy_adopted',
                value: true,
              },
            ],
            consequences: [
              {
                type: 'ECONOMY_METRIC_CHANGE',
                metric: 'taxEfficiency',
                value: -8,
                label: 'Падіння збираності податків через ухилення',
              },
              {
                type: 'REGION_CHANGE',
                regionId: 'region_podillia',
                unrestChange: 12,
                label: 'Податкові страйки у подільських містечках',
              },
            ],
          },
        },
      ],
    },
    {
      id: 'choice_lower_taxes',
      text: 'Полегшити податки заради розквіту ремесел і торгівлі.',
      description: 'Знизити податковий тягар з 38% до 28%. Доходи скарбниці скоротяться на -6 млн щорічно, але добробут людей та довіра громад стрімко зростуть.',
      politicalCost: {
        economicCost: 6,
        politicalCost: {
          faction_communities: 15,
          faction_merchants: 12,
          faction_military_command: -12,
        },
        capitalCost: 4,
      },
      politicalReactions: [
        { factionId: 'faction_communities', reaction: 'support', note: 'Захоплена підтримка курсу полегшення' },
        { factionId: 'faction_merchants', reaction: 'support', note: 'Очікування торговельного піднесення' },
        { factionId: 'faction_military_command', reaction: 'opposition', note: 'Тривога за армійські кошти' },
      ],
      consequences: [
        {
          type: 'TAX_POLICY_CHANGE',
          policy: 'low',
          burdenChange: -10,
          label: 'Зниження податкового тягаря до 28%',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'publicProsperity',
          value: 8,
          label: 'Стрімке зростання народного добробуту',
        },
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'economicGrowth',
          value: 1.2,
          label: 'Економічне пожвавлення (+1.2% зростання)',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: 15,
          tensionChange: -15,
          label: 'Міські громади щиро підтримують Гетьмана',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -10,
          tensionChange: 15,
          label: 'Військові старшини побоюються дефіциту платні',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'maria_levytska',
          trustChange: 14,
          respectChange: 8,
          label: 'Марія Левицька вітає милосердну економічну політику',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'general_chaika',
          trustChange: -8,
          label: 'Генерал Чайка попереджає про небезпеку бідної скарбниці',
        },
        {
          type: 'FLAG',
          flag: 'low_tax_policy_adopted',
          value: true,
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Універсал про Фіскальне Полегшення та Вільну Працю',
          description: 'Гетьман рішуче обмежив побори, стимулюючи народну ініціативу та внутрішній ринок ціною зменшення бюджетного резерву.',
          importance: 'major',
          tags: ['податки', 'добробут', '1849'],
        },
      ],
    },
    {
      id: 'choice_tax_latifundia',
      text: 'Ввести прогресивний податок на латифундії земської шляхти.',
      description: 'Зберегти низькі податки для простих людей, але змусити магнатів Галичини та Правобережжя платити за кожен зайвий лан землі.',
      politicalCost: {
        economicCost: 0,
        politicalCost: {
          faction_landed_aristocracy: -22,
          faction_communities: 10,
          faction_reformers: 10,
        },
        capitalCost: 8,
      },
      politicalReactions: [
        { factionId: 'faction_landed_aristocracy', reaction: 'crisis', note: 'Оголошення війни шляхетським привілеям' },
        { factionId: 'faction_communities', reaction: 'support', note: 'Схвалення справедливості зборів' },
        { factionId: 'faction_reformers', reaction: 'support', note: 'Модерний фіскальний крок' },
      ],
      consequences: [
        {
          type: 'ECONOMY_METRIC_CHANGE',
          metric: 'treasury',
          value: 8,
          label: 'Збір поземельного мита з маєтків шляхти',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_landed_aristocracy',
          loyaltyChange: -22,
          tensionChange: 30,
          label: 'Земська аристократія на межі збройного спротиву',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_communities',
          loyaltyChange: 10,
          label: 'Громади вітають справедливе оподаткування магнатів',
        },
        {
          type: 'RELATIONSHIP_CHANGE',
          characterId: 'jan_korchak',
          trustChange: -18,
          respectChange: -6,
          loyaltyChange: -12,
          label: 'Ян Корчак вважає поземельний податок тиранією',
        },
        {
          type: 'TENSION',
          key: 'tension_might_prosperity',
          value: 10,
          label: 'Соціальне напруження між шляхтою та державою',
        },
        {
          type: 'FLAG',
          flag: 'aristocracy_taxed',
          value: true,
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'REFORM',
          title: 'Універсал про Поземельний Збір з Маєтків',
          description: 'Гетьман обклав податком латифундії магнатів. Шляхетські сеймики Галичини висловили рішучий протест.',
          importance: 'critical',
          tags: ['податки', 'шляхта', 'реформа', '1849'],
        },
      ],
    },
  ],
  reflection:
    'Податкове рішення 1849 року наочно довело володарю: неможливо наповнити скарбницю, не змінивши баланс інтересів між станами. Багатство держави — це завжди компроміс між міццю казни та терпінням підданих.',
};
