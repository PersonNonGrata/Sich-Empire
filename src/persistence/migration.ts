import { GameState } from '../game/state/types.ts';
import { CURRENT_STATE_VERSION, createInitialGameState } from '../game/state/initialState.ts';
import { evaluateArchetypeProfile } from '../game/archetypes/evaluator.ts';
import { determineAvailableScenarios } from '../game/engine/scenarioEngine.ts';
import { getScenarioById } from '../game/scenarios/registry.ts';

/**
 * Migration engine for stored GameState saves across schema revisions.
 */
export function migrateSave(raw: any): GameState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid save data format');
  }

  const rawVersion = typeof raw.version === 'number' ? raw.version : 0;
  const fresh = createInitialGameState(raw.identity?.rulerName || 'Ярослав Нескорений');

  let state: GameState;

  if (rawVersion < 3) {
    // Migrate from v0, v1, or v2 to v3 (Stage 4 Political Machine)
    state = {
      ...fresh,
      identity: {
        ...fresh.identity,
        ...(raw.identity || {}),
      },
      empire: {
        ...fresh.empire,
        ...(raw.empire || {}),
      },
      politicalCapital: typeof raw.politicalCapital === 'number' ? raw.politicalCapital : fresh.politicalCapital,
      legitimacy: raw.legitimacy ? { ...fresh.legitimacy, ...raw.legitimacy } : fresh.legitimacy,
      institutions: Array.isArray(raw.institutions) && raw.institutions.length > 0 ? raw.institutions : fresh.institutions,
      promises: Array.isArray(raw.promises) ? raw.promises : [],
      crises: Array.isArray(raw.crises) ? raw.crises : [],
      politicalRelationships: Array.isArray(raw.politicalRelationships) ? raw.politicalRelationships : fresh.politicalRelationships,
      activeProposal: raw.activeProposal ?? null,
      relationships: raw.relationships ? { ...fresh.relationships, ...raw.relationships } : fresh.relationships,
      history: Array.isArray(raw.history) && raw.history.length > 0 ? raw.history : fresh.history,
      decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
      consequences: Array.isArray(raw.consequences) ? raw.consequences : [],
      scheduledConsequences: Array.isArray(raw.consequences) ? raw.consequences : [],
      psychology: Array.isArray(raw.psychology) ? raw.psychology : [],
      completedScenarioIds: Array.isArray(raw.completedScenarioIds) ? raw.completedScenarioIds : [],
      currentScenarioId: raw.currentScenarioId ?? null,
      flags: raw.flags ? { ...fresh.flags, ...raw.flags } : fresh.flags,
      eventQueue: Array.isArray(raw.eventQueue) ? raw.eventQueue : [],
      tensions: raw.tensions ? { ...fresh.tensions, ...raw.tensions } : fresh.tensions,
      tensionRecords: raw.tensionRecords || fresh.tensionRecords,
      discoveries: Array.isArray(raw.discoveries) ? raw.discoveries : fresh.discoveries,
      version: CURRENT_STATE_VERSION,
    };

    // Ensure all 7 base factions exist with interests and redLines
    state.factions = fresh.factions.map((ff) => {
      const existing = (raw.factions || []).find((rf: any) => rf.id === ff.id);
      if (!existing) return ff;
      return {
        ...ff,
        ...existing,
        tension: existing.tension ?? ff.tension,
        wealth: existing.wealth ?? ff.wealth,
        politicalPower: existing.politicalPower ?? ff.politicalPower,
        interests: existing.interests || ff.interests,
        redLines: existing.redLines || ff.redLines,
      };
    });

    // Ensure all regions have extended properties
    state.regions = fresh.regions.map((fr) => {
      const existing = (raw.regions || []).find((rr: any) => rr.id === fr.id);
      if (!existing) return fr;
      return {
        ...fr,
        ...existing,
        autonomy: existing.autonomy ?? fr.autonomy,
        tension: existing.tension ?? existing.unrest ?? fr.tension,
        loyalty: existing.loyalty ?? existing.stability ?? fr.loyalty,
        population: existing.population || fr.population,
        wealth: existing.wealth ?? fr.wealth,
        security: existing.security ?? fr.security,
        cultureTags: existing.cultureTags || fr.cultureTags,
        dominantFactions: existing.dominantFactions || fr.dominantFactions,
      };
    });

    // Ensure characters have political links
    state.characters = fresh.characters.map((fc) => {
      const existing = (raw.characters || []).find((rc: any) => rc.id === fc.id);
      if (!existing) return fc;
      return {
        ...fc,
        ...existing,
        trust: existing.trust ?? fc.trust,
        respect: existing.respect ?? fc.respect,
        fear: existing.fear ?? fc.fear,
        loyalty: existing.loyalty ?? fc.loyalty,
        interactionHistory: existing.interactionHistory || fc.interactionHistory,
        interests: existing.interests || fc.interests,
      };
    });
  } else {
    // Current standard version (v3+)
    state = raw as GameState;
  }


  // Ensure economy and military structures are present
  if (!state.economy) {
    state.economy = fresh.economy;
  }
  if (!state.military) {
    state.military = fresh.military;
  }

  // Ensure regions have Stage 5 infrastructure and economic properties
  state.regions = state.regions.map((reg) => {
    const fReg = fresh.regions.find((r) => r.id === reg.id);
    return {
      ...reg,
      taxContribution: reg.taxContribution ?? fReg?.taxContribution ?? 15,
      tradeContribution: reg.tradeContribution ?? fReg?.tradeContribution ?? 50,
      infrastructure: reg.infrastructure || fReg?.infrastructure || {
        roads: 50,
        ports: 20,
        railways: 0,
        administration: 50,
      },
      economicPotential: reg.economicPotential || fReg?.economicPotential || {
        trade: 50,
        tax: 50,
        resources: 50,
        industry: 50,
      },
    };
  });

  // Ensure arrays and structures are resilient
  if (!Array.isArray(state.unlockedScenarioIds)) {
    state.unlockedScenarioIds = ['scenario_first_council'];
  }
  if (!Array.isArray(state.lockedScenarioIds)) {
    state.lockedScenarioIds = [];
  }
  // Requirement 38: Never trust stale availableScenarioIds from old saves with mixed years.
  // Always recalculate availableScenarioIds for the CURRENT YEAR via determineAvailableScenarios.
  state.availableScenarioIds = determineAvailableScenarios(state);

  if (!state.yearProgress) {
    state.yearProgress = {
      year: state.identity.year,
      completedScenarioIds: (state.completedScenarioIds || []).filter((id) => {
        const s = getScenarioById(id);
        return (s?.year ?? state.identity.year) === state.identity.year;
      }),
      resolvedScenarioCount: (state.completedScenarioIds || []).length,
      totalRequiredScenarios: 3,
      yearStartMetrics: { ...state.empire },
    };
  }

  if (state.yearSummary === undefined) {
    state.yearSummary = null;
  }

  if (!state.flags) {
    state.flags = fresh.flags;
  }
  if (!state.eventQueue) {
    state.eventQueue = [];
  }

  // Stage 6 Psychological Ascension Core Migration
  if (!Array.isArray(state.behaviorPatterns)) {
    state.behaviorPatterns = [];
  }
  if (!Array.isArray(state.contradictions)) {
    state.contradictions = [];
  }
  if (!Array.isArray(state.reflections)) {
    state.reflections = [];
  }
  if (!Array.isArray(state.insights)) {
    state.insights = [];
  }
  if (!Array.isArray(state.stressTests)) {
    state.stressTests = [];
  }
  if (!Array.isArray(state.transformations)) {
    state.transformations = [];
  }
  if (!state.ascensionStage) {
    state.ascensionStage = 'EXPERIENCE';
  }

  // Stage 7 Narrative Ascension Migration
  if (!Array.isArray(state.reputationTags)) {
    state.reputationTags = [];
  }
  if (!Array.isArray(state.narrativeMirrors)) {
    state.narrativeMirrors = [];
  }
  state.characters = state.characters.map((ch) => ({
    ...ch,
    memoryTags: Array.isArray(ch.memoryTags) ? ch.memoryTags : [],
  }));

  // Ensure archetype profile and psychological ascension structures are fully computed
  state.archetypeProfile = evaluateArchetypeProfile(state);

  state.version = CURRENT_STATE_VERSION;
  return state;
}
