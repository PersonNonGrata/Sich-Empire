import { PsychologicalDimension, DecisionContext } from '../psychology/types.ts';
import { ComparisonOperator } from '../conditions/types.ts';
import { Consequence } from '../consequences/types.ts';
import { ArchetypeCode } from '../archetypes/types.ts';
import { PoliticalReactionType } from '../politics/types.ts';
import { Choice } from '../scenarios/types.ts';

/**
 * Stage 7 — Narrative Ascension Engine Types
 */

export type NarrativeConditionType =
  | 'HAS_PATTERN'
  | 'HAS_DIMENSION'
  | 'HAS_TENSION'
  | 'HAS_ARCHETYPE'
  | 'HAS_MEMORY_TAG'
  | 'HAS_NOT_MEMORY_TAG'
  | 'HAS_CONTRADICTION'
  | 'HAS_TRANSFORMATION'
  | 'HAS_STRESS_TEST'
  | 'MINIMUM_EVIDENCE'
  | 'CONTEXT_EVIDENCE';

export interface NarrativeCondition {
  type: NarrativeConditionType;
  dimension?: PsychologicalDimension;
  pattern?: string;               // e.g. 'pattern_order_in_crisis', 'pattern_creation_reforms'
  tension?: string;               // tension id/key
  tensionMin?: number;
  tensionMax?: number;
  archetype?: ArchetypeCode | string;
  memoryTag?: string;             // e.g. "Заступився за громади", "Встановив столичний нагляд"
  minimumEvidence?: number;
  requiredContext?: DecisionContext;
  operator?: ComparisonOperator;
  value?: number;
  consequence?: Consequence;
}

export interface SpeakerModifier {
  speakerQuote: string;
  speakerMood?: string;
  speakerNote?: string;
}

export interface NarrativePressure {
  id: string;
  sourcePatternOrTag: string;
  condition: NarrativeCondition;
  impactDescription: string;      // The narrative description explaining how past choices exert pressure on this situation
  speakerModifier?: SpeakerModifier;
  additionalChoices?: Choice[];
  blockedChoiceIds?: string[];
  alteredReactions?: Record<string, { reaction: PoliticalReactionType; note: string }>;
}

export interface NarrativeMirror {
  id: string;
  year: number;
  title: string;
  text: string;
  reflectionPrompt?: string;
  condition: NarrativeCondition;
  triggeredByPattern?: string;
  triggeredByTag?: string;
  triggeredByTension?: string;
  shown: boolean;
}

/**
 * Historical Reputation Signals and Structured Memory Tags
 */
export type ReputationCategory =
  | 'authority'      // Влада та централізація
  | 'military'       // Військо та сила
  | 'civic'          // Громади та вольності
  | 'economic'       // Скарбниця, мита, комерція
  | 'tradition'      // Стара Січ, звичаєве право
  | 'diplomacy'      // Зовнішні союзи та пакти
  | 'character';     // Честь, клятви, моральний вибір

export interface MemoryTag {
  id: string;
  label: string;
  category: ReputationCategory;
  year: number;
  decisionId: string;
  scenarioId: string;
  choiceId: string;
  significance: 'epochal' | 'major' | 'standard';
  affectedFactionIds?: string[];
  affectedCharacterIds?: string[];
  characterAttitudeDeltas?: {
    trustDelta?: number;
    respectDelta?: number;
    fearDelta?: number;
    loyaltyDelta?: number;
  };
  narrativeEcho?: string;
}

export interface HistoricalReputationSignal {
  id: string;
  tagId: string;
  tagLabel: string;
  category: ReputationCategory;
  year: number;
  sourceDecisionTitle: string;
  perceivedBy: string;
  sentiment: 'positive' | 'negative' | 'wary' | 'reverent';
  summaryQuote: string;
  proposalImpact: string;
}
