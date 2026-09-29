import React, { useState } from 'react';
import { GameState } from '../game/state/types.ts';
import { Scenario } from '../game/scenarios/types.ts';
import { getScenarioById } from '../game/scenarios/registry.ts';
import { getYearAgenda, getAdaptedScenarioById, ChoiceResolutionResult } from '../game/engine/scenarioEngine.ts';
import { deriveCharacterExpectation } from '../game/narrative/narrativeEngine.ts';
import { ScenarioView } from './council/ScenarioView.tsx';
import { ProgressBar } from './ui/ProgressBar.tsx';
import { WaxSeal } from './ui/WaxSeal.tsx';
import { MetricModal, MetricType } from './ui/MetricModal.tsx';
import {
  Landmark,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle,
  FastForward,
  Scroll,
  Shield,
  Coins,
  Crown,
  AlertTriangle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { calculateLegitimacy } from '../game/politics/evaluator.ts';

interface CouncilViewProps {
  state: GameState;
  onStartScenario: (scenarioId: string) => void;
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  lastResolutionResult?: ChoiceResolutionResult | null;
  onContinue: () => void;
  onNegotiateFactionDemand: (demandId: string, action: 'concession' | 'guarantee' | 'bargain' | 'refuse') => void;
  onAdvanceYear: () => void;
}

export const CouncilView: React.FC<CouncilViewProps> = ({
  state,
  onStartScenario,
  onSelectChoice,
  lastExecutionLogs,
  lastResolutionResult,
  onContinue,
  onNegotiateFactionDemand,
  onAdvanceYear,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const currentScenario = state.currentScenarioId
    ? (getAdaptedScenarioById(state.currentScenarioId, state) || getScenarioById(state.currentScenarioId))
    : null;

  // Active scenario is open -> Show the full Scenario Paper Chamber
  if (currentScenario) {
    const charactersWithExpectations = state.characters.map((c) => ({
      ...c,
      expectation: c.expectation || deriveCharacterExpectation(c, state),
    }));

    return (
      <ScenarioView
        scenario={currentScenario}
        state={state}
        characters={charactersWithExpectations}
        onSelectChoice={onSelectChoice}
        lastExecutionLogs={lastExecutionLogs}
        lastResolutionResult={lastResolutionResult}
        onContinue={onContinue}
        onNegotiateFactionDemand={onNegotiateFactionDemand}
      />
    );
  }

  const { identity, empire, politicalWill = 55, crises = [] } = state;
  const activeCrises = crises.filter((c) => c.active);
  const legitimacyResult = calculateLegitimacy(state);
  const agenda = getYearAgenda(state);
  const availableScenarios = agenda.availableScenarios;
  const currentAffair = availableScenarios.length > 0 ? availableScenarios[0] : null;
  const yearSummary = state.yearSummary;

  const latestDecision = state.decisions.length > 0 ? state.decisions[0] : null;
  const pendingConsequencesCount = (state.consequences || []).filter((c) => !c.resolved).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Active Crisis Alert Banner */}
      {activeCrises.length > 0 && (
        <div className="bg-[#2A0E14] border-2 border-[#EF4444] rounded-xl p-4 md:p-5 flex items-start gap-3 shadow-2xl animate-pulse">
          <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-base md:text-lg font-bold text-[#FEE2E2]">
              УВАГА: СПАЛАХНУЛА ПОЛІТИЧНА КРИЗА!
            </h4>
            <p className="text-xs text-[#FCA5A5] leading-relaxed">
              {activeCrises[0].title}: {activeCrises[0].description}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MOBILE ONLY: СТАН ДЕРЖАВИ (Section 7 & 24 Specification)       */}
      {/* ============================================================== */}
      <section className="block md:hidden bg-[#0D111A] border border-[#232A39] rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-widest text-[#8E93A0] font-bold">
            {identity.year} РІК · Стан Держави
          </span>
          <span className="text-[10px] font-mono text-[#C9A96E]">
            Масштаб 0—100
          </span>
        </div>

        {/* 2x2 Grid per Section 7 */}
        <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
          {/* 1. Скарбниця */}
          <button
            onClick={() => setSelectedMetric('treasury')}
            className="p-3 rounded-lg bg-[#111622] hover:bg-[#161D2C] active:bg-[#1A2234] border border-[#232B3B] hover:border-[#FBBF24]/50 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[70px]"
            title="Скарбниця"
          >
            <div className="flex items-center justify-between text-[#8E93A0] text-xs">
              <span className="font-sans font-medium text-[#C8CDD8]">Скарбниця</span>
              <Coins className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-lg text-[#FBBF24]">
                {state.economy?.treasury ?? empire.treasury}M
              </span>
              {state.economy && (
                <span
                  className={`text-[10px] font-bold ${
                    state.economy.trends.treasury >= 0 ? 'text-[#34D399]' : 'text-[#EF4444]'
                  }`}
                >
                  {state.economy.trends.treasury >= 0
                    ? `+${state.economy.trends.treasury}↑`
                    : `${state.economy.trends.treasury}↓`}
                </span>
              )}
            </div>
          </button>

          {/* 2. Військо */}
          <button
            onClick={() => setSelectedMetric('militaryStrength')}
            className="p-3 rounded-lg bg-[#111622] hover:bg-[#161D2C] active:bg-[#1A2234] border border-[#232B3B] hover:border-[#EF4444]/50 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[70px]"
            title="Військова готовність та міць"
          >
            <div className="flex items-center justify-between text-[#8E93A0] text-xs">
              <span className="font-sans font-medium text-[#C8CDD8]">Військо</span>
              <Shield className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-lg text-[#EF4444]">
                {empire.militaryStrength}%
              </span>
              <span className="text-[10px] text-[#8E93A0]">
                (Гот. {state.military?.readiness ?? 70}%)
              </span>
            </div>
          </button>

          {/* 3. Стабільність */}
          <button
            onClick={() => setSelectedMetric('stability')}
            className="p-3 rounded-lg bg-[#111622] hover:bg-[#161D2C] active:bg-[#1A2234] border border-[#232B3B] hover:border-[#60A5FA]/50 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[70px]"
            title="Спокій та стабільність"
          >
            <div className="flex items-center justify-between text-[#8E93A0] text-xs">
              <span className="font-sans font-medium text-[#C8CDD8]">Стабільн.</span>
              <Landmark className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div className="mt-1">
              <span className="font-bold text-lg text-[#F3EFE6]">
                {empire.stability}%
              </span>
            </div>
          </button>

          {/* 4. Єдність та Добробут */}
          <button
            onClick={() => setSelectedMetric('unity')}
            className="p-3 rounded-lg bg-[#111622] hover:bg-[#161D2C] active:bg-[#1A2234] border border-[#232B3B] hover:border-[#A855F7]/50 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[70px]"
            title="Єдність та добробут"
          >
            <div className="flex items-center justify-between text-[#8E93A0] text-xs">
              <span className="font-sans font-medium text-[#C8CDD8]">Єдність</span>
              <Crown className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-lg text-[#E9D5FF]">
                {empire.unity}%
              </span>
              <span className="text-[10px] text-[#34D399]">
                (Добр. {empire.prosperity}%)
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* DESKTOP ONLY: CURRENT YEAR · ГЕТЬМАН · ІМПЕРІЯ СІЧ             */}
      {/* ============================================================== */}
      <section className="hidden md:block bg-[#0D111A] border border-[#232A39] rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none text-[#C9A96E]">
          <Landmark className="w-56 h-56" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2536]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
              <span>ПОТОЧНИЙ РІК — {identity.year}</span>
              <span>·</span>
              <span>{identity.rulerTitle}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F3EFE6] tracking-wide">
              Велика Рада Хортиці
            </h2>
            <p className="text-xs text-[#8E93A0]">
              Володар: <strong className="text-[#E0DDD5]">{identity.rulerName}</strong>. Час рухається послідовно від рішення до рішення.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </div>

        {/* Political Power Header Strip */}
        <div className="py-4 border-b border-[#1E2536] grid grid-cols-2 gap-4">
          <div className="bg-[#121622] p-3 rounded-lg border border-[#222B3D] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#8E93A0]">
                Легітимність Влади
              </div>
              <div className="font-serif text-lg font-bold text-[#C9A96E]">
                {legitimacyResult.aggregate}%
              </div>
            </div>
            <Crown className="w-5 h-5 text-[#C9A96E]" />
          </div>

          <div className="bg-[#121622] p-3 rounded-lg border border-[#222B3D] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#8E93A0]">
                Політична воля
              </div>
              <div className="font-serif text-lg font-bold text-[#38BDF8]">
                {politicalWill}%
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
          </div>
        </div>

        {/* 5 CORE IMPERIAL METRICS */}
        <div className="pt-6 space-y-4">
          <div className="text-[11px] uppercase font-mono tracking-widest text-[#8E93A0] font-semibold flex items-center justify-between">
            <span>Стан Держави ({identity.year} р.)</span>
            <span className="text-[10px] text-[#C9A96E] font-normal">
              Масштаб 0—100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProgressBar
              label="Стабільність"
              value={empire.stability}
              unit="%"
              color="blue"
              onClick={() => setSelectedMetric('stability')}
            />

            <ProgressBar
              label="Скарбниця"
              value={empire.treasury}
              unit="M"
              color="amber"
              onClick={() => setSelectedMetric('treasury')}
            />

            <ProgressBar
              label="Військо"
              value={empire.militaryStrength}
              unit="%"
              color="red"
              onClick={() => setSelectedMetric('militaryStrength')}
            />

            <ProgressBar
              label="Єдність"
              value={empire.unity}
              unit="%"
              color="purple"
              onClick={() => setSelectedMetric('unity')}
            />

            <div className="sm:col-span-2">
              <ProgressBar
                label="Процвітання"
                value={empire.prosperity}
                unit="%"
                color="green"
                onClick={() => setSelectedMetric('prosperity')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 13: РІЧНИЙ ПІДСУМОК (YEAR SUMMARY VIEW)                */}
      {/* ============================================================== */}
      {(yearSummary || (agenda.isYearComplete && availableScenarios.length === 0)) ? (
        <section className="bg-gradient-to-b from-[#141A28] to-[#0A0D15] border-2 border-[#C9A96E] rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2 border-b border-[#232B3C] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241F14] border border-[#C9A96E]/50 text-xs font-mono font-bold text-[#FBBF24] uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>{identity.year} РІК ЗАВЕРШЕНО</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#F3EFE6]">
              Підсумок Державного Правління за {identity.year} рік
            </h3>
            <p className="text-xs md:text-sm text-[#A8AFBD] max-w-xl mx-auto">
              Усі нагальні державні справи року вирішено. Накопичені наслідки ухвал перераховано у літопис та фінансові книги.
            </p>
          </div>

          {/* Core Metrics Evolution Grid (Start -> End) */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold">
              ЗМІНИ ПОКАЗНИКІВ ДЕРЖАВИ ЗА РІК:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#101522] border border-[#232D42]">
                <span className="text-[#8E93A0] block text-[10px]">СКАРБНИЦЯ</span>
                <div className="font-bold text-base text-[#FBBF24] mt-1">
                  {state.yearProgress?.yearStartMetrics?.treasury ?? empire.treasury}M → {empire.treasury}M
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101522] border border-[#232D42]">
                <span className="text-[#8E93A0] block text-[10px]">ВІЙСЬКО</span>
                <div className="font-bold text-base text-[#EF4444] mt-1">
                  {state.yearProgress?.yearStartMetrics?.militaryStrength ?? empire.militaryStrength}% → {empire.militaryStrength}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101522] border border-[#232D42]">
                <span className="text-[#8E93A0] block text-[10px]">СТАБІЛЬНІСТЬ</span>
                <div className="font-bold text-base text-[#60A5FA] mt-1">
                  {state.yearProgress?.yearStartMetrics?.stability ?? empire.stability}% → {empire.stability}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101522] border border-[#232D42]">
                <span className="text-[#8E93A0] block text-[10px]">ЄДНІСТЬ</span>
                <div className="font-bold text-base text-[#A855F7] mt-1">
                  {state.yearProgress?.yearStartMetrics?.unity ?? empire.unity}% → {empire.unity}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101522] border border-[#232D42] col-span-2 sm:col-span-1">
                <span className="text-[#8E93A0] block text-[10px]">ДОБРОБУТ</span>
                <div className="font-bold text-base text-[#34D399] mt-1">
                  {state.yearProgress?.yearStartMetrics?.prosperity ?? empire.prosperity}% → {empire.prosperity}%
                </div>
              </div>
            </div>
          </div>

          {/* Annual Statistics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-[#101522] border border-[#232D42] space-y-1">
              <div className="text-[10px] uppercase font-mono text-[#8E93A0]">УХВАЛЕНО РІШЕНЬ</div>
              <div className="text-xl font-serif font-bold text-[#F3EFE6]">
                {agenda.completedScenarios.length} ухвалено
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#101522] border border-[#232D42] space-y-1">
              <div className="text-[10px] uppercase font-mono text-[#8E93A0]">ВАЖЛИВІ ПОДІЇ В ЛІТОПИСІ</div>
              <div className="text-xl font-serif font-bold text-[#38BDF8]">
                {state.history.filter((h) => h.year === identity.year).length} записів
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#101522] border border-[#232D42] space-y-1">
              <div className="text-[10px] uppercase font-mono text-[#8E93A0]">ВІДКЛАДЕНІ НАСЛІДКИ</div>
              <div className="text-xl font-serif font-bold text-[#FBBF24]">
                {pendingConsequencesCount} очікують
              </div>
            </div>
          </div>

          {/* Action Button: Advance Year */}
          <div className="pt-4 text-center">
            <button
              onClick={onAdvanceYear}
              className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-xl bg-[#C9A96E] hover:bg-[#DBBC82] text-[#0A0D14] font-serif font-bold text-base uppercase tracking-widest inline-flex items-center justify-center gap-3 cursor-pointer transition-all shadow-xl hover:shadow-[#C9A96E]/20 active:scale-[0.99]"
            >
              <span>ПЕРЕЙТИ ДО {identity.year + 1} РОКУ</span>
              <FastForward className="w-5 h-5 text-[#0A0D14]" />
            </button>
          </div>
        </section>
      ) : (
        /* ============================================================== */
        /* SECTION 24 & 35: СПРАВИ ПОТОЧНОГО РОКУ                         */
        /* ============================================================== */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Scroll className="w-5 h-5 text-[#C9A96E]" />
              <span>Справи {identity.year} Року</span>
            </h3>
            <span className="text-xs font-mono text-[#8E93A0]">
              До розгляду: {availableScenarios.length}
            </span>
          </div>

          {/* 1. Feature Card: Primary Active Affair */}
          {currentAffair ? (
            <div className="bg-[#0F1420] border-2 border-[#C9A96E] rounded-xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden">
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded text-[11px] bg-[#1A2233] text-[#C9A96E] border border-[#C9A96E]/40 font-bold">
                    {identity.year} РІК · СПРАВА №{(agenda.completedScenarios.length + 1)}
                  </span>
                  <span className="flex items-center gap-1 text-[#8E93A0]">
                    <MapPin className="w-3 h-3 text-[#C9A96E]" />
                    {currentAffair.location}
                  </span>
                  <span>·</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#F87171] font-bold">
                    {currentAffair.importance === 'critical' ? 'Епохальна справа' : 'Державна рада'}
                  </span>
                </div>

                <h4 className="font-serif text-2xl md:text-3xl font-bold text-[#F3EFE6]">
                  {currentAffair.title}
                </h4>

                <p className="text-xs md:text-sm text-[#A8AFBD] leading-relaxed line-clamp-2">
                  {currentAffair.speakerQuote
                    ? currentAffair.speakerQuote.replace(/^«|»$/g, '')
                    : currentAffair.situation}
                </p>
              </div>

              {/* Primary Action Button: [ВІДКРИТИ РАДУ] */}
              <div className="shrink-0 pt-2 md:pt-0 w-full md:w-auto">
                <button
                  onClick={() => onStartScenario(currentAffair.id)}
                  className="w-full md:w-auto min-h-[50px] px-8 py-3.5 rounded-lg bg-[#C9A96E] hover:bg-[#DCBE84] text-[#0A0D14] font-serif font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#C9A96E]/20 cursor-pointer active:scale-[0.99]"
                >
                  <span>Відкрити Раду</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0E121A] border border-[#232A39] rounded-xl p-8 text-center space-y-4 shadow-lg">
              <p className="font-serif text-base text-[#C5C9D3] max-w-lg mx-auto leading-relaxed">
                Усі справи {identity.year} року розглянуто.
              </p>
              <div className="pt-2">
                <button
                  onClick={onAdvanceYear}
                  className="px-6 py-3 rounded-lg bg-[#C9A96E] hover:bg-[#DBBC82] text-[#0A0D14] font-serif font-bold text-sm tracking-wide inline-flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Перейти до підсумку {identity.year} року</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Sequential Agenda Roadmap of the CURRENT YEAR (Section 5 & 24) */}
          {agenda.allScenarios.length > 1 && (
            <div className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-4 md:p-5 space-y-3">
              <div className="text-[11px] uppercase font-mono tracking-widest text-[#8E93A0] font-semibold flex items-center justify-between">
                <span>ПОРЯДОК СПРАВ {identity.year} РОКУ (ПОСЛІДОВНІСТЬ)</span>
                <span className="text-[#C9A96E] font-bold">
                  {agenda.completedScenarios.length} / {agenda.allScenarios.length}
                </span>
              </div>

              <div className="space-y-2">
                {agenda.allScenarios.map((sc, idx) => {
                  const isDone = state.completedScenarioIds.includes(sc.id);
                  const isCurrent = currentAffair?.id === sc.id;
                  const isQueued = !isDone && !isCurrent;

                  return (
                    <div
                      key={sc.id}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs font-mono transition-colors ${
                        isCurrent
                          ? 'bg-[#141B28] border-[#C9A96E] text-[#F3EFE6]'
                          : isDone
                          ? 'bg-[#0E131C] border-[#1C2331] text-[#8E93A0]'
                          : 'bg-[#090C12] border-[#161B26] text-[#64748B]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isDone
                              ? 'bg-[#064E3B] text-[#34D399]'
                              : isCurrent
                              ? 'bg-[#C9A96E] text-[#0A0D14]'
                              : 'bg-[#181F2E] text-[#64748B]'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <span className={`font-serif text-sm ${isCurrent ? 'font-bold text-[#F3EFE6]' : ''}`}>
                          {sc.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone && <span className="text-[#34D399] font-bold">Ухвалено</span>}
                        {isCurrent && <span className="text-[#C9A96E] font-bold">На розгляді</span>}
                        {isQueued && <span>Очікує черги</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* ПАМ'ЯТЬ (Memory & Last Decision)                                */}
      {/* ============================================================== */}
      {(latestDecision || state.completedScenarioIds.length > 0) && (
        <section className="pt-6 border-t border-[#1C2331] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base md:text-lg font-bold text-[#E0DDD5] flex items-center gap-2">
              <Scroll className="w-4 h-4 text-[#C9A96E]" />
              <span>Пам'ять Держави</span>
            </h4>
            <span className="text-[11px] font-mono text-[#8E93A0]">
              {state.completedScenarioIds.length} ухвалено
            </span>
          </div>

          {latestDecision && (
            <div className="bg-[#0B0F17] border border-[#20283A] rounded-xl p-4 space-y-1.5">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#C9A96E] font-semibold">
                Останнє ухвалене рішення ({latestDecision.year} р.):
              </div>
              <div className="font-serif text-base font-bold text-[#F3EFE6]">
                «{latestDecision.choiceText}»
              </div>
              <div className="text-xs text-[#8E93A0]">
                Справа: «{latestDecision.title}»
              </div>
            </div>
          )}
        </section>
      )}

      {/* Metric Explanation Modal */}
      <MetricModal
        metricKey={selectedMetric}
        metrics={empire}
        onClose={() => setSelectedMetric(null)}
      />
    </div>
  );
};
