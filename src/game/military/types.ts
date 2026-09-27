export interface MilitaryTrends {
  strength: number;
  strengthReason: string;
  readiness: number;
  readinessReason: string;
  morale: number;
  moraleReason: string;
  logistics: number;
  logisticsReason: string;
}

export interface MilitaryState {
  strength: number;         // 0 - 100 (Potential military capacity, artillery parks, fortresses)
  readiness: number;        // 0 - 100 (Immediate field combat readiness and mobilization)
  morale: number;           // 0 - 100 (Cossack fighting spirit and loyalty)
  manpower: number;         // 0 - 100 (Registered cossacks & recruitment pool)
  equipment: number;        // 0 - 100 (Arsenal state, rifles, powder, cannons)
  logistics: number;        // 0 - 100 (Supply lines, wagon trains, transport capacity)
  militaryExpenses: number; // Current annual budget allocated (mln)
  officerLoyalty: number;   // 0 - 100 (General staff & colonels loyalty)
  veteranInfluence: number; // 0 - 100 (Sich kuren elders influence)
  trends: MilitaryTrends;
}
