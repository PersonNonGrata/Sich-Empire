import { GameState } from '../state/types.ts';
import { allScenarios, getScenarioById } from '../scenarios/registry.ts';
import { evaluateAllConditions } from '../conditions/evaluator.ts';
import { applyConsequences } from '../consequences/applier.ts';
import { Consequence, ScheduledConsequence } from '../consequences/types.ts';
import { DecisionRecord, ImperialEvent } from '../../types/index.ts';
import { evaluateArchetypeProfile } from '../archetypes/evaluator.ts';
import {
  detectPoliticalCrises,
  evaluatePromises,
  calculateLegitimacy,
  recalculatePoliticalCapital,
} from '../politics/evaluator.ts';
import { PoliticalCrisis } from '../politics/types.ts';
import { advanceEconomicYear } from '../economy/economyEngine.ts';

export interface ChoiceExecutionResult {
  state: GameState;
  logs: string[];
  resolvedScheduledEvents: ScheduledConsequence[];
  newEvents?: ImperialEvent[];
}


/**
 * Determines which scenarios are eligible given the current empire state.
 */
export function determineAvailableScenarios(state: GameState): string[] {
  return allScenarios
    .filter((scenario) => {
      // Cannot repeat completed scenarios
      if (state.completedScenarioIds.includes(scenario.id)) {
        return false;
      }

      // Explicitly locked
      if (state.lockedScenarioIds.includes(scenario.id)) {
        return false;
      }

      // Explicitly unlocked ignores conditions, or check conditions
      const isExplicitlyUnlocked = state.unlockedScenarioIds.includes(scenario.id);
      if (isExplicitlyUnlocked) {
        return true;
      }

      // Evaluate conditions
      return evaluateAllConditions(scenario.conditions, state);
    })
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .map((s) => s.id);
}

/**
 * Resolves pending scheduled consequences for the current year.
 */
export function checkAndResolveScheduledConsequences(
  currentState: GameState
): { state: GameState; resolved: ScheduledConsequence[]; logs: string[]; newEvents: ImperialEvent[] } {
  let state = { ...currentState };
  const resolvedList: ScheduledConsequence[] = [];
  const logs: string[] = [];
  const newEvents: ImperialEvent[] = [];

  const rawConsequences = state.consequences || [];
  const updatedConsequences = rawConsequences.map((sc) => {
    if (sc.resolved) return sc;

    if (sc.triggerYear <= state.identity.year) {
      // Check conditions
      const conditionsMet = sc.conditions ? evaluateAllConditions(sc.conditions, state) : true;
      if (conditionsMet) {
        // Apply consequences
        const appResult = applyConsequences(sc.consequences, state, {
          sourceDecisionId: sc.sourceDecisionId,
          scenarioId: sc.sourceScenarioId,
          scenarioTitle: sc.sourceScenarioTitle,
        });

        state = appResult.state;
        logs.push(`ВІДКЛАДЕНИЙ НАСЛІДОК СТАВСЯ (${sc.triggerYear} р.): «${sc.title}»`);
        logs.push(...appResult.logs);

        // Add history chronicle entry about the delayed consequence coming due
        const resolvedHistoryId = 'hist_res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const resolvedDescription = sc.sourceYear
          ? `${sc.description} (Подія є прямим відлунням вашого рішення у ${sc.sourceYear} році: «${sc.sourceScenarioTitle || 'Попередній Універсал'}»).`
          : sc.description;

        state = {
          ...state,
          history: [
            {
              id: resolvedHistoryId,
              year: state.identity.year,
              timestamp: Date.now(),
              type: 'CONSEQUENCE_TRIGGERED',
              title: `Відгомін минулих рішень: ${sc.title}`,
              description: resolvedDescription,
              sourceDecisionId: sc.sourceDecisionId,
              importance: 'major',
              tags: ['відкладений_наслідок', 'історія', `${sc.triggerYear}`],
            },
            ...state.history,
          ],
        };

        const resolvedItem = {
          ...sc,
          resolved: true,
          resolvedYear: state.identity.year,
          resolutionNote: resolvedDescription,
        };
        resolvedList.push(resolvedItem);

        // Queue imperial event reveal
        const eventId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const imperialEvt: ImperialEvent = {
          id: eventId,
          year: state.identity.year,
          title: sc.title,
          description: sc.description,
          source: sc.sourceYear ? `Наслідок рішення ${sc.sourceYear} року («${sc.sourceScenarioTitle || 'Рада'}»)` : 'Державний наслідок',
          relatedDecisionId: sc.sourceDecisionId,
          relatedScenarioId: sc.sourceScenarioId,
          consequencesSummary: appResult.logs,
          timestamp: Date.now(),
        };
        newEvents.push(imperialEvt);

        return resolvedItem;
      }
    }

    return sc;
  });

  const updatedQueue = [...(state.eventQueue || []), ...newEvents];

  state = {
    ...state,
    consequences: updatedConsequences,
    scheduledConsequences: updatedConsequences,
    eventQueue: updatedQueue,
    availableScenarioIds: determineAvailableScenarios(state),
    archetypeProfile: evaluateArchetypeProfile(state),
  };

  return { state, resolved: resolvedList, logs, newEvents };
}

/**
 * Executes a choice inside an active scenario.
 */
export function executeChoice(
  currentState: GameState,
  scenarioId: string,
  choiceId: string
): ChoiceExecutionResult {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }

  const choice = scenario.choices.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Choice not found: ${choiceId} in scenario ${scenarioId}`);
  }

  const decisionId = 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // Build full consequences list from choice attributes
  const allConsequences: Consequence[] = [...choice.consequences];

  // Psychological signals
  if (choice.psychologicalSignals) {
    for (const sig of choice.psychologicalSignals) {
      allConsequences.push({
        type: 'PSYCHOLOGICAL_SIGNAL',
        dimension: sig.dimension,
        value: sig.value,
        contextNote: sig.contextNote,
      });
    }
  }

  // Relationship changes
  if (choice.relationshipChanges) {
    for (const rel of choice.relationshipChanges) {
      allConsequences.push({
        type: 'RELATIONSHIP_CHANGE',
        characterId: rel.characterId,
        value: rel.delta,
        label: rel.label,
      });
    }
  }

  // History event
  if (choice.historyEvent) {
    allConsequences.push({
      type: 'ADD_HISTORY_EVENT',
      eventType: choice.historyEvent.type,
      title: choice.historyEvent.title,
      description: choice.historyEvent.description,
      importance: choice.historyEvent.importance,
      tags: choice.historyEvent.tags,
    });
  }

  // Scheduled consequences
  if (choice.scheduledConsequences) {
    for (const sc of choice.scheduledConsequences) {
      allConsequences.push({
        type: 'SCHEDULE_CONSEQUENCE',
        consequenceData: {
          triggerYear: sc.triggerYear,
          title: sc.title,
          description: sc.description,
          conditions: sc.conditions,
          consequences: sc.consequences,
          sourceScenarioId: scenarioId,
          sourceScenarioTitle: scenario.title,
          sourceYear: currentState.identity.year,
        },
      });
    }
  }

  // Unlocks & locks
  if (choice.unlocks) {
    for (const uid of choice.unlocks) {
      allConsequences.push({ type: 'UNLOCK_SCENARIO', scenarioId: uid });
    }
  }
  if (choice.locks) {
    for (const lid of choice.locks) {
      allConsequences.push({ type: 'LOCK_SCENARIO', scenarioId: lid });
    }
  }

  // Apply consequences immutably
  const { state: updatedState, logs } = applyConsequences(allConsequences, currentState, {
    sourceDecisionId: decisionId,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    choiceText: choice.text,
  });

  // Extract involved actors, regions, factions for Empire Memory
  const actorsInvolved = Array.from(new Set([
    ...(scenario.characters || []),
    ...(scenario.speakerId ? [scenario.speakerId] : []),
  ]));
  const factionsInvolved = Array.from(new Set(
    actorsInvolved
      .map((aid) => updatedState.characters.find((c) => c.id === aid)?.factionId)
      .filter((fid): fid is string => Boolean(fid))
  ));

  // Check for newly triggered political crises
  const newCrises = detectPoliticalCrises(updatedState, updatedState.crises || []);
  const crisisEvents: ImperialEvent[] = [];
  let postCrisisState = { ...updatedState };

  for (const crisis of newCrises) {
    postCrisisState.crises = [...(postCrisisState.crises || []), crisis];
    if (crisis.unlockScenarioId && !postCrisisState.unlockedScenarioIds.includes(crisis.unlockScenarioId)) {
      postCrisisState.unlockedScenarioIds = [...postCrisisState.unlockedScenarioIds, crisis.unlockScenarioId];
    }
    const evtId = 'evt_crisis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    crisisEvents.push({
      id: evtId,
      year: postCrisisState.identity.year,
      title: crisis.title,
      description: crisis.description,
      source: 'Політична криза',
      relatedDecisionId: decisionId,
      relatedScenarioId: scenarioId,
      timestamp: Date.now(),
    });
    // Add history record for crisis
    postCrisisState.history = [
      {
        id: 'hist_crisis_' + Date.now(),
        year: postCrisisState.identity.year,
        timestamp: Date.now(),
        type: 'CRISIS_TRIGGERED',
        title: crisis.title,
        description: `${crisis.description} (Прямий наслідок ухвали: «${choice.text}»).`,
        sourceDecisionId: decisionId,
        scenarioId,
        importance: 'critical',
        tags: ['політична_криза', crisis.id],
        category: 'crisis',
        causalRootDecisionId: decisionId,
        causalChainNote: `Рішення «${scenario.title}» → ${crisis.title}`,
      },
      ...postCrisisState.history,
    ];
    logs.push(`УВАГА! СПАЛАХНУЛА ПОЛІТИЧНА КРИЗА: ${crisis.title}!`);
  }

  // Recalculate legitimacy and political capital
  const legResult = calculateLegitimacy(postCrisisState);
  postCrisisState.legitimacy = legResult.components;
  postCrisisState.politicalCapital = recalculatePoliticalCapital(
    postCrisisState.politicalCapital ?? 55,
    choice.id.includes('refuse') ? -2 : 3,
    legResult.aggregate
  );

  const decisionRecord: DecisionRecord = {
    id: decisionId,
    scenarioId,
    choiceId,
    year: currentState.identity.year,
    timestamp: Date.now(),
    choiceText: choice.text,
    title: scenario.title,
    summary: `${scenario.title}: ${choice.text}`,
    actors: actorsInvolved,
    regions: scenario.location ? [scenario.location] : [],
    factions: factionsInvolved,
    stateEffects: logs,
    psychologicalSignals: (choice.psychologicalSignals || []).map((s) => `${s.dimension} +${s.value}`),
    importance: scenario.importance,
    tags: scenario.tags || [],
    causedEventIds: newCrises.map((c) => c.id),
  };

  // Complete scenario and record decision
  let finalState: GameState = {
    ...postCrisisState,
    decisions: [decisionRecord, ...postCrisisState.decisions],
    completedScenarioIds: [...postCrisisState.completedScenarioIds, scenarioId],
    currentScenarioId: null, // Scenario closed
    eventQueue: [...(postCrisisState.eventQueue || []), ...crisisEvents],
  };

  // Re-evaluate available scenarios
  finalState = {
    ...finalState,
    availableScenarioIds: determineAvailableScenarios(finalState),
    archetypeProfile: evaluateArchetypeProfile(finalState),
  };

  // Check if any scheduled consequences can fire
  const scheduledResult = checkAndResolveScheduledConsequences(finalState);
  finalState = scheduledResult.state;
  const allLogs = [...logs, ...scheduledResult.logs];

  return {
    state: finalState,
    logs: allLogs,
    resolvedScheduledEvents: scheduledResult.resolved,
    newEvents: [...crisisEvents, ...scheduledResult.newEvents],
  };
}

/**
 * Advances imperial year by delta and triggers any due consequences.
 */
export function advanceTime(
  currentState: GameState,
  years = 1
): { state: GameState; logs: string[]; resolved: ScheduledConsequence[]; newEvents: ImperialEvent[] } {
  const nextYear = currentState.identity.year + years;
  let state: GameState = {
    ...currentState,
    identity: {
      ...currentState.identity,
      year: nextYear,
    },
  };

  const advanceLogs: string[] = [`Рік переведено на ${nextYear}`];
  const newEvents: ImperialEvent[] = [];

  // Check promises (Requirement 12)
  const promiseEvaluation = evaluatePromises(state.promises || [], nextYear, state);
  state.promises = promiseEvaluation.updatedPromises;

  for (const broken of promiseEvaluation.brokenList) {
    advanceLogs.push(`ОБІЦЯНКУ ГЕТЬМАНА ПОРУШЕНО: «${broken.text}»! Втрата довіри та капіталу.`);
    // Reduce loyalty of target faction
    state.factions = state.factions.map((f) =>
      f.id === broken.targetFaction || f.name === broken.targetFaction
        ? { ...f, loyalty: Math.max(0, f.loyalty - 15), tension: Math.min(100, (f.tension ?? 25) + 15) }
        : f
    );
    // Reduce political capital
    state.politicalCapital = Math.max(0, (state.politicalCapital ?? 55) - 12);
    // Add to history
    state.history = [
      {
        id: 'hist_broken_' + Date.now() + '_' + broken.id,
        year: nextYear,
        timestamp: Date.now(),
        type: 'PROMISE_BROKEN',
        title: `Порушена обіцянка: «${broken.text}»`,
        description: `Минув призначений термін (${broken.deadlineYear} р.), але обіцяне перед фракцією «${broken.targetFaction}» не було виконано. Політичний капітал та довіра зазнали удару.`,
        importance: 'major',
        tags: ['обіцянка_порушена', broken.targetFaction],
        category: 'promise',
        causalChainNote: `Обіцянка ${broken.year} р. → Невиконання до ${broken.deadlineYear} р. → Втрата довіри`,
      },
      ...state.history,
    ];
    // Queue Imperial Event
    newEvents.push({
      id: 'evt_broken_' + broken.id,
      year: nextYear,
      title: 'Порушена обітниця Гетьмана',
      description: `Термін виконання обіцянки перед фракцією «${broken.targetFaction}» вичерпано. Рада засуджує зволікання.`,
      source: 'Обітниця перед Радою',
      timestamp: Date.now(),
    });
  }

  for (const fulfilled of promiseEvaluation.fulfilledList) {
    advanceLogs.push(`Обітницю Гетьмана виконано: «${fulfilled.text}»!`);
    state.politicalCapital = Math.min(100, (state.politicalCapital ?? 55) + 8);
    state.history = [
      {
        id: 'hist_fulfilled_' + Date.now() + '_' + fulfilled.id,
        year: nextYear,
        timestamp: Date.now(),
        type: 'PROMISE_FULFILLED',
        title: `Виконана обіцянка: «${fulfilled.text}»`,
        description: `Слово Гетьмана — твердіше за сталь. Обітниця перед фракцією «${fulfilled.targetFaction}» з честю дотримана.`,
        importance: 'major',
        tags: ['обіцянка_виконана', fulfilled.targetFaction],
        category: 'promise',
      },
      ...state.history,
    ];
  }

  // Check for crisis triggers at new year
  const crisesDetected = detectPoliticalCrises(state, state.crises || []);
  for (const crisis of crisesDetected) {
    state.crises = [...(state.crises || []), crisis];
    if (crisis.unlockScenarioId && !state.unlockedScenarioIds.includes(crisis.unlockScenarioId)) {
      state.unlockedScenarioIds = [...state.unlockedScenarioIds, crisis.unlockScenarioId];
    }
    advanceLogs.push(`ПОЛІТИЧНА КРИЗА: ${crisis.title}`);
    newEvents.push({
      id: 'evt_crisis_' + crisis.id,
      year: nextYear,
      title: crisis.title,
      description: crisis.description,
      source: 'Державна криза',
      timestamp: Date.now(),
    });
  }

  // Natural state drift / annual chronicle note
  const advanceHistoryId = 'hist_year_' + Date.now();
  state = {
    ...state,
    history: [
      {
        id: advanceHistoryId,
        year: nextYear,
        timestamp: Date.now(),
        type: 'DYNASTIC_EVENT',
        title: `Рік ${nextYear} від Різдва Христового`,
        description: `Сплинув рік правління Гетьмана ${state.identity.rulerName}. Держава вступає у новий політичний сезон.`,
        importance: 'minor',
        tags: ['час', 'рік', `${nextYear}`],
        category: 'all',
      },
      ...state.history,
    ],
  };

  // Recalculate legitimacy
  const leg = calculateLegitimacy(state);
  state.legitimacy = leg.components;

  // Execute Stage 5 Annual Economic Cycle
  if (state.economy && state.military) {
    const ecoResult = advanceEconomicYear(state, years);
    state = ecoResult.state;
    advanceLogs.push(...ecoResult.logs);
  }

  const scheduledResult = checkAndResolveScheduledConsequences(state);
  state = scheduledResult.state;

  return {
    state,
    logs: [...advanceLogs, ...scheduledResult.logs],
    resolved: scheduledResult.resolved,
    newEvents: [...newEvents, ...scheduledResult.newEvents],
  };
}

