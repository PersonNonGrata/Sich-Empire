import React, { useState } from 'react';
import { Scenario, Choice } from '../../game/scenarios/types.ts';
import { Character } from '../../types/index.ts';
import { ChoiceResolutionResult } from '../../game/engine/scenarioEngine.ts';
import { WaxSeal } from '../ui/WaxSeal.tsx';
import {
  MapPin,
  Calendar,
  Quote,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Brain,
  UserCheck,
  Sparkles,
  Shield,
  Coins,
  Landmark,
  Crown,
  HeartHandshake,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface ScenarioViewProps {
  scenario: Scenario;
  characters: Character[];
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  lastResolutionResult?: ChoiceResolutionResult | null;
  onContinue: () => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  scenario,
  characters,
  onSelectChoice,
  lastExecutionLogs,
  lastResolutionResult,
  onContinue,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);

  const speaker = scenario.speakerId
    ? characters.find((c) => c.id === scenario.speakerId)
    : null;

  const handleMakeChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    onSelectChoice(choice.id);
  };

  // Helper to extract metric changes from choice consequences
  const metricChanges = selectedChoice?.consequences
    .filter((c) => c.type === 'EMPIRE_METRIC_CHANGE' || c.type === 'STATE_CHANGE')
    .map((c: any) => ({
      metric: c.metric,
      value: c.value,
      label: c.label || c.metric,
    })) || [];

  // Helper to extract psychological signals
  const psychoSignals = selectedChoice?.consequences
    .filter((c) => c.type === 'PSYCHOLOGICAL_SIGNAL')
    .map((c: any) => ({
      dimension: c.dimension,
      value: c.value,
      contextNote: c.contextNote,
    })) || [];

  // Helper to extract relationships
  const relChanges = selectedChoice?.consequences
    .filter((c) => c.type === 'RELATIONSHIP_CHANGE')
    .map((c: any) => {
      const char = characters.find((ch) => ch.id === c.characterId);
      return {
        name: char ? char.name : 'Старшина',
        value: c.value ?? c.trustChange ?? 0,
        label: c.label,
      };
    }) || [];

  // Helper to extract history event
  const historyEvent = selectedChoice?.consequences.find(
    (c) => c.type === 'ADD_HISTORY_EVENT' || c.type === 'HISTORY_EVENT'
  ) as any;

  // Render Metric change icon
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'treasury':
        return <Coins className="w-3.5 h-3.5 text-[#FBBF24]" />;
      case 'militaryStrength':
        return <Shield className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'stability':
        return <Landmark className="w-3.5 h-3.5 text-[#60A5FA]" />;
      case 'unity':
        return <Crown className="w-3.5 h-3.5 text-[#A855F7]" />;
      case 'prosperity':
        return <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />;
    }
  };

  const isResolved = Boolean(lastExecutionLogs || lastResolutionResult);
  const prevM = lastResolutionResult?.previousMetrics;
  const newM = lastResolutionResult?.newMetrics;
  const reactions = lastResolutionResult?.politicalReactionsSummary || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Historical Parchment Document Container */}
      <article className="parchment-sheet rounded-xl border border-[#C5AF88] shadow-2xl overflow-hidden relative">
        {/* Top Seal & Imperial Header */}
        <header className="border-b border-[#C8B289] p-4 sm:p-5 md:p-8 bg-[#EFE3C8]/70 flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#544D45]">
              <span className="flex items-center gap-1 font-semibold text-[#1C1815] bg-[#E2D2B0] px-2 py-0.5 rounded border border-[#C8B289]">
                <Calendar className="w-3.5 h-3.5 text-[#8E2525]" />
                {scenario.year || 1848} РІК
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8E2525]" />
                {scenario.location}
              </span>
              <span>·</span>
              <span className="uppercase tracking-wider font-semibold text-[#8E2525]">
                {scenario.importance === 'critical' ? 'Епохальна Справа' : 'Державне Питання'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1815] tracking-tight leading-tight">
              {scenario.title}
            </h1>
          </div>

          <div className="hidden sm:flex items-center justify-end shrink-0">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </header>

        {/* Parchment Body */}
        <div className="p-4 sm:p-5 md:p-8 space-y-6 text-[#1C1815]">
          {/* Situation & Introduction */}
          <div className="space-y-3">
            <p className="font-serif text-base md:text-lg text-[#3B342C] italic leading-relaxed border-l-2 border-[#8E2525] pl-3.5 sm:pl-4">
              {scenario.introduction}
            </p>

            {/* Stage 7: Narrative Echo of past ruler behavior */}
            {scenario.narrativeEcho && (
              <div className="bg-[#DFD0B1]/90 border-l-4 border-[#8E2525] p-3 sm:p-3.5 rounded-r-lg shadow-sm space-y-1 my-2">
                <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#8E2525] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8E2525]" />
                  <span>ВІДГОМІН МИНУЛИХ РІШЕНЬ ГЕТЬМАНА</span>
                </div>
                <p className="font-serif text-xs sm:text-sm text-[#2E2822] italic leading-snug">
                  {scenario.narrativeEcho}
                </p>
              </div>
            )}

            <div className="pt-2">
              <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#6E6354] mb-1">
                СИТУАЦІЯ
              </div>
              <p className="text-base md:text-lg text-[#1C1815] leading-relaxed">
                {scenario.situation}
              </p>
            </div>
          </div>

          {/* Speaker Testimony / Quotation */}
          {scenario.speakerQuote && (
            <div className="bg-[#EAD9B8]/70 border border-[#CBB48B] rounded-lg p-3.5 sm:p-4 md:p-6 shadow-inner relative">
              <Quote className="w-8 h-8 text-[#8E2525]/20 absolute top-4 right-4 pointer-events-none" />
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1815] text-[#F4EAD4] font-serif font-bold text-base sm:text-lg flex items-center justify-center shrink-0 border border-[#8E2525]">
                  {speaker?.name ? speaker.name.charAt(0) : 'Г'}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E2525] truncate">
                      {speaker?.name || 'Представник Військової Ради'}
                    </span>
                    {speaker?.expectation && (
                      <span className="text-[10px] font-mono bg-[#E2D2B0] text-[#544D45] px-2 py-0.5 rounded border border-[#C8B289] truncate">
                        {speaker.expectation}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#544D45] font-serif truncate">
                    {scenario.speakerRole || speaker?.role}
                  </div>
                  <p className="font-serif text-base md:text-lg italic text-[#1C1815] pt-1 leading-relaxed">
                    {scenario.speakerQuote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Choices OR Immediate Consequence Resolution Flow (Section 10) */}
          {!isResolved ? (
            <div className="pt-6 border-t border-[#CBB48B] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg md:text-xl font-bold uppercase tracking-wider text-[#8E2525]">
                  ВАШЕ РІШЕННЯ
                </h3>
                <span className="text-xs font-mono text-[#544D45]">
                  Оберіть один універсал
                </span>
              </div>

              <div className="space-y-4">
                {scenario.choices.map((choice, idx) => (
                  <div
                    key={choice.id}
                    className="p-4 md:p-5 rounded-lg bg-[#FAF3E3] hover:bg-[#FFFFFF] border-2 border-[#D3C1A1] hover:border-[#8E2525] shadow-sm hover:shadow-md transition-all duration-200 group space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1815] text-[#F4EAD4] text-xs font-mono font-bold flex items-center justify-center group-hover:bg-[#8E2525] transition-colors shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-serif text-base sm:text-lg font-bold text-[#1C1815] group-hover:text-[#8E2525] transition-colors leading-snug">
                            {choice.text}
                          </span>
                        </div>

                        {choice.description && (
                          <p className="text-sm sm:text-base text-[#544D45] pl-0 sm:pl-8 leading-relaxed">
                            {choice.description}
                          </p>
                        )}
                      </div>

                      {/* Desktop Action Button */}
                      <button
                        onClick={() => handleMakeChoice(choice)}
                        className="hidden md:flex px-5 py-2.5 rounded bg-[#8E2525] hover:bg-[#A32A2A] text-white font-serif font-bold text-xs uppercase tracking-wider items-center gap-1.5 shrink-0 cursor-pointer shadow transition-colors min-h-[44px]"
                      >
                        <span>Ухвалити</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Action Button */}
                    <div className="block md:hidden pt-1">
                      <button
                        onClick={() => handleMakeChoice(choice)}
                        className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#8E2525] hover:bg-[#A32A2A] active:bg-[#6E1C1C] text-white font-serif font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-colors"
                      >
                        <span>Ухвалити універсал</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Political Cost & Reactions Strip */}
                    {(choice.politicalCost || choice.politicalReactions || choice.proposalVoting || (choice.memoryTags && choice.memoryTags.length > 0)) && (
                      <div className="flex pl-0 md:pl-8 pt-2 border-t border-[#E5D7BE] flex-wrap items-center gap-3 text-xs font-mono">
                        {choice.memoryTags && choice.memoryTags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#8E2525] font-bold flex items-center gap-1">
                              <Bookmark className="w-3 h-3 text-[#8E2525]" />
                              <span>Карбує пам'ять:</span>
                            </span>
                            {choice.memoryTags.map((mt, mIdx) => (
                              <span
                                key={mIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4E9D5] text-[#7A2A2A] border border-[#CDB58E]"
                              >
                                «{mt}»
                              </span>
                            ))}
                          </div>
                        )}

                        {choice.politicalCost && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E2525] font-bold">Ціна ухвали:</span>
                            {choice.politicalCost.capitalCost && (
                              <span className="bg-[#EADECA] text-[#4A3B2C] px-2 py-0.5 rounded border border-[#C5B396]">
                                Капітал -{choice.politicalCost.capitalCost}
                              </span>
                            )}
                            {choice.politicalCost.economicCost && (
                              <span className="bg-[#EADECA] text-[#7A3E1D] px-2 py-0.5 rounded border border-[#C5B396]">
                                Скарбниця -{choice.politicalCost.economicCost} млн
                              </span>
                            )}
                          </div>
                        )}

                        {choice.politicalReactions && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#6E6354]">Реакція станів:</span>
                            {choice.politicalReactions.map((pr, pIdx) => {
                              const isPositive = pr.reaction === 'support';
                              const isNegative = pr.reaction === 'opposition' || pr.reaction === 'crisis';
                              return (
                                <span
                                  key={pIdx}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isPositive
                                      ? 'bg-[#E1EFE6] text-[#047857] border border-[#10B981]/40'
                                      : isNegative
                                      ? 'bg-[#FBEAEB] text-[#B91C1C] border border-[#EF4444]/40'
                                      : 'bg-[#EADECA] text-[#544D45] border border-[#C5B396]'
                                  }`}
                                  title={pr.note}
                                >
                                  {pr.note}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* SECTION 10: НЕГАЙНИЙ UI ПІСЛЯ РІШЕННЯ                          */
            /* ВИ ПРИЙНЯЛИ РІШЕННЯ -> НАСЛІДКИ -> ДЕРЖАВА ВІДПОВІЛА           */
            /* -> СТАН ДЕРЖАВИ (до → після) -> РІШЕННЯ ЗАПАМ'ЯТОВАНЕ          */
            /* ============================================================== */
            <div className="pt-6 border-t-2 border-[#8E2525] space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#10141E] text-[#F3EFE6] rounded-xl p-4 sm:p-6 md:p-7 border-2 border-[#C9A96E]/60 space-y-5 md:space-y-6 shadow-2xl relative overflow-hidden">
                {/* Status emblem badge */}
                <div className="flex items-center justify-between border-b border-[#212A3A] pb-3">
                  <span className="text-xs font-mono text-[#C9A96E] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
                    <span>ВИ УХВАЛИЛИ РІШЕННЯ</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#34D399]">
                    Універсал набрав чинності
                  </span>
                </div>

                {/* 1. ВИ ПРИЙНЯЛИ РІШЕННЯ */}
                <div className="space-y-1.5 border-b border-[#212A3A] pb-4">
                  <p className="font-serif text-lg md:text-xl font-bold text-[#F3EFE6]">
                    «{selectedChoice?.text || 'Рішення ухвалено'}»
                  </p>
                  {selectedChoice?.description && (
                    <p className="text-xs sm:text-sm text-[#A8AFBD]">
                      {selectedChoice.description}
                    </p>
                  )}
                </div>

                {/* 2. НАСЛІДКИ (Immediate Deltas) */}
                <div className="space-y-3 border-b border-[#212A3A] pb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#FBBF24] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                    <span>НАСЛІДКИ РІШЕННЯ:</span>
                  </div>

                  {metricChanges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {metricChanges.map((mc, i) => {
                        const isPositive = mc.value > 0;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border ${
                              isPositive
                                ? 'bg-[#0E2218] text-[#34D399] border-[#059669]/40'
                                : 'bg-[#261010] text-[#F87171] border-[#DC2626]/40'
                            }`}
                          >
                            {getMetricIcon(mc.metric)}
                            <span>{mc.label}:</span>
                            <span>{isPositive ? `+${mc.value}` : mc.value}</span>
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {relChanges.length > 0 && (
                    <div className="space-y-1.5 pt-1 text-xs text-[#E0E4ED]">
                      {relChanges.map((rc, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#151B27] px-3 py-1.5 rounded border border-[#232C3E]">
                          <UserCheck className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                          <span>
                            {rc.name}: <strong className="text-[#F3EFE6]">{rc.label || (rc.value > 0 ? 'Схвалив' : 'Засудив')}</strong> ({rc.value > 0 ? `+${rc.value}` : rc.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 25: Психологічне сходження без числових балів */}
                  {selectedChoice && (
                    <div className="pt-1 space-y-2">
                      {selectedChoice.memoryTags && selectedChoice.memoryTags.length > 0 && (
                        <div className="p-3 rounded-lg bg-[#18202F] border border-[#2B3A54] text-xs font-mono text-[#E8D7B8] flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-[#C9A96E] shrink-0" />
                          <span>
                            Історична пам'ять зафіксувала: <strong className="text-[#F3EFE6]">{selectedChoice.memoryTags.map((t) => `«${t}»`).join(', ')}</strong>. Світ зважатиме на це в майбутніх сценаріях.
                          </span>
                        </div>
                      )}

                      {lastResolutionResult?.state.transformations && lastResolutionResult.state.transformations.length > 0 && lastResolutionResult.state.transformations[0].catalystDecisionId === lastResolutionResult.state.decisions[0]?.id ? (
                        <div className="p-3 rounded-lg bg-[#1F192C] border border-[#C9A96E]/60 text-xs font-mono text-[#E8D7B8] flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[#C9A96E] shrink-0" />
                          <span>Психологічний перелом: зафіксовано якісну трансформацію стилю правління.</span>
                        </div>
                      ) : lastResolutionResult?.state.reflections && lastResolutionResult.state.reflections.some((r) => r.status === 'pending') ? (
                        <div className="p-3 rounded-lg bg-[#141A26] border border-[#384868] text-xs font-serif text-[#C8D1DF] flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[#60A5FA] shrink-0" />
                          <span>Дзеркало Володаря: відкрилося нове спостереження у кабінеті Гетьмана.</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* 3. ДЕРЖАВА ВІДПОВІЛА (Political & Institutional Reactions) */}
                <div className="space-y-2.5 border-b border-[#212A3A] pb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#38BDF8] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>ДЕРЖАВА ВІДПОВІЛА:</span>
                  </div>

                  {reactions.length > 0 ? (
                    <div className="space-y-1.5 text-xs">
                      {reactions.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded bg-[#131926] border border-[#232F47]"
                        >
                          <span className="font-serif font-bold text-[#F3EFE6]">
                            {r.entity}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              r.reaction === 'support'
                                ? 'text-[#34D399]'
                                : r.reaction === 'opposition' || r.reaction === 'crisis'
                                ? 'text-[#F87171]'
                                : 'text-[#C9A96E]'
                            }`}
                          >
                            {r.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-[#D4D8E2]">
                      {historyEvent?.description || 'Політичне керівництво та полки прийняли волю Гетьмана.'}
                    </p>
                  )}
                </div>

                {/* 4. СТАН ДЕРЖАВИ (до → після) */}
                {prevM && newM && (
                  <div className="space-y-2.5 border-b border-[#212A3A] pb-4">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#60A5FA] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                      <span>СТАН ДЕРЖАВИ (ПЕРЕРАХУНОК ДО → ПІСЛЯ):</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded bg-[#131926] border border-[#232F47]">
                        <span className="text-[#8E93A0] block text-[10px]">СКАРБНИЦЯ</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#FBBF24] mt-0.5">
                          <span>{prevM.treasury}M</span>
                          <span>→</span>
                          <span>{newM.treasury}M</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#131926] border border-[#232F47]">
                        <span className="text-[#8E93A0] block text-[10px]">ВІЙСЬКО</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#EF4444] mt-0.5">
                          <span>{prevM.militaryStrength}%</span>
                          <span>→</span>
                          <span>{newM.militaryStrength}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#131926] border border-[#232F47]">
                        <span className="text-[#8E93A0] block text-[10px]">СТАБІЛЬНІСТЬ</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#60A5FA] mt-0.5">
                          <span>{prevM.stability}%</span>
                          <span>→</span>
                          <span>{newM.stability}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#131926] border border-[#232F47]">
                        <span className="text-[#8E93A0] block text-[10px]">ЄДНІСТЬ</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#A855F7] mt-0.5">
                          <span>{prevM.unity}%</span>
                          <span>→</span>
                          <span>{newM.unity}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#131926] border border-[#232F47] col-span-2 sm:col-span-1">
                        <span className="text-[#8E93A0] block text-[10px]">ДОБРОБУТ</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#34D399] mt-0.5">
                          <span>{prevM.prosperity}%</span>
                          <span>→</span>
                          <span>{newM.prosperity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. РІШЕННЯ ЗАПАМ'ЯТОВАНЕ */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#141B28] border border-[#27354D]">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#34D399] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>РІШЕННЯ ЗАПАМ'ЯТОВАНЕ В ЛІТОПИСІ:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D3DAE8] leading-relaxed">
                    {scenario.reflection || 'Державні механізми приведено в рух. Люди та воєводства зафіксували волю володаря.'}
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={onContinue}
                    className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-[#C9A96E] hover:bg-[#DCBE84] text-[#0A0D14] font-serif font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#C9A96E]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {lastResolutionResult?.isYearAgendaComplete ? (
                      <>
                        <Crown className="w-4 h-4 text-[#0A0D14]" />
                        <span>ЗАВЕРШИТИ {scenario.year || 1848} РІК · ПІДСУМОК</span>
                      </>
                    ) : (
                      <>
                        <span>НАСТУПНА СПРАВА РАДИ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};
