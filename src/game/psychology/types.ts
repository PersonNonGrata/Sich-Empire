export type PsychologicalDimension =
  // Stage 6 Primary 10 Dimensions (Requirement 2)
  | 'WILL'           // Воля
  | 'FREEDOM'        // Свобода
  | 'ORDER'          // Порядок
  | 'POWER'          // Сила / Влада
  | 'KNOWLEDGE'      // Знання
  | 'RESPONSIBILITY' // Відповідальність
  | 'CREATION'       // Творення
  | 'TRADITION'      // Традиція
  | 'COMPASSION'     // Співчуття
  | 'DOMINANCE'      // Домінування
  // Compatible secondary dimensions
  | 'RISK'           // Ризик / Сміливість
  | 'MERCY'          // Милосердя (alias for COMPASSION)
  | 'JUSTICE'        // Справедливість / Закон
  | 'CENTRALIZATION' // Централізація
  | 'AUTONOMY'       // Автономія
  | 'SECURITY'       // Безпека
  | 'ECONOMY';       // Ощадливість / Скарб

export type DecisionContext =
  | 'war'
  | 'crisis'
  | 'peace'
  | 'economic'
  | 'political'
  | 'personal'
  | 'regional'
  | 'moral';

export interface PsychologicalSignal {
  id: string;
  dimension: PsychologicalDimension;
  value: number; // e.g. +1, +2, -1
  context?: DecisionContext;
  sourceDecisionId?: string;
  scenarioId?: string;
  timestamp: number;
  contextNote?: string;
}

export type PsychologicalSummary = Record<PsychologicalDimension, number>;

// Stage 6 Ascension Sequence (Requirement 13)
export type AscensionStage =
  | 'EXPERIENCE'     // Досвід
  | 'PATTERN'        // Патерн
  | 'TENSION'        // Напруга
  | 'REFLECTION'     // Відображення
  | 'INSIGHT'        // Усвідомлення
  | 'STRESS_TEST'    // Випробування
  | 'TRANSFORMATION';// Трансформація

// Stage 6 Behavior Pattern (Requirement 5)
export interface BehaviorPattern {
  id: string;
  dimension: PsychologicalDimension;
  title: string;
  description: string;
  strength: number;      // Internal engine weight (not shown to user)
  frequency: number;     // How many times observed
  consistency: number;   // 0 to 1
  firstObservedYear: number;
  lastObservedYear: number;
  decisionCount: number;
  contexts: DecisionContext[];
  relatedDecisions: string[];
  contradictions: string[];
}

// Stage 6 Contradiction (Requirement 7)
export interface Contradiction {
  id: string;
  poleA: PsychologicalDimension;
  poleB: PsychologicalDimension;
  title: string;
  description: string;
  intensity: number;
  detectedYear: number;
  evidenceA: string[];
  evidenceB: string[];
  unresolvedQuestion: string;
}

// Stage 6 Dual Tension (Requirement 8)
export interface PsychologicalTensionRecord {
  id: string;
  poleA: PsychologicalDimension;
  poleB: PsychologicalDimension;
  labelA: string;
  labelB: string;
  value: number; // -100 (poleA) to +100 (poleB), or 0-100 balance
  balanceState: 'equipoise' | 'leaning_a' | 'leaning_b' | 'acute_crisis';
  description: string;
  evidence: string[];
}

// Stage 6 Reflection & Agreement/Disagreement (Requirements 9 & 10)
export type ReflectionResponse = 'AGREE' | 'PARTIAL' | 'DISAGREE';

export interface Reflection {
  id: string;
  title: string;
  observation: string;
  triggerYear: number;
  relatedPatternIds: string[];
  relatedContradictionId?: string;
  relatedDecisionIds: string[];
  status: 'pending' | 'confirmed' | 'partially_confirmed' | 'disputed';
  playerResponse?: ReflectionResponse;
  playerResponseYear?: number;
  playerNote?: string;
}

// Stage 6 Insight (Requirement 11)
export interface Insight {
  id: string;
  title: string;
  text: string;
  year: number;
  basis: string;
  relatedDecisionIds: string[];
  active: boolean;
}

// Stage 6 Stress Test (Requirement 12)
export interface StressTest {
  id: string;
  scenarioId: string;
  testedPatternId: string;
  testedDimension: PsychologicalDimension;
  opposingDimension: PsychologicalDimension;
  title: string;
  premise: string;
  targetChoiceOldModel: string;
  targetChoiceNewModel: string;
  status: 'pending' | 'passed_retained' | 'passed_transformed';
  yearTriggered: number;
  yearResolved?: number;
  resolutionNote?: string;
}

// Stage 6 Transformation Event (Requirement 14)
export interface TransformationEvent {
  id: string;
  year: number;
  title: string;
  fromState: string;
  toState: string;
  description: string;
  catalystDecisionId: string;
  stressTestId?: string;
  chronicleEntryId?: string;
}
