import React, { useState } from 'react';
import { Scenario, Choice } from '../../game/scenarios/types.ts';
import { Character } from '../../types/index.ts';
import { WaxSeal } from '../ui/WaxSeal.tsx';
import { CoatOfArms } from '../ui/CoatOfArms.tsx';
import {
  MapPin,
  Calendar,
  Quote,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Brain,
  BookOpen,
  UserCheck,
  Sparkles,
  Shield,
  Coins,
  Landmark,
  CheckCircle2,
} from 'lucide-react';

interface ScenarioViewProps {
  scenario: Scenario;
  characters: Character[];
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  onContinue: () => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  scenario,
  characters,
  onSelectChoice,
  lastExecutionLogs,
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
    .filter((c) => c.type === 'EMPIRE_METRIC_CHANGE')
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
        value: c.value,
        label: c.label,
      };
    }) || [];

  // Helper to extract history event
  const historyEvent = selectedChoice?.consequences.find(
    (c) => c.type === 'ADD_HISTORY_EVENT'
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
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />;
    }
  };

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
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E2525] truncate">
                    {speaker?.name || 'Представник Військової Ради'}
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

          {/* SECTION: Choices OR Consequence Resolution Flow */}
          {!lastExecutionLogs ? (
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

                    {/* Mobile Action Button (Full width, min-h 48px) */}
                    <div className="block md:hidden pt-1">
                      <button
                        onClick={() => handleMakeChoice(choice)}
                        className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#8E2525] hover:bg-[#A32A2A] active:bg-[#6E1C1C] text-white font-serif font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-colors"
                      >
                        <span>Ухвалити універсал</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Desktop-only Political Cost & Reactions Strip (Kept clean on mobile per Section 11) */}
                    {(choice.politicalCost || choice.politicalReactions || choice.proposalVoting) && (
                      <div className="hidden md:flex pl-8 pt-2 border-t border-[#E5D7BE] flex-wrap items-center gap-3 text-xs font-mono">
                        {choice.politicalCost && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E2525] font-bold">Політична ціна:</span>
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

                        {choice.proposalVoting && (
                          <div className="text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] text-[10px] font-bold">
                            Потребує схвалення Великої Ради
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
            /* RESOLUTION STAGE: Section 11 Specification                     */
            /* ЩО ВИ ЗРОБИЛИ -> ЩО СТАЛОСЯ -> ЩО ЗМІНИЛОСЯ -> ЩО ЦЕ МОЖЕ ОЗНАЧАТИ */
            /* ============================================================== */
            <div className="pt-6 border-t-2 border-[#8E2525] space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#10141E] text-[#F3EFE6] rounded-xl p-4 sm:p-6 md:p-7 border-2 border-[#C9A96E]/60 space-y-5 md:space-y-6 shadow-2xl relative overflow-hidden">
                {/* Status emblem badge */}
                <div className="flex items-center justify-between border-b border-[#212A3A] pb-3">
                  <span className="text-xs font-mono text-[#C9A96E] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
                    <span>ДЕРЖАВНА ВІДПОВІДЬ</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#34D399]">
                    Універсал набрав чинності
                  </span>
                </div>

                {/* 1. ЩО ВИ ЗРОБИЛИ */}
                <div className="space-y-1.5 border-b border-[#212A3A] pb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                    <span>ЩО ВИ ЗРОБИЛИ:</span>
                  </div>
                  <p className="font-serif text-lg md:text-xl font-bold text-[#F3EFE6]">
                    «{selectedChoice?.text || 'Рішення ухвалено'}»
                  </p>
                </div>

                {/* 2. ЩО СТАЛОСЯ */}
                <div className="space-y-1.5 border-b border-[#212A3A] pb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#38BDF8] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>ЩО СТАЛОСЯ:</span>
                  </div>
                  <p className="text-sm md:text-base text-[#D4D8E2] leading-relaxed">
                    {historyEvent?.description || 'Рішення передано до полків та воєводств. Розпочато виконання наказів володаря.'}
                  </p>
                </div>

                {/* 3. ЩО ЗМІНИЛОСЯ */}
                <div className="space-y-3 border-b border-[#212A3A] pb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#60A5FA] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                    <span>ЩО ЗМІНИЛОСЯ (НАСЛІДКИ ТА ВІДНОСИНИ):</span>
                  </div>

                  {/* Metrics Badges */}
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

                  {/* Character & Faction Reactions */}
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

                  {/* Psychological Signals */}
                  {psychoSignals.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {psychoSignals.map((ps, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded bg-[#1C182A] border border-[#4C3882] text-xs font-mono text-[#D8B4FE] flex items-center gap-1.5"
                        >
                          <Brain className="w-3 h-3 text-[#A78BFA] shrink-0" />
                          <span>{ps.dimension}</span>
                          <span className="font-bold">+{ps.value}</span>
                          {ps.contextNote && (
                            <span className="text-[10px] text-[#A78BFA]/80 hidden sm:inline">
                              ({ps.contextNote})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. ЩО ЦЕ МОЖЕ ОЗНАЧАТИ */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-xl bg-[#141B28] border border-[#27354D]">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#FBBF24] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
                    <span>ЩО ЦЕ МОЖЕ ОЗНАЧАТИ (ВІДЛУННЯ):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D3DAE8] leading-relaxed">
                    {scenario.reflection || 'Державні механізми приведено в рух. Люди та воєводства запам’ятали ваш вибір.'}
                  </p>
                  <div className="text-[11px] font-mono text-[#C9A96E] italic pt-1">
                    «Наслідки можуть проявитися пізніше. Деякі рішення ще не сказали останнього слова.»
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    onClick={onContinue}
                    className="w-full md:w-auto min-h-[48px] px-6 py-3.5 rounded-lg bg-[#C9A96E] hover:bg-[#DCBE84] text-[#0A0D14] font-serif font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#C9A96E]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Повернутися до Ради</span>
                    <ArrowRight className="w-4 h-4" />
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
