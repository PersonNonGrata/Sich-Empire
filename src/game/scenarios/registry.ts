import { Scenario } from './types.ts';
import { councilMeetingScenario } from './data/councilMeeting.ts';
import { voicesOfCouncilScenario } from './data/voicesOfCouncil.ts';
import { militaryTreasury1848Scenario } from './data/militaryTreasury1848.ts';
import { costOfDecisionScenario } from './data/costOfDecision.ts';
import { borderEchoesScenario } from './data/borderEchoes.ts';
import { newCouncilScenario } from './data/newCouncil.ts';
import { militaryReformInspectionScenario } from './data/militaryReformInspection.ts';
import { oldSichCrisisScenario } from './data/oldSichCrisis.ts';
import { galiciaPetitionScenario } from './data/galiciaPetition.ts';
import { taxReform1849Scenario } from './data/taxReform1849.ts';
import { railwayCredit1850Scenario } from './data/railwayCredit1850.ts';
import { portTariffs1851Scenario } from './data/portTariffs1851.ts';
import { tradeLaw1852Scenario } from './data/tradeLaw1852.ts';
import { railwayOpening1853Scenario } from './data/railwayOpening1853.ts';
import { budgetCrisisScenario, tradeCollapseScenario } from './data/economicCrisesScenarios.ts';

/**
 * SCENARIO REGISTRY
 * To add new scenarios in the future, simply import them and append to the allScenarios array!
 */
export const allScenarios: Scenario[] = [
  councilMeetingScenario,
  voicesOfCouncilScenario,
  militaryTreasury1848Scenario,
  galiciaPetitionScenario,
  costOfDecisionScenario,
  oldSichCrisisScenario,
  borderEchoesScenario,
  newCouncilScenario,
  militaryReformInspectionScenario,
  taxReform1849Scenario,
  railwayCredit1850Scenario,
  portTariffs1851Scenario,
  tradeLaw1852Scenario,
  railwayOpening1853Scenario,
  budgetCrisisScenario,
  tradeCollapseScenario,
];


export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find((s) => s.id === id);
}

export function getAllScenarios(): Scenario[] {
  return [...allScenarios];
}
