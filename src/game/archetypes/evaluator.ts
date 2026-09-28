import { ArchetypeProfile } from './types.ts';
import { GameState } from '../state/types.ts';
import { evaluateAscension } from '../psychology/ascensionEngine.ts';

export function evaluateArchetypeProfile(state: GameState): ArchetypeProfile {
  const result = evaluateAscension(state);
  return result.archetypeProfile;
}
