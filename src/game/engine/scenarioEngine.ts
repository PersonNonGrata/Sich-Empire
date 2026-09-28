import { GameState, EmpireMetrics, YearSummaryData } from '../state/types.ts';
import { allScenarios, getScenarioById } from '../scenarios/registry.ts';
import { Scenario } from '../scenarios/types.ts';
import { evaluateAllConditions } from '../conditions/evaluator.ts';
import { applyConsequences } from '../consequences/applier.ts';
import { Consequence, ScheduledConsequence } from '../consequences/types.ts';
import { DecisionRecord, ImperialEvent } from '../../types/index.ts';
import { evaluateArchetypeProfile } from '../archetypes/evaluator.ts';
import { evaluateAscension } from '../psychology/ascensionEngine.ts';
import {
  detectPoliticalCrises,
  evaluatePromises,
  calculateLegitimacy,
  recalculatePoliticalWill,
} from '../politics/evaluator.ts';
import { advanceEconomicYear } from '../economy/economyEngine.ts';
import {
  evaluateNarrativeCondition,
  evaluateAllNarrativeConditions,
  adaptScenarioToRuler,
  checkAndTriggerNarrativeMirrors,
  recordDecisionMemoryTags,
} from '../narrative/narrativeEngine.ts';

export interface ChoiceResolutionResult {
  state: GameState;
  logs: string[];
  previousMetrics: EmpireMetrics;
  newMetrics: EmpireMetrics;
  resolvedScheduledEvents: ScheduledConsequence[];
  newEvents?: ImperialEvent[];
  politicalReactionsSummary: Array<{ entity: string; reaction: string; note: string }>;
  isYearAgendaComplete: boolean;
  yearSummary?: YearSummaryData | null;
}

export interface ChoiceExecutionResult {
  state: GameState;
  logs: string[];
  resolvedScheduledEvents: ScheduledConsequence[];
  newEvents?: ImperialEvent[];
}

export interface YearAgenda {
  year: number;
  allScenarios: Scenario[];
  availableScenarios: Scenario[];
  completedScenarios: Scenario[];
  requiredScenarios: Scenario[];
  requiredPendingCount: number;
  isYearComplete: boolean;
}

/**
 * Recalculates derived state indicators across politics, economy, military and legitimacy.
 * Rule: Derived indicators must not be independent floating numbers.
 */
export function recalculateDerivedState(currentState: GameState): GameState {
  let state = { ...currentState };

  // 1. Sync & Recalculate Treasury
  const currentTreasury = state.economy?.treasury ?? state.empire.treasury;

  // 2. Military Readiness & Strength
  let militaryReadiness = state.military?.readiness ?? 70;
  if (state.military) {
    const equipFactor = (state.military.equipment - 50) * 0.1;
    const logisticsFactor = (state.military.logistics - 50) * 0.1;
    militaryReadiness = Math.max(10, Math.min(100, Math.round(militaryReadiness + equipFactor + logisticsFactor)));
  }
  const militaryStrength = state.military?.strength ?? state.empire.militaryStrength;

  // 3. Prosperity
  let publicProsperity = state.economy?.publicProsperity ?? state.empire.prosperity;
  if (state.economy) {
    const taxImpact =
      state.economy.taxBurden > 45
        ? -((state.economy.taxBurden - 45) * 0.2)
        : ((40 - state.economy.taxBurden) * 0.15);
    publicProsperity = Math.max(10, Math.min(100, Math.round(publicProsperity + taxImpact)));
  }

  // 4. Regional Unity
  const regionCount = state.regions.length;
  let avgRegionalLoyalty = 58;
  let avgRegionalUnrest = 20;
  if (regionCount > 0) {
    const totalLoyalty = state.regions.reduce((acc, r) => acc + (r.loyalty ?? 50), 0);
    const totalUnrest = state.regions.reduce((acc, r) => acc + (r.unrest ?? 20), 0);
    avgRegionalLoyalty = totalLoyalty / regionCount;
    avgRegionalUnrest = totalUnrest / regionCount;
  }
  const unity = Math.max(10, Math.min(100, Math.round(avgRegionalLoyalty * 0.7 + (100 - avgRegionalUnrest) * 0.3)));

  // 5. Political Stability
  const factionCount = state.factions.length;
  let avgFactionLoyalty = 55;
  if (factionCount > 0) {
    const totalFactionLoyalty = state.factions.reduce((acc, f) => acc + (f.loyalty ?? 50), 0);
    avgFactionLoyalty = totalFactionLoyalty / factionCount;
  }
  const activeCrisesCount = (state.crises || []).filter((c) => c.active).length;
  const crisisPenalty = activeCrisesCount * 8;
  const leg = calculateLegitimacy(state);
  const stability = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        avgFactionLoyalty * 0.35 +
        leg.aggregate * 0.35 +
        unity * 0.3 -
        crisisPenalty
      )
    )
  );

  // 6. Update empire metrics & sub-systems
  state = {
    ...state,
    empire: {
      ...state.empire,
      treasury: currentTreasury,
      militaryStrength,
      prosperity: publicProsperity,
      unity,
      stability,
    },
    economy: state.economy
      ? {
          ...state.economy,
          treasury: currentTreasury,
          publicProsperity,
        }
      : state.economy,
    military: state.military
      ? {
          ...state.military,
          readiness: militaryReadiness,
          strength: militaryStrength,
        }
      : state.military,
    legitimacy: leg.components,
    politicalWill: recalculatePoliticalWill(state.politicalWill ?? 55, 0, leg.aggregate),
  };

  return state;
}

/**
 * Determines which scenarios are eligible given the current imperial year and empire state.
 * CRITICAL ENGINE RULE: Future scenarios (scenario.year > state.identity.year) are 100% hidden.
 */
export function determineAvailableScenarios(state: GameState): string[] {
  const currentYear = state.identity.year;

  return allScenarios
    .filter((scenario) => {
      // 1. CHRONOLOGICAL FILTER (Core Engine Rule):
      // Only scenarios of the current imperial year are allowed.
      const scenarioYear = scenario.year ?? currentYear;
      if (scenarioYear !== currentYear) {
        return false;
      }

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

      // Stage 7: Blocked narrative conditions check
      if (scenario.blockedNarrativeConditions && scenario.blockedNarrativeConditions.some((c) => evaluateNarrativeCondition(c, state))) {
        return false;
      }

      // Stage 7: Required narrative conditions check
      if (scenario.narrativeConditions && !evaluateAllNarrativeConditions(scenario.narrativeConditions, state)) {
        return false;
      }

      // Evaluate standard conditions
      return evaluateAllConditions(scenario.conditions, state);
    })
    .sort((a, b) => {
      // Primary: sequenceOrder ascending (e.g. 10 before 20 before 30)
      const seqA = a.sequenceOrder ?? 50;
      const seqB = b.sequenceOrder ?? 50;
      if (seqA !== seqB) {
        return seqA - seqB;
      }
      // Secondary: priority descending (higher priority surfaces first)
      return (b.priority ?? 0) - (a.priority ?? 0);
    })
    .map((s) => s.id);
}

/**
 * Returns structured agenda information for the current imperial year.
 */
export function getYearAgenda(state: GameState): YearAgenda {
  const currentYear = state.identity.year;
  const allYearScenarios = allScenarios.filter((s) => (s.year ?? currentYear) === currentYear);
  const completedScenarios = allYearScenarios.filter((s) => state.completedScenarioIds.includes(s.id));
  const availableScenarioIds = determineAvailableScenarios(state);
  const availableScenarios = availableScenarioIds
    .map((id) => getAdaptedScenarioById(id, state))
    .filter((s): s is Scenario => Boolean(s));

  const requiredScenarios = allYearScenarios.filter((s) => s.required);
  const requiredPendingCount = requiredScenarios.filter((s) => !state.completedScenarioIds.includes(s.id)).length;

  const isYearComplete = requiredPendingCount === 0 && availableScenarios.length === 0;

  return {
    year: currentYear,
    allScenarios: allYearScenarios,
    availableScenarios,
    completedScenarios,
    requiredScenarios,
    requiredPendingCount,
    isYearComplete,
  };
}

/**
 * Returns scenario adapted to the current ruler's past choices and reputation.
 */
export function getAdaptedScenarioById(id: string, state: GameState): Scenario | undefined {
  const raw = getScenarioById(id);
  return raw ? adaptScenarioToRuler(raw, state) : undefined;
}

/**
 * Gets the next scenario in line for the current imperial year, adapted to the ruler.
 */
export function getNextScenario(state: GameState): Scenario | null {
  const availableIds = determineAvailableScenarios(state);
  if (availableIds.length === 0) return null;
  return getAdaptedScenarioById(availableIds[0], state) || null;
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
          source: sc.sourceYear
            ? `Наслідок рішення ${sc.sourceYear} року («${sc.sourceScenarioTitle || 'Рада'}»)`
            : 'Державний наслідок',
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
 * State Transaction: resolveChoice executes the complete, atomic decision cycle.
 * Choice -> Immediate Consequences -> Political Reactions -> Derived State Recalculation
 * -> History -> Scheduled Consequences -> Year Agenda Evaluation -> Autosave State.
 */
export function resolveChoice(
  currentState: GameState,
  scenarioId: string,
  choiceId: string
): ChoiceResolutionResult {
  const previousMetrics: EmpireMetrics = { ...currentState.empire };

  const rawScenario = getScenarioById(scenarioId);
  if (!rawScenario) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }
  const scenario = adaptScenarioToRuler(rawScenario, currentState);

  const choice = scenario.choices.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Choice not found: ${choiceId} in scenario ${scenarioId}`);
  }

  const decisionId = 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // Build full consequences list from choice attributes
  const allConsequences: Consequence[] = [...choice.consequences];

  // Stage 7: Memory tags from choice
  if (choice.memoryTags) {
    for (const tag of choice.memoryTags) {
      allConsequences.push({
        type: 'ADD_MEMORY_TAG',
        tag,
      });
    }
  }

  // Psychological signals
  if (choice.psychologicalSignals) {
    for (const sig of choice.psychologicalSignals) {
      allConsequences.push({
        type: 'PSYCHOLOGICAL_SIGNAL',
        dimension: sig.dimension,
        value: sig.value,
        context: sig.context,
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
  const actorsInvolved = Array.from(
    new Set([...(scenario.characters || []), ...(scenario.speakerId ? [scenario.speakerId] : [])])
  );
  const factionsInvolved = Array.from(
    new Set(
      actorsInvolved
        .map((aid) => updatedState.characters.find((c) => c.id === aid)?.factionId)
        .filter((fid): fid is string => Boolean(fid))
    )
  );

  // Extract structured political reactions summary
  const politicalReactionsSummary = (choice.politicalReactions || []).map((pr) => {
    const faction = updatedState.factions.find((f) => f.id === pr.factionId);
    return {
      entity: faction ? faction.name : pr.factionId,
      reaction: pr.reaction,
      note: pr.note,
    };
  });

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

  // Derived state recalculation (Section 9)
  let finalState = recalculateDerivedState(postCrisisState);

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
  finalState = {
    ...finalState,
    decisions: [decisionRecord, ...finalState.decisions],
    completedScenarioIds: [...finalState.completedScenarioIds, scenarioId],
    currentScenarioId: null, // Scenario closed
    eventQueue: [...(finalState.eventQueue || []), ...crisisEvents],
  };

  // Stage 7: Automatically record Memory Tags & Historical Reputation Signals
  finalState = recordDecisionMemoryTags(finalState, scenario, choice, decisionId);

  // Check if any scheduled consequences can fire for the current year
  const scheduledResult = checkAndResolveScheduledConsequences(finalState);
  finalState = scheduledResult.state;
  const allLogs = [...logs, ...scheduledResult.logs];

  // Stage 6: Evaluate Psychological Ascension Engine
  const ascensionResult = evaluateAscension(finalState);
  finalState = {
    ...finalState,
    behaviorPatterns: ascensionResult.behaviorPatterns,
    contradictions: ascensionResult.contradictions,
    reflections: ascensionResult.reflections,
    insights: ascensionResult.insights,
    stressTests: ascensionResult.stressTests,
    transformations: ascensionResult.transformations,
    ascensionStage: ascensionResult.ascensionStage,
    archetypeProfile: ascensionResult.archetypeProfile,
    availableScenarioIds: determineAvailableScenarios(finalState),
  };

  // If a transformation occurred, record historical chronicle entry
  if (ascensionResult.newTransformations.length > 0) {
    for (const trans of ascensionResult.newTransformations) {
      finalState.history = [
        {
          id: 'hist_trans_' + Date.now() + '_' + trans.id,
          year: finalState.identity.year,
          timestamp: Date.now(),
          type: 'REFORM',
          title: `Трансформація Правління: ${trans.title}`,
          description: `${trans.description} (Було: «${trans.fromState}» → Стало: «${trans.toState}»).`,
          sourceDecisionId: decisionId,
          importance: 'critical',
          tags: ['трансформація', 'сходження', `${finalState.identity.year}`],
          category: 'decision',
        },
        ...finalState.history,
      ];
      allLogs.push(`ПСИХОЛОГІЧНИЙ ПЕРЕЛОМ: «${trans.title}»`);
    }
  }

  // Year Agenda Evaluation
  const agenda = getYearAgenda(finalState);
  const completedThisYear = finalState.completedScenarioIds.filter((id) => {
    const sc = getScenarioById(id);
    return (sc?.year ?? finalState.identity.year) === finalState.identity.year;
  });
  const totalRequiredThisYear = agenda.allScenarios.filter((s) => s.required).length;

  finalState.yearProgress = {
    year: finalState.identity.year,
    completedScenarioIds: completedThisYear,
    resolvedScenarioCount: completedThisYear.length,
    totalRequiredScenarios: totalRequiredThisYear,
    yearStartMetrics: finalState.yearProgress?.yearStartMetrics || previousMetrics,
  };

  // If year agenda is complete, prepare the YearSummary
  let yearSummaryData: YearSummaryData | null = null;
  if (agenda.isYearComplete) {
    const yearStartMetrics = finalState.yearProgress.yearStartMetrics || previousMetrics;
    const yearDecisions = finalState.decisions.filter((d) => d.year === finalState.identity.year);
    const yearEvents = finalState.history.filter((h) => h.year === finalState.identity.year);
    const pendingConsequences = (finalState.consequences || []).filter((c) => !c.resolved);

    yearSummaryData = {
      year: finalState.identity.year,
      startMetrics: yearStartMetrics,
      endMetrics: { ...finalState.empire },
      decisionsCount: yearDecisions.length,
      decisionsTitles: yearDecisions.map((d) => d.choiceText),
      importantEventsCount: yearEvents.length,
      delayedConsequencesCount: pendingConsequences.length,
      politicalHighlights: yearDecisions.slice(0, 3).map((d) => `«${d.title}»: ${d.choiceText}`),
      economicHighlights: [
        `Скарбниця: ${yearStartMetrics.treasury}M → ${finalState.empire.treasury}M`,
        `Військова міць: ${yearStartMetrics.militaryStrength}% → ${finalState.empire.militaryStrength}%`,
        `Стабільність: ${yearStartMetrics.stability}% → ${finalState.empire.stability}%`,
        `Єдність: ${yearStartMetrics.unity}% → ${finalState.empire.unity}%`,
        `Добробут: ${yearStartMetrics.prosperity}% → ${finalState.empire.prosperity}%`,
      ],
    };
    finalState.yearSummary = yearSummaryData;
  }

  return {
    state: finalState,
    logs: allLogs,
    previousMetrics,
    newMetrics: { ...finalState.empire },
    resolvedScheduledEvents: scheduledResult.resolved,
    newEvents: [...crisisEvents, ...scheduledResult.newEvents],
    politicalReactionsSummary,
    isYearAgendaComplete: agenda.isYearComplete,
    yearSummary: yearSummaryData,
  };
}

/**
 * Backwards-compatible wrapper around resolveChoice.
 */
export function executeChoice(
  currentState: GameState,
  scenarioId: string,
  choiceId: string
): ChoiceExecutionResult {
  const result = resolveChoice(currentState, scenarioId, choiceId);
  return {
    state: result.state,
    logs: result.logs,
    resolvedScheduledEvents: result.resolvedScheduledEvents,
    newEvents: result.newEvents,
  };
}

/**
 * Advances imperial year by delta and processes the entire annual state transition:
 * Economic cycle, promises evaluation, scheduled consequences, political crises,
 * dynastic history event, derived state recalculation, and new YearAgenda.
 */
export function advanceYear(
  currentState: GameState,
  years = 1
): { state: GameState; logs: string[]; resolved: ScheduledConsequence[]; newEvents: ImperialEvent[] } {
  const currentYear = currentState.identity.year;
  const nextYear = currentYear + years;

  let state: GameState = {
    ...currentState,
    identity: {
      ...currentState.identity,
      year: nextYear,
    },
  };

  const advanceLogs: string[] = [`Рік ${currentYear} завершено. Імперія вступає у ${nextYear} рік правління.`];
  const newEvents: ImperialEvent[] = [];

  // Check promises
  const promiseEvaluation = evaluatePromises(state.promises || [], nextYear, state);
  state.promises = promiseEvaluation.updatedPromises;

  for (const broken of promiseEvaluation.brokenList) {
    advanceLogs.push(`ОБІЦЯНКУ ГЕТЬМАНА ПОРУШЕНО: «${broken.text}»! Втрата довіри та капіталу.`);
    state.factions = state.factions.map((f) =>
      f.id === broken.targetFaction || f.name === broken.targetFaction
        ? { ...f, loyalty: Math.max(0, f.loyalty - 15), tension: Math.min(100, (f.tension ?? 25) + 15) }
        : f
    );
    state.politicalWill = Math.max(0, (state.politicalWill ?? 55) - 12);
    state.history = [
      {
        id: 'hist_broken_' + Date.now() + '_' + broken.id,
        year: nextYear,
        timestamp: Date.now(),
        type: 'PROMISE_BROKEN',
        title: `Порушена обіцянка: «${broken.text}»`,
        description: `Минув призначений термін (${broken.deadlineYear} р.), але обіцяне перед фракцією «${broken.targetFaction}» не було виконано.`,
        importance: 'major',
        tags: ['обіцянка_порушена', broken.targetFaction],
        category: 'promise',
        causalChainNote: `Обіцянка ${broken.year} р. → Невиконання до ${broken.deadlineYear} р. → Втрата довіри`,
      },
      ...state.history,
    ];
    newEvents.push({
      id: 'evt_broken_' + broken.id,
      year: nextYear,
      title: 'Порушена обітниця Гетьмана',
      description: `Термін виконання обіцянки перед фракцією «${broken.targetFaction}» вичерпано.`,
      source: 'Обітниця перед Радою',
      timestamp: Date.now(),
    });
  }

  for (const fulfilled of promiseEvaluation.fulfilledList) {
    advanceLogs.push(`Обітницю Гетьмана виконано: «${fulfilled.text}»!`);
    state.politicalWill = Math.min(100, (state.politicalWill ?? 55) + 8);
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

  // Dynastic chronicle event
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

  // Execute Stage 5 Annual Economic Cycle
  if (state.economy && state.military) {
    const ecoResult = advanceEconomicYear(state, years);
    state = ecoResult.state;
    advanceLogs.push(...ecoResult.logs);
  }

  // Resolve scheduled consequences due in nextYear
  const scheduledResult = checkAndResolveScheduledConsequences(state);
  state = scheduledResult.state;

  // Recalculate derived state
  state = recalculateDerivedState(state);

  // Initialize new year agenda & progress
  const newYearScenarios = allScenarios.filter((s) => (s.year ?? nextYear) === nextYear);
  const totalRequired = newYearScenarios.filter((s) => s.required).length;
  state = {
    ...state,
    yearProgress: {
      year: nextYear,
      completedScenarioIds: [],
      resolvedScenarioCount: 0,
      totalRequiredScenarios: totalRequired,
      yearStartMetrics: { ...state.empire },
    },
    yearSummary: null,
    currentScenarioId: null,
  };

  const ascension = evaluateAscension(state);
  state = {
    ...state,
    behaviorPatterns: ascension.behaviorPatterns,
    contradictions: ascension.contradictions,
    reflections: ascension.reflections,
    insights: ascension.insights,
    stressTests: ascension.stressTests,
    transformations: ascension.transformations,
    ascensionStage: ascension.ascensionStage,
    archetypeProfile: ascension.archetypeProfile,
    availableScenarioIds: determineAvailableScenarios(state),
  };

  // Stage 7: Check and trigger Narrative Mirrors (e.g. entering 1850)
  const mirrorResult = checkAndTriggerNarrativeMirrors(state);
  state = mirrorResult.state;
  if (mirrorResult.mirror) {
    advanceLogs.push(`ДЗЕРКАЛО ВОЛОДАРЯ (${state.identity.year} р.): «${mirrorResult.mirror.title}»`);
  }

  return {
    state,
    logs: [...advanceLogs, ...scheduledResult.logs],
    resolved: scheduledResult.resolved,
    newEvents: [...newEvents, ...scheduledResult.newEvents],
  };
}

/**
 * Backwards-compatible alias for advanceYear.
 */
export function advanceTime(
  currentState: GameState,
  years = 1
): { state: GameState; logs: string[]; resolved: ScheduledConsequence[]; newEvents: ImperialEvent[] } {
  return advanceYear(currentState, years);
}
