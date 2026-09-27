import { Importance } from '../../types/index.ts';

export type HistoryEventType =
  | 'COUNCIL_DECISION'
  | 'REFORM'
  | 'MILITARY_ACT'
  | 'DIPLOMATIC_PACT'
  | 'ECONOMIC_MEASURE'
  | 'CRISIS_RESOLVED'
  | 'CRISIS_TRIGGERED'
  | 'PROMISE_MADE'
  | 'PROMISE_BROKEN'
  | 'PROMISE_FULFILLED'
  | 'CONSEQUENCE_TRIGGERED'
  | 'DISCOVERY'
  | 'DYNASTIC_EVENT';

export type ChronicleFilterCategory =
  | 'all'
  | 'decision'
  | 'character'
  | 'faction'
  | 'region'
  | 'crisis'
  | 'promise';

export interface HistoryEvent {
  id: string;
  year: number;
  timestamp: number;
  type: HistoryEventType;
  title: string;
  description: string;
  sourceDecisionId?: string;
  scenarioId?: string;
  importance: Importance;
  consequencesSummary?: string[];
  tags: string[];
  // Causal Chain & Filter metadata (Requirement 27)
  category?: ChronicleFilterCategory;
  causalParentId?: string;       // ID of previous event that triggered this
  causalRootDecisionId?: string; // ID of original decision
  causalChainNote?: string;      // Human-readable chain summary (e.g. "Рішення 1848 → Втрата довіри 1849 → Криза 1851")
  actors?: string[];
  factions?: string[];
  regions?: string[];
}

