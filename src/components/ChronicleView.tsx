import React, { useState } from 'react';
import { HistoryEvent, ChronicleFilterCategory } from '../game/history/types.ts';
import { ScheduledConsequence } from '../game/consequences/types.ts';
import { WaxSeal } from './ui/WaxSeal.tsx';
import {
  BookOpen,
  Calendar,
  Tag,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  ArrowDown,
  Filter,
  Scroll,
} from 'lucide-react';

interface ChronicleViewProps {
  events: HistoryEvent[];
  scheduledConsequences?: ScheduledConsequence[];
}

export const ChronicleView: React.FC<ChronicleViewProps> = ({ events, scheduledConsequences = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'chains' | 'delayed'>('history');
  const [filterCategory, setFilterCategory] = useState<ChronicleFilterCategory>('all');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');

  // Collect distinct years
  const years = Array.from(new Set(events.map((e) => e.year))).sort((a, b) => b - a);

  // Apply filters
  const filteredEvents = events.filter((e) => {
    if (filterYear !== 'all' && e.year !== filterYear) return false;

    if (filterCategory === 'all') return true;
    if (filterCategory === 'decision') return e.type === 'COUNCIL_DECISION' || e.type === 'REFORM' || e.type === 'MILITARY_ACT';
    if (filterCategory === 'crisis') return e.type === 'CRISIS_TRIGGERED' || e.type === 'CRISIS_RESOLVED' || e.tags.includes('криза');
    if (filterCategory === 'promise') return e.type === 'PROMISE_MADE' || e.type === 'PROMISE_BROKEN' || e.type === 'PROMISE_FULFILLED';
    if (filterCategory === 'faction') return e.factions && e.factions.length > 0;
    if (filterCategory === 'region') return e.regions && e.regions.length > 0;
    if (filterCategory === 'character') return e.actors && e.actors.length > 0;

    return true;
  });

  const pendingConsequences = scheduledConsequences.filter((sc) => !sc.resolved);
  const resolvedConsequences = scheduledConsequences.filter((sc) => sc.resolved);

  // Causal chains: extract items with causal notes or parent links
  const eventsWithChains = events.filter(
    (e) => e.causalChainNote || e.causalRootDecisionId || e.type === 'CONSEQUENCE_TRIGGERED' || e.type === 'CRISIS_TRIGGERED'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#232A39] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A96E] uppercase tracking-widest font-semibold">
            <span>Аннали та Політична Пам'ять</span>
            <span>·</span>
            <span>1848—1851</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#F3EFE6] tracking-wide mt-1">
            Літопис Пам'яті Держави
          </h2>
          <p className="text-xs text-[#8E929E] mt-1 font-serif italic">
            «Історія складається з ланцюгів причин і наслідків. Жодне слово володаря не зникає безслідно.»
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#10141E] p-1 rounded-lg border border-[#222A3B] overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-[#C9A96E] text-[#0A0D14] font-bold'
                : 'text-[#8E93A0] hover:text-[#F3EFE6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Літопис ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('chains')}
            className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'chains'
                ? 'bg-[#C9A96E] text-[#0A0D14] font-bold'
                : 'text-[#8E93A0] hover:text-[#F3EFE6]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>Ланцюги</span>
          </button>
          <button
            onClick={() => setActiveSubTab('delayed')}
            className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'delayed'
                ? 'bg-[#C9A96E] text-[#0A0D14] font-bold'
                : 'text-[#8E93A0] hover:text-[#F3EFE6]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Відлуння ({scheduledConsequences.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: ІСТОРИЧНИЙ ЛІТОПИС З ФІЛЬТРАМИ (Requirement 27)         */}
      {/* ============================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-4 md:space-y-6">
          {/* Category Filters: Horizontal smooth scroll on mobile */}
          <div className="flex items-center gap-1.5 bg-[#0C1018] p-2 rounded-xl border border-[#20293B] overflow-x-auto scrollbar-none">
            <span className="text-xs font-mono text-[#8E93A0] flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3 text-[#C9A96E]" />
              <span className="hidden sm:inline">Фільтр:</span>
            </span>
            {[
              { id: 'all', label: 'УСІ' },
              { id: 'decision', label: 'РІШЕННЯ' },
              { id: 'character', label: 'ПЕРСОНАЖІ' },
              { id: 'faction', label: 'ФРАКЦІЇ' },
              { id: 'region', label: 'РЕГІОНИ' },
              { id: 'crisis', label: 'КРИЗИ' },
              { id: 'promise', label: 'ОБІЦЯНКИ' },
            ].map((cat) => {
              const isActive = filterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id as ChronicleFilterCategory)}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer shrink-0 min-h-[36px] flex items-center ${
                    isActive
                      ? 'bg-[#C9A96E] text-[#0A0D14] border-[#C9A96E] font-bold'
                      : 'bg-[#121622] text-[#8E93A0] border-[#222B3B] hover:text-[#F3EFE6]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            {/* Year selector */}
            {years.length > 1 && (
              <div className="ml-auto flex items-center gap-1 shrink-0 pl-2">
                <span className="text-xs font-mono text-[#8E93A0]">Рік:</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-[#121622] text-[#C9A96E] border border-[#222B3B] rounded px-2 py-1 text-xs font-mono min-h-[36px]"
                >
                  <option value="all">Усі роки</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y} р.</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-[#0E121A] border border-[#232A39] rounded-xl p-8 text-center text-[#8E93A0] text-xs font-mono">
              Літопис не містить записів за обраними критеріями.
            </div>
          ) : (
            <div className="relative md:border-l-2 md:border-[#2B3548] md:ml-6 md:pl-8 space-y-4 md:space-y-6">
              {filteredEvents.map((event) => {
                const isCrisis = event.type === 'CRISIS_TRIGGERED' || event.tags.includes('криза');
                const isPromise = event.type === 'PROMISE_MADE' || event.type === 'PROMISE_BROKEN' || event.type === 'PROMISE_FULFILLED';
                const isCritical = event.importance === 'critical' || isCrisis;

                return (
                  <div key={event.id} className="relative group w-full">
                    {/* Desktop Timeline node */}
                    <div
                      className={`hidden md:flex absolute -left-[43px] top-4 w-5 h-5 rounded-full items-center justify-center border-2 transition-transform group-hover:scale-110 ${
                        isCrisis
                          ? 'bg-[#8E2525] border-[#F87171] text-white shadow-lg shadow-[#8E2525]/50'
                          : isPromise
                          ? 'bg-[#2A1D0E] border-[#FBBF24] text-[#FBBF24]'
                          : isCritical
                          ? 'bg-[#18202E] border-[#C9A96E] text-[#C9A96E]'
                          : 'bg-[#0B0E14] border-[#3B455A] text-[#8E93A0]'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    {/* Event Card - 1 Column on Mobile */}
                    <article
                      className={`w-full rounded-xl border p-4 sm:p-5 md:p-6 transition-all duration-200 shadow-xl ${
                        isCrisis
                          ? 'bg-gradient-to-r from-[#200D12] to-[#14121A] border-[#EF4444]/60'
                          : isPromise
                          ? 'bg-[#14121A] border-[#D97706]/50'
                          : isCritical
                          ? 'bg-[#0E131C] border-[#C9A96E]/50'
                          : 'bg-[#0A0E15] border-[#1C2331]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E2536] mb-3">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="flex items-center gap-1 font-bold text-[#C9A96E] bg-[#161D2B] px-2.5 py-1 rounded border border-[#C9A96E]/30">
                            <Calendar className="w-3 h-3 text-[#C9A96E]" />
                            {event.year} РІК
                          </span>

                          {isCrisis && (
                            <span className="px-2 py-0.5 rounded bg-[#8E2525]/30 text-[#FCA5A5] border border-[#EF4444]/40 uppercase text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Політична криза
                            </span>
                          )}

                          {isPromise && (
                            <span className="px-2 py-0.5 rounded bg-[#FBBF24]/20 text-[#FDE68A] border border-[#FBBF24]/40 uppercase text-[10px] font-bold flex items-center gap-1">
                              <Scroll className="w-2.5 h-2.5" />
                              Обітниця
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#F3EFE6] tracking-wide mb-2">
                        {event.title}
                      </h3>

                      <p className="text-sm md:text-base text-[#D4D8E2] leading-relaxed">
                        {event.description}
                      </p>

                      {/* Causal Note / Consequence (Section 12: наслідок) */}
                      {event.causalChainNote && (
                        <div className="mt-3 p-3 rounded-lg bg-[#131926] border border-[#232F47] text-xs font-mono text-[#93C5FD] flex items-start gap-2">
                          <span className="text-[#60A5FA] font-bold shrink-0">↓</span>
                          <span><strong>Наслідок:</strong> {event.causalChainNote}</span>
                        </div>
                      )}

                      {/* Related Decision indicator if present */}
                      {event.causalRootDecisionId && (
                        <div className="mt-2 text-[11px] font-mono text-[#C9A96E] flex items-center gap-1.5 pl-1">
                          <span>↳ Пов'язане рішення Ради</span>
                        </div>
                      )}

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#1C2331]">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8E93A0] bg-[#121622] px-2 py-0.5 rounded border border-[#21293B]"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#C9A96E]/60" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: ПРИЧИННО-НАСЛІДКОВІ ЛАНЦЮГИ (Requirement 27)           */}
      {/* ============================================================== */}
      {activeSubTab === 'chains' && (
        <div className="space-y-6">
          <div className="bg-[#0E131E] border border-[#232B3C] rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#C9A96E]" />
              <span>Політична Причинність: Ланцюги Подій Імперії</span>
            </h3>
            <p className="text-xs text-[#8E93A0] font-serif leading-relaxed">
              Гравець бачить, як перші рішення 1848 року формують політичну реакцію 1849 року та ведуть до розв’язки або кризи 1851 року.
            </p>

            {/* Example of causal chain card */}
            <div className="space-y-4 pt-2">
              <div className="bg-[#121724] border-2 border-[#263248] rounded-xl p-5 space-y-3">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold">
                  Ланцюг Причинності №1: Питання Армії та Старої Січі
                </div>

                <div className="flex flex-col space-y-2 font-mono text-xs">
                  {/* Step 1 */}
                  <div className="bg-[#182030] p-3 rounded border border-[#283750] flex items-start gap-3">
                    <span className="text-[#C9A96E] font-bold">1848 р.</span>
                    <div>
                      <div className="text-[#F3EFE6] font-bold">Перше Засідання Ради: Рішення про Реформу або Армію</div>
                      <div className="text-[#8E93A0] text-[11px]">Визначено пріоритет бюджету та започатковано перші напруження між станами.</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-[#C9A96E]">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#182030] p-3 rounded border border-[#283750] flex items-start gap-3">
                    <span className="text-[#C9A96E] font-bold">1849 р.</span>
                    <div>
                      <div className="text-[#F3EFE6] font-bold">Голоси Ради: Поляризація Автономії та Вертикалі</div>
                      <div className="text-[#8E93A0] text-[11px]">Стара Січ та Землевласники реагують на зміни у статусі воєводств.</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-[#C9A96E]">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 3 */}
                  <div className="bg-[#182030] p-3 rounded border border-[#283750] flex items-start gap-3">
                    <span className="text-[#C9A96E] font-bold">1851 р.</span>
                    <div>
                      <div className="text-[#F3EFE6] font-bold">Відлуння 1848 року або Рада Старшини</div>
                      <div className="text-[#8E93A0] text-[11px]">Відкладені наслідки приходять до виконання, вимагаючи остаточного розрахунку.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recorded causal chains from state */}
              {eventsWithChains.map((ev) => (
                <div key={ev.id} className="bg-[#101522] border border-[#20293B] rounded-lg p-4 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-[#C9A96E]">
                    <span className="font-bold">{ev.year} РІК</span>
                    <span className="text-[10px] uppercase text-[#8E93A0]">{ev.type}</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-[#F3EFE6]">{ev.title}</div>
                  <div className="text-[#93C5FD] pt-1">
                    ↳ Відлуння: {ev.causalChainNote || ev.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: ВІДКЛАДЕНІ НАСЛІДКИ                                     */}
      {/* ============================================================== */}
      {activeSubTab === 'delayed' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FBBF24]" />
              <span>Очікувані Відгомони Рішень</span>
            </h3>

            {pendingConsequences.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0E121A] border border-[#232A39] text-center text-[#8E93A0] text-xs font-mono">
                Наразі немає активних відкладених наслідків.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {pendingConsequences.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-[#111622] border-2 border-[#26334A] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#2B2312] text-[#FBBF24] border border-[#FBBF24]/30 font-bold">
                        ● {sc.triggerYear} РІК
                      </span>
                      <span className="text-[#8E93A0]">
                        Джерело: {sc.sourceScenarioTitle || 'Рада'} ({sc.sourceYear || 1848} р.)
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-[#EAE6DD]">
                      «{sc.title}»
                    </h4>

                    <p className="text-xs text-[#8E93A0] italic">
                      «Приховані сили дозрівають у тиші. Наслідок проявиться у повному обсязі, коли настане призначений рік.»
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {resolvedConsequences.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-[#1E2536]">
              <h3 className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                <span>Справджені Відгомони</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {resolvedConsequences.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-[#0C1018] border border-[#1E2638] space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#34D399] font-bold">Справдилося у {sc.resolvedYear || sc.triggerYear} р.</span>
                      <span className="text-[#8E93A0]">Джерело: {sc.sourceYear || 1848} р.</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#F3EFE6]">{sc.title}</h4>
                    <p className="text-[#B8C0D0]">{sc.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
