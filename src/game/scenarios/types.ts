import { Importance } from '../../types/index.ts';
import { Condition } from '../conditions/types.ts';
import { Consequence } from '../consequences/types.ts';
import { HistoryEventType } from '../history/types.ts';
import { PsychologicalSignal } from '../psychology/types.ts';
import { PoliticalCost, PoliticalReactionType, PoliticalInterests } from '../politics/types.ts';
import { NarrativeCondition, NarrativePressure } from '../narrative/types.ts';

export interface Choice {
  id: string;
  text: string;
  description?: string;
  consequences: Consequence[];
  psychologicalSignals?: Array<Omit<PsychologicalSignal, 'id' | 'timestamp'>>;
  relationshipChanges?: Array<{ characterId: string; delta: number; label?: string }>;
  memoryTags?: string[]; // Reputational memory tags awarded by this choice
  historyEvent?: {
    type: HistoryEventType;
    title: string;
    description: string;
    importance: Importance;
    tags?: string[];
  };
  scheduledConsequences?: Array<{
    triggerYear: number;
    title: string;
    description: string;
    conditions?: Condition[];
    consequences: Consequence[];
    kind?: 'delayed' | 'self_created_problem';
    unlockScenarioId?: string;
  }>;
  unlocks?: string[];
  locks?: string[];
  followUpScenarioIds?: string[];
  // Stage 4 Political Machine extensions (Requirement 28):
  politicalCost?: PoliticalCost;
  politicalReactions?: Array<{
    factionId: string;
    reaction: PoliticalReactionType;
    note: string;
  }>;
  promiseEffects?: Array<{
    text: string;
    targetFaction: string;
    deadlineYear: number;
  }>;
  crisisEffects?: string[];
  proposalVoting?: {
    domain: keyof PoliticalInterests;
    impactStrength: number;
    requiredCapital: number;
  };
}

export interface ScenarioActor {
  id: string;
  name?: string;
  role: string;
  interest: string;
}

export interface ScenarioKnowledge {
  known: string[];
  uncertain: string[];
}

export interface Scenario {
  id: string;
  title: string;
  year?: number;
  location: string;
  tags: string[];
  priority?: number; // Higher priority scenarios surface first
  sequenceOrder?: number; // Order within the year (e.g. 10, 20, 30)
  required?: boolean; // If true, must be resolved before the year can conclude
  importance?: Importance;
  conditions: Condition[];
  characters: string[]; // characterIds
  speakerId?: string;
  speakerRole?: string;
  speakerQuote?: string;
  introduction: string;
  situation: string;
  // Structured case dossier fields. Optional for backwards compatibility.
  problem?: string;
  context?: string;
  actors?: ScenarioActor[];
  knowledge?: ScenarioKnowledge;
  inaction?: string;
  choices: Choice[];
  reflection?: string;
  followUp?: string;
  // Stage 7 Narrative Ascension extensions:
  narrativeConditions?: NarrativeCondition[];
  blockedNarrativeConditions?: NarrativeCondition[];
  narrativePressures?: NarrativePressure[];
  narrativeEcho?: string;
  narrativeMirrorId?: string;
  // Stage 4 Political Machine extensions:
  politicalActors?: string[];
  requiredFaction?: string;
  requiredRegion?: string;
  requiredInstitution?: string;
}

