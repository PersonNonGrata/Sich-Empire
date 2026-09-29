import { GameState } from './types.ts';
import { createInitialGameState } from './initialState.ts';
import {
  determineAvailableScenarios,
  executeChoice,
  resolveChoice as engineResolveChoice,
  advanceYear as engineAdvanceYear,
  advanceTime as engineAdvanceTime,
  checkAndResolveScheduledConsequences,
  ChoiceResolutionResult,
} from '../engine/scenarioEngine.ts';
import { Consequence, ScheduledConsequence } from '../consequences/types.ts';
import { applyConsequences, applySingleConsequence } from '../consequences/applier.ts';
import { HistoryEvent, HistoryEventType } from '../history/types.ts';
import { PsychologicalDimension, PsychologicalSignal } from '../psychology/types.ts';
import { Importance, ImperialEvent } from '../../types/index.ts';
import { evaluateArchetypeProfile } from '../archetypes/evaluator.ts';
import { handlePlayerReflectionResponse } from '../psychology/ascensionEngine.ts';
import { ReflectionResponse } from '../psychology/types.ts';
import { FactionNegotiationAction } from '../politics/types.ts';
import { negotiateFactionDemand as engineNegotiateFactionDemand } from '../politics/negotiationEngine.ts';

/**
 * PURE STATE OPERATIONS (Immutable transitions)
 */

export function startScenario(state: GameState, scenarioId: string): GameState {
  if (!state.availableScenarioIds.includes(scenarioId) && !state.unlockedScenarioIds.includes(scenarioId)) {
    throw new Error(`Scenario ${scenarioId} is not available.`);
  }

  return {
    ...state,
    currentScenarioId: scenarioId,
  };
}

export function makeChoice(
  state: GameState,
  scenarioId: string,
  choiceId: string
): ChoiceResolutionResult {
  return engineResolveChoice(state, scenarioId, choiceId);
}

export function resolveChoice(
  state: GameState,
  scenarioId: string,
  choiceId: string
): ChoiceResolutionResult {
  return engineResolveChoice(state, scenarioId, choiceId);
}

export function advanceYear(
  state: GameState,
  years = 1
): { state: GameState; logs: string[]; resolved: ScheduledConsequence[]; newEvents: ImperialEvent[] } {
  return engineAdvanceYear(state, years);
}

export function advanceTime(
  state: GameState,
  years = 1
): { state: GameState; logs: string[]; resolved: ScheduledConsequence[]; newEvents: ImperialEvent[] } {
  return engineAdvanceYear(state, years);
}

export function dismissEvent(state: GameState, eventId: string): GameState {
  return {
    ...state,
    eventQueue: (state.eventQueue || []).filter((e) => e.id !== eventId),
  };
}

export function dismissAllEvents(state: GameState): GameState {
  return {
    ...state,
    eventQueue: [],
  };
}

export function setWorldFlag(state: GameState, flag: string, value: boolean | string | number): GameState {
  return {
    ...state,
    flags: {
      ...(state.flags || {}),
      [flag]: value,
    },
  };
}

export function addHistoryEvent(
  state: GameState,
  event: {
    type: HistoryEventType;
    title: string;
    description: string;
    importance: Importance;
    tags?: string[];
  }
): GameState {
  const newEvent: HistoryEvent = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    year: state.identity.year,
    timestamp: Date.now(),
    type: event.type,
    title: event.title,
    description: event.description,
    importance: event.importance,
    tags: event.tags || [],
  };

  return {
    ...state,
    history: [newEvent, ...state.history],
  };
}

export function scheduleConsequence(
  state: GameState,
  scheduledData: Omit<ScheduledConsequence, 'id' | 'sourceDecisionId' | 'resolved'>,
  sourceDecisionId = 'custom_order'
): GameState {
  const newScheduled: ScheduledConsequence = {
    id: 'sched_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sourceDecisionId,
    sourceYear: state.identity.year,
    triggerYear: scheduledData.triggerYear,
    title: scheduledData.title,
    description: scheduledData.description,
    conditions: scheduledData.conditions,
    consequences: scheduledData.consequences,
    resolved: false,
  };

  const updatedConsequences = [...(state.consequences || []), newScheduled];
  return {
    ...state,
    consequences: updatedConsequences,
    scheduledConsequences: updatedConsequences,
  };
}

export function resolveConsequence(state: GameState, scheduledId: string): GameState {
  const target = (state.consequences || []).find((c) => c.id === scheduledId);
  if (!target || target.resolved) return state;

  const applied = applyConsequences(target.consequences, state, {
    sourceDecisionId: target.sourceDecisionId,
    scenarioTitle: target.sourceScenarioTitle,
    scenarioId: target.sourceScenarioId,
  });

  let newState = applied.state;
  const updatedConsequences = (newState.consequences || []).map((c) =>
    c.id === scheduledId ? { ...c, resolved: true, resolvedYear: newState.identity.year } : c
  );

  newState = {
    ...newState,
    consequences: updatedConsequences,
    scheduledConsequences: updatedConsequences,
    availableScenarioIds: determineAvailableScenarios(newState),
    archetypeProfile: evaluateArchetypeProfile(newState),
  };

  return newState;
}

export function updateRelationship(
  state: GameState,
  characterId: string,
  valueDelta: number
): GameState {
  const current = state.relationships[characterId] ?? 0;
  const newRel = Math.max(-100, Math.min(100, current + valueDelta));

  return {
    ...state,
    relationships: {
      ...state.relationships,
      [characterId]: newRel,
    },
  };
}

export function addPsychologicalSignal(
  state: GameState,
  signal: {
    dimension: PsychologicalDimension;
    value: number;
    contextNote?: string;
    sourceDecisionId?: string;
  }
): GameState {
  const newSignal: PsychologicalSignal = {
    id: 'sig_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    dimension: signal.dimension,
    value: signal.value,
    contextNote: signal.contextNote,
    sourceDecisionId: signal.sourceDecisionId,
    timestamp: Date.now(),
  };

  const updatedSignals = [...state.psychology, newSignal];
  let newState: GameState = {
    ...state,
    psychology: updatedSignals,
  };
  newState = {
    ...newState,
    archetypeProfile: evaluateArchetypeProfile(newState),
  };

  return newState;
}

export function addTension(state: GameState, key: string, valueDelta: number): GameState {
  const current = state.tensions[key] ?? 50;
  return {
    ...state,
    tensions: {
      ...state.tensions,
      [key]: Math.max(0, Math.min(100, current + valueDelta)),
    },
  };
}

export function negotiateFactionDemand(state: GameState, demandId: string, action: FactionNegotiationAction): { state: GameState; logs: string[]; politicalWillCost: number } {
  return engineNegotiateFactionDemand(state, demandId, action);
}

export function resetGame(rulerName?: string): GameState {
  return createInitialGameState(rulerName);
}

export function respondToReflection(
  state: GameState,
  reflectionId: string,
  response: ReflectionResponse,
  note?: string
): GameState {
  return handlePlayerReflectionResponse(state, reflectionId, response, note);
}

