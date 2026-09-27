import React, { useState } from 'react';
import { GameState } from '../game/state/types.ts';
import { Scenario } from '../game/scenarios/types.ts';
import { getScenarioById } from '../game/scenarios/registry.ts';
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
  Flame,
  Users,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { calculateLegitimacy } from '../game/politics/evaluator.ts';


interface CouncilViewProps {
  state: GameState;
  onStartScenario: (scenarioId: string) => void;
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  onContinue: () => void;
  onAdvanceYear: () => void;
}

export const CouncilView: React.FC<CouncilViewProps> = ({
  state,
  onStartScenario,
  onSelectChoice,
  lastExecutionLogs,
  onContinue,
  onAdvanceYear,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const currentScenario = state.currentScenarioId
    ? getScenarioById(state.currentScenarioId)
    : null;

  // Active scenario is open -> Show the full Scenario Paper Chamber
  if (currentScenario) {
    return (
      <ScenarioView
        scenario={currentScenario}
        characters={state.characters}
        onSelectChoice={onSelectChoice}
        lastExecutionLogs={lastExecutionLogs}
        onContinue={onContinue}
      />
    );
  }

  // No active scenario: Show Council Hall with Ruler Header, 5 Core Metrics, and «Перед Гетьманом»
  const availableScenarios: Scenario[] = state.availableScenarioIds
    .map((id) => getScenarioById(id))
    .filter((s): s is Scenario => Boolean(s));

  const { identity, empire, politicalCapital = 55, crises = [] } = state;
  const activeCrises = crises.filter((c) => c.active);
  const legitimacyResult = calculateLegitimacy(state);

  const latestDecision = state.decisions.length > 0 ? state.decisions[state.decisions.length - 1] : null;
  const latestHistory = state.history.length > 0 ? state.history[state.history.length - 1] : null;

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
            Стан Держави
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
                <span className={`text-[10px] font-bold ${state.economy.trends.treasury >= 0 ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
                  {state.economy.trends.treasury >= 0 ? `+${state.economy.trends.treasury}↑` : `${state.economy.trends.treasury}↓`}
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
                {state.military?.readiness ?? 70}%
              </span>
              <span className="text-[10px] text-[#8E93A0]">
                ({state.military?.strength ?? empire.militaryStrength}%)
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
      {/* DESKTOP ONLY: 1848 · ГЕТЬМАН · ІМПЕРІЯ СІЧ (Dominant Header)   */}
      {/* ============================================================== */}
      <section className="hidden md:block bg-[#0D111A] border border-[#232A39] rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background crest ornament */}
        <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none text-[#C9A96E]">
          <Landmark className="w-56 h-56" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2536]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
              <span>{identity.year} РІК</span>
              <span>·</span>
              <span>{identity.rulerTitle}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F3EFE6] tracking-wide">
              Імперія Січ
            </h2>
            <p className="text-xs text-[#8E93A0]">
              Володар: <strong className="text-[#E0DDD5]">{identity.rulerName}</strong>. Велика Палата Хортиці готова до наказів.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </div>

        {/* Political Power Header Strip: Legitimacy & Political Capital (Stage 4) */}
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
                Політичний Капітал
              </div>
              <div className="font-serif text-lg font-bold text-[#38BDF8]">
                {politicalCapital}%
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
          </div>
        </div>

        {/* 5 CORE IMPERIAL METRICS */}
        <div className="pt-6 space-y-4">
          <div className="text-[11px] uppercase font-mono tracking-widest text-[#8E93A0] font-semibold flex items-center justify-between">
            <span>Стан Держави (Натисніть для пояснення)</span>
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
      {/* «ПЕРЕД ГЕТЬМАНОМ» (Section 4 Specification)                   */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl md:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
            <Scroll className="w-5 h-5 text-[#C9A96E]" />
            <span>Перед Гетьманом</span>
          </h3>
          <span className="text-xs font-mono text-[#8E93A0]">
            Справ на розгляді: {availableScenarios.length}
          </span>
        </div>

        {availableScenarios.length === 0 ? (
          <div className="bg-[#0E121A] border border-[#232A39] rounded-xl p-8 text-center space-y-4 shadow-lg">
            <p className="font-serif text-base text-[#C5C9D3] max-w-lg mx-auto leading-relaxed">
              Наразі всі нагальні справи 1848 року вирішено. Накази розіслано по полках і воєводствах. Державні механізми діють.
            </p>
            <div className="pt-2">
              <button
                onClick={onAdvanceYear}
                className="px-6 py-3 rounded-lg bg-[#C9A96E] hover:bg-[#DBBC82] text-[#0A0D14] font-serif font-bold text-sm tracking-wide inline-flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                <FastForward className="w-4 h-4" />
                <span>Перейти до наступного року (+1 рік)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableScenarios.map((sc) => (
              <div
                key={sc.id}
                className="bg-[#0F1420] border-2 border-[#232B3B] hover:border-[#C9A96E] rounded-xl p-5 md:p-6 transition-all duration-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="space-y-2.5 flex-1">
                  {/* Meta coordinates: Location, Year, Importance */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#1A2233] text-[#C9A96E] border border-[#C9A96E]/30 font-semibold">
                      Рік {sc.year || identity.year}
                    </span>
                    <span className="flex items-center gap-1 text-[#8E93A0]">
                      <MapPin className="w-3 h-3 text-[#C9A96E]" />
                      {sc.location}
                    </span>
                    <span>·</span>
                    <span className="text-[11px] uppercase tracking-wider text-[#F87171] font-semibold">
                      {sc.importance === 'critical' ? 'Епохальна справа' : 'Державна рада'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-xl md:text-2xl font-bold text-[#F3EFE6] group-hover:text-[#C9A96E] transition-colors">
                    {sc.title}
                  </h4>

                  {/* Short Situation / Prompt */}
                  <p className="text-xs md:text-sm text-[#A8AFBD] leading-relaxed line-clamp-2">
                    {sc.speakerQuote
                      ? sc.speakerQuote.replace(/^«|»$/g, '')
                      : sc.situation}
                  </p>
                </div>

                {/* Primary Action Button: [ВІДКРИТИ РАДУ] */}
                <div className="shrink-0 pt-2 md:pt-0 w-full md:w-auto">
                  <button
                    onClick={() => onStartScenario(sc.id)}
                    className="w-full md:w-auto min-h-[48px] px-6 py-3.5 rounded-lg bg-[#C9A96E] hover:bg-[#DCBE84] text-[#0A0D14] font-serif font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
                  >
                    <span>Відкрити Раду</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* ПАМ'ЯТЬ (Memory & Last Decision - Section 24 Specification)    */}
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
              {latestHistory && latestHistory.description && (
                <div className="text-xs text-[#8E93A0] italic">
                  {latestHistory.description}
                </div>
              )}
            </div>
          )}

          {state.completedScenarioIds.length > 1 && (
            <div className="space-y-1.5 pt-1">
              {state.completedScenarioIds.slice(0, -1).reverse().map((scId) => {
                const sc = getScenarioById(scId);
                return (
                  <div
                    key={scId}
                    className="bg-[#0A0E16] border border-[#1A2130] px-3.5 py-2 rounded-lg text-xs text-[#8E93A0] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span className="text-[#C8CDD8] font-serif text-sm truncate">
                        {sc?.title || scId}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B] shrink-0">
                      У Літописі
                    </span>
                  </div>
                );
              })}
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
