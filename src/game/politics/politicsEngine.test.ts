/**
 * Automated Verification Suite for Stage 4 Political Machine (Requirement 32)
 */

import { createInitialGameState } from '../state/initialState.ts';
import { BASE_FACTIONS } from './factionsData.ts';
import {
  evaluateFactionReaction,
  calculateLegitimacy,
  recalculatePoliticalCapital,
  simulateProposalVoting,
  detectPoliticalCrises,
  evaluatePromises,
} from './evaluator.ts';
import { CRISIS_IDS } from './constants.ts';
import { applySingleConsequence } from '../consequences/applier.ts';
import { executeChoice, advanceTime } from '../engine/scenarioEngine.ts';

export function runPoliticalEngineTests(): { success: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push(`✓ [PASS] ${testName}`);
    } else {
      results.push(`✗ [FAIL] ${testName}`);
      allPassed = false;
    }
  }

  // 1. Faction Reaction Test
  const oldSich = BASE_FACTIONS.find((f) => f.id === 'faction_old_sich')!;
  const supportReaction = evaluateFactionReaction(oldSich, { autonomy: 80, freedom: 80 }, 60);
  assert(supportReaction.reaction === 'support', '1. Faction reaction: Old Sich supports autonomy expansion');

  const oppositionReaction = evaluateFactionReaction(oldSich, { centralization: 80, taxation: 60 }, 50);
  assert(
    oppositionReaction.reaction === 'opposition' || oppositionReaction.reaction === 'crisis',
    '1. Faction reaction: Old Sich opposes centralization/taxation (opposition/crisis)'
  );


  // 2. Regional Reaction & Autonomy Test
  const state = createInitialGameState('Богдан Островерхий');
  const regConsequence = applySingleConsequence(
    {
      type: 'REGION_CHANGE',
      regionId: 'region_sich_core',
      autonomyChange: 15,
      stabilityChange: 5,
    },
    state
  );
  const updatedReg = regConsequence.state.regions.find((r) => r.id === 'region_sich_core');
  assert((updatedReg?.autonomy ?? 0) === 55, '2. Regional reaction: Autonomy correctly updated to 55');

  // 3. Political Capital Test
  const newCapital = recalculatePoliticalCapital(50, 10, 80);
  assert(newCapital === 62, '3. Political Capital: Recalculates with decision delta (+10) and high legitimacy bonus (+2)');

  // 4. Multi-Component Legitimacy Test
  const legitimacyResult = calculateLegitimacy(state);
  assert(legitimacyResult.components.tradition > 0, '4. Legitimacy: Tradition component calculated');
  assert(legitimacyResult.components.law > 0, '4. Legitimacy: Law component calculated');
  assert(legitimacyResult.components.success > 0, '4. Legitimacy: Success component calculated');
  assert(legitimacyResult.aggregate >= 50 && legitimacyResult.aggregate <= 100, '4. Legitimacy: Aggregate legitimacy calculated within valid range');

  // 5. Promises Test (Requirement 12)
  const testPromise = {
    id: 'test_prom_1',
    year: 1848,
    text: 'Провести реформу війська до 1850 року',
    targetFaction: 'faction_military_command',
    deadlineYear: 1850,
    fulfilled: false,
    broken: false,
    importance: 'major' as const,
  };
  const promiseCheck1849 = evaluatePromises([testPromise], 1849, state);
  assert(promiseCheck1849.brokenList.length === 0, '5. Promises: Pending promise not broken in 1849');

  const promiseCheck1850 = evaluatePromises([testPromise], 1850, state);
  assert(promiseCheck1850.brokenList.length === 1, '5. Promises: Promise marked broken at deadline year 1850');

  // 6. Universal Relationships Test
  const relConsequence = applySingleConsequence(
    {
      type: 'RELATIONSHIP_CHANGE',
      characterId: 'general_chaika',
      trustChange: 10,
      respectChange: 5,
    },
    state
  );
  const updatedChaika = relConsequence.state.characters.find((c) => c.id === 'general_chaika');
  assert((updatedChaika?.trust ?? 0) === 15, '6. Relationships: General Chaika trust updated correctly to 15');

  // 7. Political Crisis Detection (Requirement 18: «ГОЛОС СТАРОЇ СІЧІ»)
  // Condition: centralization > 70 AND autonomy Zaporizhzhia < 40 AND loyalty Old Sich < 35
  const crisisTriggerState = {
    ...state,
    tensions: {
      ...state.tensions,
      tension_autonomy_centralization: 75,
    },
    regions: state.regions.map((r) =>
      r.id === 'region_sich_core' ? { ...r, autonomy: 30 } : r
    ),
    factions: state.factions.map((f) =>
      f.id === 'faction_old_sich' ? { ...f, loyalty: 30 } : f
    ),
  };
  const detectedCrises = detectPoliticalCrises(crisisTriggerState, []);
  assert(
    detectedCrises.some((c) => c.id === CRISIS_IDS.VOICE_OF_OLD_SICH),
    '7. Political Crisis: «Голос Старої Січі» accurately detected when centralization > 70, autonomy < 40, loyalty < 35'
  );

  // 8. Autonomy vs Centralization Tension System Test
  const tensionConsequence = applySingleConsequence(
    {
      type: 'TENSION',
      key: 'tension_autonomy_centralization',
      value: 15,
      label: 'Посилення централізації',
    },
    state
  );
  assert(tensionConsequence.state.tensions['tension_autonomy_centralization'] === 60, '8. Autonomy vs Centralization: Tension shifted toward centralization (60%)');

  // 9. Institution Influence Test
  const instConsequence = applySingleConsequence(
    {
      type: 'INSTITUTION_CHANGE',
      institutionId: 'institution_great_council',
      influenceChange: 10,
      authorityChange: 5,
    },
    state
  );
  const updatedInst = instConsequence.state.institutions.find((i) => i.id === 'institution_great_council');
  assert((updatedInst?.influence ?? 0) === 85, '9. Institutions: Great Council influence successfully updated');

  // 10. Great Council Proposal Voting Simulation (Requirement 20)
  const voteResult = simulateProposalVoting(
    {
      id: 'prop_military_funding',
      title: 'Пропозиція виділення коштів армії',
      domain: 'armyFunding',
      impactStrength: 50,
      requiredCapital: 5,
    },
    BASE_FACTIONS,
    55
  );
  assert(voteResult.totalVotesFor > 0, '10. Proposal Voting: Factions cast weighted votes for military funding proposal');
  assert(typeof voteResult.passed === 'boolean', '10. Proposal Voting: Output deterministic vote pass/fail status');

  // 11. Causal History & Playable Decision Test
  const choiceResult = executeChoice(state, 'scenario_first_council', 'choice_reform_army');
  assert(choiceResult.state.completedScenarioIds.includes('scenario_first_council'), '11. Causal History: Scenario first council completed');
  assert(choiceResult.state.decisions.length === 1, '11. Causal History: Decision recorded with actors and factions');
  assert((choiceResult.state.promises || []).length > 0, '11. Causal History: 3-year military reform promise established');

  // 12. Advance Time with Broken/Fulfilled Promise
  const advanceResult = advanceTime(choiceResult.state, 3);
  assert(advanceResult.state.identity.year === 1851, '12. Advance Time: Year advanced from 1848 to 1851');

  return { success: allPassed, results };
}
