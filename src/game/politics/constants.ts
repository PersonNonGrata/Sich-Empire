/**
 * Centralized Political Engine Constants & Ranges
 * Requirement 5: Centralized ranges to avoid magic numbers across the code.
 */

export const POLITICAL_RANGES = {
  INFLUENCE: { MIN: 0, MAX: 100, DEFAULT: 50 },
  LOYALTY: { MIN: 0, MAX: 100, DEFAULT: 50 },
  TENSION: { MIN: 0, MAX: 100, DEFAULT: 25 },
  WEALTH: { MIN: 0, MAX: 100, DEFAULT: 50 },
  POLITICAL_POWER: { MIN: 0, MAX: 100, DEFAULT: 50 },
  POLITICAL_CAPITAL: { MIN: 0, MAX: 100, DEFAULT: 55 },
  LEGITIMACY_PILLAR: { MIN: 0, MAX: 100, DEFAULT: 60 },
  AUTONOMY: { MIN: 0, MAX: 100, DEFAULT: 45 },
  CHARACTER_TRUST: { MIN: -20, MAX: 20, DEFAULT: 0 },
  CHARACTER_RESPECT: { MIN: -20, MAX: 20, DEFAULT: 5 },
  CHARACTER_FEAR: { MIN: 0, MAX: 20, DEFAULT: 0 },
  CHARACTER_LOYALTY: { MIN: -20, MAX: 20, DEFAULT: 5 },
} as const;

export const REACTION_THRESHOLDS = {
  SUPPORT_INTEREST_MIN: 20,
  OPPOSITION_INTEREST_MAX: -20,
  CRISIS_LOYALTY_LIMIT: 25,
  CRISIS_TENSION_LIMIT: 75,
} as const;

export const CRISIS_IDS = {
  VOICE_OF_OLD_SICH: 'crisis_voice_of_old_sich',
  GALICIAN_LAND_REVOLT: 'crisis_galician_land_revolt',
  MILITARY_COMMAND_ULTIMATUM: 'crisis_military_command_ultimatum',
  COMMUNITIES_TAX_STRIKE: 'crisis_communities_tax_strike',
} as const;

export function clampRange(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
