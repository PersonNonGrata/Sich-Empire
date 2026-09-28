import { GameState } from '../state/types.ts';
import { Character, ImperialEvent } from '../../types/index.ts';
import { Scenario, Choice } from '../scenarios/types.ts';
import {
  NarrativeCondition,
  NarrativePressure,
  NarrativeMirror,
  MemoryTag,
  HistoricalReputationSignal,
  ReputationCategory,
} from './types.ts';
import { NARRATIVE_MIRRORS_CATALOG } from './data/narrativeMirrors.ts';
import { calculatePsychologicalScore } from '../psychology/manager.ts';
import { ComparisonOperator } from '../conditions/types.ts';

function compareValues(val: number, op: ComparisonOperator | undefined, target: number): boolean {
  const operator = op || '>=';
  switch (operator) {
    case '>=':
      return val >= target;
    case '<=':
      return val <= target;
    case '>':
      return val > target;
    case '<':
      return val < target;
    case '==':
      return val === target;
    case '!=':
      return val !== target;
    default:
      return false;
  }
}

/**
 * Pure evaluation of a NarrativeCondition against the GameState.
 */
export function evaluateNarrativeCondition(condition: NarrativeCondition, state: GameState): boolean {
  switch (condition.type) {
    case 'HAS_PATTERN': {
      const patterns = state.behaviorPatterns || [];
      if (condition.pattern) {
        return patterns.some((p) => p.id === condition.pattern);
      }
      if (condition.dimension) {
        return patterns.some((p) => p.dimension === condition.dimension);
      }
      return patterns.length > 0;
    }

    case 'HAS_DIMENSION': {
      if (!condition.dimension) return false;
      const score = calculatePsychologicalScore(state.psychology || [], condition.dimension);
      return compareValues(score, condition.operator, condition.value ?? 1);
    }

    case 'HAS_TENSION': {
      if (!condition.tension) return false;
      const val = state.tensions?.[condition.tension] ?? 50;
      if (condition.tensionMin !== undefined && val < condition.tensionMin) return false;
      if (condition.tensionMax !== undefined && val > condition.tensionMax) return false;
      if (condition.value !== undefined) {
        return compareValues(val, condition.operator, condition.value);
      }
      return true;
    }

    case 'HAS_ARCHETYPE': {
      if (!condition.archetype) return false;
      const code = state.archetypeProfile?.archetypeCode;
      const title = state.archetypeProfile?.archetype;
      return code === condition.archetype || (title && title.includes(String(condition.archetype))) || false;
    }

    case 'HAS_MEMORY_TAG': {
      if (!condition.memoryTag) return false;
      const tagStr = condition.memoryTag;
      const inRep = (state.reputationTags || []).includes(tagStr);
      const inMem = (state.memoryTags || []).some((m) => m.label === tagStr || m.id === tagStr);
      return inRep || inMem;
    }

    case 'HAS_NOT_MEMORY_TAG': {
      if (!condition.memoryTag) return true;
      const tagStr = condition.memoryTag;
      const inRep = (state.reputationTags || []).includes(tagStr);
      const inMem = (state.memoryTags || []).some((m) => m.label === tagStr || m.id === tagStr);
      return !inRep && !inMem;
    }

    case 'HAS_CONTRADICTION': {
      const contras = state.contradictions || [];
      if (condition.pattern) {
        return contras.some((c) => c.id === condition.pattern);
      }
      if (condition.dimension) {
        return contras.some((c) => c.poleA === condition.dimension || c.poleB === condition.dimension);
      }
      return contras.length > 0;
    }

    case 'HAS_TRANSFORMATION': {
      const trans = state.transformations || [];
      return trans.length > 0;
    }

    case 'HAS_STRESS_TEST': {
      const tests = state.stressTests || [];
      if (condition.pattern) {
        return tests.some((t) => t.id === condition.pattern);
      }
      return tests.some((t) => t.status === 'passed_transformed' || t.status === 'passed_retained');
    }

    case 'MINIMUM_EVIDENCE': {
      const min = condition.minimumEvidence ?? condition.value ?? 1;
      return (state.decisions || []).length >= min;
    }

    case 'CONTEXT_EVIDENCE': {
      if (!condition.requiredContext) return false;
      const count = (state.psychology || []).filter((s) => s.context === condition.requiredContext).length;
      return compareValues(count, condition.operator, condition.value ?? 1);
    }

    default:
      return true;
  }
}

export function evaluateAllNarrativeConditions(
  conditions: NarrativeCondition[] | undefined,
  state: GameState
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((cond) => evaluateNarrativeCondition(cond, state));
}

/**
 * Derives a character's current expectation regarding the Hetman based on historical memory tags,
 * fear, trust, and past interactions.
 */
export function deriveCharacterExpectation(character: Character, state: GameState): string {
  const reputation = state.reputationTags || [];
  const charFear = character.fear ?? 0;
  const charTrust = character.trust ?? 0;

  if (charFear >= 8 || reputation.includes('Застосував силу проти повстанців')) {
    return 'Побоюється збройного диктату та очікує жорстких наказів.';
  }

  if (character.factionId === 'faction_communities' && reputation.includes('Заступився за громади')) {
    return 'Розраховує на збереження міських субсидій та шкільних прав.';
  }

  if (character.factionId === 'faction_old_sich') {
    if (reputation.includes('Обмежив Стару Січ') || reputation.includes('Встановив столичний нагляд')) {
      return 'Підозрює намір остаточно знищити давні козацькі клейноди.';
    }
    if (reputation.includes('Уклав інституційний Соборний Пакт')) {
      return 'Очікує дотримання Соборного Пакту та поваги до Палати Отаманів.';
    }
    return 'Пильно охороняє непорушність звичаєвого права Хортиці.';
  }

  if (character.factionId === 'faction_military_command') {
    if (reputation.includes('Спирався на зброю генералітету')) {
      return 'Впевнений у пріоритеті військових потреб над цивільними.';
    }
    if (reputation.includes('Провів реформу попри опір')) {
      return 'Очікує практичного завершення політехнічної модернізації.';
    }
    return 'Очікує вчасної виплати платні та зміцнення кордонів.';
  }

  if (character.factionId === 'faction_landed_aristocracy') {
    if (reputation.includes('Уклав пакт із землевласниками')) {
      return 'Сподівається на захист великих маєтків та стабільний збут хліба.';
    }
    if (reputation.includes('Оподаткував маєтки магнатів')) {
      return 'Затаїв опір проти фіскального визиску шляхти.';
    }
    return 'Вимагає захисту приватної власності та судових прав шляхти.';
  }

  if (charTrust >= 10) {
    return 'Покладається на непорушність гетьманського слова.';
  }

  return 'Очікує рішень Ради, що визначать долю держави.';
}

/**
 * Data-Driven Scenario Adaptation:
 * Checks active narrative pressures and alters the scenario context, speaker quotes,
 * available choices, and dilemma depth dynamically to reflect what the Hetman has become.
 */
export function adaptScenarioToRuler(originalScenario: Scenario, state: GameState): Scenario {
  if (!originalScenario.narrativePressures || originalScenario.narrativePressures.length === 0) {
    return originalScenario;
  }

  let adapted: Scenario = {
    ...originalScenario,
    choices: [...originalScenario.choices],
  };

  const activeEchoes: string[] = [];
  const blockedIds: string[] = [];
  const additionalChoicesToAdd: Choice[] = [];

  for (const pressure of originalScenario.narrativePressures) {
    if (evaluateNarrativeCondition(pressure.condition, state)) {
      activeEchoes.push(pressure.impactDescription);

      // Modify speaker quote if specified
      if (pressure.speakerModifier?.speakerQuote) {
        adapted.speakerQuote = pressure.speakerModifier.speakerQuote;
      }

      // Collect blocked choices
      if (pressure.blockedChoiceIds) {
        blockedIds.push(...pressure.blockedChoiceIds);
      }

      // Collect pressure-specific dilemma choices
      if (pressure.additionalChoices) {
        for (const ac of pressure.additionalChoices) {
          if (!additionalChoicesToAdd.some((c) => c.id === ac.id) && !adapted.choices.some((c) => c.id === ac.id)) {
            additionalChoicesToAdd.push(ac);
          }
        }
      }

      // Apply altered political reactions
      if (pressure.alteredReactions) {
        adapted.choices = adapted.choices.map((c) => {
          const altered = pressure.alteredReactions?.[c.id];
          if (altered && c.politicalReactions) {
            return {
              ...c,
              politicalReactions: c.politicalReactions.map((pr) =>
                pr.factionId === Object.keys(pressure.alteredReactions || {})[0]
                  ? { ...pr, reaction: altered.reaction, note: altered.note }
                  : pr
              ),
            };
          }
          return c;
        });
      }
    }
  }

  // Filter blocked choices
  if (blockedIds.length > 0) {
    adapted.choices = adapted.choices.filter((c) => !blockedIds.includes(c.id));
  }

  // Append dilemma choices
  if (additionalChoicesToAdd.length > 0) {
    adapted.choices = [...adapted.choices, ...additionalChoicesToAdd];
  }

  // Add narrative echo banner if any pressure is active
  if (activeEchoes.length > 0) {
    adapted.narrativeEcho = activeEchoes.join(' ');
  }

  return adapted;
}

/**
 * Checks if a Narrative Mirror should be shown to the ruler.
 * Typically evaluated when entering a pivotal year (such as 1850) or resolving a major threshold.
 */
export function checkAndTriggerNarrativeMirrors(
  state: GameState
): { mirror: NarrativeMirror | null; state: GameState } {
  const currentMirrors = state.narrativeMirrors || [];
  const eligibleMirrors = NARRATIVE_MIRRORS_CATALOG.filter((m) => {
    if (currentMirrors.some((cm) => cm.id === m.id)) return false;
    if (m.year > state.identity.year) return false;
    return evaluateNarrativeCondition(m.condition, state);
  });

  if (eligibleMirrors.length === 0) {
    return { mirror: null, state };
  }

  const selected = { ...eligibleMirrors[0], shown: true };
  const updatedMirrors = [...currentMirrors, selected];

  const mirrorEvent: ImperialEvent = {
    id: 'evt_mirror_' + selected.id,
    year: state.identity.year,
    title: `Дзеркало Володаря: «${selected.title}»`,
    description: `${selected.text}\n\n[Усвідомлення]: ${selected.reflectionPrompt || 'Світ віддзеркалює твій власний вибір.'}`,
    source: 'Внутрішнє Дзеркало Правління',
    timestamp: Date.now(),
    consequencesSummary: [
      `Світ зафіксував вектор правління: «${selected.title}»`,
      `Персонажі та воєводства будують стосунки з огляду на минулий досвід`,
    ],
  };

  const updatedHistory = [
    {
      id: 'hist_mirror_' + Date.now(),
      year: state.identity.year,
      timestamp: Date.now(),
      type: 'REFORM' as const,
      title: `Наративне Дзеркало: ${selected.title}`,
      description: selected.text,
      importance: 'major' as const,
      tags: ['дзеркало', 'сходження', `${state.identity.year}`],
      category: 'decision' as const,
    },
    ...state.history,
  ];

  const nextState: GameState = {
    ...state,
    narrativeMirrors: updatedMirrors,
    eventQueue: [...(state.eventQueue || []), mirrorEvent],
    history: updatedHistory,
  };

  return { mirror: selected, state: nextState };
}

/**
 * Automatically extracts or derives Memory Tags and Historical Reputation Signals
 * from a player's decision, persisting them to GameState.memoryTags, GameState.reputationTags,
 * GameState.reputationSignals, and immediately updating character attitudes, memoryTags, and expectations.
 */
export function deriveAutomaticMemoryTags(scenario: Scenario, choice: Choice): string[] {
  const tags: string[] = [];

  // Check consequences
  for (const c of choice.consequences || []) {
    if (c.type === 'STATE_CHANGE' || c.type === 'ECONOMY_METRIC_CHANGE') {
      if (c.metric === 'militaryStrength' && (c.value || 0) >= 4) {
        tags.push('Спирався на зброю генералітету');
      }
      if (c.metric === 'treasury' && (c.value || 0) <= -10) {
        tags.push('Відкрив скарбницю для великих видатків');
      }
      if (c.metric === 'treasury' && (c.value || 0) >= 8) {
        tags.push('Зберіг скарбницю');
      }
    }
    if (c.type === 'TAX_POLICY_CHANGE') {
      if (c.policy === 'high' || (c.burdenChange && c.burdenChange > 0)) {
        tags.push('Посилив фіскальний тягар');
      }
      if (c.policy === 'low' || (c.burdenChange && c.burdenChange < 0)) {
        tags.push('Полегшив податковий тиск');
      }
    }
    if (c.type === 'TENSION') {
      if (c.key === 'tension_freedom_order' && c.value >= 10) {
        tags.push('Встановив столичний нагляд');
      }
      if (c.key === 'tension_might_prosperity' && c.value >= 10) {
        tags.push('Спирався на зброю генералітету');
      }
      if (c.key === 'tension_autonomy_centralization' && c.value >= 10) {
        tags.push('Централізував управління');
      }
    }
    if (c.type === 'FACTION_CHANGE') {
      if (c.factionId === 'faction_communities' && (c.loyaltyChange || 0) >= 12) {
        tags.push('Заступився за громади');
      }
      if (c.factionId === 'faction_old_sich' && (c.loyaltyChange || 0) <= -12) {
        tags.push('Обмежив Стару Січ');
      }
      if (c.factionId === 'faction_old_sich' && (c.loyaltyChange || 0) >= 18) {
        tags.push('Підтвердив автономію Хортиці');
      }
    }
  }

  // Check psychological signals
  for (const s of choice.psychologicalSignals || []) {
    if (s.dimension === 'ORDER' && s.value >= 2) {
      tags.push('Встановив залізну дисципліну');
    }
    if (s.dimension === 'POWER' && s.value >= 2) {
      tags.push('Продемонстрував гетьманську міць');
    }
    if (s.dimension === 'FREEDOM' && s.value >= 2) {
      tags.push('Захистив козацькі вольності');
    }
  }

  // Fallback for major or critical scenarios
  if (tags.length === 0 && (scenario.importance === 'critical' || scenario.importance === 'major')) {
    if (choice.text.includes('військ') || choice.text.includes('армі') || choice.text.includes('генерал')) {
      tags.push('Спирався на зброю генералітету');
    } else if (choice.text.includes('громад') || choice.text.includes('міщ')) {
      tags.push('Заступився за громади');
    } else if (choice.text.includes('автоном')) {
      tags.push('Захистив автономію воєводств');
    } else if (choice.text.includes('подат') || choice.text.includes('скарб')) {
      tags.push('Здійснив фіскальне регулювання');
    }
  }

  return Array.from(new Set(tags));
}

export function deriveReputationCategory(label: string, choice?: Choice): ReputationCategory {
  const lower = label.toLowerCase();
  if (lower.includes('збро') || lower.includes('генерал') || lower.includes('військ') || lower.includes('оборон') || lower.includes('полк') || lower.includes('рубеж')) {
    return 'military';
  }
  if (lower.includes('громад') || lower.includes('просвіт') || lower.includes('міщан') || lower.includes('шкіл') || lower.includes('цех')) {
    return 'civic';
  }
  if (lower.includes('січ') || lower.includes('хортиц') || lower.includes('отаман') || lower.includes('вольност') || lower.includes('клейнод')) {
    return 'tradition';
  }
  if (lower.includes('скарбниц') || lower.includes('подат') || lower.includes('мит') || lower.includes('фіскал') || lower.includes('маєтк') || lower.includes('порт') || lower.includes('кредит') || lower.includes('залізниц') || lower.includes('комерц')) {
    return 'economic';
  }
  if (lower.includes('нагляд') || lower.includes('вертикал') || lower.includes('диктат') || lower.includes('дисциплін') || lower.includes('центр') || lower.includes('контрол')) {
    return 'authority';
  }
  if (lower.includes('пакт') || lower.includes('обітниц') || lower.includes('чест') || lower.includes('слово') || lower.includes('клятв')) {
    return 'character';
  }
  return 'diplomacy';
}

export function deriveAffectedFactions(choice: Choice, scenario: Scenario): string[] {
  const factions: string[] = [];
  if (choice.politicalReactions) {
    for (const pr of choice.politicalReactions) {
      factions.push(pr.factionId);
    }
  }
  if (choice.consequences) {
    for (const c of choice.consequences) {
      if (c.type === 'FACTION_CHANGE' && c.factionId) {
        factions.push(c.factionId);
      }
    }
  }
  if (choice.politicalCost?.politicalCost) {
    for (const fid of Object.keys(choice.politicalCost.politicalCost)) {
      factions.push(fid);
    }
  }
  return Array.from(new Set(factions));
}

export function calculateReputationAttitudeDeltas(category: ReputationCategory, choice: Choice) {
  switch (category) {
    case 'military':
      return { trustDelta: 2, respectDelta: 3, fearDelta: 3, loyaltyDelta: 1 };
    case 'civic':
      return { trustDelta: 4, respectDelta: 2, fearDelta: -2, loyaltyDelta: 3 };
    case 'authority':
      return { trustDelta: -1, respectDelta: 4, fearDelta: 5, loyaltyDelta: 0 };
    case 'tradition':
      return { trustDelta: 3, respectDelta: 3, fearDelta: 0, loyaltyDelta: 4 };
    case 'economic':
      return { trustDelta: 2, respectDelta: 2, fearDelta: 1, loyaltyDelta: 1 };
    case 'character':
      return { trustDelta: 6, respectDelta: 5, fearDelta: -1, loyaltyDelta: 5 };
    default:
      return { trustDelta: 1, respectDelta: 1, fearDelta: 0, loyaltyDelta: 1 };
  }
}

export function generateNarrativeEcho(label: string, category: ReputationCategory, scenario: Scenario): string {
  switch (category) {
    case 'military':
      return `Держава пам'ятає мілітарний курс: ухвалено «${label}». Військовий кулак зміцнів, проте цивільні стани побоюються росту витрат.`;
    case 'civic':
      return `Громади пам'ятають підтримку володаря: ухвалено «${label}». Довіра міщан зростає.`;
    case 'authority':
      return `Столична вертикаль дала відчути свій авторитет: «${label}». Персонажі зважають на непохитну волю Гетьмана.`;
    case 'tradition':
      return `Хортиця закарбувала ваше ставлення до козацького звичаю: «${label}».`;
    case 'economic':
      return `Скарбниця та торговельні доми адаптуються до фіскального курсу: «${label}».`;
    default:
      return `Історія зафіксувала суверенний вибір: «${label}».`;
  }
}

export function generateReputationSignal(
  tag: MemoryTag,
  scenario: Scenario,
  choice: Choice,
  state: GameState
): HistoricalReputationSignal {
  let perceivedBy = 'Загал держави та Рада Старшини';
  let sentiment: HistoricalReputationSignal['sentiment'] = 'positive';
  let summaryQuote = `«У Раді пам'ятають: Гетьман ухвалив кардинальне рішення — «${tag.label}».»`;
  let proposalImpact = `Цей вчинок змінює майбутні пропозиції станів: персонажі зважатимуть на рішучість володаря.`;

  switch (tag.category) {
    case 'military':
      perceivedBy = 'Генералітет та Офіцерський Корпус';
      sentiment = 'reverent';
      summaryQuote = `«Полки знають: воля Гетьмана спирається на силу зброї та надійність рубежів.»`;
      proposalImpact = `Військові стани сміливіше пропонуватимуть оборонні ініціативи, очікуючи схвалення з боку центру.`;
      break;
    case 'civic':
      perceivedBy = 'Міські Громади та Просвітники';
      sentiment = 'positive';
      summaryQuote = `«Міщани та цехові майстри вдячні Гетьману за захист самоврядування і прав.»`;
      proposalImpact = `Громади охочіше підтримуватимуть цивільні проєкти та реформи освіти й податків.`;
      break;
    case 'authority':
      perceivedBy = 'Воєводська Шляхта та Отамани';
      sentiment = 'wary';
      summaryQuote = `«Рада пам'ятає важку руку столиці: накази з кабінетів не терплять непослуху.»`;
      proposalImpact = `Персонажі остерігатимуться відкритого саботажу, проте опозиційні фракції шукатимуть прихованого спротиву.`;
      break;
    case 'tradition':
      perceivedBy = 'Низове Військо Хортиці';
      sentiment = tag.label.includes('Обмежив') ? 'wary' : 'reverent';
      summaryQuote = tag.label.includes('Обмежив')
        ? `«Стара Січ пам'ятає утиск вольностей і ревниво береже залишки звичаєвого права.»`
        : `«Низове козацтво шанує володаря, що зберіг давні клейноди та батьківські звичаї.»`;
      proposalImpact = `Визначає формат майбутніх криз на Запоріжжі: отамани звертатимуться до прецеденту цієї ухвали.`;
      break;
    case 'economic':
      perceivedBy = 'Купецькі Гільдії та Скарбнича Палата';
      sentiment = 'positive';
      summaryQuote = `«Торговельні доми та підскарбії ведуть розрахунки, знаючи фіскальний напрям правління.»`;
      proposalImpact = `Купці розраховують на передбачуваність мит або вимагатимуть спеціальних привілеїв.`;
      break;
    case 'character':
      perceivedBy = 'Усі Стани Імперії Січ';
      sentiment = 'reverent';
      summaryQuote = `«Слово Гетьмана — твердіше за сталь. Довіра до верховного суверена зростає.»`;
      proposalImpact = `Підвищує вагу обіцянок перед станами та зменшує політичний капітал, необхідний для ухвалення реформ.`;
      break;
  }

  return {
    id: `sig_${Date.now()}_${tag.id}`,
    tagId: tag.id,
    tagLabel: tag.label,
    category: tag.category,
    year: tag.year,
    sourceDecisionTitle: scenario.title,
    perceivedBy,
    sentiment,
    summaryQuote,
    proposalImpact,
  };
}

/**
 * Records Memory Tags and Historical Reputation Signals from a key player decision,
 * modifying character attitudes, updating character expectations, and altering future proposals.
 */
export function recordDecisionMemoryTags(
  state: GameState,
  scenario: Scenario,
  choice: Choice,
  decisionId: string
): GameState {
  const currentRepTags = state.reputationTags ? [...state.reputationTags] : [];
  const currentMemTags = state.memoryTags ? [...state.memoryTags] : [];
  const currentSignals = state.reputationSignals ? [...state.reputationSignals] : [];
  let updatedCharacters = [...state.characters];

  // 1. Gather tag labels from explicit choice.memoryTags or derive automatically
  const rawLabels: string[] = [];
  if (choice.memoryTags && choice.memoryTags.length > 0) {
    rawLabels.push(...choice.memoryTags);
  }

  // 2. Automatic semantic derivation
  const autoTags = deriveAutomaticMemoryTags(scenario, choice);
  for (const at of autoTags) {
    if (!rawLabels.includes(at)) {
      rawLabels.push(at);
    }
  }

  if (rawLabels.length === 0) {
    return state;
  }

  const year = state.identity.year;
  const newMemoryTags: MemoryTag[] = [];
  const newSignals: HistoricalReputationSignal[] = [];

  for (const label of rawLabels) {
    // If not already in legacy reputationTags, add it
    if (!currentRepTags.includes(label)) {
      currentRepTags.push(label);
    }

    // Check if structured memoryTag for this decision already exists
    const existing = currentMemTags.find((m) => m.label === label && m.decisionId === decisionId);
    if (existing) continue;

    const category = deriveReputationCategory(label, choice);
    const significance =
      scenario.importance === 'critical' ? 'epochal' : scenario.importance === 'major' ? 'major' : 'standard';

    const affectedFactionIds = deriveAffectedFactions(choice, scenario);
    const affectedCharacterIds = scenario.characters || [];
    const attitudeDeltas = calculateReputationAttitudeDeltas(category, choice);

    const memTag: MemoryTag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label,
      category,
      year,
      decisionId,
      scenarioId: scenario.id,
      choiceId: choice.id,
      significance,
      affectedFactionIds,
      affectedCharacterIds,
      characterAttitudeDeltas: attitudeDeltas,
      narrativeEcho: generateNarrativeEcho(label, category, scenario),
    };

    newMemoryTags.push(memTag);
    currentMemTags.push(memTag);

    const signal = generateReputationSignal(memTag, scenario, choice, state);
    newSignals.push(signal);
    currentSignals.push(signal);

    // Apply attitude deltas and memory tags to characters
    updatedCharacters = updatedCharacters.map((c) => {
      const isAffected =
        affectedCharacterIds.includes(c.id) ||
        Boolean(c.factionId && affectedFactionIds.includes(c.factionId)) ||
        c.id === scenario.speakerId;

      if (!isAffected) {
        return c;
      }

      const charMemories = c.memoryTags ? [...c.memoryTags] : [];
      if (!charMemories.includes(label)) {
        charMemories.push(label);
      }

      let trustDelta = attitudeDeltas.trustDelta || 0;
      let respectDelta = attitudeDeltas.respectDelta || 0;
      let fearDelta = attitudeDeltas.fearDelta || 0;
      let loyaltyDelta = attitudeDeltas.loyaltyDelta || 0;

      if (category === 'military') {
        if (c.factionId === 'faction_military_command') {
          trustDelta += 3;
          respectDelta += 3;
        } else if (c.factionId === 'faction_communities') {
          fearDelta += 3;
          trustDelta -= 2;
        }
      } else if (category === 'civic') {
        if (c.factionId === 'faction_communities') {
          trustDelta += 4;
          loyaltyDelta += 3;
        }
      } else if (category === 'tradition') {
        if (c.factionId === 'faction_old_sich') {
          if (label.includes('Обмежив') || label.includes('нагляд')) {
            trustDelta -= 5;
            fearDelta += 4;
          } else {
            trustDelta += 4;
            loyaltyDelta += 4;
          }
        }
      }

      return {
        ...c,
        trust: Math.max(0, Math.min(100, (c.trust ?? 0) + trustDelta)),
        respect: Math.max(0, Math.min(100, (c.respect ?? 0) + respectDelta)),
        fear: Math.max(0, Math.min(100, (c.fear ?? 0) + fearDelta)),
        loyalty: Math.max(0, Math.min(100, (c.loyalty ?? 0) + loyaltyDelta)),
        memoryTags: charMemories,
      };
    });
  }

  const intermediateState: GameState = {
    ...state,
    reputationTags: currentRepTags,
    memoryTags: currentMemTags,
    reputationSignals: currentSignals,
  };

  updatedCharacters = updatedCharacters.map((c) => ({
    ...c,
    expectation: deriveCharacterExpectation(c, intermediateState),
  }));

  return {
    ...intermediateState,
    characters: updatedCharacters,
  };
}
