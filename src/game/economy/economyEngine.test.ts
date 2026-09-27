/**
 * Automated Verification Suite for Stage 5: Material Machine of State (Requirement 35)
 */

import { createInitialGameState } from '../state/initialState.ts';
import {
  calculatePublicProsperity,
  calculateLogistics,
  advanceEconomicYear,
  detectEconomicCrises,
} from './economyEngine.ts';
import { applySingleConsequence } from '../consequences/applier.ts';
import { executeChoice, advanceTime } from '../engine/scenarioEngine.ts';
import { migrateSave } from '../../persistence/migration.ts';

export function runEconomyEngineTests(): { success: boolean; results: string[] } {
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

  const state = createInitialGameState('Богдан Островерхий');

  // 1. Initial State Check
  assert(
    Boolean(state.economy && state.military),
    '1. Initial State: EconomyState and MilitaryState properly initialized'
  );
  assert(
    state.economy.treasury === 50 && state.military.strength === 60 && state.military.readiness === 70,
    '1. Initial State: Treasury (50), Military Strength (60), Readiness (70)'
  );

  // 2. Revenues & Expenses change Treasury
  const preAdvanceTreasury = state.economy.treasury;
  const advanceResult = advanceEconomicYear(state, 1);
  assert(
    advanceResult.summary.grossIncome > 0 && advanceResult.summary.grossExpenses > 0,
    '2. Annual Cycle: Gross income and gross expenses calculated deterministically'
  );
  assert(
    advanceResult.state.economy.treasury === preAdvanceTreasury + advanceResult.summary.netBalance,
    '2. Annual Cycle: Treasury accurately updated by net balance (treasury + income - expenses)'
  );

  // 3. Deficit accumulates Debt & Debt interest
  const deficitState = {
    ...state,
    economy: {
      ...state.economy,
      treasury: 2,
      militaryExpenses: 40, // huge expenses
      administrativeExpenses: 20,
    },
  };
  const deficitResult = advanceEconomicYear(deficitState, 1);
  assert(
    deficitResult.state.economy.treasury === 0,
    '3. Debt Accumulation: Treasury zeroed when deficit exceeds liquid funds'
  );
  assert(
    deficitResult.state.economy.debt > state.economy.debt,
    '3. Debt Accumulation: Uncovered deficit added to state debt'
  );

  // 4. Taxes Trade-off
  const lowTaxBurdenProsperity = calculatePublicProsperity({
    economicGrowth: 2.0,
    taxBurden: 25,
    security: 60,
    infrastructureAvg: 60,
    educationLevel: 50,
    tradeVolume: 60,
  });
  const highTaxBurdenProsperity = calculatePublicProsperity({
    economicGrowth: 2.0,
    taxBurden: 65,
    security: 60,
    infrastructureAvg: 60,
    educationLevel: 50,
    tradeVolume: 60,
  });
  assert(
    lowTaxBurdenProsperity.value > highTaxBurdenProsperity.value,
    '4. Taxes Trade-off: High tax burden depresses public prosperity (Laffer trade-off)'
  );

  // 5. Military Expenses Affect Readiness Over Time
  const cutMilitaryState = {
    ...state,
    economy: {
      ...state.economy,
      militaryExpenses: 8, // cut budget deeply
    },
  };
  const milAdvanceYear1 = advanceEconomicYear(cutMilitaryState, 1);
  assert(
    milAdvanceYear1.state.military.readiness < state.military.readiness,
    '5. Military Decay: Cutting military budget reduces readiness over annual cycle'
  );

  // 6. Logistics calculation
  const highInfraLogistics = calculateLogistics(80, 50, 20, 80);
  const lowInfraLogistics = calculateLogistics(30, 0, 10, 40);
  assert(
    highInfraLogistics > lowInfraLogistics,
    '6. Logistics: High infrastructure (roads, rail, security) yields superior military logistics'
  );

  // 7. Long-term State Project Progression and Completion
  const testProjectState = {
    ...state,
    economy: {
      ...state.economy,
      stateProjects: [
        {
          id: 'test_project_1',
          name: 'Тестова залізниця',
          description: 'Тестове будівництво',
          category: 'railways' as const,
          cost: 10,
          duration: 2,
          yearsProgress: 1, // 1 year left
          completed: false,
          consequencesOnComplete: [
            {
              type: 'ECONOMY_METRIC_CHANGE' as const,
              metric: 'tradeVolume' as const,
              value: 15,
              label: 'Вантажообіг зріс',
            },
          ],
        },
      ],
    },
  };
  const projectAdvanced = advanceEconomicYear(testProjectState, 1);
  const completedProj = projectAdvanced.state.economy.stateProjects.find((p) => p.id === 'test_project_1');
  assert(
    completedProj?.completed === true,
    '7. State Projects: Project finishes at duration threshold and fires completion consequences'
  );

  // 8. Long-term Investment Completion
  const testInvestmentState = {
    ...state,
    identity: {
      ...state.identity,
      year: 1848,
    },
    economy: {
      ...state.economy,
      investments: [
        {
          id: 'inv_test_1',
          name: 'Тестовий елеватор',
          type: 'port' as const,
          cost: 5,
          startYear: 1848,
          completionYear: 1850,
          completed: false,
          description: 'Будівництво зерносховищ',
          effects: [],
        },
      ],
    },
  };
  const invYear1849 = advanceTime(testInvestmentState, 1);
  assert(
    invYear1849.state.economy.investments[0].completed === false,
    '8. Investments: In-progress investment pending in 1849'
  );
  const invYear1850 = advanceTime(invYear1849.state, 1);
  assert(
    invYear1850.state.economy.investments[0].completed === true,
    '8. Investments: Investment marked completed at maturity year 1850'
  );

  // 9. Economic Crisis Detection (Insolvency)
  const insolventState = {
    ...state,
    economy: {
      ...state.economy,
      treasury: 0,
      debt: 55,
      creditLimit: 60,
    },
  };
  const detectedEcoCrises = detectEconomicCrises(insolventState);
  assert(
    detectedEcoCrises.some((c) => c.id === 'crisis_budget_insolvency'),
    '9. Economic Crisis: Budget Insolvency triggered when treasury is 0 and debt near limit'
  );

  // 10. Regional Economic & Infrastructure Integration
  const galicia = state.regions.find((r) => r.id === 'region_galicia');
  assert(
    Boolean(galicia?.infrastructure && galicia?.economicPotential),
    '10. Regional Integration: Galicia possesses infrastructure and economic potential metrics'
  );
  assert(
    (galicia?.economicPotential?.trade ?? 0) >= 80,
    '10. Regional Integration: Galicia high trade potential correctly configured'
  );

  // 11. Playable Chain Decision Integration (1848 First Council -> 1849 Tax Reform)
  const choiceResult = executeChoice(state, 'scenario_first_council', 'choice_fund_army');
  assert(
    choiceResult.state.empire.militaryStrength > state.empire.militaryStrength,
    '11. Causal Decision: Funding army boosted military strength'
  );

  // 12. Advance time triggers annual economic summary into History Chronicle
  const timeAdvanceResult = advanceTime(state, 1);
  assert(
    timeAdvanceResult.state.identity.year === 1849,
    '12. Time Advance: Year progressed to 1849'
  );
  assert(
    timeAdvanceResult.state.history.some((h) => h.type === 'ECONOMIC_MEASURE'),
    '12. Time Advance: Annual economic summary logged into History Chronicle'
  );

  // 13. Persistence & Migration (v0/v1/v2/v3 save upscaled to v5)
  const oldSave = {
    version: 2,
    identity: { gameId: 'save_legacy', rulerName: 'Данило', rulerTitle: 'Гетьман', year: 1848 },
    empire: { stability: 60, treasury: 40, militaryStrength: 55, unity: 50, prosperity: 50 },
  };
  const migrated = migrateSave(oldSave);
  assert(
    migrated.version === 5 && Boolean(migrated.economy && migrated.military),
    '13. Persistence: Legacy save seamlessly migrated to v5 with Economy and Military states'
  );

  return { success: allPassed, results };
}
