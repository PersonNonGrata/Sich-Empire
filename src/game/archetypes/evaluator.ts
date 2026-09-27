import { ArchetypeProfile } from './types.ts';
import { GameState } from '../state/types.ts';
import { DIMENSION_DETAILS, getPsychologicalSummary } from '../psychology/manager.ts';
import { PsychologicalDimension } from '../psychology/types.ts';

export function evaluateArchetypeProfile(state: GameState): ArchetypeProfile {
  const summary = getPsychologicalSummary(state.psychology);
  const sorted = Object.entries(summary)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]) as [PsychologicalDimension, number][];

  const dominantTendencies = sorted.slice(0, 2).map(([dim, score]) => ({
    dimension: dim,
    score,
    title: DIMENSION_DETAILS[dim]?.label || dim,
  }));

  const secondaryTendencies = sorted.slice(2, 4).map(([dim, score]) => ({
    dimension: dim,
    score,
    title: DIMENSION_DETAILS[dim]?.label || dim,
  }));

  // Detect contradictions
  const contradictions: string[] = [];
  if (summary.ORDER >= 2 && summary.FREEDOM >= 2) {
    contradictions.push('Напруга між залізним військовим порядком та козацькою волею громад.');
  }
  if (summary.ECONOMY >= 2 && summary.RISK >= 2) {
    contradictions.push('Суперечність між бажанням заощаджувати скарб та авантюрними ризиками.');
  }
  if (summary.CENTRALIZATION >= 2 && summary.AUTONOMY >= 2) {
    contradictions.push('Розрив між прагненням унітарної гетьманської влади та автономією полків.');
  }

  // Strengths & Shadow
  const recognizedStrengths: string[] = [];
  const shadowRisks: string[] = [];

  if (summary.CREATION >= 1) {
    recognizedStrengths.push('Здатність знаходити структурні реформи замість прямолінійних витрат.');
  }
  if (summary.ORDER >= 1) {
    recognizedStrengths.push('Висока дисципліна рішень та непохитність перед тиском.');
  }
  if (summary.ECONOMY >= 1) {
    recognizedStrengths.push('Твереза турбота про фінансову подушку держави.');
  }
  if (recognizedStrengths.length === 0) {
    recognizedStrengths.push('Початковий нейтральний баланс сил');
  }

  if (summary.ORDER > 3) {
    shadowRisks.push('Небезпека перетворення правління на тиранію та бунт вільного козацтва.');
  }
  if (summary.ECONOMY > 3 && state.empire.militaryStrength < 50) {
    shadowRisks.push('Надмірна жадібність може залишити кордони беззахисними перед агресорами.');
  }
  if (shadowRisks.length === 0) {
    shadowRisks.push('Поки що не виявлено критичних перекосів влади.');
  }

  // Determine tentative title
  let tentativeArchetypeTitle = 'Новообраний Гетьман на роздоріжжі';
  if (dominantTendencies.length > 0) {
    const top = dominantTendencies[0].dimension;
    switch (top) {
      case 'CREATION':
        tentativeArchetypeTitle = 'Гетьман-Реформатор і Будівничий';
        break;
      case 'ORDER':
        tentativeArchetypeTitle = 'Залізний Охоронець Ладу';
        break;
      case 'ECONOMY':
        tentativeArchetypeTitle = 'Ощадливий Скарбник Нації';
        break;
      case 'SECURITY':
        tentativeArchetypeTitle = 'Вартовий Степових Рубежів';
        break;
      case 'FREEDOM':
        tentativeArchetypeTitle = 'Провідник Козацької Вольниці';
        break;
      case 'POWER':
        tentativeArchetypeTitle = 'Самовладний Гетьман-Верховник';
        break;
      default:
        tentativeArchetypeTitle = `Носій духу ${DIMENSION_DETAILS[top]?.label || top}`;
    }
  }

  return {
    dominantTendencies,
    secondaryTendencies,
    tensionsAndContradictions: contradictions,
    recognizedStrengths,
    shadowRisks,
    historicalPrecedents: ['Богдан Хмельницький (1648)', 'Петро Дорошенко (1665)', 'Іван Мазепа (1700)'],
    tentativeArchetypeTitle,
    calculatedAtYear: state.identity.year,
  };
}
