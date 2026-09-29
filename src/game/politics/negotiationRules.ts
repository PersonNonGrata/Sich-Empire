export type NegotiationAction = 'concession' | 'guarantee' | 'bargain' | 'refuse';

export function negotiationCost(action: NegotiationAction, urgency: number): number {
  if (action === 'concession') return 6 + urgency * 2;
  if (action === 'guarantee') return 3 + urgency;
  if (action === 'bargain') return 4 + urgency;
  return 0;
}
