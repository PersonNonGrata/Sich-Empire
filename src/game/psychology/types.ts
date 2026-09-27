export type PsychologicalDimension =
  | 'ORDER'          // Порядок
  | 'FREEDOM'        // Свобода
  | 'RISK'           // Ризик / Сміливість
  | 'KNOWLEDGE'      // Знання / Раціональність
  | 'POWER'          // Влада / Воля до панування
  | 'TRADITION'      // Традиція / Родовід
  | 'CREATION'       // Творення / Інновація
  | 'RESPONSIBILITY' // Відповідальність / Тягар
  | 'MERCY'          // Милосердя / Гуманність
  | 'JUSTICE'        // Справедливість / Закон
  | 'CENTRALIZATION' // Централізація
  | 'AUTONOMY'       // Автономія / Козацька вольниця
  | 'SECURITY'       // Безпека / Захист рубежів
  | 'ECONOMY';       // Ощадливість / Господарність

export interface PsychologicalSignal {
  id: string;
  dimension: PsychologicalDimension;
  value: number; // e.g. +1, +2, -1
  sourceDecisionId?: string;
  scenarioId?: string;
  timestamp: number;
  contextNote?: string;
}

export type PsychologicalSummary = Record<PsychologicalDimension, number>;
