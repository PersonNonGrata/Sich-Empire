import { Consequence } from '../consequences/types.ts';

export type TaxPolicy = 'low' | 'moderate' | 'high' | 'draconian';

export interface TradeState {
  tradeVolume: number;         // 0 - 100 (Trade activity index)
  tradeFreedom: number;        // 0 - 100 (Freedom vs state monopolies)
  portEfficiency: number;      // 0 - 100 (Black Sea & Dnieper ports)
  merchantInfluence: number;   // 0 - 100
  customsRevenue: number;      // Mln karbovantsi annual
  tariffsRate: number;         // 0 - 100 (% import/export duty)
}

export interface Investment {
  id: string;
  name: string;
  type: 'railway' | 'port' | 'arsenal' | 'university' | 'roads';
  cost: number;                // Initial or annual capital cost in mln
  startYear: number;
  completionYear: number;
  regionId?: string;
  completed: boolean;
  description: string;
  effects: Consequence[];
}

export interface StateProject {
  id: string;
  name: string;
  description: string;
  category: 'railways' | 'military_reform' | 'university' | 'port_modernization' | 'fortifications';
  cost: number;                // Total budget commitment (mln)
  duration: number;            // Total years to complete
  yearsProgress: number;       // Elapsed years
  completed: boolean;
  politicalCost?: Record<string, number>; // Faction loyalty changes
  economicEffects?: {
    tradeRevenueDelta?: number;
    taxRevenueDelta?: number;
    growthDelta?: number;
    prosperityDelta?: number;
  };
  militaryEffects?: {
    strengthDelta?: number;
    readinessDelta?: number;
    logisticsDelta?: number;
  };
  regionalEffects?: Array<{
    regionId: string;
    prosperityChange?: number;
    stabilityChange?: number;
    tradeChange?: number;
  }>;
  consequencesOnComplete: Consequence[];
}

export interface EconomicCrisis {
  id: string;
  title: string;
  description: string;
  type: 'budget_deficit' | 'debt_default' | 'inflation_spiral' | 'trade_collapse' | 'military_decay';
  severity: 'moderate' | 'severe' | 'existential';
  triggeredYear: number;
  active: boolean;
  resolved: boolean;
  unlockScenarioId?: string;
}

export interface EconomicAnnualSummary {
  year: number;
  grossIncome: number;
  grossExpenses: number;
  netBalance: number;
  taxRevenue: number;
  tradeRevenue: number;
  resourceRevenue: number;
  customsRevenue: number;
  extraordinaryRevenue: number;
  militaryExpenses: number;
  administrativeExpenses: number;
  infrastructureExpenses: number;
  educationExpenses: number;
  debtInterest: number;
  debtChange: number;
  prosperityChange: number;
  growthChange: number;
  notes: string[];
}

export interface EconomicTrends {
  treasury: number;
  treasuryReason: string;
  prosperity: number;
  prosperityReason: string;
  debt: number;
  debtReason: string;
  growth: number;
  growthReason: string;
}

export interface EconomyState {
  treasury: number;              // Mln karbovantsi in central vault
  income: number;                // Total projected annual revenue
  expenses: number;              // Total projected annual expenditure
  taxRevenue: number;            // Taxes from communities, estates, guilds
  tradeRevenue: number;          // Inland & river trade returns
  resourceRevenue: number;       // Salt mines, timber, iron ores, grain
  customsRevenue: number;        // Port duties and border tariffs
  extraordinaryRevenue: number;  // Special contributions or subsidies
  
  militaryExpenses: number;      // Army and fleet upkeep
  administrativeExpenses: number;// Judicial, chancellery, prefectures
  infrastructureExpenses: number;// Postal routes, canals, roads
  educationExpenses: number;     // Academies, schools, technical workshops
  emergencyExpenses: number;     // Famine or crisis relief
  
  debt: number;                  // Outstanding sovereign loans
  debtInterest: number;          // Annual rate (%) and interest payment
  creditLimit: number;           // Borrowing ceiling before default
  
  inflation: number;             // % annual inflation pressure
  economicGrowth: number;        // % annual economic expansion
  publicProsperity: number;      // 0 - 100 overall population welfare
  taxBurden: number;             // 0 - 100 (30-40 optimal, >50 heavy)
  taxEfficiency: number;         // 0 - 100 fiscal collection apparatus
  taxPolicy: TaxPolicy;
  
  trade: TradeState;
  
  educationLevel: number;        // 0 - 100 national educational index
  educationInvestment: number;   // Current investment level (mln)
  humanCapital: number;          // 0 - 100 scientific and engineering depth
  
  investments: Investment[];
  stateProjects: StateProject[];
  crises: EconomicCrisis[];
  annualSummary?: EconomicAnnualSummary;
  trends: EconomicTrends;
}
