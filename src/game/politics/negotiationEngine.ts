import { GameState } from '../state/types.ts';
import { FactionNegotiationAction, Promise as PoliticalPromise } from './types.ts';
import { negotiationCost } from './negotiationRules.ts';

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function negotiateFactionDemand(
  state: GameState,
  demandId: string,
  action: FactionNegotiationAction,
): { state: GameState; logs: string[]; politicalWillCost: number } {
  const demand = (state.factionDemands || []).find((item) => item.id === demandId && item.status === 'open');
  if (!demand) throw new Error('Demand is unavailable.');
  const faction = state.factions.find((item) => item.id === demand.factionId);
  if (!faction) throw new Error('Faction not found.');

  const cost = negotiationCost(action, demand.urgency);
  const will = state.politicalWill ?? state.politicalCapital ?? 55;
  if (cost > will) throw new Error('Insufficient political will.');

  const demands = (state.factionDemands || []).map((item) => ({ ...item }));
  const factions = state.factions.map((item) => ({ ...item }));
  const target = demands.find((item) => item.id === demandId)!;
  const targetFaction = factions.find((item) => item.id === demand.factionId)!;
  const year = state.identity.year;

  if (action === 'concession') {
    target.status = 'fulfilled';
    target.resolvedYear = year;
    target.pressure = 0;
    target.resolutionNote = 'Demand resolved through a negotiated concession.';
    targetFaction.loyalty = clamp((targetFaction.loyalty ?? 50) + 5);
    targetFaction.tension = clamp((targetFaction.tension ?? 0) - 6);
  } else if (action === 'guarantee') {
    target.status = 'fulfilled';
    target.resolvedYear = year;
    target.pressure = 10;
    target.resolutionNote = 'Demand replaced by a formal guarantee.';
    targetFaction.loyalty = clamp((targetFaction.loyalty ?? 50) + 3);
    targetFaction.tension = clamp((targetFaction.tension ?? 0) - 3);
    const promise: PoliticalPromise = {
      id: 'promise_neg_' + Date.now(),
      year,
      text: target.text,
      targetFaction: targetFaction.id,
      deadlineYear: target.deadlineYear,
      fulfilled: false,
      broken: false,
      importance: demand.urgency >= 3 ? 'critical' : 'major',
    };
    return {
      state: { ...state, politicalWill: will - cost, factionDemands: demands, factions, promises: [promise, ...(state.promises || [])] },
      logs: ['A formal guarantee was issued; a future obligation was created.'],
      politicalWillCost: cost,
    };
  } else if (action === 'bargain') {
    target.pressure = clamp(target.pressure - 20);
    target.urgency = Math.max(1, target.urgency - 1) as 1 | 2 | 3;
    target.deadlineYear += 1;
    target.resolutionNote = 'Pressure reduced through a temporary bargain.';
    targetFaction.loyalty = clamp((targetFaction.loyalty ?? 50) + 2);
    targetFaction.tension = clamp((targetFaction.tension ?? 0) - 2);
  } else {
    target.pressure = clamp(target.pressure + 18);
    targetFaction.loyalty = clamp((targetFaction.loyalty ?? 50) - 4);
    targetFaction.tension = clamp((targetFaction.tension ?? 0) + 5);
  }

  return {
    state: { ...state, politicalWill: will - cost, factionDemands: demands, factions },
    logs: ['Negotiation outcome recorded.'],
    politicalWillCost: cost,
  };
}
