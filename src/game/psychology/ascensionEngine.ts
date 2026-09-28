import { GameState } from '../state/types.ts';
import {
  PsychologicalDimension,
  PsychologicalSignal,
  AscensionStage,
  BehaviorPattern,
  Contradiction,
  PsychologicalTensionRecord,
  Reflection,
  Insight,
  StressTest,
  TransformationEvent,
  ReflectionResponse,
} from './types.ts';
import { ArchetypeProfile, ArchetypeCode } from '../archetypes/types.ts';
import {
  ARCHETYPE_CATALOG,
  BASE_PSYCHOLOGICAL_TENSIONS,
  PATTERN_RULES,
  CONTRADICTION_RULES,
  REFLECTIONS_CATALOG,
  INSIGHTS_CATALOG,
} from './data/ascensionCatalog.ts';
import { calculatePsychologicalScore, getPsychologicalSummary } from './manager.ts';

export interface AscensionEvaluationResult {
  behaviorPatterns: BehaviorPattern[];
  contradictions: Contradiction[];
  tensionRecords: PsychologicalTensionRecord[];
  reflections: Reflection[];
  insights: Insight[];
  stressTests: StressTest[];
  transformations: TransformationEvent[];
  ascensionStage: AscensionStage;
  archetypeProfile: ArchetypeProfile;
  newTransformations: TransformationEvent[];
  newReflections: Reflection[];
}

/**
 * Stage 6 Psychological Ascension Evaluator.
 * Pure, deterministic evaluation of the ruler's character evolution from real historical actions.
 */
export function evaluateAscension(state: GameState): AscensionEvaluationResult {
  const decisions = state.decisions || [];
  const signals = state.psychology || [];
  const existingPatterns = state.behaviorPatterns || [];
  const existingContradictions = state.contradictions || [];
  const existingReflections = state.reflections || [];
  const existingInsights = state.insights || [];
  const existingStressTests = state.stressTests || [];
  const existingTransformations = state.transformations || [];

  const summary = getPsychologicalSummary(signals);

  // 1. EVALUATE BEHAVIOR PATTERNS
  const behaviorPatterns: BehaviorPattern[] = [];

  for (const rule of PATTERN_RULES) {
    const matchingSignals = signals.filter((s) => {
      if (s.dimension !== rule.dimension) return false;
      if (rule.contexts && s.context && !rule.contexts.includes(s.context)) {
        return false;
      }
      return true;
    });

    const decisionCount = matchingSignals.length;
    if (decisionCount >= rule.minFrequency) {
      const relatedDecisions = Array.from(
        new Set(
          matchingSignals
            .map((s) => s.sourceDecisionId)
            .filter((id): id is string => Boolean(id))
        )
      );

      const observedYears = decisions
        .filter((d) => relatedDecisions.includes(d.id))
        .map((d) => d.year);

      const firstYear = observedYears.length > 0 ? Math.min(...observedYears) : state.identity.year;
      const lastYear = observedYears.length > 0 ? Math.max(...observedYears) : state.identity.year;

      const contexts = Array.from(
        new Set(matchingSignals.map((s) => s.context).filter((c): c is any => Boolean(c)))
      );

      behaviorPatterns.push({
        id: rule.id,
        dimension: rule.dimension,
        title: rule.title,
        description: rule.description,
        strength: matchingSignals.reduce((acc, s) => acc + s.value, 0) * 10,
        frequency: decisionCount,
        consistency: Math.min(1, decisionCount / Math.max(1, decisions.length)),
        firstObservedYear: firstYear,
        lastObservedYear: lastYear,
        decisionCount,
        contexts,
        relatedDecisions,
        contradictions: [],
      });
    }
  }

  // Preserve any previously formed patterns that might not match current filter
  for (const oldPattern of existingPatterns) {
    if (!behaviorPatterns.some((p) => p.id === oldPattern.id)) {
      behaviorPatterns.push(oldPattern);
    }
  }

  // 2. DETECT CONTRADICTIONS
  const contradictions: Contradiction[] = [];

  // Check custom dynamic contradictions from signals and decisions
  for (const rule of CONTRADICTION_RULES) {
    const scoreA = (summary[rule.poleA] || 0) + (rule.poleA === 'ORDER' ? summary.CENTRALIZATION || 0 : 0);
    const scoreB = (summary[rule.poleB] || 0) + (rule.poleB === 'FREEDOM' ? summary.AUTONOMY || 0 : 0);

    // Contradiction surfaces when both opposite poles have distinct manifestations
    if (scoreA >= 1 && scoreB >= 1) {
      const evidenceA = decisions
        .filter((d) => (d.psychologicalSignals || []).some((s) => s.includes(rule.poleA)))
        .map((d) => `${d.year} р.: «${d.choiceText}»`);

      const evidenceB = decisions
        .filter((d) => (d.psychologicalSignals || []).some((s) => s.includes(rule.poleB)))
        .map((d) => `${d.year} р.: «${d.choiceText}»`);

      contradictions.push({
        id: rule.id,
        poleA: rule.poleA,
        poleB: rule.poleB,
        title: rule.title,
        description: rule.description,
        intensity: Math.min(100, (scoreA + scoreB) * 15),
        detectedYear: state.identity.year,
        evidenceA,
        evidenceB,
        unresolvedQuestion: rule.unresolvedQuestion,
      });
    }
  }

  // Link contradictions back into patterns
  for (const pat of behaviorPatterns) {
    pat.contradictions = contradictions
      .filter((c) => c.poleA === pat.dimension || c.poleB === pat.dimension)
      .map((c) => c.id);
  }

  // 3. PSYCHOLOGICAL TENSIONS (Dual poles)
  const tensionRecords: PsychologicalTensionRecord[] = BASE_PSYCHOLOGICAL_TENSIONS.map((base) => {
    const scoreA = summary[base.poleA] || 0;
    const scoreB = summary[base.poleB] || 0;
    const total = scoreA + scoreB;

    let balanceState: PsychologicalTensionRecord['balanceState'] = 'equipoise';
    let balanceValue = 0; // -100 to +100

    if (total > 0) {
      balanceValue = Math.round(((scoreB - scoreA) / total) * 100);
      if (Math.abs(balanceValue) < 25) {
        balanceState = 'equipoise';
      } else if (balanceValue < -50) {
        balanceState = 'acute_crisis';
      } else if (balanceValue < 0) {
        balanceState = 'leaning_a';
      } else if (balanceValue > 50) {
        balanceState = 'acute_crisis';
      } else {
        balanceState = 'leaning_b';
      }
    }

    let description = '';
    if (balanceState === 'equipoise') {
      description = `Свідомий баланс: правитель тримає рівновагу між засадами «${base.labelA}» та «${base.labelB}».`;
    } else if (balanceState === 'leaning_a' || (balanceState === 'acute_crisis' && balanceValue < 0)) {
      description = `Перевага схиляється до полюсу «${base.labelA}». ${base.descriptionA}`;
    } else {
      description = `Перевага схиляється до полюсу «${base.labelB}». ${base.descriptionB}`;
    }

    const evidence = decisions
      .filter((d) =>
        (d.psychologicalSignals || []).some(
          (s) => s.includes(base.poleA) || s.includes(base.poleB)
        )
      )
      .slice(0, 3)
      .map((d) => `«${d.title}» (${d.year} р.): ${d.choiceText}`);

    return {
      id: base.id,
      poleA: base.poleA,
      poleB: base.poleB,
      labelA: base.labelA,
      labelB: base.labelB,
      value: balanceValue,
      balanceState,
      description,
      evidence,
    };
  });

  // 4. REFLECTIONS & PLAYER CONFIRMATION
  const reflections: Reflection[] = [...existingReflections];
  const newReflections: Reflection[] = [];

  for (const item of REFLECTIONS_CATALOG) {
    const alreadyExists = reflections.some((r) => r.id === item.id);
    let conditionMet = false;

    if (item.conditionType === 'contradiction') {
      conditionMet = contradictions.some((c) => c.id === item.conditionKey);
    } else if (item.conditionType === 'pattern') {
      conditionMet = behaviorPatterns.some((p) => p.id === item.conditionKey);
    } else if (item.conditionType === 'high_order_restrained_power') {
      // Order is high, but power/dominance is restrained or responsibility is present
      const orderPresent = (summary.ORDER || 0) + (summary.CENTRALIZATION || 0) >= 1;
      const restraintPresent = (summary.RESPONSIBILITY || 0) >= 1 || (summary.FREEDOM || 0) >= 1;
      conditionMet = orderPresent && restraintPresent;
    } else if (item.conditionType === 'stress_test_passed') {
      conditionMet = existingTransformations.length > 0;
    }

    if (conditionMet && !alreadyExists && decisions.length >= 4) {
      const matchingDecisions = decisions.slice(0, 4).map((d) => d.id);
      const newRefl: Reflection = {
        id: item.id,
        title: item.title,
        observation: item.observation,
        triggerYear: state.identity.year,
        relatedPatternIds: behaviorPatterns.map((p) => p.id),
        relatedContradictionId: contradictions.length > 0 ? contradictions[0].id : undefined,
        relatedDecisionIds: matchingDecisions,
        status: 'pending',
      };
      reflections.push(newRefl);
      newReflections.push(newRefl);
    }
  }

  // 5. INSIGHTS (Deep realization from reflections and decisions)
  const insights: Insight[] = [...existingInsights];

  for (const item of INSIGHTS_CATALOG) {
    const alreadyExists = insights.some((ins) => ins.id === item.id);
    const relatedRefl = reflections.find((r) => r.id === item.triggerReflectionId);

    // Insight activates when the reflection is confirmed (or partially confirmed)
    // or when at least 3 decisions and a contradiction exist
    const isTriggered =
      (relatedRefl && (relatedRefl.status === 'confirmed' || relatedRefl.status === 'partially_confirmed')) ||
      (decisions.length >= 5 && contradictions.length > 0 && Boolean(relatedRefl));

    if (isTriggered && !alreadyExists) {
      insights.push({
        id: item.id,
        title: item.title,
        text: item.text,
        year: state.identity.year,
        basis: item.basis,
        relatedDecisionIds: decisions.slice(0, 3).map((d) => d.id),
        active: true,
      });
    }
  }

  // 6. STRESS TESTS & TRANSFORMATIONS EVALUATION
  const stressTests: StressTest[] = [...existingStressTests];
  const transformations: TransformationEvent[] = [...existingTransformations];
  const newTransformations: TransformationEvent[] = [];

  // Stress Test 1: 1849 Old Sich Revolt Crisis
  const sichCrisisScenario = 'scenario_crisis_old_sich_revolt';
  const hasTriggeredSichCrisis =
    state.completedScenarioIds.includes(sichCrisisScenario) ||
    state.currentScenarioId === sichCrisisScenario ||
    (state.crises || []).some((c) => c.id === 'crisis_voice_of_old_sich');

  const existingSichTest = stressTests.find((st) => st.id === 'stresstest_1849_old_sich_crisis');

  if (hasTriggeredSichCrisis && !existingSichTest) {
    // Stage 7 Requirement 5: Stress Test is generated from player's prior behavior
    const hasCentralized = (state.reputationTags || []).includes('Встановив столичний нагляд') || (summary.ORDER || 0) >= 2;
    const hasCivic = (state.reputationTags || []).includes('Заступився за громади') || (summary.FREEDOM || 0) >= 2;

    let testTitle = 'Випробування Бунтом Низового Війська';
    let testPremise = 'Козацькі курені Хортиці вимагають вольностей під загрозою шабель. Вибір: придушити бунт силою гармат чи створити постійну Палату Отаманів.';
    let testedPat = 'pattern_order_in_crisis';

    if (hasCentralized) {
      testTitle = 'Випробування Силової Вертикалі: Бунт Низового Війська';
      testPremise = 'Ти роками зміцнював столичний нагляд та наказував провінціям. Тепер Низове Військо на Хортиці повстало проти твоїх інспекторів. Чи продовжиш ти тиск гарматами, чи зумієш перейти до соборного інституційного договору?';
      testedPat = 'pattern_order_in_crisis';
    } else if (hasCivic) {
      testTitle = 'Випробування Вольності: Соборний Рубіж Хортиці';
      testPremise = 'Ти надав свободу громадам, але отамани Хортиці вимагають окремого суверенітету для шаблі. Чи зумієш ти узгодити козацьку вольницю із законом, не скочуючись до збройної різанини?';
      testedPat = 'pattern_civic_freedom';
    }

    stressTests.push({
      id: 'stresstest_1849_old_sich_crisis',
      scenarioId: sichCrisisScenario,
      testedPatternId: testedPat,
      testedDimension: 'POWER',
      opposingDimension: 'RESPONSIBILITY',
      title: testTitle,
      premise: testPremise,
      targetChoiceOldModel: 'choice_crisis_threaten_force',
      targetChoiceNewModel: 'choice_crisis_propose_new_pact',
      status: 'pending',
      yearTriggered: 1849,
    });
  }

  // Check if Stress Test was resolved
  const testToResolve = stressTests.find((st) => st.id === 'stresstest_1849_old_sich_crisis' && st.status === 'pending');
  if (testToResolve && state.completedScenarioIds.includes(sichCrisisScenario)) {
    const pactDecision = decisions.find((d) => d.choiceId === 'choice_crisis_propose_new_pact');
    const forceDecision = decisions.find((d) => d.choiceId === 'choice_crisis_threaten_force');

    if (pactDecision) {
      testToResolve.status = 'passed_transformed';
      testToResolve.yearResolved = pactDecision.year;
      testToResolve.resolutionNote =
        'Гетьман подолав спокусу швидкого силового розстрілу і натомість уклав Соборний Інституційний Пакт із Низовим Військом.';

      // Check if transformation already recorded
      if (!transformations.some((t) => t.id === 'trans_force_to_institutional_pact')) {
        const transEvt: TransformationEvent = {
          id: 'trans_force_to_institutional_pact',
          year: pactDecision.year,
          title: 'Перелом влади: від силового примусу до соборного договору',
          fromState: 'Прямий військовий наказ та загроза зброєю',
          toState: 'Інституційний соборний консенсус та Палата Отаманів',
          description:
            'Перед лицем розколу та бунту Хортиці Гетьман не націлив гармати, а заснував постійну Палату Військових Отаманів. Відбувся перелом від автократії до високого інституційного парламентаризму.',
          catalystDecisionId: pactDecision.id,
          stressTestId: testToResolve.id,
        };
        transformations.push(transEvt);
        newTransformations.push(transEvt);
      }
    } else if (forceDecision) {
      testToResolve.status = 'passed_retained';
      testToResolve.yearResolved = forceDecision.year;
      testToResolve.resolutionNote =
        'Гетьман залишився вірним старій моделі залізної руки, придушивши опозицію погрозою артилерії.';
    }
  }

  // 7. CURRENT ASCENSION STAGE
  let ascensionStage: AscensionStage = 'EXPERIENCE';
  if (transformations.length > 0) {
    ascensionStage = 'TRANSFORMATION';
  } else if (stressTests.length > 0) {
    ascensionStage = 'STRESS_TEST';
  } else if (insights.length > 0) {
    ascensionStage = 'INSIGHT';
  } else if (reflections.length > 0) {
    ascensionStage = 'REFLECTION';
  } else if (contradictions.length > 0 || tensionRecords.some((t) => t.balanceState !== 'equipoise')) {
    ascensionStage = 'TENSION';
  } else if (behaviorPatterns.length > 0 && decisions.length >= 4) {
    ascensionStage = 'PATTERN';
  }

  // 8. RICH ARCHETYPE EVALUATION (Requirement 15, 16, 17, 18, 19, 20)
  // Calculate archetype strength from whole journey: decisions + patterns + contexts + contradictions + transformations
  const archetypeScores: Record<ArchetypeCode, number> = {
    ARCHITECT: 0,
    GUARDIAN: 0,
    REFORMER: 0,
    UNIFIER: 0,
    SOVEREIGN: 0,
    CONQUEROR: 0,
    LEGISLATOR: 0,
    SAGE: 0,
  };

  for (const [code, def] of Object.entries(ARCHETYPE_CATALOG) as [ArchetypeCode, typeof ARCHETYPE_CATALOG[ArchetypeCode]][]) {
    let score = 0;
    for (const dim of def.coreDimensions) {
      score += summary[dim] || 0;
    }
    // Bonus for matching patterns
    if (code === 'ARCHITECT' && behaviorPatterns.some((p) => p.id === 'pattern_creation_reforms')) score += 3;
    if (code === 'GUARDIAN' && behaviorPatterns.some((p) => p.id === 'pattern_traditional_ancestry')) score += 3;
    if (code === 'REFORMER' && summary.CREATION >= 1 && summary.KNOWLEDGE >= 1) score += 3;
    if (code === 'UNIFIER' && transformations.length > 0) score += 4;
    if (code === 'LEGISLATOR' && behaviorPatterns.some((p) => p.id === 'pattern_power_restraint')) score += 4;
    if (code === 'SOVEREIGN' && (summary.POWER >= 2 || summary.DOMINANCE >= 2)) score += 3;

    archetypeScores[code] = score;
  }

  // Sort archetypes by calculated alignment
  const sortedArchetypes = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]) as [
    ArchetypeCode,
    number
  ][];

  const primaryCode = sortedArchetypes[0][0];
  const primaryDef = ARCHETYPE_CATALOG[primaryCode];
  const secondaryCode = sortedArchetypes[1] && sortedArchetypes[1][1] > 0 ? sortedArchetypes[1][0] : undefined;
  const secondaryDef = secondaryCode ? ARCHETYPE_CATALOG[secondaryCode] : undefined;

  // Stage 7 Requirement 6: Progressive Archetype Emergence (Never reveal final archetype too early)
  const decCount = decisions.length;
  let crystallizationStage: ArchetypeProfile['crystallizationStage'] = 'EMERGING';
  let progressionNote = 'Ти починаєш часто обирати перші рішення. Внутрішній стрижень лише окреслюється у перших універсалах.';
  let compositeTitle = primaryDef.title;

  if (decCount <= 3) {
    crystallizationStage = 'EMERGING';
    if ((summary.ORDER || 0) + (summary.CENTRALIZATION || 0) >= 1) {
      progressionNote = 'Ти починаєш часто обирати централізовані рішення та мілітарний порядок.';
    } else if ((summary.FREEDOM || 0) >= 1) {
      progressionNote = 'Ти починаєш часто обирати рішення на користь самоврядування та свободи громад.';
    } else if ((summary.CREATION || 0) + (summary.KNOWLEDGE || 0) >= 1) {
      progressionNote = 'Ти починаєш часто обирати модернізацію та нові інженерні шляхи.';
    } else {
      progressionNote = 'Ти робиш перші зважені кроки, намацуючи баланс сил у Раді.';
    }
    compositeTitle = `Нарис: ${primaryDef.title} (зародження)`;
  } else if (decCount === 4 && state.identity.year < 1850) {
    crystallizationStage = 'FORMING';
    if ((summary.ORDER || 0) + (summary.POWER || 0) >= 2) {
      progressionNote = 'Твої рішення дедалі частіше будуються навколо контролю, дисципліни та сильної руки.';
    } else if ((summary.FREEDOM || 0) >= 2) {
      progressionNote = 'Твої рішення дедалі частіше будуються навколо прав громад та вільного розвитку міст.';
    } else if ((summary.CREATION || 0) + (summary.KNOWLEDGE || 0) >= 2) {
      progressionNote = 'Твої рішення дедалі частіше будуються навколо реформ, науки та технологічного поступу.';
    } else {
      progressionNote = 'Твої рішення дедалі частіше будуються навколо соборного миру та балансу інтересів станів.';
    }
    compositeTitle = `Визрівання: ${primaryDef.title}`;
  } else if (decCount >= 4 && transformations.length === 0 && state.identity.year < 1850) {
    crystallizationStage = 'CRYSTALLIZING';
    if ((summary.ORDER || 0) + (summary.POWER || 0) >= 3) {
      progressionNote = 'Ти створив державу, яка дедалі більше залежить від твоєї особистої волі та центрального нагляду.';
    } else if ((summary.FREEDOM || 0) >= 2) {
      progressionNote = 'Ти створив державу, де регіони та громади відчули власну вагу і вимагають рахуватися з ними.';
    } else {
      progressionNote = 'Ти створив інституційний баланс, який вимагає від тебе щоденного гармонізування протилежних сил.';
    }
    compositeTitle = `Переддень перелому: ${primaryDef.title}`;
  } else if (decCount >= 5 && state.identity.year >= 1850) {
    crystallizationStage = 'REVEALED';
    progressionNote = 'Твій архетип правління пройшов крізь перші випробування і починає кристалізуватися в історію Імперії Січ.';
    compositeTitle = primaryDef.title;
  } else {
    crystallizationStage = 'CRYSTALLIZING';
    progressionNote = 'Твій архетип правління пройшов крізь вогонь криз і кристалізувався в історію Імперії Січ.';
    compositeTitle =
      secondaryDef && sortedArchetypes[0][1] - sortedArchetypes[1][1] <= 2 && sortedArchetypes[0][1] >= 2
        ? `${primaryDef.title}-${secondaryDef.title}`
        : primaryDef.title;
  }

  // Evidence list
  const evidenceList: string[] = [];
  for (const pat of behaviorPatterns.slice(0, 3)) {
    evidenceList.push(`Патерн: ${pat.title}`);
  }
  for (const dec of decisions.slice(0, 3)) {
    evidenceList.push(`Універсал ${dec.year} р.: «${dec.choiceText}»`);
  }
  if (evidenceList.length === 0) {
    evidenceList.push('Перші кроки правління на Великій Раді 1848 року.');
  }

  // Unresolved question from player's active contradiction, or archetype's core question
  const activeContradiction = contradictions.length > 0 ? contradictions[0] : null;
  const unresolvedQuestion = activeContradiction
    ? activeContradiction.unresolvedQuestion
    : primaryDef.defaultUnresolvedQuestion;

  const keyDecisionsTitles = decisions.slice(0, 4).map((d) => `${d.year} р. — «${d.title}»: ${d.choiceText}`);

  const archetypeProfile: ArchetypeProfile = {
    archetype: compositeTitle,
    archetypeCode: primaryCode,
    secondaryArchetype: secondaryDef ? secondaryDef.title : undefined,
    summaryQuote: primaryDef.summaryQuote,
    evidence: evidenceList,
    strength: primaryDef.strength,
    shadow: primaryDef.shadow,
    contradiction: activeContradiction
      ? activeContradiction.description
      : 'Внутрішні полюси влади перебувають у динамічному пошуку рівноваги.',
    transformations: transformations.map((t) => t.title),
    unresolvedQuestion,
    keyDecisions: keyDecisionsTitles,
    calculatedAtYear: state.identity.year,
    crystallizationStage,
    progressionNote,

    // Internal backwards compatibility:
    dominantTendencies: [
      { dimension: primaryDef.coreDimensions[0], score: summary[primaryDef.coreDimensions[0]] || 0, title: primaryDef.title },
    ],
    secondaryTendencies: secondaryDef
      ? [{ dimension: secondaryDef.coreDimensions[0], score: summary[secondaryDef.coreDimensions[0]] || 0, title: secondaryDef.title }]
      : [],
    tensionsAndContradictions: contradictions.map((c) => c.title),
    recognizedStrengths: [primaryDef.strength],
    shadowRisks: [primaryDef.shadow],
    historicalPrecedents: primaryDef.historicalPrecedents,
    tentativeArchetypeTitle: compositeTitle,
  };

  return {
    behaviorPatterns,
    contradictions,
    tensionRecords,
    reflections,
    insights,
    stressTests,
    transformations,
    ascensionStage,
    archetypeProfile,
    newTransformations,
    newReflections,
  };
}

/**
 * Updates player response to a reflection ('AGREE', 'PARTIAL', 'DISAGREE').
 * Note: If 'DISAGREE', facts are not altered, but playerDisagreement is preserved.
 */
export function handlePlayerReflectionResponse(
  state: GameState,
  reflectionId: string,
  response: ReflectionResponse,
  note?: string
): GameState {
  const currentReflections = state.reflections || [];
  const updatedReflections = currentReflections.map((r) => {
    if (r.id !== reflectionId) return r;

    let status: Reflection['status'] = 'confirmed';
    if (response === 'PARTIAL') status = 'partially_confirmed';
    if (response === 'DISAGREE') status = 'disputed';

    return {
      ...r,
      status,
      playerResponse: response,
      playerResponseYear: state.identity.year,
      playerNote: note || (response === 'DISAGREE' ? 'Гетьман не погодився зі спостереженням' : undefined),
    };
  });

  const nextState: GameState = {
    ...state,
    reflections: updatedReflections,
  };

  // Re-evaluate ascension with updated reflections
  const evalResult = evaluateAscension(nextState);

  return {
    ...nextState,
    behaviorPatterns: evalResult.behaviorPatterns,
    contradictions: evalResult.contradictions,
    tensionRecords: evalResult.tensionRecords,
    reflections: evalResult.reflections,
    insights: evalResult.insights,
    stressTests: evalResult.stressTests,
    transformations: evalResult.transformations,
    ascensionStage: evalResult.ascensionStage,
    archetypeProfile: evalResult.archetypeProfile,
  };
}
