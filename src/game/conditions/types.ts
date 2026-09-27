import { EmpireMetric } from '../consequences/types.ts';
import { PsychologicalDimension } from '../psychology/types.ts';
import { HistoryEventType } from '../history/types.ts';

export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '==' | '!=';

export type Condition =
  | {
      type: 'METRIC';
      metric: EmpireMetric;
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'YEAR';
      operator?: ComparisonOperator;
      value?: number;
      minYear?: number;
      maxYear?: number;
    }
  | {
      type: 'REGION';
      regionId: string;
      metric: 'stability' | 'loyalty' | 'prosperity' | 'unrest' | 'tension' | 'autonomy' | 'garrisonStrength';
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'FACTION';
      factionId: string;
      metric: 'influence' | 'loyalty' | 'tension';
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'RELATIONSHIP' | 'CHARACTER_RELATIONSHIP';
      characterId: string;
      metric?: 'overall' | 'trust' | 'respect' | 'fear' | 'loyalty';
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'HAS_DECISION';
      choiceId?: string;
      scenarioId?: string;
      tag?: string;
    }
  | {
      type: 'HAS_NOT_DECISION';
      choiceId?: string;
      scenarioId?: string;
      tag?: string;
    }
  | {
      type: 'SCENARIO_COMPLETED';
      scenarioId: string;
    }
  | {
      type: 'SCENARIO_NOT_COMPLETED';
      scenarioId: string;
    }
  | {
      type: 'HAS_FLAG';
      flag: string;
      value?: boolean | string | number;
      operator?: ComparisonOperator;
    }
  | {
      type: 'HAS_HISTORY_EVENT';
      eventType?: HistoryEventType;
      tag?: string;
      eventId?: string;
    }
  | {
      type: 'HAS_DISCOVERY';
      discoveryId: string;
    }
  | {
      type: 'TENSION';
      key: string;
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'PSYCHOLOGY';
      dimension: PsychologicalDimension;
      operator: ComparisonOperator;
      value: number;
    }
  | {
      type: 'SCHEDULED_CONSEQUENCE';
      id?: string;
      status: 'pending' | 'resolved';
    }
  | {
      type: 'AND';
      conditions: Condition[];
    }
  | {
      type: 'OR';
      conditions: Condition[];
    }
  | {
      type: 'NOT';
      condition: Condition;
    };
