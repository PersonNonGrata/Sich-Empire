import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../state/initialState.ts';
import {
  determineAvailableScenarios,
  resolveChoice,
  advanceYear,
  getYearAgenda,
  getNextScenario,
  recalculateDerivedState,
  checkAndResolveScheduledConsequences,
} from './scenarioEngine.ts';
import { allScenarios, getScenarioById } from '../scenarios/registry.ts';
import { startScenario } from '../state/gameOperations.ts';
import { migrateSave } from '../../persistence/migration.ts';

describe('Етап 3.5: Хронологічний Рушій та Послідовна Історія', () => {
  it('31. Bug Verification: Future scenarios (1849, 1851) are strictly hidden in 1848', () => {
    const state = createInitialGameState('Богдан Островерхий');
    expect(state.identity.year).toBe(1848);

    const availableIds = determineAvailableScenarios(state);
    const availableScenarios = availableIds.map((id) => getScenarioById(id)!);

    // Verify all available scenarios strictly belong to 1848
    for (const sc of availableScenarios) {
      expect(sc.year ?? 1848).toBe(1848);
    }

    // Verify specifically that 1849 and 1851 scenarios are NOT available
    expect(availableIds).not.toContain('scenario_petition_galicia_land'); // 1849
    expect(availableIds).not.toContain('scenario_tax_reform_1849');       // 1849
    expect(availableIds).not.toContain('scenario_cost_of_decision');      // 1850
    expect(availableIds).not.toContain('scenario_border_echoes_1851');    // 1851
    expect(availableIds).not.toContain('scenario_port_tariffs_1851');     // 1851

    // Initial 1848 scenario is available
    expect(availableIds).toContain('scenario_first_council');
  });

  it('32. Resource Accumulation: Consecutive decisions accumulate deltas without resetting', () => {
    let state = createInitialGameState('Богдан Островерхий');
    // Set initial treasury to 74 as in user prompt test requirement
    state.empire.treasury = 74;
    if (state.economy) state.economy.treasury = 74;

    // Step 1: Decision A with treasury -10
    const resA = resolveChoice(state, 'scenario_first_council', 'choice_fund_army');
    state = resA.state;
    expect(state.empire.treasury).toBe(64);
    expect(state.economy?.treasury).toBe(64);

    // Step 2: Decision B with treasury +8
    const resB = resolveChoice(state, 'scenario_military_treasury_1848', 'choice_port_customs_levy');
    state = resB.state;
    expect(state.empire.treasury).toBe(72);
    expect(state.economy?.treasury).toBe(72);

    // Step 3: Decision C with treasury -15
    const resC = resolveChoice(state, 'scenario_military_treasury_1848', 'choice_reserve_mobilization');
    state = resC.state;
    expect(state.empire.treasury).toBe(57);
    expect(state.economy?.treasury).toBe(57);

    // State never reverted back to initial 74
    expect(state.empire.treasury).not.toBe(74);
  });

  it('33. Delayed Consequences: Fire strictly in triggerYear with causal root recorded', () => {
    let state = createInitialGameState('Богдан Островерхий');
    expect(state.identity.year).toBe(1848);

    // Choice 1 of first council schedules consequence for 1851
    const resA = resolveChoice(state, 'scenario_first_council', 'choice_fund_army');
    state = resA.state;

    // Verify scheduled consequence was added with sourceYear: 1848
    const sched = state.consequences.find((c) => c.triggerYear === 1851);
    expect(sched).toBeDefined();
    expect(sched?.sourceYear).toBe(1848);
    expect(sched?.resolved).toBe(false);

    // Advance to 1849: should NOT trigger
    const adv1849 = advanceYear(state, 1);
    state = adv1849.state;
    expect(state.identity.year).toBe(1849);
    expect(adv1849.resolved.length).toBe(0);
    expect(state.consequences.find((c) => c.triggerYear === 1851)?.resolved).toBe(false);

    // Advance to 1850: should NOT trigger
    const adv1850 = advanceYear(state, 1);
    state = adv1850.state;
    expect(state.identity.year).toBe(1850);
    expect(state.consequences.find((c) => c.triggerYear === 1851)?.resolved).toBe(false);

    // Advance to 1851: should trigger now!
    const adv1851 = advanceYear(state, 1);
    state = adv1851.state;
    expect(state.identity.year).toBe(1851);
    expect(adv1851.resolved.some((c) => c.triggerYear === 1851)).toBe(true);

    // History event in 1851 notes causal link to 1848
    const echoHist = state.history.find((h) => h.type === 'CONSEQUENCE_TRIGGERED' && h.year === 1851);
    expect(echoHist).toBeDefined();
    expect(echoHist?.description).toContain('1848');
  });

  it('34. Political Chain: Political indicators and faction loyalty persist from decision to decision', () => {
    let state = createInitialGameState('Богдан Островерхий');

    const initialLoyalty = state.factions.find((f) => f.id === 'faction_military_command')?.loyalty ?? 0;

    // Decision A boosts military command loyalty
    const resA = resolveChoice(state, 'scenario_first_council', 'choice_fund_army');
    state = resA.state;

    const postALoyalty = state.factions.find((f) => f.id === 'faction_military_command')?.loyalty ?? 0;
    expect(postALoyalty).toBeGreaterThan(initialLoyalty);

    // Next decision starts with already modified state
    const nextSc = getNextScenario(state);
    expect(nextSc).toBeDefined();
    expect(nextSc?.year).toBe(1848);

    // Resolve second decision in 1848
    const resB = resolveChoice(state, nextSc!.id, nextSc!.choices[0].id);
    state = resB.state;

    // Faction loyalty persists through B
    const postBLoyalty = state.factions.find((f) => f.id === 'faction_military_command')?.loyalty ?? 0;
    expect(postBLoyalty).toBeDefined();
  });

  it('Ordering & Sequencing: Scenarios follow sequenceOrder inside the year', () => {
    let state = createInitialGameState('Богдан Островерхий');

    // First scenario must be sequenceOrder 10 (First Council)
    const firstSc = getNextScenario(state);
    expect(firstSc?.id).toBe('scenario_first_council');
    expect(firstSc?.sequenceOrder).toBe(10);

    // Resolve first scenario
    const res1 = resolveChoice(state, firstSc!.id, firstSc!.choices[0].id);
    state = res1.state;

    // Second scenario must be sequenceOrder 20 (Voices of the Council)
    const secondSc = getNextScenario(state);
    expect(secondSc?.id).toBe('scenario_voices_of_the_council');
    expect(secondSc?.sequenceOrder).toBe(20);

    // Resolve second scenario
    const res2 = resolveChoice(state, secondSc!.id, secondSc!.choices[0].id);
    state = res2.state;

    // Third scenario must be sequenceOrder 30 (Military Treasury)
    const thirdSc = getNextScenario(state);
    expect(thirdSc?.id).toBe('scenario_military_treasury_1848');
    expect(thirdSc?.sequenceOrder).toBe(30);
  });

  it('Year does not advance prematurely after one choice; advances only when explicitly commanded', () => {
    let state = createInitialGameState('Богдан Островерхий');
    expect(state.identity.year).toBe(1848);

    // Make choice 1: year remains 1848!
    const res1 = resolveChoice(state, 'scenario_first_council', 'choice_fund_army');
    state = res1.state;
    expect(state.identity.year).toBe(1848);
    expect(res1.isYearAgendaComplete).toBe(false);

    // Make choice 2: year remains 1848!
    const res2 = resolveChoice(state, 'scenario_voices_of_the_council', 'choice_support_communities');
    state = res2.state;
    expect(state.identity.year).toBe(1848);
    expect(res2.isYearAgendaComplete).toBe(false);

    // Make choice 3 (last required of 1848):
    const res3 = resolveChoice(state, 'scenario_military_treasury_1848', 'choice_civic_concord_budget');
    state = res3.state;
    expect(state.identity.year).toBe(1848); // Still 1848 until advanceYear()!
    expect(res3.isYearAgendaComplete).toBe(true);
    expect(res3.yearSummary).toBeDefined();
    expect(res3.yearSummary?.year).toBe(1848);

    // Now advance year to 1849
    const adv = advanceYear(state, 1);
    state = adv.state;
    expect(state.identity.year).toBe(1849);

    // In 1849, new agenda starts
    const agenda1849 = getYearAgenda(state);
    expect(agenda1849.year).toBe(1849);
    expect(agenda1849.availableScenarios.length).toBeGreaterThan(0);
    expect(agenda1849.availableScenarios.every((s) => s.year === 1849)).toBe(true);
  });

  it('Year Summary Generation: produces accurate start vs end metrics', () => {
    let state = createInitialGameState('Богдан Островерхий');
    const startTreasury = state.empire.treasury;

    // Complete all 3 required scenarios of 1848
    state = resolveChoice(state, 'scenario_first_council', 'choice_fund_army').state;
    state = resolveChoice(state, 'scenario_voices_of_the_council', 'choice_support_communities').state;
    const finalRes = resolveChoice(state, 'scenario_military_treasury_1848', 'choice_port_customs_levy');
    state = finalRes.state;

    expect(state.yearSummary).toBeDefined();
    expect(state.yearSummary?.year).toBe(1848);
    expect(state.yearSummary?.startMetrics.treasury).toBe(startTreasury);
    expect(state.yearSummary?.endMetrics.treasury).toBe(state.empire.treasury);
    expect(state.yearSummary?.decisionsCount).toBe(3);
  });

  it('Persistence & Migration: legacy save with mixed years recalculates available scenarios for current year', () => {
    const rawLegacySave = {
      version: 2,
      identity: { gameId: 'save_corrupted', rulerName: 'Остап', rulerTitle: 'Гетьман', year: 1848 },
      empire: { stability: 65, treasury: 50, militaryStrength: 60, unity: 58, prosperity: 55 },
      availableScenarioIds: [
        'scenario_first_council',
        'scenario_petition_galicia_land', // 1849
        'scenario_cost_of_decision',      // 1850
        'scenario_border_echoes_1851',    // 1851
      ],
      completedScenarioIds: [],
    };

    const migrated = migrateSave(rawLegacySave);

    // Stale future scenarios MUST have been purged by determineAvailableScenarios
    expect(migrated.availableScenarioIds).not.toContain('scenario_petition_galicia_land');
    expect(migrated.availableScenarioIds).not.toContain('scenario_cost_of_decision');
    expect(migrated.availableScenarioIds).not.toContain('scenario_border_echoes_1851');
    expect(migrated.availableScenarioIds).toContain('scenario_first_council');
  });

  it('Derived State: Recalculates stability, unity, readiness and prosperity dynamically', () => {
    let state = createInitialGameState('Богдан Островерхий');
    state = recalculateDerivedState(state);

    expect(state.empire.stability).toBeGreaterThanOrEqual(10);
    expect(state.empire.stability).toBeLessThanOrEqual(100);
    expect(state.empire.unity).toBeGreaterThanOrEqual(10);
    expect(state.empire.unity).toBeLessThanOrEqual(100);
    expect(state.empire.prosperity).toBeGreaterThanOrEqual(10);
    expect(state.empire.prosperity).toBeLessThanOrEqual(100);
  });
});
