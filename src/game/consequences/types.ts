import { HistoryEventType } from '../history/types.ts';
import { PsychologicalDimension, DecisionContext } from '../psychology/types.ts';
import { Importance } from '../../types/index.ts';
import type { Condition } from '../conditions/types.ts';
import type { TaxPolicy, StateProject, Investment, EconomicCrisis } from '../economy/types.ts';

export type EmpireMetric =
  | 'stability'
  | 'treasury'
  | 'militaryStrength'
  | 'unity'
  | 'prosperity';

export type Consequence =
  | {
      type: 'EMPIRE_METRIC_CHANGE' | 'STATE_CHANGE';
      metric: EmpireMetric;
      value: number; // e.g. +5, -10
      label?: string;
    }
  | {
      type: 'RELATIONSHIP_CHANGE';
      characterId: string;
      value?: number; // general relationship delta
      trustChange?: number; // -20 to +20 delta
      respectChange?: number; // -20 to +20 delta
      fearChange?: number; // 0 to 20 delta
      loyaltyChange?: number; // -20 to +20 delta
      label?: string;
      reason?: string;
    }
  | {
      type: 'PSYCHOLOGICAL_SIGNAL';
      dimension: PsychologicalDimension;
      value: number;
      context?: DecisionContext;
      contextNote?: string;
    }
  | {
      type: 'ADD_HISTORY_EVENT' | 'HISTORY_EVENT';
      eventType: HistoryEventType;
      title: string;
      description: string;
      importance: Importance;
      tags?: string[];
    }
  | {
      type: 'SCHEDULE_CONSEQUENCE' | 'SCHEDULE_EVENT';
      consequenceData: Omit<ScheduledConsequence, 'id' | 'sourceDecisionId' | 'resolved'>;
    }
  | {
      type: 'ADD_TENSION' | 'TENSION';
      key: string;
      value: number; // delta to tension
      poleA?: string;
      poleB?: string;
      label?: string;
      reason?: string;
    }
  | {
      type: 'FLAG';
      flag: string;
      value: boolean | string | number;
      label?: string;
    }
  | {
      type: 'UNLOCK_SCENARIO';
      scenarioId: string;
    }
  | {
      type: 'LOCK_SCENARIO';
      scenarioId: string;
    }
  | {
      type: 'ADD_DISCOVERY';
      discoveryId: string;
      label: string;
    }
  | {
      type: 'ADD_MEMORY_TAG' | 'MEMORY_TAG';
      tag: string;
      characterId?: string;
      label?: string;
    }
  | {
      type: 'REGION_CHANGE';
      regionId: string;
      stabilityChange?: number;
      loyaltyChange?: number;
      prosperityChange?: number;
      unrestChange?: number;
      tensionChange?: number;
      autonomyChange?: number;
      label?: string;
    }
  | {
      type: 'FACTION_CHANGE';
      factionId: string;
      influenceChange?: number;
      loyaltyChange?: number;
      tensionChange?: number;
      wealthChange?: number;
      politicalPowerChange?: number;
      label?: string;
    }
  | {
      type: 'POLITICAL_CAPITAL_CHANGE' | 'POLITICAL_WILL_CHANGE';
      value: number; // e.g. +5, -10
      label?: string;
      reason?: string;
    }
  | {
      type: 'LEGITIMACY_CHANGE';
      pillar?: 'tradition' | 'law' | 'success' | 'popularSupport' | 'eliteSupport' | 'militarySupport';
      value: number; // e.g. +4, -8
      label?: string;
    }
  | {
      type: 'CREATE_PROMISE';
      promise: {
        id?: string;
        text: string;
        targetFaction: string;
        deadlineYear: number;
        importance?: Importance;
        conditionDescription?: string;
      };
      label?: string;
    }
  | {
      type: 'FULFILL_PROMISE';
      promiseId: string;
      label?: string;
    }
  | {
      type: 'BREAK_PROMISE';
      promiseId: string;
      label?: string;
    }
  | {
      type: 'INSTITUTION_CHANGE';
      institutionId: string;
      influenceChange?: number;
      authorityChange?: number;
      loyaltyChange?: number;
      tensionChange?: number;
      label?: string;
    }
  | {
      type: 'TRIGGER_CRISIS';
      crisisId: string;
      title: string;
      description: string;
      severity?: 'moderate' | 'severe' | 'existential';
      unlockScenarioId?: string;
    }
  | {
      type: 'RESOLVE_CRISIS';
      crisisId: string;
      resolutionNote?: string;
    }
  | {
      type: 'POLITICAL_COST';
      cost: {
        economicCost?: number;
        militaryCost?: number;
        politicalCost?: Record<string, number>;
        socialCost?: number;
        institutionalCost?: number;
        capitalCost?: number;
      };
      label?: string;
    }
  | {
      type: 'ADVANCE_YEAR' | 'YEAR_ADVANCE';
      deltaYears: number;
    }
  | {
      type: 'ECONOMY_METRIC_CHANGE';
      metric:
        | 'treasury'
        | 'debt'
        | 'taxBurden'
        | 'taxEfficiency'
        | 'inflation'
        | 'economicGrowth'
        | 'publicProsperity'
        | 'militaryExpenses'
        | 'administrativeExpenses'
        | 'educationExpenses'
        | 'infrastructureExpenses'
        | 'taxRevenue'
        | 'tradeRevenue'
        | 'tradeVolume'
        | 'tradeFreedom'
        | 'portEfficiency'
        | 'tariffsRate';
      value: number;
      label?: string;
    }
  | {
      type: 'TAX_POLICY_CHANGE';
      policy: TaxPolicy;
      burdenChange?: number;
      label?: string;
    }
  | {
      type: 'MILITARY_METRIC_CHANGE';
      metric:
        | 'strength'
        | 'readiness'
        | 'morale'
        | 'manpower'
        | 'equipment'
        | 'logistics'
        | 'militaryExpenses'
        | 'officerLoyalty'
        | 'veteranInfluence';
      value: number;
      label?: string;
    }
  | {
      type: 'START_STATE_PROJECT';
      project: StateProject;
      label?: string;
    }
  | {
      type: 'START_INVESTMENT';
      investment: Investment;
      label?: string;
    }
  | {
      type: 'TRIGGER_ECONOMIC_CRISIS';
      crisis: EconomicCrisis;
    }
  | {
      type: 'RESOLVE_ECONOMIC_CRISIS';
      crisisId: string;
      resolutionNote?: string;
    };


export interface ScheduledConsequence {
  id: string;
  sourceDecisionId: string;
  sourceScenarioId?: string;
  sourceScenarioTitle?: string;
  sourceYear?: number;
  triggerYear: number;
  title: string;
  description: string;
  conditions?: Condition[];
  consequences: Consequence[];
  resolved: boolean;
  /** Identifies consequences that intentionally create a later political problem. */
  kind?: 'delayed' | 'self_created_problem';
  /** Scenario to unlock when this consequence matures. */
  unlockScenarioId?: string;
  resolvedYear?: number;
  resolutionNote?: string;
}
