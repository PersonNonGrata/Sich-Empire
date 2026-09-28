import { describe, it, expect } from 'vitest';
import { runPoliticalEngineTests } from '../src/game/politics/politicsEngineDiagnostics.ts';
import { runEconomyEngineTests } from '../src/game/economy/economyEngineDiagnostics.ts';
import { runPsychologyEngineTests } from '../src/game/psychology/psychologyEngineDiagnostics.ts';

describe('Stage 4: Political Machine Suite', () => {
  it('executes full political engine verification', () => {
    const res = runPoliticalEngineTests();
    expect(res.success).toBe(true);
  });
});

describe('Stage 5: Material Machine Suite', () => {
  it('executes full economy and military verification', () => {
    const res = runEconomyEngineTests();
    expect(res.success).toBe(true);
  });
});

describe('Stage 6: Psychological Ascension Suite', () => {
  it('executes full psychological ascension and ruler profile verification', () => {
    const res = runPsychologyEngineTests();
    expect(res.success).toBe(true);
  });
});

