import { Consequence, ScheduledConsequence } from './types.ts';
import { GameState } from '../state/types.ts';
import { Tension } from '../../types/index.ts';
import { evaluateArchetypeProfile } from '../archetypes/evaluator.ts';
import { HistoryEvent } from '../history/types.ts';
import { calculateLegitimacy } from '../politics/evaluator.ts';
import { Promise as PoliticalPromise, PoliticalCrisis } from '../politics/types.ts';
import { deriveCharacterExpectation } from '../narrative/narrativeEngine.ts';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}


export interface ApplicationResult {
  state: GameState;
  logs: string[];
}

export function applySingleConsequence(
  consequence: Consequence,
  currentState: GameState,
  context?: { sourceDecisionId?: string; scenarioId?: string; scenarioTitle?: string; choiceText?: string }
): ApplicationResult {
  let state = { ...currentState };
  const logs: string[] = [];

  switch (consequence.type) {
    case 'EMPIRE_METRIC_CHANGE':
    case 'STATE_CHANGE': {
      const currentVal = state.empire[consequence.metric];
      const maxVal = consequence.metric === 'treasury' ? 9999 : 100;
      const newVal = clamp(currentVal + consequence.value, 0, maxVal);

      state = {
        ...state,
        empire: {
          ...state.empire,
          [consequence.metric]: newVal,
        },
      };

      // Keep state.economy and state.military in sync
      if (consequence.metric === 'treasury' && state.economy) {
        state = {
          ...state,
          economy: {
            ...state.economy,
            treasury: newVal,
          },
        };
      } else if (consequence.metric === 'militaryStrength' && state.military) {
        state = {
          ...state,
          military: {
            ...state.military,
            strength: newVal,
          },
        };
      } else if (consequence.metric === 'prosperity' && state.economy) {
        state = {
          ...state,
          economy: {
            ...state.economy,
            publicProsperity: newVal,
          },
        };
      }

      const sign = consequence.value >= 0 ? '+' : '';
      logs.push(`${consequence.label || consequence.metric}: ${sign}${consequence.value} (нове значення: ${newVal})`);
      break;
    }

    case 'RELATIONSHIP_CHANGE': {
      const char = state.characters.find((c) => c.id === consequence.characterId);
      const charName = char ? char.name : consequence.characterId;

      const tDelta = consequence.trustChange ?? consequence.value ?? 0;
      const rDelta = consequence.respectChange ?? 0;
      const fDelta = consequence.fearChange ?? 0;
      const lDelta = consequence.loyaltyChange ?? 0;

      // Update specific character object
      state = {
        ...state,
        characters: state.characters.map((c) => {
          if (c.id !== consequence.characterId) return c;

          const updatedTrust = clamp((c.trust ?? 0) + tDelta, -20, 20);
          const updatedRespect = clamp((c.respect ?? 0) + rDelta, -20, 20);
          const updatedFear = clamp((c.fear ?? 0) + fDelta, 0, 20);
          const updatedLoyalty = clamp((c.loyalty ?? 0) + lDelta, -20, 20);

          const histEntry = {
            year: state.identity.year,
            scenarioId: context?.scenarioId || context?.scenarioTitle,
            choiceText: context?.choiceText,
            note: consequence.label || consequence.reason || (tDelta >= 0 ? 'Схвалив рішення' : 'Засудив рішення'),
          };

          const updatedChar = {
            ...c,
            trust: updatedTrust,
            respect: updatedRespect,
            fear: updatedFear,
            loyalty: updatedLoyalty,
            interactionHistory: [histEntry, ...(c.interactionHistory || [])],
          };

          return {
            ...updatedChar,
            expectation: deriveCharacterExpectation(updatedChar, state),
          };
        }),
      };

      // Keep legacy/composite relationships map in sync
      const currentRel = state.relationships[consequence.characterId] ?? 0;
      const netDelta = tDelta * 3 + rDelta * 2 + lDelta * 2;
      const newRel = clamp(currentRel + (netDelta !== 0 ? netDelta : (consequence.value ?? 0)), -100, 100);

      state = {
        ...state,
        relationships: {
          ...state.relationships,
          [consequence.characterId]: newRel,
        },
      };

      const changesSummary: string[] = [];
      if (tDelta !== 0) changesSummary.push(`довіра ${tDelta > 0 ? '+' : ''}${tDelta}`);
      if (rDelta !== 0) changesSummary.push(`повага ${rDelta > 0 ? '+' : ''}${rDelta}`);
      if (fDelta !== 0) changesSummary.push(`страх ${fDelta > 0 ? '+' : ''}${fDelta}`);
      if (lDelta !== 0) changesSummary.push(`лояльність ${lDelta > 0 ? '+' : ''}${lDelta}`);
      if (changesSummary.length === 0 && consequence.value !== undefined) {
        changesSummary.push(`відносини ${consequence.value > 0 ? '+' : ''}${consequence.value}`);
      }

      logs.push(`${charName}: ${changesSummary.join(', ')}`);
      break;
    }

    case 'REGION_CHANGE': {
      state = {
        ...state,
        regions: state.regions.map((reg) => {
          if (reg.id !== consequence.regionId) return reg;

          const stabDelta = consequence.stabilityChange ?? consequence.loyaltyChange ?? 0;
          const prospDelta = consequence.prosperityChange ?? 0;
          const unrstDelta = consequence.unrestChange ?? consequence.tensionChange ?? 0;
          const autoDelta = consequence.autonomyChange ?? 0;

          const newStab = clamp(reg.stability + stabDelta, 0, 100);
          const newProsp = clamp(reg.prosperity + prospDelta, 0, 100);
          const newUnrest = clamp((reg.unrest ?? 10) + unrstDelta, 0, 100);
          const newAutonomy = clamp((reg.autonomy ?? 30) + autoDelta, 0, 100);

          return {
            ...reg,
            stability: newStab,
            loyalty: newStab,
            prosperity: newProsp,
            unrest: newUnrest,
            tension: newUnrest,
            autonomy: newAutonomy,
          };
        }),
      };

      const regName = state.regions.find((r) => r.id === consequence.regionId)?.name || consequence.regionId;
      logs.push(`Регіон «${regName}»: ${consequence.label || 'зміна показників'}`);
      break;
    }

    case 'FACTION_CHANGE': {
      state = {
        ...state,
        factions: state.factions.map((f) => {
          if (f.id !== consequence.factionId) return f;
          return {
            ...f,
            influence: consequence.influenceChange !== undefined
              ? clamp(f.influence + consequence.influenceChange, 0, 100)
              : f.influence,
            loyalty: consequence.loyaltyChange !== undefined
              ? clamp(f.loyalty + consequence.loyaltyChange, 0, 100)
              : f.loyalty,
            tension: consequence.tensionChange !== undefined
              ? clamp((f.tension ?? 20) + consequence.tensionChange, 0, 100)
              : (f.tension ?? 20),
            wealth: consequence.wealthChange !== undefined
              ? clamp((f.wealth ?? 50) + consequence.wealthChange, 0, 100)
              : f.wealth,
            politicalPower: consequence.politicalPowerChange !== undefined
              ? clamp((f.politicalPower ?? 50) + consequence.politicalPowerChange, 0, 100)
              : f.politicalPower,
          };
        }),
      };

      const fName = state.factions.find((f) => f.id === consequence.factionId)?.name || consequence.factionId;
      logs.push(`Фракція «${fName}»: ${consequence.label || 'зміна впливу та лояльності'}`);
      break;
    }

    case 'POLITICAL_CAPITAL_CHANGE': {
      const currentCapital = state.politicalCapital ?? 55;
      const newCapital = clamp(currentCapital + consequence.value, 0, 100);
      state = {
        ...state,
        politicalCapital: newCapital,
      };
      const sign = consequence.value >= 0 ? '+' : '';
      logs.push(`Політичний капітал Гетьмана: ${sign}${consequence.value} (поточний рівень: ${newCapital}%)`);
      break;
    }

    case 'LEGITIMACY_CHANGE': {
      const pillar = consequence.pillar;
      const currentLegitimacy = state.legitimacy || {
        tradition: 65,
        law: 60,
        success: 60,
        popularSupport: 55,
        eliteSupport: 55,
        militarySupport: 70,
      };

      if (pillar && pillar in currentLegitimacy) {
        currentLegitimacy[pillar] = clamp(currentLegitimacy[pillar] + consequence.value, 0, 100);
      }

      state = {
        ...state,
        legitimacy: { ...currentLegitimacy },
      };
      const sign = consequence.value >= 0 ? '+' : '';
      logs.push(`Легітимність [${pillar || 'загальна'}]: ${sign}${consequence.value}`);
      break;
    }

    case 'CREATE_PROMISE': {
      const pData = consequence.promise;
      const newPromise: PoliticalPromise = {
        id: pData.id || 'prom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        year: state.identity.year,
        text: pData.text,
        targetFaction: pData.targetFaction,
        deadlineYear: pData.deadlineYear,
        fulfilled: false,
        broken: false,
        importance: pData.importance || 'standard',
        conditionDescription: pData.conditionDescription,
      };

      state = {
        ...state,
        promises: [...(state.promises || []), newPromise],
        history: [
          {
            id: 'hist_prom_' + Date.now(),
            year: state.identity.year,
            timestamp: Date.now(),
            type: 'PROMISE_MADE',
            title: `Обітниця Гетьмана: «${pData.text}»`,
            description: `Перед фракцією «${pData.targetFaction}» Гетьман урочисто заприсягнувся виконати зобов’язання до ${pData.deadlineYear} року.`,
            importance: pData.importance || 'standard',
            tags: ['обіцянка', pData.targetFaction, `${pData.deadlineYear}`],
            category: 'promise',
          },
          ...state.history,
        ],
      };
      logs.push(`Урочиста обітниця: «${pData.text}» (термін: ${pData.deadlineYear} р.)`);
      break;
    }

    case 'FULFILL_PROMISE': {
      state = {
        ...state,
        promises: (state.promises || []).map((p) =>
          p.id === consequence.promiseId ? { ...p, fulfilled: true } : p
        ),
      };
      logs.push(`Обітницю Гетьмана успішно виконано: ${consequence.label || consequence.promiseId}`);
      break;
    }

    case 'BREAK_PROMISE': {
      state = {
        ...state,
        promises: (state.promises || []).map((p) =>
          p.id === consequence.promiseId ? { ...p, broken: true } : p
        ),
      };
      logs.push(`Увага: Обітницю Гетьмана порушено! Втрата довіри.`);
      break;
    }

    case 'INSTITUTION_CHANGE': {
      state = {
        ...state,
        institutions: (state.institutions || []).map((inst) => {
          if (inst.id !== consequence.institutionId) return inst;
          return {
            ...inst,
            influence: consequence.influenceChange !== undefined
              ? clamp(inst.influence + consequence.influenceChange, 0, 100)
              : inst.influence,
            authority: consequence.authorityChange !== undefined
              ? clamp(inst.authority + consequence.authorityChange, 0, 100)
              : inst.authority,
            loyalty: consequence.loyaltyChange !== undefined
              ? clamp(inst.loyalty + consequence.loyaltyChange, 0, 100)
              : inst.loyalty,
            tension: consequence.tensionChange !== undefined
              ? clamp(inst.tension + consequence.tensionChange, 0, 100)
              : inst.tension,
          };
        }),
      };
      const instName = state.institutions?.find((i) => i.id === consequence.institutionId)?.name || consequence.institutionId;
      logs.push(`Інституція «${instName}»: ${consequence.label || 'зміна показників'}`);
      break;
    }

    case 'TRIGGER_CRISIS': {
      const existingCrisis = (state.crises || []).find((c) => c.id === consequence.crisisId);
      if (!existingCrisis) {
        const newCrisis: PoliticalCrisis = {
          id: consequence.crisisId,
          title: consequence.title,
          description: consequence.description,
          severity: consequence.severity || 'severe',
          triggeredYear: state.identity.year,
          active: true,
          resolved: false,
          unlockScenarioId: consequence.unlockScenarioId,
        };

        const updatedCrises = [...(state.crises || []), newCrisis];
        const unlockedScenarios = consequence.unlockScenarioId
          ? [...state.unlockedScenarioIds, consequence.unlockScenarioId]
          : state.unlockedScenarioIds;

        state = {
          ...state,
          crises: updatedCrises,
          unlockedScenarioIds: unlockedScenarios,
          history: [
            {
              id: 'hist_crisis_' + Date.now(),
              year: state.identity.year,
              timestamp: Date.now(),
              type: 'CRISIS_TRIGGERED',
              title: consequence.title,
              description: consequence.description,
              importance: 'critical',
              tags: ['криза', consequence.crisisId],
              category: 'crisis',
            },
            ...state.history,
          ],
        };
        logs.push(`ПОЛІТИЧНА КРИЗА: ${consequence.title}`);
      }
      break;
    }

    case 'RESOLVE_CRISIS': {
      state = {
        ...state,
        crises: (state.crises || []).map((c) =>
          c.id === consequence.crisisId ? { ...c, active: false, resolved: true } : c
        ),
      };
      logs.push(`Політичну кризу врегульовано: ${consequence.resolutionNote || consequence.crisisId}`);
      break;
    }

    case 'POLITICAL_COST': {
      const cost = consequence.cost;
      if (cost.capitalCost) {
        state = {
          ...state,
          politicalCapital: clamp((state.politicalCapital ?? 55) - cost.capitalCost, 0, 100),
        };
        logs.push(`Витрачено політичного капіталу: -${cost.capitalCost}`);
      }
      if (cost.economicCost) {
        state = {
          ...state,
          empire: {
            ...state.empire,
            treasury: clamp(state.empire.treasury - cost.economicCost, 0, 9999),
          },
        };
        logs.push(`Економічна ціна рішення: -${cost.economicCost} млн`);
      }
      if (cost.militaryCost) {
        state = {
          ...state,
          empire: {
            ...state.empire,
            militaryStrength: clamp(state.empire.militaryStrength - cost.militaryCost, 0, 100),
          },
        };
        logs.push(`Мілітарна ціна: -${cost.militaryCost}%`);
      }
      if (cost.politicalCost) {
        for (const [fId, delta] of Object.entries(cost.politicalCost)) {
          state = {
            ...state,
            factions: state.factions.map((f) =>
              f.id === fId ? { ...f, loyalty: clamp(f.loyalty + delta, 0, 100) } : f
            ),
          };
          const fName = state.factions.find((f) => f.id === fId)?.name || fId;
          logs.push(`Політична ціна [${fName}]: ${delta > 0 ? '+' : ''}${delta} лояльності`);
        }
      }
      break;
    }


    case 'ADD_TENSION':
    case 'TENSION': {
      const currTension = state.tensions[consequence.key] ?? 50;
      const newTension = clamp(currTension + consequence.value, 0, 100);

      // Update basic tension map
      state = {
        ...state,
        tensions: {
          ...state.tensions,
          [consequence.key]: newTension,
        },
      };

      // Also update or initialize tensionRecords
      const existingRecords: Tension[] = state.tensionRecords ? [...state.tensionRecords] : [];
      const recordIdx = existingRecords.findIndex((t) => t.id === consequence.key);

      const histItem = {
        year: state.identity.year,
        delta: consequence.value,
        reason: consequence.label || consequence.reason || 'Рішення володаря',
      };

      if (recordIdx >= 0) {
        existingRecords[recordIdx] = {
          ...existingRecords[recordIdx],
          value: newTension,
          history: [histItem, ...(existingRecords[recordIdx].history || [])],
        };
      } else {
        existingRecords.push({
          id: consequence.key,
          poleA: consequence.poleA || 'ПОЛЮС А',
          poleB: consequence.poleB || 'ПОЛЮС Б',
          value: newTension,
          source: context?.scenarioTitle || 'Державна рада',
          history: [histItem],
        });
      }

      state = {
        ...state,
        tensionRecords: existingRecords,
      };

      logs.push(`Напруження [${consequence.label || consequence.key}]: ${consequence.value > 0 ? '+' : ''}${consequence.value} (рівень: ${newTension}%)`);
      break;
    }

    case 'FLAG': {
      state = {
        ...state,
        flags: {
          ...(state.flags || {}),
          [consequence.flag]: consequence.value,
        },
      };
      if (consequence.label) {
        logs.push(`Державний стан: ${consequence.label}`);
      }
      break;
    }

    case 'PSYCHOLOGICAL_SIGNAL': {
      const signalId = 'sig_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newSignal = {
        id: signalId,
        dimension: consequence.dimension,
        value: consequence.value,
        context: consequence.context,
        sourceDecisionId: context?.sourceDecisionId,
        timestamp: Date.now(),
        contextNote: consequence.contextNote,
      };

      state = {
        ...state,
        psychology: [...state.psychology, newSignal],
      };

      if (consequence.contextNote) {
        logs.push(`Сходження Гетьмана: ${consequence.contextNote}`);
      }
      break;
    }

    case 'ADD_HISTORY_EVENT':
    case 'HISTORY_EVENT': {
      const histId = 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newEvent: HistoryEvent = {
        id: histId,
        year: state.identity.year,
        timestamp: Date.now(),
        type: consequence.eventType,
        title: consequence.title,
        description: consequence.description,
        sourceDecisionId: context?.sourceDecisionId,
        importance: consequence.importance,
        tags: consequence.tags || [],
      };

      state = {
        ...state,
        history: [newEvent, ...state.history],
      };

      logs.push(`Запис до Літопису: «${consequence.title}»`);
      break;
    }

    case 'SCHEDULE_CONSEQUENCE':
    case 'SCHEDULE_EVENT': {
      const schedId = 'sched_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const scheduled: ScheduledConsequence = {
        id: schedId,
        sourceDecisionId: context?.sourceDecisionId || 'unknown_decision',
        sourceScenarioId: context?.scenarioId,
        sourceScenarioTitle: context?.scenarioTitle,
        sourceYear: state.identity.year,
        triggerYear: consequence.consequenceData.triggerYear,
        title: consequence.consequenceData.title,
        description: consequence.consequenceData.description,
        conditions: consequence.consequenceData.conditions,
        consequences: consequence.consequenceData.consequences,
        resolved: false,
      };

      const updatedScheds = [...(state.consequences || []), scheduled];
      state = {
        ...state,
        consequences: updatedScheds,
        scheduledConsequences: updatedScheds,
      };

      logs.push(`Заплановано відкладений наслідок на ${scheduled.triggerYear} рік: «${scheduled.title}»`);
      break;
    }

    case 'UNLOCK_SCENARIO': {
      if (!state.unlockedScenarioIds.includes(consequence.scenarioId)) {
        state = {
          ...state,
          unlockedScenarioIds: [...state.unlockedScenarioIds, consequence.scenarioId],
        };
        logs.push(`Розблоковано новий сценарій: [${consequence.scenarioId}]`);
      }
      break;
    }

    case 'LOCK_SCENARIO': {
      if (!state.lockedScenarioIds.includes(consequence.scenarioId)) {
        state = {
          ...state,
          lockedScenarioIds: [...state.lockedScenarioIds, consequence.scenarioId],
        };
        logs.push(`Заблоковано сценарій: [${consequence.scenarioId}]`);
      }
      break;
    }

    case 'ADD_DISCOVERY': {
      if (!state.discoveries.includes(consequence.discoveryId)) {
        state = {
          ...state,
          discoveries: [...state.discoveries, consequence.label],
        };
        logs.push(`Відкрито державне знання: «${consequence.label}»`);
      }
      break;
    }

    case 'ADD_MEMORY_TAG':
    case 'MEMORY_TAG': {
      const currentTags = state.reputationTags || [];
      if (!currentTags.includes(consequence.tag)) {
        const nextTags = [...currentTags, consequence.tag];
        state = {
          ...state,
          reputationTags: nextTags,
        };
      }

      // Also update character memory tags if characterId provided, or if character was involved
      if (consequence.characterId) {
        state = {
          ...state,
          characters: state.characters.map((ch) => {
            if (ch.id !== consequence.characterId) return ch;
            const chMem = ch.memoryTags || [];
            const updatedCh = {
              ...ch,
              memoryTags: chMem.includes(consequence.tag) ? chMem : [...chMem, consequence.tag],
            };
            return {
              ...updatedCh,
              expectation: deriveCharacterExpectation(updatedCh, state),
            };
          }),
        };
      } else {
        // Update all character expectations based on newly earned reputation
        state = {
          ...state,
          characters: state.characters.map((ch) => ({
            ...ch,
            expectation: deriveCharacterExpectation(ch, state),
          })),
        };
      }

      logs.push(`Історична пам'ять Січі: «${consequence.tag}»`);
      break;
    }

    case 'ADVANCE_YEAR':
    case 'YEAR_ADVANCE': {
      const nextYear = state.identity.year + consequence.deltaYears;
      state = {
        ...state,
        identity: {
          ...state.identity,
          year: nextYear,
        },
      };
      logs.push(`Час спливає: настав ${nextYear} рік`);
      break;
    }

    case 'ECONOMY_METRIC_CHANGE': {
      if (!state.economy) break;
      const eco = state.economy;
      const m = consequence.metric;
      const v = consequence.value;
      const sign = v >= 0 ? '+' : '';

      if (m === 'tradeVolume' || m === 'tradeFreedom' || m === 'portEfficiency' || m === 'tariffsRate') {
        const cur = eco.trade[m];
        const updated = clamp(cur + v, 0, 100);
        state = {
          ...state,
          economy: {
            ...eco,
            trade: {
              ...eco.trade,
              [m]: updated,
            },
          },
        };
        logs.push(`Торгівля [${consequence.label || m}]: ${sign}${v} (рівень: ${updated}%)`);
      } else {
        const cur = eco[m] as number;
        const maxLimit = m === 'treasury' || m === 'debt' ? 9999 : 100;
        const minLimit = m === 'economicGrowth' ? -10 : 0;
        const updated = clamp(cur + v, minLimit, maxLimit);
        state = {
          ...state,
          economy: {
            ...eco,
            [m]: updated,
          },
        };

        if (m === 'treasury') {
          state = {
            ...state,
            empire: { ...state.empire, treasury: updated },
          };
        } else if (m === 'publicProsperity') {
          state = {
            ...state,
            empire: { ...state.empire, prosperity: updated },
          };
        }

        logs.push(`Економіка [${consequence.label || m}]: ${sign}${v} (рівень: ${updated})`);
      }
      break;
    }

    case 'TAX_POLICY_CHANGE': {
      if (!state.economy) break;
      const newBurden = consequence.burdenChange !== undefined
        ? clamp(state.economy.taxBurden + consequence.burdenChange, 10, 90)
        : state.economy.taxBurden;

      state = {
        ...state,
        economy: {
          ...state.economy,
          taxPolicy: consequence.policy,
          taxBurden: newBurden,
        },
      };
      logs.push(`Податкова реформа: курс «${consequence.policy}» (податковий тягар: ${newBurden}%)`);
      break;
    }

    case 'MILITARY_METRIC_CHANGE': {
      if (!state.military) break;
      const mil = state.military;
      const m = consequence.metric;
      const v = consequence.value;
      const cur = mil[m];
      const maxLim = m === 'militaryExpenses' ? 9999 : 100;
      const updated = clamp(cur + v, 0, maxLim);

      state = {
        ...state,
        military: {
          ...mil,
          [m]: updated,
        },
      };

      if (m === 'strength') {
        state = {
          ...state,
          empire: { ...state.empire, militaryStrength: updated },
        };
      }

      const sign = v >= 0 ? '+' : '';
      logs.push(`Військо [${consequence.label || m}]: ${sign}${v} (новий показник: ${updated})`);
      break;
    }

    case 'START_STATE_PROJECT': {
      if (!state.economy) break;
      const prj = consequence.project;
      const existing = (state.economy.stateProjects || []).some((p) => p.id === prj.id);
      if (!existing) {
        state = {
          ...state,
          economy: {
            ...state.economy,
            stateProjects: [...state.economy.stateProjects, prj],
          },
          history: [
            {
              id: 'hist_prj_' + Date.now(),
              year: state.identity.year,
              timestamp: Date.now(),
              type: 'REFORM',
              title: `Започатковано державний проєкт: «${prj.name}»`,
              description: `${prj.description} (Термін реалізації: ${prj.duration} років, кошторис: ${prj.cost} млн крб).`,
              importance: 'major',
              tags: ['проєкт', prj.category, `${state.identity.year}`],
              category: 'decision',
            },
            ...state.history,
          ],
        };
        logs.push(`Розпочато державний проєкт: «${prj.name}» (${prj.duration} р.)`);
      }
      break;
    }

    case 'START_INVESTMENT': {
      if (!state.economy) break;
      const inv = consequence.investment;
      const existing = (state.economy.investments || []).some((i) => i.id === inv.id);
      if (!existing) {
        state = {
          ...state,
          economy: {
            ...state.economy,
            investments: [...state.economy.investments, inv],
          },
        };
        logs.push(`Спрямовано інвестицію: «${inv.name}» (завершення у ${inv.completionYear} р.)`);
      }
      break;
    }

    case 'TRIGGER_ECONOMIC_CRISIS': {
      if (!state.economy) break;
      const cr = consequence.crisis;
      const existing = state.economy.crises.find((c) => c.id === cr.id);
      if (!existing) {
        state = {
          ...state,
          economy: {
            ...state.economy,
            crises: [...state.economy.crises, cr],
          },
          history: [
            {
              id: 'hist_ecocrisis_' + Date.now(),
              year: state.identity.year,
              timestamp: Date.now(),
              type: 'CRISIS_TRIGGERED',
              title: cr.title,
              description: cr.description,
              importance: 'critical',
              tags: ['економічна_криза', cr.id],
              category: 'crisis',
            },
            ...state.history,
          ],
        };
        if (cr.unlockScenarioId && !state.unlockedScenarioIds.includes(cr.unlockScenarioId)) {
          state.unlockedScenarioIds = [...state.unlockedScenarioIds, cr.unlockScenarioId];
        }
        logs.push(`ЕКОНОМІЧНА КРИЗА: ${cr.title}!`);
      }
      break;
    }

    case 'RESOLVE_ECONOMIC_CRISIS': {
      if (!state.economy) break;
      state = {
        ...state,
        economy: {
          ...state.economy,
          crises: state.economy.crises.map((c) =>
            c.id === consequence.crisisId ? { ...c, active: false, resolved: true } : c
          ),
        },
      };
      logs.push(`Економічну кризу врегульовано: ${consequence.resolutionNote || consequence.crisisId}`);
      break;
    }
  }

  // Recalculate archetype profile and legitimacy automatically
  const legitimacyResult = calculateLegitimacy(state);
  state = {
    ...state,
    legitimacy: legitimacyResult.components,
    archetypeProfile: evaluateArchetypeProfile(state),
  };


  return { state, logs };
}

export function applyConsequences(
  consequences: Consequence[],
  initialState: GameState,
  context?: { sourceDecisionId?: string; scenarioId?: string; scenarioTitle?: string; choiceText?: string }
): ApplicationResult {
  let state = initialState;
  const allLogs: string[] = [];

  for (const c of consequences) {
    const result = applySingleConsequence(c, state, context);
    state = result.state;
    allLogs.push(...result.logs);
  }

  return { state, logs: allLogs };
}
