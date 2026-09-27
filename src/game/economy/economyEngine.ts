import { GameState } from '../state/types.ts';
import {
  EconomyState,
  EconomicAnnualSummary,
  EconomicCrisis,
  Investment,
  StateProject,
} from './types.ts';
import { MilitaryState } from '../military/types.ts';
import { Consequence } from '../consequences/types.ts';
import { applyConsequences } from '../consequences/applier.ts';
import { DetailedFaction } from '../politics/factionsData.ts';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Requirement 17: Transparent Public Prosperity Calculation Formula.
 * Prosperity depends on: economic growth, tax burden, security, infrastructure, education, trade volume.
 */
export function calculatePublicProsperity(params: {
  economicGrowth: number;       // e.g. 2.0 (%)
  taxBurden: number;            // 0 - 100
  security: number;             // 0 - 100
  infrastructureAvg: number;    // 0 - 100
  educationLevel: number;       // 0 - 100
  tradeVolume: number;          // 0 - 100
}): { value: number; breakdown: Record<string, number>; notes: string[] } {
  const notes: string[] = [];
  const breakdown: Record<string, number> = {};

  const base = 50;

  // 1. Security effect (peace brings wealth)
  const securityDelta = Math.round((params.security - 50) * 0.22);
  breakdown['security'] = securityDelta;
  if (securityDelta !== 0) {
    notes.push(securityDelta > 0 ? 'Безпека рубежів захищає працю' : 'Небезпека та розбій руйнують добробут');
  }

  // 2. Infrastructure effect (transport & trade connectivity)
  const infraDelta = Math.round((params.infrastructureAvg - 45) * 0.25);
  breakdown['infrastructure'] = infraDelta;
  if (infraDelta > 2) {
    notes.push('Шляхи та мости зменшують вартість товарів');
  }

  // 3. Trade & Growth impact
  const growthDelta = Math.round(params.economicGrowth * 2.2 + (params.tradeVolume - 50) * 0.15);
  breakdown['tradeAndGrowth'] = growthDelta;
  if (growthDelta > 0) {
    notes.push('Торговельне пожвавлення збагачує ярмарки');
  }

  // 4. Education & Human capital
  const eduDelta = Math.round((params.educationLevel - 40) * 0.18);
  breakdown['education'] = eduDelta;

  // 5. Tax Burden Drag (Trade-off: high taxes depress prosperity)
  let taxDrag = 0;
  if (params.taxBurden > 40) {
    // Progressive penalty for heavy extraction
    taxDrag = -Math.round((params.taxBurden - 40) * 0.4);
    notes.push('Податковий тягар пригнічує статки ремісників та селян');
  } else if (params.taxBurden < 30) {
    taxDrag = Math.round((30 - params.taxBurden) * 0.2);
    notes.push('Помірні податки сприяють заощадженням');
  }
  breakdown['taxBurden'] = taxDrag;

  const total = clamp(base + securityDelta + infraDelta + growthDelta + eduDelta + taxDrag, 5, 100);
  return { value: total, breakdown, notes };
}

/**
 * Requirement 14: Logistics calculation
 * Depends on: roads, railways, military expenses, security.
 */
export function calculateLogistics(
  infrastructureAvgRoads: number,
  railwaysAvg: number,
  militaryExpenses: number,
  security: number
): number {
  const roadPart = infrastructureAvgRoads * 0.35;
  const railPart = railwaysAvg * 0.30;
  const fundingPart = clamp((militaryExpenses / 20) * 20, 0, 25);
  const secPart = security * 0.15;
  return clamp(Math.round(roadPart + railPart + fundingPart + secPart), 10, 100);
}

/**
 * Requirement 20: Economic Crisis Detector
 * Detects insolvency, trade collapse, inflation spiral, military decay.
 */
export function detectEconomicCrises(state: GameState): EconomicCrisis[] {
  const newCrises: EconomicCrisis[] = [];
  const existingIds = new Set((state.economy?.crises || []).filter((c) => c.active).map((c) => c.id));
  const eco = state.economy;
  const mil = state.military;

  if (!eco || !mil) return newCrises;

  // 1. БЮДЖЕТНА КРИЗА / ДЕФОЛТ (treasury <= 0 and debt >= creditLimit * 0.75)
  if (!existingIds.has('crisis_budget_insolvency')) {
    if (eco.treasury <= 0 && eco.debt >= eco.creditLimit * 0.75) {
      newCrises.push({
        id: 'crisis_budget_insolvency',
        title: 'Бюджетна криза: Загроза державного дефолту',
        description:
          'Скарбниця порожня, а державний борг наблизився до критичного ліміту. Іноземні банкіри та купецькі гільдії припиняють кредитування. Армія та чиновники місяцями не бачать платні.',
        type: 'budget_deficit',
        severity: 'existential',
        triggeredYear: state.identity.year,
        active: true,
        resolved: false,
        unlockScenarioId: 'scenario_crisis_budget_deficit',
      });
    }
  }

  // 2. ТОРГОВЕЛЬНИЙ СПАД / КОЛАПС (low security + low trade volume / freedom)
  if (!existingIds.has('crisis_trade_collapse')) {
    if (eco.trade.tradeVolume < 25 || (eco.trade.portEfficiency < 30 && eco.trade.tradeFreedom < 25)) {
      newCrises.push({
        id: 'crisis_trade_collapse',
        title: 'Економічна криза: Торговельний параліч гаваней',
        description:
          'Чорноморські порти та дніпровські річкові пристані спорожніли. Митні збори впали до критичного мінімуму, купці переводять капітали за кордон.',
        type: 'trade_collapse',
        severity: 'severe',
        triggeredYear: state.identity.year,
        active: true,
        resolved: false,
        unlockScenarioId: 'scenario_crisis_trade_collapse',
      });
    }
  }

  // 3. ВІЙСЬКОВА РОЗРУХА (readiness < 30% due to starvation of military budget)
  if (!existingIds.has('crisis_military_decay')) {
    if (mil.readiness < 30 && mil.equipment < 35) {
      newCrises.push({
        id: 'crisis_military_decay',
        title: 'Військово-матеріальна криза: Знесилення полків',
        description:
          'Брак фінансування призвів до розвалу артилерійських парків та падіння бойової готовності. Прикордонні корпуси не в змозі стримати навіть розбійницькі ватаги.',
        type: 'military_decay',
        severity: 'severe',
        triggeredYear: state.identity.year,
        active: true,
        resolved: false,
      });
    }
  }

  return newCrises;
}

/**
 * Requirement 19: Annual Economic Cycle (advanceEconomicYear)
 * Deterministically computes budget, taxes, trade, debts, investments, projects.
 */
export function advanceEconomicYear(
  currentState: GameState,
  years = 1
): { state: GameState; summary: EconomicAnnualSummary; logs: string[] } {
  let state = { ...currentState };
  const logs: string[] = [];
  const currentYear = state.identity.year;
  const notes: string[] = [];

  const eco = state.economy;
  const mil = state.military;

  if (!eco || !mil) {
    throw new Error('Economy or Military state not initialized');
  }

  // 1. Regional Infrastructure and Potential aggregations
  const regionsCount = state.regions.length || 1;
  const totalTaxPot = state.regions.reduce((sum, r) => sum + (r.economicPotential?.tax ?? 60), 0) / regionsCount;
  const totalTradePot = state.regions.reduce((sum, r) => sum + (r.economicPotential?.trade ?? 60), 0) / regionsCount;
  const totalResPot = state.regions.reduce((sum, r) => sum + (r.economicPotential?.resources ?? 55), 0) / regionsCount;
  const avgRoads = state.regions.reduce((sum, r) => sum + (r.infrastructure?.roads ?? 50), 0) / regionsCount;
  const avgRailways = state.regions.reduce((sum, r) => sum + (r.infrastructure?.railways ?? 0), 0) / regionsCount;
  const avgAdmin = state.regions.reduce((sum, r) => sum + (r.infrastructure?.administration ?? 50), 0) / regionsCount;
  const avgSecurity = state.regions.reduce((sum, r) => sum + (r.security ?? 60), 0) / regionsCount;

  // 2. REVENUES CALCULATION (Requirement 5)
  // Tax Revenue: Tax Potential * Tax Burden * Tax Efficiency
  const taxBurdenFactor = eco.taxBurden / 40; // 1.0 at standard 40%
  const taxEffFactor = eco.taxEfficiency / 100;
  const calculatedTaxRevenue = Math.max(5, Math.round((totalTaxPot * 0.35) * taxBurdenFactor * taxEffFactor));

  // Trade Revenue: Trade Volume * Port Efficiency * Trade Freedom
  const freedomFactor = 0.7 + (eco.trade.tradeFreedom / 100) * 0.6; // 0.7 to 1.3
  const portFactor = 0.5 + (eco.trade.portEfficiency / 100) * 0.5;
  const calculatedTradeRevenue = Math.max(3, Math.round((eco.trade.tradeVolume * 0.22) * freedomFactor * portFactor));

  // Customs Revenue: Trade Volume * Tariff Rate * Port Efficiency
  const tariffFactor = (eco.trade.tariffsRate / 30); // standard tariff ~30%
  const calculatedCustomsRevenue = Math.max(2, Math.round((eco.trade.tradeVolume * 0.12) * tariffFactor * portFactor));

  // Resource Revenue: Salt, Timber, Ores, Black soil grain
  const calculatedResourceRevenue = Math.max(4, Math.round(totalResPot * 0.12 + (avgRoads / 100) * 3));

  const extraordinaryRevenue = eco.extraordinaryRevenue || 0;

  const grossIncome = calculatedTaxRevenue + calculatedTradeRevenue + calculatedCustomsRevenue + calculatedResourceRevenue + extraordinaryRevenue;

  // 3. EXPENSES CALCULATION (Requirement 6)
  // Military expenses: Current allocation
  const militaryExpenses = eco.militaryExpenses;

  // Administrative expenses: Governance, courts
  const administrativeExpenses = eco.administrativeExpenses;

  // Infrastructure upkeep
  const infrastructureExpenses = eco.infrastructureExpenses;

  // Education investment
  const educationExpenses = eco.educationExpenses;

  // Debt interest
  const calculatedDebtInterest = Math.round(eco.debt * (eco.debtInterest / 100));

  // Emergency expenses
  const emergencyExpenses = eco.emergencyExpenses || 0;

  const grossExpenses = militaryExpenses + administrativeExpenses + infrastructureExpenses + educationExpenses + calculatedDebtInterest + emergencyExpenses;

  // 4. TREASURY & DEBT RESOLUTION (Requirement 4 & 7)
  const netBalance = grossIncome - grossExpenses;
  let newTreasury = eco.treasury + netBalance;
  let newDebt = eco.debt;
  let debtChange = 0;

  if (newTreasury < 0) {
    // Treasury depleted -> Deficit converts to Debt
    const deficit = Math.abs(newTreasury);
    newTreasury = 0;
    newDebt += deficit;
    debtChange = deficit;
    notes.push(`Дефіцит бюджету: скарбницю спустошено, залучено ${deficit} млн кредитів`);
    logs.push(`УВАГА! Дефіцит бюджету: державний борг зріс на +${deficit} млн крб`);
  } else if (netBalance > 0 && eco.debt > 0) {
    // If surplus and debt exists, automatically retire a modest portion of debt
    const debtRepayment = Math.min(eco.debt, Math.floor(netBalance * 0.3));
    if (debtRepayment > 0) {
      newDebt -= debtRepayment;
      newTreasury -= debtRepayment;
      debtChange = -debtRepayment;
      notes.push(`Профіцит дозволив погасити ${debtRepayment} млн боргу`);
      logs.push(`Скарбниця погасила частину боргу: -${debtRepayment} млн крб`);
    }
  }

  // 5. ECONOMIC GROWTH & INFLATION
  // Growth is boosted by trade volume, education, infrastructure, penalized by excessive debt & taxes
  const debtDrag = newDebt > eco.creditLimit * 0.5 ? ((newDebt - eco.creditLimit * 0.5) / 10) * 0.5 : 0;
  const taxDrag = eco.taxBurden > 50 ? ((eco.taxBurden - 50) / 10) * 0.4 : 0;
  const growthBoost = (calculatedTradeRevenue / 10) * 0.5 + (avgRailways / 20) * 0.6 + (eco.educationLevel / 50) * 0.4;
  const newGrowth = Number(Math.max(-5.0, Math.min(8.0, 1.5 + growthBoost - debtDrag - taxDrag)).toFixed(1));

  // Inflation: Rises if spending high + deficit + low production
  let newInflation = 3.0;
  if (netBalance < -10) newInflation += 4.0;
  if (newDebt > 40) newInflation += 3.5;
  if (eco.trade.tradeFreedom > 70) newInflation -= 1.0;
  newInflation = Number(clamp(newInflation, 1.0, 25.0).toFixed(1));

  // 6. PUBLIC PROSPERITY CALCULATION (Requirement 17)
  const prosperityCalc = calculatePublicProsperity({
    economicGrowth: newGrowth,
    taxBurden: eco.taxBurden,
    security: avgSecurity,
    infrastructureAvg: (avgRoads + avgRailways + avgAdmin) / 3,
    educationLevel: eco.educationLevel,
    tradeVolume: eco.trade.tradeVolume,
  });
  const prosperityDelta = prosperityCalc.value - eco.publicProsperity;

  // 7. MILITARY READINESS & DELAYED DECAY (Requirements 11, 12, 13)
  // If military expenses are cut below 15, readiness drops gradually
  let newReadiness = mil.readiness;
  let newEquipment = mil.equipment;
  let newMorale = mil.morale;
  let readinessReason = 'Стабільне утримання полків';

  if (militaryExpenses < 14) {
    const decay = Math.round((14 - militaryExpenses) * 1.5);
    newReadiness = clamp(newReadiness - decay, 15, 100);
    newEquipment = clamp(newEquipment - Math.round(decay * 0.8), 20, 100);
    newMorale = clamp(newMorale - Math.round(decay * 0.7), 15, 100);
    readinessReason = `Брак коштів на вишкіл та амуніцію (-${decay}%)`;
    logs.push(`Військо: через скорочення бюджету боєздатність впала на -${decay}%`);
  } else if (militaryExpenses >= 18) {
    const boost = Math.round((militaryExpenses - 17) * 1.2);
    newReadiness = clamp(newReadiness + boost, 0, 95);
    newEquipment = clamp(newEquipment + Math.round(boost * 0.8), 0, 95);
    readinessReason = `Посилене фінансування зброярень та вишколу (+${boost}%)`;
  }

  const newLogistics = calculateLogistics(avgRoads, avgRailways, militaryExpenses, avgSecurity);

  // 8. ADVANCE INVESTMENTS & STATE PROJECTS (Requirements 24 & 25)
  const updatedProjects: StateProject[] = [];
  const completedProjects: StateProject[] = [];

  for (const project of eco.stateProjects) {
    if (project.completed) {
      updatedProjects.push(project);
      continue;
    }

    const nextProgress = project.yearsProgress + years;
    if (nextProgress >= project.duration) {
      const completedPrj: StateProject = {
        ...project,
        yearsProgress: project.duration,
        completed: true,
      };
      updatedProjects.push(completedPrj);
      completedProjects.push(completedPrj);

      logs.push(`ДЕРЖАВНИЙ ПРОЄКТ ЗАВЕРШЕНО: «${project.name}»!`);
      notes.push(`Завершено великий проєкт: «${project.name}»`);

      // Apply complete consequences
      if (project.consequencesOnComplete && project.consequencesOnComplete.length > 0) {
        const appRes = applyConsequences(project.consequencesOnComplete, state, {
          scenarioTitle: project.name,
        });
        state = appRes.state;
      }
    } else {
      updatedProjects.push({
        ...project,
        yearsProgress: nextProgress,
      });
      logs.push(`Державний проєкт «${project.name}»: поступ ${nextProgress}/${project.duration} р.`);
    }
  }

  // Advance simple investments
  const updatedInvestments: Investment[] = [];
  for (const inv of eco.investments) {
    if (inv.completed) {
      updatedInvestments.push(inv);
      continue;
    }

    if (currentYear >= inv.completionYear) {
      const compInv = { ...inv, completed: true };
      updatedInvestments.push(compInv);
      logs.push(`ІНВЕСТИЦІЯ ОКУПИЛАСЯ: «${inv.name}»!`);
      notes.push(`Завершено будівництво: «${inv.name}»`);
      if (inv.effects && inv.effects.length > 0) {
        const appRes = applyConsequences(inv.effects, state, {
          scenarioTitle: inv.name,
        });
        state = appRes.state;
      }
    } else {
      updatedInvestments.push(inv);
    }
  }

  // 9. UPDATE REGIONS (Requirement 10)
  const updatedRegions = state.regions.map((reg) => {
    const regProsperity = clamp(reg.prosperity + Math.round(prosperityDelta * 0.7), 10, 100);
    const regTaxYield = Math.round((reg.economicPotential?.tax ?? 60) * 0.3 * (eco.taxBurden / 40));
    const regTradeYield = Math.round((reg.economicPotential?.trade ?? 60) * 0.25 * (eco.trade.tradeVolume / 50));
    return {
      ...reg,
      prosperity: regProsperity,
      taxContribution: regTaxYield,
      tradeContribution: regTradeYield,
    };
  });

  // 10. FACTION & POLITICAL REACTION TO ECONOMIC SHOCKS (Requirements 21, 22, 23)
  const updatedFactions = (state.factions as DetailedFaction[]).map((f) => {
    let loyaltyDelta = 0;

    // High taxes trigger backlash from communities and merchants
    if (eco.taxBurden > 50) {
      if (f.id === 'faction_communities') loyaltyDelta -= 5;
      if (f.id === 'faction_merchants') loyaltyDelta -= 4;
      if (f.id === 'faction_landed_aristocracy') loyaltyDelta -= 6;
    } else if (eco.taxBurden <= 30) {
      if (f.id === 'faction_communities') loyaltyDelta += 3;
      if (f.id === 'faction_merchants') loyaltyDelta += 4;
    }

    // High debt damages merchant confidence
    if (newDebt > 35 && f.id === 'faction_merchants') {
      loyaltyDelta -= 5;
    }

    // Military funding directly impacts Military Leadership
    if (militaryExpenses >= 18 && f.id === 'faction_military_command') {
      loyaltyDelta += 5;
    } else if (militaryExpenses < 14 && f.id === 'faction_military_command') {
      loyaltyDelta -= 8;
    }

    // Trade freedom rewards merchants
    if (eco.trade.tradeFreedom >= 65 && f.id === 'faction_merchants') {
      loyaltyDelta += 4;
    }

    if (loyaltyDelta !== 0) {
      return {
        ...f,
        loyalty: clamp(f.loyalty + loyaltyDelta, 0, 100),
      };
    }
    return f;
  });

  // 11. ANNUAL SUMMARY OBJECT
  const summary: EconomicAnnualSummary = {
    year: currentYear,
    grossIncome,
    grossExpenses,
    netBalance,
    taxRevenue: calculatedTaxRevenue,
    tradeRevenue: calculatedTradeRevenue,
    resourceRevenue: calculatedResourceRevenue,
    customsRevenue: calculatedCustomsRevenue,
    extraordinaryRevenue,
    militaryExpenses,
    administrativeExpenses,
    infrastructureExpenses,
    educationExpenses,
    debtInterest: calculatedDebtInterest,
    debtChange,
    prosperityChange: prosperityDelta,
    growthChange: Number((newGrowth - eco.economicGrowth).toFixed(1)),
    notes: [...notes, ...prosperityCalc.notes],
  };

  // Compile trends
  const treasuryDelta = newTreasury - eco.treasury;
  const treasuryReason = treasuryDelta >= 0
    ? `Доходи (+${grossIncome}) перевищили витрати (-${grossExpenses})`
    : `Витрати (-${grossExpenses}) перевищили доходи (+${grossIncome})`;

  const updatedEco: EconomyState = {
    ...eco,
    treasury: newTreasury,
    income: grossIncome,
    expenses: grossExpenses,
    taxRevenue: calculatedTaxRevenue,
    tradeRevenue: calculatedTradeRevenue,
    resourceRevenue: calculatedResourceRevenue,
    customsRevenue: calculatedCustomsRevenue,
    extraordinaryRevenue: 0, // Consumed
    debt: newDebt,
    economicGrowth: newGrowth,
    inflation: newInflation,
    publicProsperity: prosperityCalc.value,
    investments: updatedInvestments,
    stateProjects: updatedProjects,
    annualSummary: summary,
    trends: {
      treasury: treasuryDelta,
      treasuryReason,
      prosperity: prosperityDelta,
      prosperityReason: prosperityCalc.notes[0] || 'Збалансований стан господарства',
      debt: debtChange,
      debtReason: debtChange > 0 ? 'Покриття дефіциту державними запозиченнями' : debtChange < 0 ? 'Своєчасне погашення частини боргу' : 'Боргове навантаження стабільне',
      growth: summary.growthChange,
      growthReason: newGrowth > 2 ? 'Пожвавлення торгівлі та нові мануфактури' : 'Податковий та борговий тиск стримують ріст',
    },
  };

  const updatedMil: MilitaryState = {
    ...mil,
    readiness: newReadiness,
    equipment: newEquipment,
    morale: newMorale,
    logistics: newLogistics,
    militaryExpenses,
    trends: {
      strength: 0,
      strengthReason: 'Базова кадрова структура козацтва незмінна',
      readiness: newReadiness - mil.readiness,
      readinessReason,
      morale: newMorale - mil.morale,
      moraleReason: newMorale >= mil.morale ? 'Військо відчуває турботу Гетьмана' : 'Невдоволення затримками платні та старими мушкетами',
      logistics: newLogistics - mil.logistics,
      logisticsReason: newLogistics >= mil.logistics ? 'Покращення поштових трактів та станцій' : 'Погіршення сполучення з прикордонними паланками',
    },
  };

  // Keep top-level empire metrics synchronized
  state = {
    ...state,
    regions: updatedRegions,
    factions: updatedFactions,
    economy: updatedEco,
    military: updatedMil,
    empire: {
      ...state.empire,
      treasury: newTreasury,
      prosperity: prosperityCalc.value,
      militaryStrength: mil.strength,
    },
  };

  // 12. ECONOMIC CHRONICLE EVENT (Requirement 31)
  const economicEventTitle = netBalance >= 0
    ? `Річний господарський звіт ${currentYear} р.: Профіцит +${netBalance} млн крб`
    : `Річний господарський звіт ${currentYear} р.: Дефіцит ${netBalance} млн крб`;

  const chronicleDescription = `Доходи склали ${grossIncome} млн крб (податки: ${calculatedTaxRevenue}, торгівля: ${calculatedTradeRevenue}, мита: ${calculatedCustomsRevenue}). Витрати: ${grossExpenses} млн крб (армія: ${militaryExpenses}, адміністрація: ${administrativeExpenses}). Скарбниця: ${newTreasury} млн крб. Державний борг: ${newDebt} млн крб. Добробут краю: ${prosperityCalc.value}%.`;

  state = {
    ...state,
    history: [
      {
        id: 'hist_eco_' + Date.now() + '_' + currentYear,
        year: currentYear,
        timestamp: Date.now(),
        type: 'ECONOMIC_MEASURE',
        title: economicEventTitle,
        description: chronicleDescription,
        importance: Math.abs(netBalance) > 10 ? 'major' : 'standard',
        tags: ['економіка', 'бюджет', `${currentYear}`],
        category: 'decision',
      },
      ...state.history,
    ],
  };

  // Check for newly triggered economic crises
  const ecoCrises = detectEconomicCrises(state);
  for (const crisis of ecoCrises) {
    state.economy.crises = [...state.economy.crises, crisis];
    if (crisis.unlockScenarioId && !state.unlockedScenarioIds.includes(crisis.unlockScenarioId)) {
      state.unlockedScenarioIds = [...state.unlockedScenarioIds, crisis.unlockScenarioId];
    }
    logs.push(`КРИТИЧНО! СПАЛАХНУЛА ЕКОНОМІЧНА КРИЗА: ${crisis.title}`);
  }

  return { state, summary, logs };
}
