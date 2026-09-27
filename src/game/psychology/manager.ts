import { PsychologicalDimension, PsychologicalSignal, PsychologicalSummary } from './types.ts';

export const DIMENSION_DETAILS: Record<
  PsychologicalDimension,
  { label: string; description: string; color: string }
> = {
  ORDER: {
    label: 'Порядок',
    description: 'Дисципліна, підпорядкування, непорушність законів та субординація.',
    color: '#60A5FA', // blue
  },
  FREEDOM: {
    label: 'Свобода',
    description: 'Козацька воля, вільний голос громад, відсутність кайданів та цензури.',
    color: '#34D399', // emerald
  },
  RISK: {
    label: 'Сміливість / Ризик',
    description: 'Готовність ставити все на карту заради історичного прориву.',
    color: '#F87171', // red
  },
  KNOWLEDGE: {
    label: 'Знання / Розум',
    description: 'Політехнічний поступ, науковий розрахунок, раціоналізм.',
    color: '#818CF8', // indigo
  },
  POWER: {
    label: 'Воля до Влади',
    description: 'Концентрація повноважень, авторитет гетьманської булави.',
    color: '#A78BFA', // purple
  },
  TRADITION: {
    label: 'Традиція',
    description: 'Спадщина пращурів, козацькі звичаї, шанування старшин.',
    color: '#FBBF24', // amber
  },
  CREATION: {
    label: 'Творення',
    description: 'Будівництво нового ладу, реформи, модернізація застарілого.',
    color: '#F59E0B', // gold
  },
  RESPONSIBILITY: {
    label: 'Відповідальність',
    description: 'Прийняття важких тягарів без перекладання провини на інших.',
    color: '#E5E7EB', // light gray
  },
  MERCY: {
    label: 'Милосердя',
    description: 'Гуманне ставлення до підлеглих, полегшення податків, амністія.',
    color: '#F472B6', // pink
  },
  JUSTICE: {
    label: 'Справедливість',
    description: 'Рівність перед судом, чесний поділ здобичі та землі.',
    color: '#38BDF8', // sky
  },
  CENTRALIZATION: {
    label: 'Централізація',
    description: 'Єдиний центр рішень у столиці, приборкання свавілля на місцях.',
    color: '#93C5FD', // soft blue
  },
  AUTONOMY: {
    label: 'Автономія',
    description: 'Самостійність полків, куренів та місцевих рад.',
    color: '#6EE7B7', // teal
  },
  SECURITY: {
    label: 'Безпека Кордонів',
    description: 'Фортифікації, арсенали, неприступність перед ворожими імперіями.',
    color: '#FB923C', // orange
  },
  ECONOMY: {
    label: 'Ощадливість / Скарб',
    description: 'Збереження резервів, баланс бюджету, торгівельна обачність.',
    color: '#FCD34D', // yellow
  },
};

export function calculatePsychologicalScore(
  signals: PsychologicalSignal[],
  dimension: PsychologicalDimension
): number {
  return signals
    .filter((s) => s.dimension === dimension)
    .reduce((acc, s) => acc + s.value, 0);
}

export function getPsychologicalSummary(signals: PsychologicalSignal[]): PsychologicalSummary {
  const allDimensions: PsychologicalDimension[] = [
    'ORDER',
    'FREEDOM',
    'RISK',
    'KNOWLEDGE',
    'POWER',
    'TRADITION',
    'CREATION',
    'RESPONSIBILITY',
    'MERCY',
    'JUSTICE',
    'CENTRALIZATION',
    'AUTONOMY',
    'SECURITY',
    'ECONOMY',
  ];

  const summary = {} as PsychologicalSummary;
  for (const dim of allDimensions) {
    summary[dim] = calculatePsychologicalScore(signals, dim);
  }
  return summary;
}
