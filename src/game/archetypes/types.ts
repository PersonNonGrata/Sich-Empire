import { PsychologicalDimension } from '../psychology/types.ts';

export type ArchetypeCode =
  | 'ARCHITECT'     // АРХІТЕКТОР
  | 'GUARDIAN'      // ОХОРОНЕЦЬ
  | 'REFORMER'      // РЕФОРМАТОР
  | 'UNIFIER'       // ОБ'ЄДНУВАЧ
  | 'SOVEREIGN'     // ВОЛОДАР
  | 'CONQUEROR'     // ЗАВОЙОВНИК
  | 'LEGISLATOR'    // ЗАКОНОДАВЕЦЬ
  | 'SAGE';         // МУДРЕЦЬ

export interface ArchetypeProfile {
  archetype: string;                  // Українська назва головного архетипу
  archetypeCode: ArchetypeCode;       // Машинний код
  secondaryArchetype?: string;        // Гібридний або додатковий архетип
  summaryQuote: string;               // Лаконічна філософська формула правління
  evidence: string[];                 // Текстові докази з рішень правителя
  strength: string;                   // У чому найвища міць та чеснота
  shadow: string;                     // Тінь (глибинний ризик характеру)
  contradiction: string;              // Ключове внутрішнє протиріччя
  transformations: string[];          // Пройдені переломи та зміни стилю
  unresolvedQuestion: string;         // «Питання, на яке твоє правління ще не дало відповіді»
  keyDecisions: string[];             // Головні історичні ухвали-опори
  calculatedAtYear: number;
  crystallizationStage?: 'EMERGING' | 'FORMING' | 'CRYSTALLIZING' | 'REVEALED'; // Поступове визрівання архетипу (Етап 7)
  progressionNote?: string;           // Наративне відображення становлення (напр. «Ти починаєш часто обирати централізовані рішення»)

  // Backwards-compatible fields (used internally, not shown to user):
  dominantTendencies?: Array<{
    dimension: PsychologicalDimension;
    score: number;
    title: string;
  }>;
  secondaryTendencies?: Array<{
    dimension: PsychologicalDimension;
    score: number;
    title: string;
  }>;
  tensionsAndContradictions?: string[];
  recognizedStrengths?: string[];
  shadowRisks?: string[];
  historicalPrecedents?: string[];
  tentativeArchetypeTitle?: string;
}
