import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../state/initialState.ts';
import { negotiateFactionDemand } from './negotiationEngine.ts';
import { FactionDemand } from './types.ts';

describe('faction negotiation', () => {
  it('resolves a demand through concession and spends political will', () => {
    const base = createInitialGameState('Гетьман');
    const faction = base.factions[0];
    const demand: FactionDemand = {
      id: 'test-demand',
      factionId: faction.id,
      title: 'Тестова вимога',
      text: 'Тест',
      domain: 'stability',
      desiredDirection: 1,
      createdYear: base.identity.year,
      deadlineYear: base.identity.year + 2,
      sourceDecisionId: 'test-decision',
      urgency: 2,
      pressure: 50,
      status: 'open',
    };
    const state = { ...base, factionDemands: [demand], politicalWill: 50 };
    const result = negotiateFactionDemand(state, demand.id, 'concession');

    expect(result.state.factionDemands?.[0].status).toBe('fulfilled');
    expect(result.state.politicalWill).toBe(40);
    expect(result.state.factions.find((f) => f.id === faction.id)?.loyalty).toBeGreaterThan(faction.loyalty);
  });

  it('creates a future obligation when a guarantee is negotiated', () => {
    const base = createInitialGameState('Гетьман');
    const faction = base.factions[0];
    const demand: FactionDemand = {
      id: 'test-guarantee',
      factionId: faction.id,
      title: 'Гарантія',
      text: 'Виконати обіцянку',
      domain: 'stability',
      desiredDirection: 1,
      createdYear: base.identity.year,
      deadlineYear: base.identity.year + 2,
      sourceDecisionId: 'test-decision',
      urgency: 2,
      pressure: 50,
      status: 'open',
    };
    const state = { ...base, factionDemands: [demand], politicalWill: 50 };
    const result = negotiateFactionDemand(state, demand.id, 'guarantee');

    expect(result.state.factionDemands?.[0].status).toBe('fulfilled');
    expect(result.state.promises?.[0].targetFaction).toBe(faction.id);
    expect(result.state.promises?.[0].deadlineYear).toBe(demand.deadlineYear);
  });
});
