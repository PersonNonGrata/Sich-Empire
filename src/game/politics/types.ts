import { Importance } from '../../types/index.ts';
import { Condition } from '../conditions/types.ts';
import { Consequence } from '../consequences/types.ts';

export type ActorType = 'character' | 'faction' | 'region' | 'institution';

export type PoliticalReactionType = 'support' | 'neutral' | 'concern' | 'opposition' | 'crisis';

export interface PoliticalInterests {
  armyFunding: number;       // -100 to +100
  taxation: number;          // -100 to +100
  autonomy: number;          // -100 to +100
  centralization: number;    // -100 to +100
  landReform: number;        // -100 to +100
  education: number;         // -100 to +100
  tradeFreedom: number;      // -100 to +100
  freedom?: number;          // -100 to +100
  stability?: number;        // -100 to +100
  [key: string]: number | undefined;
}


export interface RedLine {
  id: string;
  label: string;
  metric: string; // e.g. 'centralization', 'autonomy', 'landReform', 'militaryStrength'
  operator: '<' | '<=' | '>' | '>=' | '==';
  threshold: number;
  consequenceDescription: string;
  severity: 'concern' | 'opposition' | 'crisis';
  crisisId?: string; // Links to a PoliticalCrisis if triggered
}

export type FactionDemandStatus = 'open' | 'fulfilled' | 'expired';

export type FactionNegotiationAction = 'concession' | 'guarantee' | 'bargain' | 'refuse';

export interface FactionDemand {
  id: string;
  factionId: string;
  title: string;
  text: string;
  domain: keyof PoliticalInterests;
  desiredDirection: -1 | 1;
  createdYear: number;
  deadlineYear: number;
  sourceDecisionId: string;
  urgency: 1 | 2 | 3;
  pressure: number;
  status: FactionDemandStatus;
  resolvedYear?: number;
  resolutionNote?: string;
}

export interface PoliticalRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  trust: number;    // -20 to +20
  respect: number;  // -20 to +20
  fear: number;     // 0 to 20
  loyalty: number;  // -20 to +20
  tension: number;  // 0 to 100
  history: Array<{
    year: number;
    delta: number;
    reason: string;
  }>;
}

export interface PoliticalActor {
  id: string;
  name: string;
  type: ActorType;
  influence: number;    // 0 to 100
  loyalty: number;      // 0 to 100
  interests: Partial<PoliticalInterests>;
  redLines: RedLine[];
  relationships?: Record<string, number>;
  currentGoals: string[];
  tags: string[];
}

export interface LegitimacyBreakdown {
  tradition: number;        // 0 to 100
  law: number;              // 0 to 100
  success: number;          // 0 to 100
  popularSupport: number;   // 0 to 100
  eliteSupport: number;     // 0 to 100
  militarySupport: number;  // 0 to 100
}

export interface PoliticalCost {
  economicCost?: number;
  militaryCost?: number;
  politicalCost?: Record<string, number>; // factionId -> loyalty change
  socialCost?: number;
  institutionalCost?: number;
  politicalWillCost?: number; // political will spent
  /** @deprecated Legacy save/scenario compatibility. */
  capitalCost?: number;
}

export interface Promise {
  id: string;
  year: number;
  text: string;
  targetFaction: string;
  targetActorId?: string;
  deadlineYear: number;
  fulfilled: boolean;
  broken: boolean;
  importance: Importance;
  conditionDescription?: string;
  targetCondition?: Condition;
  onFulfillRewards?: Consequence[];
  onBreakPenalties?: Consequence[];
}

export interface PoliticalCrisis {
  id: string;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'existential';
  sourceFactionId?: string;
  sourceRegionId?: string;
  triggeredYear: number;
  active: boolean;
  resolved: boolean;
  unlockScenarioId?: string;
  triggerConditions?: Condition[];
}

export interface Institution {
  id: string;
  name: string;
  headTitle: string;
  influence: number;   // 0 to 100
  authority: number;   // 0 to 100
  loyalty: number;     // 0 to 100
  tension: number;     // 0 to 100
  description: string;
  duties: string[];
}

export interface ProposalVote {
  proposalId: string;
  title: string;
  domain: keyof PoliticalInterests;
  requiredCapital: number;
  factionVotes: Array<{
    factionId: string;
    factionName: string;
    vote: 'support' | 'opposition' | 'abstain';
    weight: number;
    reason: string;
  }>;
  totalVotesFor: number;
  totalVotesAgainst: number;
  totalAbstain: number;
  passed: boolean;
  margin: number;
}
