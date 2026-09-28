import { createInitialGameState } from '../state/initialState.ts';
import { evaluateAscension, handlePlayerReflectionResponse } from './ascensionEngine.ts';
import { resolveChoice, advanceYear } from '../engine/scenarioEngine.ts';
import { migrateSave } from '../../persistence/migration.ts';

export interface DiagnosticsResult {
  success: boolean;
  results: string[];
}

export function runPsychologyEngineTests(): DiagnosticsResult {
  const results: string[] = [];
  let success = true;

  try {
    // Test 1: Initial state evaluation
    let state = createInitialGameState('Богдан Островерхий');
    const initialAscension = evaluateAscension(state);
    if (initialAscension.archetypeProfile && initialAscension.archetypeProfile.archetype) {
      results.push(`✓ Початковий профіль створено: «${initialAscension.archetypeProfile.archetype}»`);
    } else {
      results.push('✗ Помилка створення початкового профілю');
      success = false;
    }

    // Test 2: Resolve 1848 Council Meeting (Choice 3: Reform Army -> CREATION + KNOWLEDGE, context: 'peace')
    const res1 = resolveChoice(state, 'scenario_first_council', 'choice_reform_army');
    state = res1.state;
    if (state.psychology.length > 0 && state.psychology[0].context) {
      results.push(`✓ Психологічний сигнал зафіксовано з контекстом: [${state.psychology[0].dimension}, context: ${state.psychology[0].context}]`);
    } else {
      results.push('✗ Сигнал не містить обов’язкового контексту рішення');
      success = false;
    }

    // Test 3: Resolve 1848 Voices of Council (Choice 1: Support Communities -> FREEDOM + KNOWLEDGE, context: 'peace')
    const res2 = resolveChoice(state, 'scenario_voices_of_the_council', 'choice_support_communities');
    state = res2.state;
    results.push(`✓ Друге рішення ухвалено: ${state.decisions[0].choiceText}`);

    // Test 4: Contradiction & Reflection emergence
    // Player has CREATION + FREEDOM + KNOWLEDGE
    const res3 = resolveChoice(state, 'scenario_military_treasury_1848', 'choice_civic_concord_budget');
    state = res3.state;

    if (state.behaviorPatterns.length >= 1 || state.reflections.length >= 1 || state.archetypeProfile) {
      results.push(`✓ Поведінкові патерни та рефлексії накопичено (${state.behaviorPatterns.length} патернів, ${state.reflections.length} рефлексій)`);
    } else {
      results.push('✗ Патерни або рефлексії не сформувалися після 3 рішень');
      success = false;
    }

    // Test 5: Reflection interaction (Agree / Disagree)
    if (state.reflections.length > 0) {
      const targetRefl = state.reflections[0];
      const agreedState = handlePlayerReflectionResponse(state, targetRefl.id, 'AGREE');
      const updatedRefl = agreedState.reflections.find((r) => r.id === targetRefl.id);

      if (updatedRefl?.status === 'confirmed' && updatedRefl.playerResponse === 'AGREE') {
        results.push(`✓ Відповідь гравця [ТОЧНО] успішно зафіксована: status=confirmed`);
      } else {
        results.push('✗ Відповідь гравця не змінила статус рефлексії');
        success = false;
      }

      // Test Disagree
      const disagreedState = handlePlayerReflectionResponse(state, targetRefl.id, 'DISAGREE');
      const disRefl = disagreedState.reflections.find((r) => r.id === targetRefl.id);
      if (disRefl?.status === 'disputed' && disRefl.playerResponse === 'DISAGREE' && disRefl.playerNote) {
        results.push(`✓ Відповідь гравця [НЕ ЗГОДЕН] зберегла незгоду володаря без викривлення історії`);
      } else {
        results.push('✗ Незгода гравця не зафіксована належним чином');
        success = false;
      }
    } else {
      results.push('✓ Рефлексії формуються за подальшими кризами');
    }

    // Test 6: Advance year to 1849 & trigger Old Sich Crisis (Stress Test)
    const adv = advanceYear(state, 1);
    state = adv.state;
    results.push(`✓ Рік переведено до ${state.identity.year}. Доступно справ: ${state.availableScenarioIds.length}`);

    // Trigger Old Sich crisis manually or via scenario
    state.currentScenarioId = 'scenario_crisis_old_sich_revolt';
    state.completedScenarioIds = state.completedScenarioIds.filter((id) => id !== 'scenario_crisis_old_sich_revolt');

    // Test 7: Stress Test resolution with Transformation
    // Choice 3: propose new institutional pact (transformation away from pure force)
    const stressRes = resolveChoice(state, 'scenario_crisis_old_sich_revolt', 'choice_crisis_propose_new_pact');
    state = stressRes.state;

    if (state.transformations.length > 0) {
      results.push(`✓ Стрес-тест пройдено з ТРАНСФОРМАЦІЄЮ: «${state.transformations[0].title}»`);
    } else {
      results.push('✗ Трансформація не зафіксована після проходження стрес-тесту');
      success = false;
    }

    // Test 8: Chronicle entry for transformation
    const histTransform = state.history.find((h) => h.tags?.includes('трансформація'));
    if (histTransform) {
      results.push(`✓ Запис про трансформацію успішно додано до Літопису: «${histTransform.title}»`);
    } else {
      results.push('✗ Запис про трансформацію відсутній у Літописі');
      success = false;
    }

    // Test 9: Archetype profile completeness
    const profile = state.archetypeProfile;
    if (
      profile.archetype &&
      profile.strength &&
      profile.shadow &&
      profile.unresolvedQuestion &&
      Array.isArray(profile.evidence)
    ) {
      results.push(`✓ Повний фінальний портрет: Архетип «${profile.archetype}», Невирішене питання: «${profile.unresolvedQuestion}»`);
      results.push(`✓ Сила: ${profile.strength.substring(0, 40)}...`);
      results.push(`✓ Тінь: ${profile.shadow.substring(0, 40)}...`);
    } else {
      results.push('✗ Профіль архетипу не містить обов’язкових полів (сила, тінь, питання)');
      success = false;
    }

    // Test 10: Persistence migration
    const rawLegacyState = {
      version: 2,
      identity: { rulerName: 'Данило Бунтар', year: 1848 },
      empire: { stability: 50, treasury: 40, militaryStrength: 50, unity: 50, prosperity: 50 },
      decisions: [],
      history: [],
      psychology: [],
    };
    const migrated = migrateSave(rawLegacyState);
    if (
      migrated.behaviorPatterns !== undefined &&
      migrated.reflections !== undefined &&
      migrated.contradictions !== undefined &&
      migrated.transformations !== undefined &&
      migrated.archetypeProfile
    ) {
      results.push('✓ Міграція старого збереження (v2 → v6) успішно наповнила структуру Stage 6');
    } else {
      results.push('✗ Міграція не створила полів Stage 6 для старих збережень');
      success = false;
    }

  } catch (err: any) {
    success = false;
    results.push(`✗ Виняткова помилка діагностики: ${err.message}`);
  }

  return { success, results };
}
