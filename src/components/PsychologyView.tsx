import React from 'react';
import { HetmanView } from './hetman/HetmanView.tsx';
import { GameState } from '../game/state/types.ts';

interface PsychologyViewProps {
  state: GameState;
}

export const PsychologyView: React.FC<PsychologyViewProps> = (props) => {
  return <HetmanView {...props} />;
};
