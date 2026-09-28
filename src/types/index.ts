// General Core Types for Sich Empire

export type Importance = 'minor' | 'standard' | 'major' | 'critical';

export interface RegionInfrastructure {
  roads: number;          // 0 - 100
  ports: number;          // 0 - 100
  railways: number;       // 0 - 100
  administration: number; // 0 - 100
}

export interface RegionEconomicPotential {
  trade: number;          // 0 - 100
  tax: number;            // 0 - 100
  resources: number;      // 0 - 100
  industry: number;       // 0 - 100
}

export interface Region {
  id: string;
  name: string;
  stability: number; // 0 - 100
  loyalty: number; // 0 - 100 (aligned with stability)
  prosperity: number; // 0 - 100
  unrest: number; // 0 - 100
  tension: number; // 0 - 100 (unrest/tension)
  autonomy: number; // 0 - 100
  garrisonStrength: number; // 0 - 100
  description: string;
  // Stage 4 Political Machine extensions:
  population?: string;
  wealth?: number;
  security?: number;
  cultureTags?: string[];
  dominantFactions?: string[];
  // Stage 5 Material Machine extensions:
  taxContribution?: number;   // Projected annual tax yield in mln
  tradeContribution?: number; // Regional trade turnover index
  infrastructure?: RegionInfrastructure;
  economicPotential?: RegionEconomicPotential;
}

export interface Faction {
  id: string;
  name: string;
  influence: number; // 0 - 100
  loyalty: number; // 0 - 100
  tension: number; // 0 - 100
  leaderName: string;
  ideology: string;
  description: string;
  // Stage 4 Political Machine extensions:
  wealth?: number;
  politicalPower?: number;
  interests?: Record<string, number | undefined>;
  redLines?: Array<{

    id: string;
    label: string;
    metric: string;
    operator: '<' | '<=' | '>' | '>=' | '==';
    threshold: number;
    consequenceDescription: string;
    severity: 'concern' | 'opposition' | 'crisis';
    crisisId?: string;
  }>;
  tags?: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  factionId?: string;
  regionId?: string;
  influence: number; // 0 - 100
  trust: number; // -20 to +20
  respect: number; // -20 to +20
  fear: number; // 0 to 20
  loyalty: number; // -20 to +20
  tags?: string[];
  memoryTags?: string[]; // Reputational memory tags this character holds about the Hetman
  expectation?: string;  // Current expectation from the Hetman (e.g. "Очікує захисту традицій")
  avatarSeed?: string;
  bio: string;
  interests?: string[];
  relationships?: Record<string, number>;
  interactionHistory?: Array<{
    year: number;
    scenarioId?: string;
    choiceText?: string;
    note: string;
  }>;
}

export interface UniversalRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  trust: number;    // -20 to +20
  respect: number;  // -20 to +20
  fear: number;     // 0 to 20
  loyalty: number;  // -20 to +20
  tension: number;  // 0 to 100
  history?: Array<{
    year: number;
    delta: number;
    reason: string;
  }>;
}

export interface DecisionRecord {
  id: string;
  scenarioId: string;
  choiceId: string;
  year: number;
  timestamp: number;
  choiceText: string;
  title?: string;
  summary: string;
  actors?: string[];
  regions?: string[];
  factions?: string[];
  stateEffects?: string[];
  psychologicalSignals?: string[];
  importance?: Importance;
  tags?: string[];
  causedEventIds?: string[];
}

export interface Tension {
  id: string;
  poleA: string; // e.g. "СВОБОДА"
  poleB: string; // e.g. "ПОРЯДОК"
  value: number; // 0 - 100, where 50 is equilibrium
  source?: string;
  history?: Array<{
    year: number;
    delta: number;
    reason: string;
  }>;
}

export interface ImperialEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  source: string;
  consequencesSummary?: string[];
  relatedDecisionId?: string;
  relatedScenarioId?: string;
  timestamp: number;
  dismissed?: boolean;
}

