import { PsychologicalDimension, PsychologicalSignal, PsychologicalSummary } from './types.ts';

export const DIMENSION_DETAILS: Record<
  PsychologicalDimension,
  { label: string; description: string; color: string }
> = {
  // Stage 6 Primary 10 Dimensions (Requirement 2)
  WILL: {
    label: 'Воля',
    description: 'Внутрішня непохитність, здатність долати інерцію та диктувати напрямок історичного поступу.',
    color: '#E8D7B8',
  },
  FREEDOM: {
    label: 'Свобода',
    description: 'Козацька вольниця, повага до місцевого самоврядування, нетерпимість до кайданів і тиранії.',
    color: '#34D399',
  },
  ORDER: {
    label: 'Порядок',
    description: 'Державна субординація, законність, військова дисципліна та передбачуваність інституцій.',
    color: '#60A5FA',
  },
  POWER: {
    label: 'Сила',
    description: 'Здатність мобілізувати ресурси держави, спиратися на військовий кулак і приймати важкі ухвали.',
    color: '#F87171',
  },
  KNOWLEDGE: {
    label: 'Знання',
    description: 'Раціоналізм, ставка на науку, освіту, інженерію та перевірені перші принципи.',
    color: '#818CF8',
  },
  RESPONSIBILITY: {
    label: 'Відповідальність',
    description: 'Твереза готовність нести тягар наслідків за весь народ без перекладання вини на обставини.',
    color: '#F3EFE6',
  },
  CREATION: {
    label: 'Творення',
    description: 'Зведення нового ладу, реформи, будівництво інфраструктури та подолання застарілих догм.',
    color: '#C9A96E',
  },
  TRADITION: {
    label: 'Традиція',
    description: 'Спадщина пращурів, звичаєве козацьке право, пам’ять роду та спадкоємність поколінь.',
    color: '#FBBF24',
  },
  COMPASSION: {
    label: 'Співчуття',
    description: 'Полегшення долі простого люду, захист вразливих верств, милосердя та зменшення страждань.',
    color: '#F472B6',
  },
  DOMINANCE: {
    label: 'Домінування',
    description: 'Прагнення безумовного верховенства над станами, приборкання свавілля отаманів і шляхти.',
    color: '#A855F7',
  },

  // Compatible aliases / secondary dimensions
  RISK: {
    label: 'Сміливість / Ризик',
    description: 'Готовність ставити все на карту заради історичного прориву.',
    color: '#EF4444',
  },
  MERCY: {
    label: 'Милосердя',
    description: 'Гуманне ставлення до підлеглих, полегшення тягарів, амністія.',
    color: '#F472B6',
  },
  JUSTICE: {
    label: 'Справедливість',
    description: 'Рівність перед судом, чесний поділ здобичі та непорушність права.',
    color: '#38BDF8',
  },
  CENTRALIZATION: {
    label: 'Централізація',
    description: 'Єдиний центр ухвалення рішень у столиці, приборкання провінційного розпаду.',
    color: '#93C5FD',
  },
  AUTONOMY: {
    label: 'Автономія',
    description: 'Самостійність полків, куренів, магістратів та місцевих громад.',
    color: '#6EE7B7',
  },
  SECURITY: {
    label: 'Безпека Кордонів',
    description: 'Фортифікації, арсенали, неприступність перед зовнішніми імперіями.',
    color: '#FB923C',
  },
  ECONOMY: {
    label: 'Ощадливість / Скарб',
    description: 'Збереження резервів, баланс бюджету, торгівельна обачність.',
    color: '#FCD34D',
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
    'WILL',
    'FREEDOM',
    'ORDER',
    'POWER',
    'KNOWLEDGE',
    'RESPONSIBILITY',
    'CREATION',
    'TRADITION',
    'COMPASSION',
    'DOMINANCE',
    'RISK',
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
