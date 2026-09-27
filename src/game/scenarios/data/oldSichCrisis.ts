import { Scenario } from '../types.ts';

export const oldSichCrisisScenario: Scenario = {
  id: 'scenario_crisis_old_sich_revolt',
  title: 'Рада Старшини: Бунт Низового Війська',
  year: 1849,
  location: 'Курінний Майдан Хортиці, Низова Січ',
  tags: ['криза', 'стара_січ', 'автономія', 'рада_старшини'],
  priority: 150, // Top priority when triggered
  importance: 'critical',
  conditions: [
    {
      type: 'SCENARIO_NOT_COMPLETED',
      scenarioId: 'scenario_crisis_old_sich_revolt',
    },
  ],
  characters: ['ostap_kovalenko', 'general_chaika', 'maria_levytska', 'jan_korchak'],
  speakerId: 'ostap_kovalenko',
  speakerRole: 'Курінний Отаман Низового Війська',
  speakerQuote:
    '«Гетьмане! Ми терпіли столичних чиновників та накази з кабінетів. Але коли зазіхають на віковічну волю Хортиці та козацький суд — шаблі виходять із піхов самі! Низове товариство не потерпить ярма. Або ти вертаєш вольності, або на Хортиці оберуть іншого володаря!»',
  introduction:
    'Напруження навколо централізації та утиску автономії Запоріжжя вибухнуло відкритим протистоянням. На курінному майдані зібралися тисячі озброєних козаків під чорними прапорами. Дзвони Січової дзвіниці б’ють тривогу.',
  situation:
    'Стара Січ перейшла червону лінію: отамани вимагають негайного скасування нагляду чиновників або загрожують відмовою присяги. Поруч стоїть генерал Чайка з готовими до бою гарматами, а представники громад благають уникнути братовбивчої крові.',
  choices: [
    {
      id: 'choice_crisis_concede_autonomy',
      text: 'Поступитися: підтвердити суверенні права Низової Січі та відкликати інспекторів.',
      description: 'Визнати повну внутрішню автономію Запоріжжя, обмежити владу столичних чиновників та знизити централізацію.',
      consequences: [
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_old_sich',
          loyaltyChange: 35,
          tensionChange: -40,
          influenceChange: 15,
          label: 'Стара Січ святкує тріумф козацької волі',
        },
        {
          type: 'REGION_CHANGE',
          regionId: 'region_sich_core',
          autonomyChange: 25,
          stabilityChange: 10,
          unrestChange: -20,
          label: 'Запоріжжя відновлює широкий статус автономії',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: -12,
          tensionChange: 15,
          label: 'Генералітет незадоволений слабкістю перед отаманами',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: -8,
          label: 'Поступка під тиском послабила столичний авторитет',
        },
        {
          type: 'TENSION',
          key: 'tension_autonomy_centralization',
          value: -20,
          label: 'АВТОНОМІЯ ↔ ЦЕНТРАЛІЗАЦІЯ (відкат до децентралізації)',
        },
        {
          type: 'RESOLVE_CRISIS',
          crisisId: 'crisis_voice_of_old_sich',
          resolutionNote: 'Кризу врегульовано через повернення вольностей Запоріжжю',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'CRISIS_RESOLVED',
          title: 'Умиротворення Хортиці: Відновлення Вольностей Старої Січі',
          description: 'Гетьман підтвердив давні права Низового Війська, зупинивши загрозу громадянської війни поступкою козацькій волі.',
          importance: 'critical',
          tags: ['криза_розв_язана', 'стара_січ', 'мир'],
        },
      ],
    },
    {
      id: 'choice_crisis_threaten_force',
      text: 'Погрожувати силою: націлити гармати генерала Чайки та вимагати скласти зброю.',
      description: 'Поставити ультиматум бунтівним куреням: заколотники будуть розсіяні картеччю за спробу порушення державної присяги.',
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'stability',
          value: -10,
          label: 'Шок від військової загрози столиці',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_old_sich',
          loyaltyChange: -30,
          tensionChange: 35,
          label: 'Стара Січ затаїла смертельну ненависть до уряду',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_military_command',
          loyaltyChange: 15,
          influenceChange: 15,
          label: 'Військові торжествують встановлення диктату',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: -15,
          label: 'Управління силою зброї підриває суспільну довіру',
        },
        {
          type: 'LEGITIMACY_CHANGE',
          pillar: 'tradition',
          value: -20,
          label: 'Удар по козацькій традиції',
        },
        {
          type: 'RESOLVE_CRISIS',
          crisisId: 'crisis_voice_of_old_sich',
          resolutionNote: 'Бунт придушено погрозою артилерії, посіяно глибоку ворожнечу',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'CRISIS_RESOLVED',
          title: 'Залізна Рука на Хортиці: Приборкання Куренів Силою',
          description: 'Гетьман розгорнув артилерію проти отаманів. Бунт згас від страху, але рана в серці козацтва горітиме роками.',
          importance: 'critical',
          tags: ['криза', 'зброя', 'розрив'],
        },
      ],
    },
    {
      id: 'choice_crisis_propose_new_pact',
      text: 'Запропонувати Нову Угоду: Козацька Палата при Гетьмані та збереження клейнодів.',
      description: 'Шлях високого державного розуму: створити постійну Палату Військових Отаманів у столиці з правом вето на військові закони.',
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'unity',
          value: 8,
          label: 'Новий консенсус влади та традиції',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_old_sich',
          loyaltyChange: 20,
          tensionChange: -25,
          label: 'Стара Січ отримує гідне місце в інституціях',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_reformers',
          loyaltyChange: 8,
          label: 'Реформатори схвалюють інституційне вирішення конфлікту',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: 10,
          label: 'Мудрий компроміс звеличує авторитет володаря',
        },
        {
          type: 'LEGITIMACY_CHANGE',
          pillar: 'law',
          value: 12,
          label: 'Зміцнення законності',
        },
        {
          type: 'RESOLVE_CRISIS',
          crisisId: 'crisis_voice_of_old_sich',
          resolutionNote: 'Укладено нову інституційну угоду з Низовим Військом',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'DIPLOMATIC_PACT',
          title: 'Хортицька Соборна Угода: Народження Палати Отаманів',
          description: 'Гетьман перетворив кризу на інституційний тріумф, об’єднавши звичаєве козацьке право з імперською конституцією.',
          importance: 'critical',
          tags: ['компроміс', 'пакт', 'соборність'],
        },
      ],
    },
    {
      id: 'choice_crisis_ignore',
      text: 'Ігнорувати вимоги та покинути майдан без відповіді.',
      description: 'Показати зневагу до крику натовпу, наказати вартовим замкнути браму цитаделі.',
      consequences: [
        {
          type: 'STATE_CHANGE',
          metric: 'stability',
          value: -12,
          label: 'Розпад керованості в серці держави',
        },
        {
          type: 'FACTION_CHANGE',
          factionId: 'faction_old_sich',
          loyaltyChange: -25,
          tensionChange: 30,
          label: 'Отамани вважають Гетьмана негідним клейнодів',
        },
        {
          type: 'POLITICAL_CAPITAL_CHANGE',
          value: -20,
          label: 'Параліч влади та втрата ініціативи',
        },
        {
          type: 'HISTORY_EVENT',
          eventType: 'CRISIS_TRIGGERED',
          title: 'Глухий Кут на Хортиці: Втеча Влади від Рішення',
          description: 'Гетьман проігнорував Раду Старшини. Степ охопило глухе ремствування та підготовка до повстання.',
          importance: 'critical',
          tags: ['криза', 'параліч', 'небезпека'],
        },
      ],
    },
  ],
  reflection:
    'Політична криза довела: влада без згоди станів — це будинок на піску. Гетьман мусить не просто наказувати, а відчувати живу межу терпіння народу.',
};
