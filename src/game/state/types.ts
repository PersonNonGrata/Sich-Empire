import { Character, DecisionRecord, Faction, Region, Tension, ImperialEvent } from '../../types/index.ts';
import { ArchetypeProfile } from '../archetypes/types.ts';
import { ScheduledConsequence } from '../consequences/types.ts';
import { HistoryEvent } from '../history/types.ts';
import {
  PsychologicalSignal,
  BehaviorPattern,
  Contradiction,
  Reflection,
  Insight,
  StressTest,
  TransformationEvent,
  AscensionStage,
  PsychologicalTensionRecord,
} from '../psychology/types.ts';
import { NarrativeMirror, MemoryTag, HistoricalReputationSignal } from '../narrative/types.ts';
import {
  LegitimacyBreakdown,
  Institution,
  Promise,
  PoliticalCrisis,
  PoliticalRelationship,
  ProposalVote,
} from '../politics/types.ts';
import { EconomyState } from '../economy/types.ts';
import { MilitaryState } from '../military/types.ts';

export interface EmpireIdentity {
  gameId: string;
  rulerName: string;
  rulerTitle: string;
  year: number;
}

export interface EmpireMetrics {
  stability: number;       // 0 - 100
  treasury: number;        // integer / millions karbovantsi or index
  militaryStrength: number;// 0 - 100
  unity: number;           // 0 - 100
  prosperity: number;      // 0 - 100
}

export interface YearProgress {
  year: number;
  completedScenarioIds: string[];
  resolvedScenarioCount: number;
  totalRequiredScenarios: number;
  yearStartMetrics?: EmpireMetrics;
}

export interface YearSummaryData {
  year: number;
  startMetrics: EmpireMetrics;
  endMetrics: EmpireMetrics;
  decisionsCount: number;
  decisionsTitles: string[];
  importantEventsCount: number;
  delayedConsequencesCount: number;
  politicalHighlights: string[];
  economicHighlights: string[];
}

export interface GameState {
  version: number; // For schema migrations (e.g. 1, 2, 3)

  identity: EmpireIdentity;
  empire: EmpireMetrics;

  // Stage 5 Material Machine Core
  economy: EconomyState;
  military: MilitaryState;

  // Stage 4 Political Machine Core
  politicalWill: number;
  /** @deprecated Legacy save compatibility only. */
  politicalCapital?: number;              // 0 - 100 (Hetman capacity to act)
  legitimacy: LegitimacyBreakdown;       // Multi-component legitimacy
  institutions: Institution[];           // Key state institutions
  promises: Promise[];                   // Hetman oaths & deadlines
  crises: PoliticalCrisis[];             // Active and resolved political crises
  politicalRelationships?: PoliticalRelationship[]; // Universal entity relationships
  activeProposal?: ProposalVote | null;  // Current Great Council vote in progress

  regions: Region[];
  factions: Faction[];
  characters: Character[];

  relationships: Record<string, number>; // characterId -> score (-100 to +100) or overall trust
  decisions: DecisionRecord[];
  consequences: ScheduledConsequence[]; // Pending & past scheduled consequences
  scheduledConsequences?: ScheduledConsequence[]; // Alias for consequences
  history: HistoryEvent[];
  psychology: PsychologicalSignal[];
  tensions: Record<string, number>; // key -> intensity (0 - 100)
  tensionRecords?: Tension[]; // Rich dual-pole tension systems
  discoveries: string[];
  flags: Record<string, boolean | string | number>; // Persistent world flags
  reputationTags?: string[]; // Historical Reputation & Memory Tags (Stage 7 - legacy string list)
  memoryTags?: MemoryTag[]; // Structured Memory Tags (Stage 7)
  reputationSignals?: HistoricalReputationSignal[]; // Historical Reputation Signals perceived across the realm (Stage 7)
  narrativeMirrors?: NarrativeMirror[]; // Triggered historical reflection mirrors (Stage 7)

  eventQueue?: ImperialEvent[]; // Sequential event queue for reveals

  currentScenarioId: string | null;
  completedScenarioIds: string[];
  availableScenarioIds: string[];

  yearProgress?: YearProgress;
  yearSummary?: YearSummaryData | null;

  unlockedScenarioIds: string[]; // Explicitly unlocked by choices
  lockedScenarioIds: string[];   // Explicitly locked by choices

  archetypeProfile: ArchetypeProfile;

  // Stage 6 Psychological Ascension Core (Requirements 5, 7, 8, 9, 11, 12, 13, 14)
  behaviorPatterns: BehaviorPattern[];
  contradictions: Contradiction[];
  psychologicalTensions?: PsychologicalTensionRecord[];
  reflections: Reflection[];
  insights: Insight[];
  stressTests: StressTest[];
  transformations: TransformationEvent[];
  ascensionStage: AscensionStage;

  lastSavedTimestamp?: number;
}

