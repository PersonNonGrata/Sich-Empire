import React from 'react';
import { ScenarioView } from './council/ScenarioView.tsx';
import { Scenario } from '../game/scenarios/types.ts';
import { Character } from '../types/index.ts';
import { GameState } from '../game/state/types.ts';

interface ScenarioCardProps {
  scenario: Scenario;
  state: GameState;
  characters: Character[];
  onNegotiateFactionDemand: (demandId: string, action: 'concession' | 'guarantee' | 'bargain' | 'refuse') => void;
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  onContinue: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = (props) => {
  return <ScenarioView {...props} />;
};
