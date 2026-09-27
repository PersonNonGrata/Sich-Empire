import { PsychologicalDimension } from '../psychology/types.ts';

export interface ArchetypeProfile {
  dominantTendencies: Array<{
    dimension: PsychologicalDimension;
    score: number;
    title: string;
  }>;
  secondaryTendencies: Array<{
    dimension: PsychologicalDimension;
    score: number;
    title: string;
  }>;
  tensionsAndContradictions: string[];
  recognizedStrengths: string[];
  shadowRisks: string[];
  historicalPrecedents: string[];
  tentativeArchetypeTitle: string; // e.g. "Залізний Реформатор", "Батько-Оборонець", "Козацький Стратег"
  calculatedAtYear: number;
}
