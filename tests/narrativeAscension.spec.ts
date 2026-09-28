import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/game/state/initialState.ts';
import {
  evaluateNarrativeCondition,
  evaluateAllNarrativeConditions,
  adaptScenarioToRuler,
  checkAndTriggerNarrativeMirrors,
  deriveCharacterExpectation,
} from '../src/game/narrative/narrativeEngine.ts';
import { resolveChoice, getNextScenario, advanceYear } from '../src/game/engine/scenarioEngine.ts';
import { Scenario } from '../src/game/scenarios/types.ts';
import { evaluateAscension } from '../src/game/psychology/ascensionEngine.ts';

describe('Stage 7 — Narrative Ascension Engine', () => {
  it('evaluates narrative conditions correctly', () => {
    let state = createInitialGameState();

    // HAS_MEMORY_TAG when tag does not exist
    expect(
      evaluateNarrativeCondition(
        { type: 'HAS_MEMORY_TAG', memoryTag: 'Заступився за громади' },
        state
      )
    ).toBe(false);

    // HAS_NOT_MEMORY_TAG when tag does not exist
    expect(
      evaluateNarrativeCondition(
        { type: 'HAS_NOT_MEMORY_TAG', memoryTag: 'Заступився за громади' },
        state
      )
    ).toBe(true);

    // Add tag to state
    state = {
      ...state,
      reputationTags: ['Заступився за громади', 'Спирався на зброю генералітету'],
    };

    expect(
      evaluateNarrativeCondition(
        { type: 'HAS_MEMORY_TAG', memoryTag: 'Заступився за громади' },
        state
      )
    ).toBe(true);

    expect(
      evaluateNarrativeCondition(
        { type: 'HAS_NOT_MEMORY_TAG', memoryTag: 'Заступився за громади' },
        state
      )
    ).toBe(false);
  });

  it('adapts scenarios dynamically based on ruler past choices and reputation', () => {
    let state = createInitialGameState();
    state = {
      ...state,
      reputationTags: ['Встановив столичний нагляд'],
    };

    const mockScenario: Scenario = {
      id: 'mock_test_scenario',
      title: 'Тестова Рада',
      location: 'Хортиця',
      tags: ['тест'],
      conditions: [],
      characters: [],
      introduction: 'Вступ',
      situation: 'Звичайна ситуація',
      speakerQuote: '«Початкова цитата»',
      choices: [
        {
          id: 'base_choice_1',
          text: 'Базовий вибір 1',
          consequences: [],
        },
        {
          id: 'base_choice_2',
          text: 'Базовий вибір 2',
          consequences: [],
        },
      ],
      narrativePressures: [
        {
          id: 'pressure_centralization_test',
          sourcePatternOrTag: 'Встановив столичний нагляд',
          condition: {
            type: 'HAS_MEMORY_TAG',
            memoryTag: 'Встановив столичний нагляд',
          },
          impactDescription: 'Минулий вибір централізації змушує опозицію діяти жорсткіше.',
          speakerModifier: {
            speakerQuote: '«Ми знаємо вашу схильність до централізованого тиску!»',
          },
          blockedChoiceIds: ['base_choice_1'],
          additionalChoices: [
            {
              id: 'dilemma_choice_emergency_power',
              text: 'Дилема: використати надзвичайний контроль',
              consequences: [],
            },
          ],
        },
      ],
    };

    const adapted = adaptScenarioToRuler(mockScenario, state);

    // Speaker quote changed
    expect(adapted.speakerQuote).toBe('«Ми знаємо вашу схильність до централізованого тиску!»');

    // Narrative echo added
    expect(adapted.narrativeEcho).toContain('Минулий вибір централізації');

    // Blocked choice removed
    expect(adapted.choices.some((c) => c.id === 'base_choice_1')).toBe(false);

    // Additional dilemma choice injected
    expect(adapted.choices.some((c) => c.id === 'dilemma_choice_emergency_power')).toBe(true);
  });

  it('records memory tags from player choices into GameState.reputationTags', () => {
    let state = createInitialGameState();
    expect(state.reputationTags).toEqual([]);

    // Execute first council scenario choosing to fund army
    const res = resolveChoice(state, 'scenario_first_council', 'choice_fund_army');
    expect(res.state.reputationTags).toBeDefined();
    expect(res.state.reputationTags).toContain('Спирався на зброю генералітету');
  });

  it('derives character expectations dynamically based on historical reputation and fear/trust', () => {
    let state = createInitialGameState();
    const general = state.characters.find((c) => c.id === 'general_chaika')!;

    // Initial expectation
    const initialExp = deriveCharacterExpectation(general, state);
    expect(initialExp).toBeTruthy();

    // After militarist reputation
    state = {
      ...state,
      reputationTags: ['Спирався на зброю генералітету'],
    };
    const militaryExp = deriveCharacterExpectation(general, state);
    expect(militaryExp).toContain('Впевнений у пріоритеті військових потреб');

    // After violence against rebels
    state = {
      ...state,
      reputationTags: ['Застосував силу проти повстанців'],
    };
    const scaredExp = deriveCharacterExpectation(general, state);
    expect(scaredExp).toContain('Побоюється збройного диктату');
  });

  it('progressively crystallizes the archetype (EMERGING -> CRYSTALLIZING -> REVEALED)', () => {
    let state = createInitialGameState();

    // 0 decisions: EMERGING
    let ascension = evaluateAscension(state);
    expect(ascension.archetypeProfile.crystallizationStage).toBe('EMERGING');
    expect(ascension.archetypeProfile.progressionNote).toBeTruthy();

    // Add decisions to reach CRYSTALLIZING stage (3 decisions)
    state = {
      ...state,
      decisions: [
        { id: 'd1', scenarioId: 's1', choiceId: 'c1', year: 1848, timestamp: 1, choiceText: 't1', title: 'T1', summary: 's', actors: [], regions: [], factions: [], stateEffects: [], psychologicalSignals: ['ORDER +2'], importance: 'major', tags: [] },
        { id: 'd2', scenarioId: 's2', choiceId: 'c2', year: 1848, timestamp: 2, choiceText: 't2', title: 'T2', summary: 's', actors: [], regions: [], factions: [], stateEffects: [], psychologicalSignals: ['ORDER +2'], importance: 'major', tags: [] },
        { id: 'd3', scenarioId: 's3', choiceId: 'c3', year: 1849, timestamp: 3, choiceText: 't3', title: 'T3', summary: 's', actors: [], regions: [], factions: [], stateEffects: [], psychologicalSignals: ['ORDER +2'], importance: 'major', tags: [] },
      ],
      psychology: [
        { id: 'p1', dimension: 'ORDER', value: 2, timestamp: 1, context: 'crisis', contextNote: 'order' },
        { id: 'p2', dimension: 'ORDER', value: 2, timestamp: 2, context: 'crisis', contextNote: 'order' },
        { id: 'p3', dimension: 'ORDER', value: 2, timestamp: 3, context: 'crisis', contextNote: 'order' },
      ],
    };

    ascension = evaluateAscension(state);
    expect(ascension.archetypeProfile.crystallizationStage).toBe('CRYSTALLIZING');

    // Add more decisions or advance year to 1851 -> REVEALED
    state = {
      ...state,
      identity: {
        ...state.identity,
        year: 1851,
      },
      decisions: [
        ...state.decisions,
        { id: 'd4', scenarioId: 's4', choiceId: 'c4', year: 1850, timestamp: 4, choiceText: 't4', title: 'T4', summary: 's', actors: [], regions: [], factions: [], stateEffects: [], psychologicalSignals: ['ORDER +2'], importance: 'major', tags: [] },
        { id: 'd5', scenarioId: 's5', choiceId: 'c5', year: 1851, timestamp: 5, choiceText: 't5', title: 'T5', summary: 's', actors: [], regions: [], factions: [], stateEffects: [], psychologicalSignals: ['ORDER +2'], importance: 'major', tags: [] },
      ],
    };

    ascension = evaluateAscension(state);
    expect(ascension.archetypeProfile.crystallizationStage).toBe('REVEALED');
  });

  it('triggers narrative mirrors on pivotal year advance', () => {
    let state = createInitialGameState();
    state = {
      ...state,
      reputationTags: ['Спирався на зброю генералітету'],
      behaviorPatterns: [
        {
          id: 'pattern_order_in_crisis',
          title: 'Залізний Порядок у Час Загрози',
          description: 'Прагнення до суворої дисципліни',
          dimension: 'ORDER',
          frequency: 3,
          firstObservedYear: 1848,
          lastObservedYear: 1849,
          contexts: ['crisis'],
          strength: 0.85,
          consistency: 0.9,
          decisionCount: 3,
          relatedDecisions: ['d1', 'd2', 'd3'],
          contradictions: [],
        },
      ],
    };

    // Advance to 1850
    const adv = advanceYear(state, 2);
    expect(adv.state.identity.year).toBe(1850);
    expect(adv.state.narrativeMirrors).toBeDefined();
    expect(adv.state.narrativeMirrors!.length).toBeGreaterThan(0);
    const mirror = adv.state.narrativeMirrors![0];
    expect(mirror.title).toBeTruthy();
    expect(mirror.text).toBeTruthy();
  });
});
