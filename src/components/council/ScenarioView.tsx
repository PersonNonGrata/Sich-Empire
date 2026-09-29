import React, { useState } from 'react';
import { Scenario, Choice } from '../../game/scenarios/types.ts';
import { GameState } from '../../game/state/types.ts';
import { Character } from '../../types/index.ts';
import { ChoiceResolutionResult } from '../../game/engine/scenarioEngine.ts';
import { calculateChoicePoliticalWillCost } from '../../game/politics/evaluator.ts';
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
  Users,
  CheckCircle2,
  Bookmark,
  Clock,
} from 'lucide-react';

interface ScenarioViewProps {
  scenario: Scenario;
  state: GameState;
  characters: Character[];
  onSelectChoice: (choiceId: string) => void;
  lastExecutionLogs: string[] | null;
  lastResolutionResult?: ChoiceResolutionResult | null;
  onContinue: () => void;
  onNegotiateFactionDemand: (demandId: string, action: 'concession' | 'guarantee' | 'bargain' | 'refuse') => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  scenario,
  state,
  characters,
  onSelectChoice,
  lastExecutionLogs,
  lastResolutionResult,
  onContinue,
  onNegotiateFactionDemand,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [highlightedChoice, setHighlightedChoice] = useState<Choice | null>(null);

  const speaker = scenario.speakerId
    ? characters.find((c) => c.id === scenario.speakerId)
    : null;

  const handleMakeChoice = (choice: Choice) => {
    // First tap only highlights the choice. The explicit checkmark commits it.
    setHighlightedChoice(choice);
  };

  const handleConfirmChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setHighlightedChoice(null);
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
  const delayed = lastResolutionResult?.state.consequences?.filter((c) => c.sourceDecisionId === lastResolutionResult?.state.decisions?.[0]?.id && !c.resolved) || [];

  const getChoiceResourceStakes = (choice: Choice) => {
    const treasuryDelta = choice.consequences
      .filter((c: any) => (c.type === 'STATE_CHANGE' || c.type === 'EMPIRE_METRIC_CHANGE' || c.type === 'ECONOMY_METRIC_CHANGE') && c.metric === 'treasury')
      .reduce((sum: number, c: any) => sum + (c.value || 0), 0);

    const militaryDelta = choice.consequences
      .filter((c: any) => (c.type === 'STATE_CHANGE' || c.type === 'EMPIRE_METRIC_CHANGE') && c.metric === 'militaryStrength')
      .reduce((sum: number, c: any) => sum + (c.value || 0), 0);

    const stabilityDelta = choice.consequences
      .filter((c: any) => (c.type === 'STATE_CHANGE' || c.type === 'EMPIRE_METRIC_CHANGE') && c.metric === 'stability')
      .reduce((sum: number, c: any) => sum + (c.value || 0), 0);

    const politicalWillCost = calculateChoicePoliticalWillCost(choice, state);

    return [
      politicalWillCost ? { label: 'Політична воля', value: -politicalWillCost, suffix: '', icon: Crown } : null,
      treasuryDelta ? { label: 'Скарбниця', value: treasuryDelta, suffix: 'M', icon: Coins } : null,
      militaryDelta ? { label: 'Військо', value: militaryDelta, suffix: '%', icon: Shield } : null,
      stabilityDelta ? { label: 'Стабільність', value: stabilityDelta, suffix: '%', icon: Landmark } : null,
    ].filter(Boolean) as Array<{ label: string; value: number; suffix: string; icon: React.ElementType }>;
  };

  const getChoicePoliticalStakes = (choice: Choice) => {
    return (choice.politicalReactions || []).filter((r) => r.reaction !== 'neutral');
  };

  const getChoiceRisk = (choice: Choice) => {
    const delayed = (choice.scheduledConsequences || []).length > 0;
    const tension = choice.consequences.some((c: any) => c.type === 'TENSION');
    const opposition = (choice.politicalReactions || []).some((r) => r.reaction === 'opposition' || r.reaction === 'crisis');

    if (delayed && opposition) return 'Політичний опір може поєднатися з відкладеним наслідком.';
    if (delayed) return 'Рішення має відкладений наслідок.';
    if (opposition && tension) return 'Рішення створює політичний опір і нову напругу.';
    if (opposition) return 'Рішення може викликати політичний опір.';
    if (tension) return 'Рішення змінює баланс інтересів і створює нову напругу.';
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Historical Parchment Document Container */}
      <article className="parchment-sheet rounded-xl border border-[#C5AF88] shadow-2xl overflow-visible relative">
        {/* Top Seal & Imperial Header */}
        <header className="border-b border-[#C8B289] px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 bg-[#EFE3C8]/90 flex flex-row items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#544D45]">
              <span className="flex items-center gap-1 font-semibold text-[#1C1815] bg-[#E2D2B0] px-1.5 py-0.5 rounded border border-[#C8B289]">
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

            <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#1C1815] tracking-tight leading-tight">
              {scenario.title}
            </h1>
          </div>

          <div className="hidden sm:flex items-center justify-end shrink-0 scale-75 origin-right">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </header>

        {/* Parchment Body */}
        <div className="p-4 sm:p-5 md:p-8 space-y-6 text-[#1C1815]">
          {/* Compact resource bar: always visible while reading the case. */}
          <div className="sticky top-0 z-40 -mx-4 sm:-mx-5 md:-mx-8 px-4 sm:px-5 md:px-8 py-1.5 bg-[#1C1815]/95 backdrop-blur-sm border-y border-[#C9A96E]/40 shadow-lg">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-widest text-[#C9A96E] mr-1">РЕСУРСИ</span>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#2A241A] border border-[#8B6A2B]/50 text-[#FBBF24]">
                <Coins className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Скарбниця</span><strong className="text-xs font-mono">{state.empire.treasury}M</strong>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#271A1A] border border-[#8E2525]/50 text-[#F87171]">
                <Shield className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Військо</span><strong className="text-xs font-mono">{state.empire.militaryStrength}%</strong>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#211D28] border border-[#8B6A2B]/50 text-[#C9A96E]">
                <Crown className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Політична воля</span><strong className="text-xs font-mono">{state.politicalWill}</strong>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#18212A] border border-[#315B45]/50 text-[#60A5FA]">
                <Landmark className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Стабільність</span><strong className="text-xs font-mono">{state.empire.stability}%</strong>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#211D28] border border-[#6D4A8A]/50 text-[#A855F7]">
                <Sparkles className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Єдність</span><strong className="text-xs font-mono">{state.empire.unity}%</strong>
              </div>
            </div>
          </div>

          {/* Narrative context is kept only when it adds information beyond the dossier. */}
          {scenario.narrativeEcho && (
            <div className="bg-[#DFD0B1]/90 border-l-4 border-[#8E2525] p-2.5 sm:p-3 rounded-r-lg shadow-sm space-y-1">
              <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#8E2525] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ВІДГОМІН МИНУЛИХ РІШЕНЬ</span>
              </div>
              <p className="font-serif text-xs sm:text-sm text-[#2E2822] italic leading-snug">{scenario.narrativeEcho}</p>
            </div>
          )}

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

          {/* SECTION: Structured Case Dossier */}
          {!isResolved && (
            <section className="space-y-3" aria-label="Досьє державної справи">
              <div className="border-t-2 border-[#8E2525] pt-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-serif text-base md:text-lg font-bold uppercase tracking-wider text-[#8E2525]">ДОСЬЄ СПРАВИ</h3>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#7A6F60]">КОРОТКИЙ БРИФІНГ</span>
                </div>

                <div className="rounded-lg border border-[#CBB48B] bg-[#F7EEDB] px-3 py-2.5 space-y-2">
                  <div>
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E2525] mb-0.5">ПРОБЛЕМА</div>
                    <p className="font-serif text-sm text-[#1C1815] leading-snug">{scenario.problem || scenario.situation}</p>
                  </div>
                  <div className="border-t border-[#D8C6A5] pt-2">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6E6354] mb-0.5">КОНТЕКСТ</div>
                    <p className="text-xs sm:text-sm text-[#544D45] leading-snug">{scenario.context || scenario.introduction}</p>
                  </div>
                </div>

                {scenario.actors && scenario.actors.length > 0 && (
                  <div className="mt-2 rounded-lg border border-[#D8C6A5] bg-[#FAF3E3] p-2.5">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6E6354] mb-1.5">АКТОРИ / ІНТЕРЕСИ</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                      {scenario.actors.map((actor) => (
                        <div key={actor.id} className="flex items-start gap-2 min-w-0">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#8E2525] shrink-0" />
                          <p className="text-[11px] leading-snug text-[#544D45]">
                            <strong className="font-serif text-[#1C1815]">{actor.name || actor.id}</strong>
                            <span className="text-[#8E2525]"> · {actor.role}</span>
                            <span> · {actor.interest}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scenario.knowledge && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="rounded-lg border border-[#C8C0AD] bg-[#F3F0E7] px-3 py-2">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#315B45] mb-1">ВІДОМО</div>
                      <ul className="space-y-0.5 text-[11px] text-[#3F3A34] leading-snug list-disc pl-3.5">
                        {scenario.knowledge.known.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#C8C0AD] bg-[#F3F0E7] px-3 py-2">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#765B2A] mb-1">НЕВІДОМО</div>
                      <ul className="space-y-0.5 text-[11px] text-[#3F3A34] leading-snug list-disc pl-3.5">
                        {scenario.knowledge.uncertain.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {scenario.inaction && (
                  <div className="mt-2 rounded-lg border border-[#B99A67] bg-[#F4E8D2] px-3 py-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#765B2A]">ЯКЩО НІЧОГО НЕ РОБИТИ · </span>
                    <span className="text-[11px] text-[#544D45] leading-snug">{scenario.inaction}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SECTION: Active Faction Pressure */}
          {!isResolved && (state.factionDemands || []).some((d) => d.status === 'open') && (
            <section className="space-y-3" aria-label="Активні політичні вимоги">
              <div className="border-t-2 border-[#765B2A] pt-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-serif text-base md:text-lg font-bold uppercase tracking-wider text-[#765B2A] flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    ПОЛІТИЧНЕ ПОЛЕ
                  </h3>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#7A6F60]">
                    АКТИВНІ ВИМОГИ
                  </span>
                </div>

                <div className="space-y-2">
                  {(state.factionDemands || [])
                    .filter((d) => d.status === 'open')
                    .slice(0, 5)
                    .map((demand) => {
                      const faction = state.factions.find((f: any) => f.id === demand.factionId);
                      const urgent = demand.urgency >= 3;
                      return (
                        <div
                          key={demand.id}
                          className={`rounded-lg border px-3 py-2.5 ${
                            urgent
                              ? 'border-[#B86B5C] bg-[#F8ECE9]'
                              : 'border-[#D8C6A5] bg-[#FAF3E3]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E2525]">
                                {faction?.name || 'Політична фракція'}
                              </div>
                              <div className="font-serif text-sm font-bold text-[#1C1815] leading-snug">
                                {demand.title}
                              </div>
                            </div>
                            <span className={`shrink-0 px-2 py-1 rounded border text-[9px] font-mono font-bold uppercase ${
                              urgent
                                ? 'border-[#B86B5C] text-[#8E2525] bg-[#F8ECE9]'
                                : 'border-[#D8C6A5] text-[#765B2A] bg-[#F4E8D2]'
                            }`}>
                              {urgent ? 'УЛЬТИМАТУМ' : demand.urgency === 2 ? 'ВИМОГА' : 'НАПОЛЯГАННЯ'}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] sm:text-xs text-[#544D45] leading-snug">
                            {demand.text}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[9px] font-mono text-[#7A6F60]">
                              Термін політичної відповіді: {demand.deadlineYear} рік
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { action: 'concession' as const, label: 'Поступка', cost: 6 + demand.urgency * 2 },
                                { action: 'guarantee' as const, label: 'Гарантія', cost: 3 + demand.urgency },
                                { action: 'bargain' as const, label: 'Домовитись', cost: 4 + demand.urgency },
                                { action: 'refuse' as const, label: 'Відмова', cost: 0 },
                              ].map((option) => {
                                const affordable = option.cost <= (state.politicalWill ?? 55);
                                return (
                                  <button
                                    key={option.action}
                                    type="button"
                                    disabled={!affordable}
                                    onClick={() => onNegotiateFactionDemand(demand.id, option.action)}
                                    className="px-2 py-1 rounded border border-[#CBB48B] bg-[#F7EEDB] text-[9px] font-mono font-bold text-[#544D45] hover:border-[#8E2525] hover:text-[#8E2525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {option.label}{option.cost > 0 ? ' · −' + option.cost + ' ВП' : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
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
                {scenario.choices.map((choice, idx) => {
                  const resources = getChoiceResourceStakes(choice);
                  const political = getChoicePoliticalStakes(choice);
                  const risk = getChoiceRisk(choice);
                  const willCost = calculateChoicePoliticalWillCost(choice, state);
                  const willAvailable = state.politicalWill ?? 55;
                  const canAffordWill = willCost <= willAvailable;
                  const isHighlighted = highlightedChoice?.id === choice.id;

                  return (
                    <div
                      key={choice.id}
                      className={`rounded-lg shadow-sm transition-all duration-200 group ${
                        isHighlighted
                          ? 'bg-[#FFF8E8] border-2 border-[#C9A96E] shadow-[0_0_0_2px_rgba(201,169,110,0.18)]'
                          : 'bg-[#FAF3E3] border-2 border-[#D3C1A1] hover:bg-[#FFFFFF] hover:border-[#8E2525] hover:shadow-md'
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 md:p-5">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-6 h-6 rounded-full text-[#F4EAD4] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isHighlighted ? 'bg-[#8E2525]' : 'bg-[#1C1815] group-hover:bg-[#8E2525]'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif text-base sm:text-lg font-bold text-[#1C1815] group-hover:text-[#8E2525] leading-snug">
                                {choice.text}
                              </h4>
                              {isHighlighted && (
                                <CheckCircle2 className="w-5 h-5 text-[#8E2525] shrink-0 mt-0.5" />
                              )}
                            </div>
                            {choice.description && (
                              <p className="mt-1.5 text-xs sm:text-sm text-[#544D45] leading-snug">
                                {choice.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {(resources.length > 0 || political.length > 0 || risk || !canAffordWill) && (
                          <div className="mt-3 ml-0 sm:ml-8 rounded-md border border-[#E0D1B4] bg-[#F7EEDB]/80 px-2.5 py-2 space-y-2">
                            {resources.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#765B2A] mr-0.5">ЦІНА</span>
                                {resources.map((item) => {
                                  const Icon = item.icon;
                                  const positive = item.value > 0;
                                  return (
                                    <span
                                      key={item.label}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-mono font-semibold ${
                                        positive
                                          ? 'bg-[#EEF6EF] border-[#B7D0B8] text-[#315B45]'
                                          : 'bg-[#F8ECE9] border-[#D9B5AD] text-[#8E2525]'
                                      }`}
                                    >
                                      <Icon className="w-3 h-3 shrink-0" />
                                      <span>{item.label}</span>
                                      <strong>{positive ? '+' : ''}{item.value}{item.suffix}</strong>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {political.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#765B2A] mr-0.5">РЕАКЦІЯ</span>
                                {political.map((reaction, index) => {
                                  const faction = state.factions.find((f: any) => f.id === reaction.factionId);
                                  const label = faction?.name || reaction.factionId.replace(/^faction_/, '').replace(/_/g, ' ');
                                  const tone = reaction.reaction === 'support'
                                    ? 'text-[#315B45] border-[#B7D0B8] bg-[#EEF6EF]'
                                    : reaction.reaction === 'opposition' || reaction.reaction === 'crisis'
                                    ? 'text-[#8E2525] border-[#D9B5AD] bg-[#F8ECE9]'
                                    : 'text-[#765B2A] border-[#D8C6A5] bg-[#FAF3E3]';
                                  const reactionLabel = reaction.reaction === 'support'
                                    ? 'підтримка'
                                    : reaction.reaction === 'opposition'
                                    ? 'опір'
                                    : reaction.reaction === 'crisis'
                                    ? 'криза'
                                    : 'занепокоєння';
                                  return (
                                    <span key={`${reaction.factionId}-${index}`} className={`px-2 py-1 rounded border text-[9px] font-mono ${tone}`}>
                                      {label}: {reactionLabel}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {risk && (
                              <div className="flex items-start gap-1.5 text-[10px] text-[#765B2A] leading-snug">
                                <span className="font-mono font-bold uppercase tracking-wide shrink-0">РИЗИК</span>
                                <span>{risk}</span>
                              </div>
                            )}

                            {!canAffordWill && (
                              <div className="text-[10px] text-[#8E2525] leading-snug font-semibold">
                                Потрібно {willCost} політичної волі, доступно {willAvailable}.
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => isHighlighted ? handleConfirmChoice(choice) : handleMakeChoice(choice)}
                            disabled={!canAffordWill}
                            aria-label={isHighlighted ? 'Підтвердити рішення' : 'Обрати рішення'}
                            className={`min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-all ${
                              isHighlighted
                                ? 'bg-[#C9A96E] hover:bg-[#DCBE84] active:bg-[#B5965C] text-[#0A0D14] shadow-[#C9A96E]/20'
                                : 'bg-[#8E2525] hover:bg-[#A32A2A] active:bg-[#6E1C1C] text-white'
                            }`}
                          >
                            {isHighlighted ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Ухвалити рішення</span>
                              </>
                            ) : (
                              <>
                                <span>Обрати рішення</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>

                        {isHighlighted && (
                          <div className="flex items-center justify-center gap-1.5 mt-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-[#8E2525] text-center">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Обрано · натисніть ще раз для ухвалення</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

                {/* Political Will accounting */}
                {lastResolutionResult && (
                  <div className="space-y-2.5 border-b border-[#212A3A] pb-4">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>ПОЛІТИЧНА ВОЛЯ</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-[#131926] border border-[#3A3048] px-3 py-2.5">
                      <span className="text-xs text-[#C8CDD8]">Ціна проведення рішення</span>
                      <strong className="font-mono text-sm text-[#FBBF24]">
                        {lastResolutionResult.previousPoliticalWill} → {lastResolutionResult.newPoliticalWill}
                      </strong>
                    </div>
                  </div>
                )}

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

                {/* 4.5. ВІДКЛАДЕНИЙ НАСЛІДОК */}
                {delayed.length > 0 && (
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-[#1A1620] border border-[#5B4868]">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ВІДКЛАДЕНО</div>
                    <p className="text-xs sm:text-sm text-[#D3DAE8]">Це рішення ще озветься у <strong>{delayed[0].triggerYear} році</strong>: {delayed[0].title}.</p>
                  </div>
                )}

                {/* 4.6. Голос людини */}
                {speaker && scenario.speakerQuote && (
                  <div className="p-3.5 rounded-xl bg-[#141B28] border border-[#27354D]">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#8E93A0] mb-1">ПІСЛЯ УХВАЛИ</div>
                    <p className="font-serif text-sm italic text-[#E3D8C5]">«{speaker.name} ще пам'ятатиме цей день.»</p>
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