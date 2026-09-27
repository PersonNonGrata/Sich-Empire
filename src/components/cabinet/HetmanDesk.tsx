import React from 'react';
import { GameState } from '../../game/state/types.ts';
import { CoatOfArms } from '../ui/CoatOfArms.tsx';
import { WaxSeal } from '../ui/WaxSeal.tsx';
import { FileText, Map, BookOpen, User, Feather, Sparkles } from 'lucide-react';

interface HetmanDeskProps {
  state: GameState;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCouncil: () => void;
}

export const HetmanDesk: React.FC<HetmanDeskProps> = ({
  state,
  activeTab,
  onSelectTab,
  onOpenCouncil,
}) => {
  const pendingScenarios = state.availableScenarioIds.length;
  const decisionsCount = state.decisions.length;
  const eventsCount = state.history.length;

  return (
    <>
      {/* MOBILE COMPACT HEADER BLOCK (< md) - Section 4 & 24 specification */}
      <div className="block md:hidden desk-surface border border-[#2B3548] rounded-xl shadow-xl overflow-hidden mb-5 relative p-4">
        {/* Decorative brass corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A96E]/50 pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CoatOfArms size={38} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
                <span>{state.identity.year} РІК</span>
                <span>·</span>
                <span>{state.identity.rulerTitle}</span>
              </div>
              <h2 className="font-serif text-lg font-bold tracking-wider text-[#F3EFE6] uppercase truncate">
                Кабінет Гетьмана
              </h2>
              <div className="text-xs text-[#8E93A0] truncate">
                {state.identity.rulerName}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <WaxSeal size="sm" label="СІЧ" />
          </div>
        </div>
      </div>

      {/* DESKTOP DESK MATRIX (md+) - Full 4-document desk preserved */}
      <div className="hidden md:block desk-surface border border-[#2B3548] rounded-xl shadow-2xl overflow-hidden mb-6 relative">
        {/* Decorative brass corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A96E]/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A96E]/50 pointer-events-none" />

        {/* Desk Top Inlay: State Coat & Year Header */}
        <div className="border-b border-[#212A3A] px-4 md:px-6 py-3.5 bg-gradient-to-r from-[#111622] via-[#161C28] to-[#111622] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CoatOfArms size={34} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base md:text-lg font-bold tracking-widest text-[#F3EFE6] uppercase">
                  Кабінет Гетьмана
                </span>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-[#1D2534] text-[#C9A96E] border border-[#C9A96E]/30">
                  1848 РІК
                </span>
              </div>
              <p className="text-[11px] text-[#8E93A0] hidden sm:block">
                Стіл у Золотій Палаті Хортиці. Перед вами лежать рапорти, карти та літописи Імперії Січ.
              </p>
            </div>
          </div>

          {/* Desk Atmospheric Status */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex items-center gap-1.5 text-[#8E93A0]">
              <Feather className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Перо нагострене</span>
            </div>
            <div className="flex items-center gap-2">
              <WaxSeal size="sm" label="СІЧ" />
            </div>
          </div>
        </div>

        {/* Desk Working Documents Matrix */}
        <div className="p-3 md:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Document 1: Рапорти Ради */}
          <button
            onClick={() => {
              onSelectTab('rada');
              onOpenCouncil();
            }}
            className={`relative p-3.5 md:p-4 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between ${
              activeTab === 'rada'
                ? 'bg-[#18202E] border-[#C9A96E] shadow-lg shadow-[#C9A96E]/10'
                : 'bg-[#10141E] border-[#222A3B] hover:border-[#C9A96E]/50 hover:bg-[#141A26]'
            }`}
          >
            {pendingScenarios > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#8E2525] text-[#F3EFE6] text-[10px] font-mono font-bold border border-[#F87171] animate-pulse">
                {pendingScenarios}
              </span>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#C9A96E]">
                  Державні справи
                </span>
                <FileText className={`w-4 h-4 ${activeTab === 'rada' ? 'text-[#C9A96E]' : 'text-[#8E93A0] group-hover:text-[#C9A96E]'}`} />
              </div>
              <div className="font-serif font-bold text-sm md:text-base text-[#F3EFE6]">
                Рапорти Ради
              </div>
              <p className="text-[11px] text-[#8E93A0] mt-1 line-clamp-2">
                Термінові питання армії, бюджету та воєводств, що вимагають рішення.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1C2433] text-[10px] font-mono text-[#C9A96E]">
              {pendingScenarios > 0 ? `${pendingScenarios} справ на столі` : 'Справи вирішено'}
            </div>
          </button>

          {/* Document 2: Держава (Економіка, Військо, Землі) */}
          <button
            onClick={() => onSelectTab('state')}
            className={`p-3.5 md:p-4 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between ${
              activeTab === 'state'
                ? 'bg-[#18202E] border-[#C9A96E] shadow-lg shadow-[#C9A96E]/10'
                : 'bg-[#10141E] border-[#222A3B] hover:border-[#C9A96E]/50 hover:bg-[#141A26]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#C9A96E]">
                  Матеріальна машина
                </span>
                <Map className={`w-4 h-4 ${activeTab === 'state' ? 'text-[#C9A96E]' : 'text-[#8E93A0] group-hover:text-[#C9A96E]'}`} />
              </div>
              <div className="font-serif font-bold text-sm md:text-base text-[#F3EFE6]">
                Держава
              </div>
              <p className="text-[11px] text-[#8E93A0] mt-1 line-clamp-2">
                Скарбниця, податки, торгівля, боєздатність полків та воєводства.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1C2433] text-[10px] font-mono text-[#FBBF24] flex items-center justify-between">
              <span>Казна: {state.economy?.treasury ?? state.empire.treasury}M</span>
              <span className="text-[#EF4444]">Готовність: {state.military?.readiness ?? 70}%</span>
            </div>
          </button>

          {/* Document 3: Літопис */}
          <button
            onClick={() => onSelectTab('chronicle')}
            className={`p-3.5 md:p-4 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between ${
              activeTab === 'chronicle'
                ? 'bg-[#18202E] border-[#C9A96E] shadow-lg shadow-[#C9A96E]/10'
                : 'bg-[#10141E] border-[#222A3B] hover:border-[#C9A96E]/50 hover:bg-[#141A26]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#C9A96E]">
                  Пам'ять віків
                </span>
                <BookOpen className={`w-4 h-4 ${activeTab === 'chronicle' ? 'text-[#C9A96E]' : 'text-[#8E93A0] group-hover:text-[#C9A96E]'}`} />
              </div>
              <div className="font-serif font-bold text-sm md:text-base text-[#F3EFE6]">
                Літопис
              </div>
              <p className="text-[11px] text-[#8E93A0] mt-1 line-clamp-2">
                Хроніка наказів, баталій, реформ та відкладених наслідків.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1C2433] text-[10px] font-mono text-[#8E93A0]">
              {eventsCount} записів у книзі
            </div>
          </button>

          {/* Document 4: Гетьманський Профіль */}
          <button
            onClick={() => onSelectTab('hetman')}
            className={`p-3.5 md:p-4 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between ${
              activeTab === 'hetman'
                ? 'bg-[#18202E] border-[#C9A96E] shadow-lg shadow-[#C9A96E]/10'
                : 'bg-[#10141E] border-[#222A3B] hover:border-[#C9A96E]/50 hover:bg-[#141A26]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#C9A96E]">
                  Воля володаря
                </span>
                <User className={`w-4 h-4 ${activeTab === 'hetman' ? 'text-[#C9A96E]' : 'text-[#8E93A0] group-hover:text-[#C9A96E]'}`} />
              </div>
              <div className="font-serif font-bold text-sm md:text-base text-[#F3EFE6]">
                Гетьман
              </div>
              <p className="text-[11px] text-[#8E93A0] mt-1 line-clamp-2">
                Особистий профіль, психологічні сигнали та вектор архетипу.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1C2433] text-[10px] font-mono text-[#C9A96E]">
              {decisionsCount} ухвалених рішень
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
