import React from 'react';
import { ScenarioView } from './council/ScenarioView.tsx';
import { Scenario } from '../game/scenarios/types.ts';
import { Character } from '../types/index.ts';

interface ScenarioCardProps {
  scenario: Scenario;
  characters: Character[];
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  onContinue: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = (props) => {
  return <ScenarioView {...props} />;
};
