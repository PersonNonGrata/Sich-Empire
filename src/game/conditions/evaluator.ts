import { Condition, ComparisonOperator } from './types.ts';
import { GameState } from '../state/types.ts';
import { calculatePsychologicalScore } from '../psychology/manager.ts';

function compare(val: number, op: ComparisonOperator, target: number): boolean {
  switch (op) {
    case '>=':
      return val >= target;
    case '<=':
      return val <= target;
    case '>':
      return val > target;
    case '<':
      return val < target;
    case '==':
      return val === target;
    case '!=':
      return val !== target;
    default:
      return false;
  }
}

export function evaluateCondition(condition: Condition, state: GameState): boolean {
  switch (condition.type) {
    case 'METRIC': {
      const val = state.empire[condition.metric];
      return compare(val, condition.operator, condition.value);
    }

    case 'YEAR': {
      const currentYear = state.identity.year;
      if (condition.minYear !== undefined && currentYear < condition.minYear) {
        return false;
      }
      if (condition.maxYear !== undefined && currentYear > condition.maxYear) {
        return false;
      }
      if (condition.operator && condition.value !== undefined) {
        return compare(currentYear, condition.operator, condition.value);
      }
      return true;
    }

    case 'REGION': {
      const region = state.regions.find((r) => r.id === condition.regionId);
      if (!region) return false;
      const val = (region as any)[condition.metric] ?? 0;
      return compare(val, condition.operator, condition.value);
    }

    case 'FACTION': {
      const faction = state.factions.find((f) => f.id === condition.factionId);
      if (!faction) return false;
      const val = (faction as any)[condition.metric] ?? 0;
      return compare(val, condition.operator, condition.value);
    }

    case 'RELATIONSHIP':
    case 'CHARACTER_RELATIONSHIP': {
      const char = state.characters.find((c) => c.id === condition.characterId);
      let val = 0;
      if (condition.metric && condition.metric !== 'overall') {
        val = (char as any)?.[condition.metric] ?? 0;
      } else {
        val = state.relationships[condition.characterId] ?? char?.trust ?? 0;
      }
      return compare(val, condition.operator, condition.value);
    }

    case 'HAS_DECISION': {
      return state.decisions.some((d) => {
        if (condition.choiceId && d.choiceId !== condition.choiceId) return false;
        if (condition.scenarioId && d.scenarioId !== condition.scenarioId) return false;
        if (condition.tag && !d.tags?.includes(condition.tag)) return false;
        return true;
      });
    }

    case 'HAS_NOT_DECISION': {
      return !state.decisions.some((d) => {
        if (condition.choiceId && d.choiceId !== condition.choiceId) return false;
        if (condition.scenarioId && d.scenarioId !== condition.scenarioId) return false;
        if (condition.tag && !d.tags?.includes(condition.tag)) return false;
        return true;
      });
    }

    case 'SCENARIO_COMPLETED': {
      return state.completedScenarioIds.includes(condition.scenarioId);
    }

    case 'SCENARIO_NOT_COMPLETED': {
      return !state.completedScenarioIds.includes(condition.scenarioId);
    }

    case 'HAS_FLAG': {
      const flagVal = state.flags ? state.flags[condition.flag] : undefined;
      if (condition.value === undefined) {
        return Boolean(flagVal);
      }
      if (condition.operator) {
        return compare(Number(flagVal ?? 0), condition.operator, Number(condition.value));
      }
      return flagVal === condition.value;
    }

    case 'HAS_HISTORY_EVENT': {
      return state.history.some((evt) => {
        if (condition.eventId && evt.id !== condition.eventId) return false;
        if (condition.eventType && evt.type !== condition.eventType) return false;
        if (condition.tag && !evt.tags.includes(condition.tag)) return false;
        return true;
      });
    }

    case 'HAS_DISCOVERY': {
      return state.discoveries.includes(condition.discoveryId);
    }

    case 'TENSION': {
      const tension = state.tensions[condition.key] ?? 50;
      return compare(tension, condition.operator, condition.value);
    }

    case 'PSYCHOLOGY': {
      const score = calculatePsychologicalScore(state.psychology, condition.dimension);
      return compare(score, condition.operator, condition.value);
    }

    case 'SCHEDULED_CONSEQUENCE': {
      const sched = (state.consequences || []).find((sc) => !condition.id || sc.id === condition.id);
      if (!sched) return false;
      return condition.status === 'resolved' ? sched.resolved : !sched.resolved;
    }

    case 'AND': {
      return condition.conditions.every((c) => evaluateCondition(c, state));
    }

    case 'OR': {
      return condition.conditions.some((c) => evaluateCondition(c, state));
    }

    case 'NOT': {
      return !evaluateCondition(condition.condition, state);
    }

    default:
      return true;
  }
}

export function evaluateAllConditions(conditions: Condition[], state: GameState): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((cond) => evaluateCondition(cond, state));
}
