import { GameState } from '../state/types.ts';
import { DetailedFaction } from './factionsData.ts';
import {
  PoliticalReactionType,
  PoliticalInterests,
  LegitimacyBreakdown,
  ProposalVote,
  PoliticalCrisis,
  Promise,
  PoliticalRelationship,
  FactionDemand,
  FactionDemandStatus,
} from './types.ts';
import { CRISIS_IDS, clampRange } from './constants.ts';
import { evaluateAllConditions } from '../conditions/evaluator.ts';

/**
 * Requirement 8: Evaluate political reaction deterministically.
 * Reaction: 'support' | 'neutral' | 'concern' | 'opposition' | 'crisis'
 */
export function evaluateFactionReaction(
  faction: DetailedFaction,
  effectImpacts: Partial<PoliticalInterests>,
  currentLoyalty: number = faction.loyalty
): { reaction: PoliticalReactionType; score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // Compare impact with faction's interests
  for (const [key, factionWeight] of Object.entries(faction.interests)) {
    const domainKey = key as keyof PoliticalInterests;
    const impactVal = effectImpacts[domainKey];

    if (impactVal !== undefined && impactVal !== 0 && factionWeight !== undefined) {
      // Positive correlation = support, negative correlation = opposition
      const alignment = (impactVal * factionWeight) / 100;
      score += alignment;

      if (alignment > 15) {
        reasons.push(`Схвалює напрямок: ${domainKey}`);
      } else if (alignment < -15) {
        reasons.push(`Засуджує тиск на: ${domainKey}`);
      }
    }
  }

  // Factor in baseline loyalty
  if (currentLoyalty >= 70) {
    score += 10;
  } else if (currentLoyalty <= 35) {
    score -= 15;
  }

  // Determine categorical reaction
  if (score >= 25) {
    return { reaction: 'support', score, reason: reasons.join('; ') || 'Повна підтримка курсу' };
  } else if (score >= 5) {
    return { reaction: 'neutral', score, reason: reasons.join('; ') || 'Стримана згода' };
  } else if (score >= -20) {
    return { reaction: 'concern', score, reason: reasons.join('; ') || 'Висловлює занепокоєння' };
  } else if (score >= -45) {
    return { reaction: 'opposition', score, reason: reasons.join('; ') || 'Рішуча станова опозиція' };
  } else {
    return { reaction: 'crisis', score, reason: reasons.join('; ') || 'Критичний розрив із владою' };
  }
}

/**
 * Phase 5: Active Factions.
 * Turns strong faction reactions into persistent political demands.
 * Demands are deliberately qualitative in the UI, while pressure remains
 * a deterministic hidden state used by the simulation.
 */
const DEMAND_DOMAIN_LABELS: Record<string, string> = {
  armyFunding: 'фінансування війська',
  taxation: 'податкова політика',
  autonomy: 'автономія',
  centralization: 'межі централізації',
  landReform: 'земельна політика',
  education: 'освіта',
  tradeFreedom: 'торговельна свобода',
  freedom: 'громадянські свободи',
  stability: 'державна стабільність',
};

function getFactionDemandDomain(faction: DetailedFaction): keyof PoliticalInterests {
  const entries = Object.entries(faction.interests)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .sort((a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1])));
  return (entries[0]?.[0] || 'stability') as keyof PoliticalInterests;
}

function getDemandUrgency(reaction: PoliticalReactionType): 1 | 2 | 3 {
  if (reaction === 'crisis') return 3;
  if (reaction === 'opposition') return 2;
  return 1;
}

function getDemandTitle(reaction: PoliticalReactionType, factionName: string, domain: keyof PoliticalInterests): string {
  const prefix = reaction === 'crisis' ? 'Ультиматум' : reaction === 'opposition' ? 'Вимога' : 'Наполягання';
  return `${prefix} фракції: ${factionName} · ${DEMAND_DOMAIN_LABELS[domain]}`;
}

function getDemandText(
  reaction: PoliticalReactionType,
  faction: DetailedFaction,
  domain: keyof PoliticalInterests,
): string {
  const interest = faction.interests[domain] ?? 0;
  const direction = interest >= 0 ? 'посилити' : 'зменшити';
  const tone = reaction === 'crisis'
    ? 'Фракція ставить це питання на межу відкритого конфлікту'
    : reaction === 'opposition'
      ? 'Фракція вимагає політичної відповіді'
      : 'Фракція очікує поступок або гарантій';
  return `${tone}: ${direction} вплив держави у сфері «${DEMAND_DOMAIN_LABELS[domain]}». Її інтерес у цій сфері: ${interest > 0 ? '+' : ''}${interest}.`;
}

export function updateFactionDemandsAfterDecision(
  state: GameState,
  decisionId: string,
  reactions: Array<{ factionId: string; reaction: PoliticalReactionType; note: string }>,
): { state: GameState; logs: string[] } {
  let demands: FactionDemand[] = [...(state.factionDemands || [])];
  const logs: string[] = [];
  const currentYear = state.identity.year;

  // Existing demands react to the new political decision.
  for (const demand of demands) {
    if (demand.status !== 'open') continue;

    const reaction = reactions.find((r) => r.factionId === demand.factionId);
    if (!reaction) continue;

    if (reaction.reaction === 'support') {
      demand.status = 'fulfilled';
      demand.resolvedYear = currentYear;
      demand.resolutionNote = 'Подальша ухвала дала фракції достатню політичну відповідь.';
      logs.push(`ПОЛІТИЧНА ВИМОГА ЗНЯТА: «${demand.title}»`);
    } else if (reaction.reaction === 'opposition' || reaction.reaction === 'crisis') {
      demand.pressure = clampRange(demand.pressure + (reaction.reaction === 'crisis' ? 25 : 15), 0, 100);
      demand.urgency = Math.min(3, demand.urgency + 1) as 1 | 2 | 3;
      const faction = state.factions.find((f) => f.id === demand.factionId);
      if (faction) {
        faction.tension = clampRange((faction.tension ?? 0) + (reaction.reaction === 'crisis' ? 4 : 2), 0, 100);
      }
      logs.push(`ПОЛІТИЧНИЙ ТИСК ЗРОС: «${demand.title}»`);
    }
  }

  // A new demand appears when a faction has moved beyond simple concern.
  for (const reaction of reactions) {
    if (!['concern', 'opposition', 'crisis'].includes(reaction.reaction)) continue;

    const faction = state.factions.find((f) => f.id === reaction.factionId) as DetailedFaction | undefined;
    if (!faction) continue;

    const hasOpenDemand = demands.some(
      (d) => d.status === 'open' && d.factionId === faction.id
    );
    if (hasOpenDemand) continue;

    const domain = getFactionDemandDomain(faction);
    const interest = faction.interests[domain] ?? 0;
    const urgency = getDemandUrgency(reaction.reaction);
    const demand: FactionDemand = {
      id: `fd_${decisionId}_${faction.id}`,
      factionId: faction.id,
      title: getDemandTitle(reaction.reaction, faction.name, domain),
      text: getDemandText(reaction.reaction, faction, domain),
      domain,
      desiredDirection: interest >= 0 ? 1 : -1,
      createdYear: currentYear,
      deadlineYear: currentYear + (urgency === 3 ? 1 : urgency === 2 ? 2 : 3),
      sourceDecisionId: decisionId,
      urgency,
      pressure: urgency === 3 ? 70 : urgency === 2 ? 50 : 30,
      status: 'open',
    };
    demands = [demand, ...demands];
    logs.push(`ФРАКЦІЯ ВИСУНУЛА НОВУ ПОЛІТИЧНУ ВИМОГУ: «${demand.title}»`);
  }

  // Keep completed demands in the chronicle, but prevent an ever-growing active queue.
  const active = demands.filter((d) => d.status === 'open');
  const closed = demands
    .filter((d) => d.status !== 'open')
    .slice(0, 40);

  return {
    state: {
      ...state,
      factionDemands: [...active, ...closed],
    },
    logs,
  };
}

/**
 * Expires overdue demands. Expiry is pressure, not automatic collapse:
 * the next political decision still determines whether a faction escalates.
 */
export function expireFactionDemands(state: GameState): { state: GameState; logs: string[] } {
  const demands = [...(state.factionDemands || [])];
  const logs: string[] = [];
  let changed = false;

  for (const demand of demands) {
    if (demand.status === 'open' && demand.deadlineYear < state.identity.year) {
      demand.status = 'expired' as FactionDemandStatus;
      demand.resolvedYear = state.identity.year;
      demand.resolutionNote = 'Термін політичної вимоги минув без зафіксованої відповіді.';
      demand.pressure = clampRange(demand.pressure + 20, 0, 100);
      const faction = state.factions.find((f) => f.id === demand.factionId);
      if (faction) faction.tension = clampRange((faction.tension ?? 0) + 5, 0, 100);
      logs.push(`ПОЛІТИЧНА ВИМОГА ПРОТЕРМІНУВАЛА: «${demand.title}»`);
      changed = true;
    }
  }

  return changed ? { state: { ...state, factionDemands: demands }, logs } : { state, logs };
}

/**
 * Requirement 11: Multi-component Legitimacy Breakdown
 * Keeps components separately and calculates aggregate score.
 */
export function calculateLegitimacy(state: GameState): {
  components: LegitimacyBreakdown;
  aggregate: number;
} {
  const { empire, factions, regions, flags } = state;

  const oldSich = factions.find((f) => f.id === 'faction_old_sich');
  const military = factions.find((f) => f.id === 'faction_military_command');
  const reformers = factions.find((f) => f.id === 'faction_reformers');
  const aristocracy = factions.find((f) => f.id === 'faction_landed_aristocracy');
  const communities = factions.find((f) => f.id === 'faction_communities');
  const merchants = factions.find((f) => f.id === 'faction_merchants');

  // 1. Традиція: вірність козацьким звичаям, відсутність заколотів Старої Січі
  const traditionScore = clampRange(
    Math.round(
      (oldSich?.loyalty ?? 60) * 0.6 +
      (empire.unity) * 0.2 +
      (flags['cossack_brotherhood_mobilized'] ? 15 : 0) +
      (flags['eternal_sich_covenant_ratified'] ? 15 : 0)
    ),
    0,
    100
  );

  // 2. Право: сила інституцій, підтримка реформаторів, стабільність закону
  const lawScore = clampRange(
    Math.round(
      (reformers?.loyalty ?? 60) * 0.6 +
      (empire.stability) * 0.3 +
      (flags['military_reform_instituted'] ? 10 : 0)
    ),
    0,
    100
  );

  // 3. Успіх: державний добробут, скарбниця, відсутність боргової петлі
  const successScore = clampRange(
    Math.round(
      (empire.prosperity) * 0.5 +
      Math.min(100, empire.treasury * 1.5) * 0.3 +
      (empire.stability) * 0.2
    ),
    0,
    100
  );

  // 4. Підтримка суспільства: лояльність громад та воєводств
  const avgRegionLoyalty = regions.length > 0
    ? regions.reduce((sum, r) => sum + (r.loyalty ?? r.stability), 0) / regions.length
    : 60;
  const popularSupportScore = clampRange(
    Math.round(
      (communities?.loyalty ?? 55) * 0.5 +
      avgRegionLoyalty * 0.5
    ),
    0,
    100
  );

  // 5. Підтримка еліт: землевласники та купецтво
  const eliteSupportScore = clampRange(
    Math.round(
      (aristocracy?.loyalty ?? 50) * 0.6 +
      (merchants?.loyalty ?? 60) * 0.4
    ),
    0,
    100
  );

  // 6. Підтримка війська: генералітет та військова міць
  const militarySupportScore = clampRange(
    Math.round(
      (military?.loyalty ?? 65) * 0.5 +
      (empire.militaryStrength) * 0.5
    ),
    0,
    100
  );

  const components: LegitimacyBreakdown = {
    tradition: traditionScore,
    law: lawScore,
    success: successScore,
    popularSupport: popularSupportScore,
    eliteSupport: eliteSupportScore,
    militarySupport: militarySupportScore,
  };

  const aggregate = Math.round(
    (traditionScore + lawScore + successScore + popularSupportScore + eliteSupportScore + militarySupportScore) / 6
  );

  return { components, aggregate };
}

/**
 * Requirement 10: Recalculate political capital based on performance, promises, and legitimacy
 */
export function recalculatePoliticalWill(
  currentPoliticalWill: number,
  delta: number,
  legitimacyAggregate: number
): number {
  // Higher legitimacy grants a small positive buoyancy to political will.
  const legitimacyBonus = legitimacyAggregate >= 75 ? 2 : legitimacyAggregate < 40 ? -3 : 0;
  const updated = currentPoliticalWill + delta + legitimacyBonus;
  return clampRange(updated, 0, 100);
}

/**
 * Legacy compatibility alias for older callers/saves.
 * New code should use recalculatePoliticalWill.
 */
export const recalculatePoliticalCapital = recalculatePoliticalWill;

/**
 * Requirement 20: Great Council Proposal Voting Mechanism
 */
export function simulateProposalVoting(
  proposal: {
    id: string;
    title: string;
    domain: keyof PoliticalInterests;
    impactStrength: number; // positive or negative push in that domain
    requiredCapital: number;
  },
  factions: DetailedFaction[],
  politicalCapital: number
): ProposalVote {
  let totalVotesFor = 0;
  let totalVotesAgainst = 0;
  let totalAbstain = 0;

  const factionVotes = factions.map((faction) => {
    const domainInterest = faction.interests[proposal.domain] ?? 0;
    const alignment = (domainInterest * proposal.impactStrength) / 100;
    const loyaltyModifier = (faction.loyalty - 50) / 2;
    const finalScore = alignment + loyaltyModifier;

    // Weight proportional to faction political power & influence
    const weight = Math.max(5, Math.round(((faction.influence ?? 50) * 0.6 + (faction.politicalPower ?? 50) * 0.4) / 10));

    let vote: 'support' | 'opposition' | 'abstain';
    let reason: string;

    if (finalScore >= 12) {
      vote = 'support';
      totalVotesFor += weight;
      reason = `Інтереси стану збігаються з ухвалою (${domainInterest > 0 ? '+' : ''}${domainInterest})`;
    } else if (finalScore <= -12) {
      vote = 'opposition';
      totalVotesAgainst += weight;
      reason = `Ухвала прямо шкодить інтересам фракції`;
    } else {
      vote = 'abstain';
      totalAbstain += weight;
      reason = 'Фракція утримується через брак вигоди або гарантій';
    }

    return {
      factionId: faction.id,
      factionName: faction.name,
      vote,
      weight,
      reason,
    };
  });

  const passed = totalVotesFor > totalVotesAgainst;
  const margin = totalVotesFor - totalVotesAgainst;

  return {
    proposalId: proposal.id,
    title: proposal.title,
    domain: proposal.domain,
    requiredCapital: proposal.requiredCapital,
    factionVotes,
    totalVotesFor,
    totalVotesAgainst,
    totalAbstain,
    passed,
    margin,
  };
}

/**
 * Requirement 17 & 18: Political Crisis Detector
 * Checks whether state conditions breach critical boundaries.
 */
export function detectPoliticalCrises(
  state: GameState,
  activeCrises: PoliticalCrisis[]
): PoliticalCrisis[] {
  const newCrises: PoliticalCrisis[] = [];
  const existingIds = new Set(activeCrises.map((c) => c.id));

  const oldSich = state.factions.find((f) => f.id === 'faction_old_sich');
  const zaporizhzhia = state.regions.find((r) => r.id === 'region_sich_core');
  const centralTension = state.tensions['tension_autonomy_centralization'] ?? 45;

  // 1. «ГОЛОС СТАРОЇ СІЧІ» (Requirement 18)
  // centralization > 70 AND autonomy Zaporizhzhia < 40 AND loyalty Old Sich < 35
  if (!existingIds.has(CRISIS_IDS.VOICE_OF_OLD_SICH)) {
    const isCentralizationHigh = centralTension > 65 || Boolean(state.flags['central_vertical_established']);
    const isAutonomyLow = (zaporizhzhia?.autonomy ?? 40) <= 40;
    const isLoyaltyCritical = (oldSich?.loyalty ?? 60) <= 35;

    if (isCentralizationHigh && isAutonomyLow && isLoyaltyCritical) {
      newCrises.push({
        id: CRISIS_IDS.VOICE_OF_OLD_SICH,
        title: 'Політична криза: «Голос Старої Січі»',
        description:
          'Низове козацтво Хортиці та курінні отамани відкрито засудили тиск центру. Автономія Запоріжжя придушена, лояльність Старої Січі впала нижче критичної межі. Отамани скликають надзвичайну Раду Старшини.',
        severity: 'severe',
        sourceFactionId: 'faction_old_sich',
        sourceRegionId: 'region_sich_core',
        triggeredYear: state.identity.year,
        active: true,
        resolved: false,
        unlockScenarioId: 'scenario_crisis_old_sich_revolt',
      });
    }
  }

  // 2. «БУНТ ГАЛИЦЬКИХ ЗЕМЛЕВЛАСНИКІВ»
  if (!existingIds.has(CRISIS_IDS.GALICIAN_LAND_REVOLT)) {
    const galicia = state.regions.find((r) => r.id === 'region_galicia');
    const aristocracy = state.factions.find((f) => f.id === 'faction_landed_aristocracy');
    if ((galicia?.unrest ?? 20) > 60 && (aristocracy?.loyalty ?? 50) < 30) {
      newCrises.push({
        id: CRISIS_IDS.GALICIAN_LAND_REVOLT,
        title: 'Політична криза: Шляхетський опір Галичини',
        description: 'Галицькі землевласники відмовляються платити державні мита та вимагають повернення суверенних сеймикових прав.',
        severity: 'severe',
        sourceFactionId: 'faction_landed_aristocracy',
        sourceRegionId: 'region_galicia',
        triggeredYear: state.identity.year,
        active: true,
        resolved: false,
        unlockScenarioId: 'scenario_petition_galicia_land',
      });
    }
  }

  return newCrises;
}

/**
 * Requirement 12: Evaluate Promises at year advances
 */
export function evaluatePromises(
  promises: Promise[],
  currentYear: number,
  state: GameState
): {
  updatedPromises: Promise[];
  brokenList: Promise[];
  fulfilledList: Promise[];
} {
  const brokenList: Promise[] = [];
  const fulfilledList: Promise[] = [];

  const updatedPromises = promises.map((promise) => {
    if (promise.fulfilled || promise.broken) {
      return promise;
    }

    // Check condition if present
    if (promise.targetCondition) {
      const isMet = evaluateAllConditions([promise.targetCondition], state);
      if (isMet) {
        const fulfilled = { ...promise, fulfilled: true };
        fulfilledList.push(fulfilled);
        return fulfilled;
      }
    }

    // If deadline reached and not yet met
    if (currentYear >= promise.deadlineYear) {
      const broken = { ...promise, broken: true };
      brokenList.push(broken);
      return broken;
    }

    return promise;
  });

  return { updatedPromises, brokenList, fulfilledList };
}
