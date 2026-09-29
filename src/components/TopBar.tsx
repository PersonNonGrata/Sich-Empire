import React, { useState } from 'react';
import { GameState } from '../game/state/types.ts';
import { CoatOfArms } from './ui/CoatOfArms.tsx';
import { MetricModal, MetricType } from './ui/MetricModal.tsx';
import { Coins, Landmark, Save, Settings, Scale } from 'lucide-react';

interface TopBarProps {
  state: GameState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableScenariosCount: number;
  isSaving: boolean;
  onOpenCouncil: () => void;
  onOpenDiagnostics?: () => void;
  hasHetmanUpdates: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  activeTab,
  setActiveTab,
  availableScenariosCount,
  isSaving,
  onOpenCouncil,
  onOpenDiagnostics,
  hasHetmanUpdates,
}) => {
  const { identity, empire } = state;
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const navItems = [
    { id: 'rada', label: 'РАДА', badge: availableScenariosCount },
    { id: 'state', label: 'ДЕРЖАВА', badge: 0 },
    { id: 'chronicle', label: 'ЛІТОПИС', badge: 0 },
    { id: 'hetman', label: 'ГЕТЬМАН', badge: hasHetmanUpdates ? 1 : 0 },
  ];

  return (
    <>
      <header className="border-b border-[#232A39] bg-[#0A0D13]/95 backdrop-blur-md sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: Coat of Arms, Title, Year */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('rada');
                onOpenCouncil();
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none min-h-[44px] py-1"
              title="Головна Палата Ради"
            >
              <CoatOfArms size={32} className="group-hover:scale-105 transition-transform shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm md:text-base font-bold tracking-widest text-[#F3EFE6] uppercase group-hover:text-[#C9A96E] transition-colors whitespace-nowrap">
                    Імперія Січ
                  </span>
                  <span className="font-mono text-[11px] tracking-wider px-1.5 py-0.5 rounded bg-[#171D2B] text-[#C9A96E] border border-[#C9A96E]/30 font-semibold">
                    {identity.year}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E93A0] leading-none hidden sm:block">
                  {identity.rulerTitle}: <span className="text-[#E0DDD5] font-medium">{identity.rulerName}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Center (Desktop only): only the three signals needed during rule */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 font-mono text-xs">
            {/* 1. Treasury */}
            <button
              onClick={() => setSelectedMetric('treasury')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111622] hover:bg-[#182030] border border-[#232B3B] hover:border-[#FBBF24]/50 transition-all cursor-pointer text-left min-h-[36px]"
              title="Натисніть для пояснення показника Скарбниці"
            >
              <Coins className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] text-[#8E93A0] hidden md:inline">Казна:</span>
                <span className="font-bold text-[#FBBF24]">{state.economy?.treasury ?? empire.treasury}M</span>
                {state.economy && (
                  <span className={`text-[10px] font-bold ${state.economy.trends.treasury >= 0 ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
                    {state.economy.trends.treasury >= 0 ? `+${state.economy.trends.treasury}↑` : `${state.economy.trends.treasury}↓`}
                  </span>
                )}
              </div>
            </button>

            {/* 2. Political Will */}
            <button
              onClick={() => setSelectedMetric(null)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111622] border border-[#232B3B] transition-all cursor-default min-h-[36px]"
              title="Політична воля Гетьмана"
            >
              <Scale className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] text-[#8E93A0]">Політична воля:</span>
                <span className="font-bold text-[#C9A96E]">{state.politicalWill ?? 55}</span>
              </div>
            </button>

            {/* 3. Stability */}
            <button
              onClick={() => setSelectedMetric('stability')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111622] hover:bg-[#182030] border border-[#232B3B] hover:border-[#60A5FA]/50 transition-all cursor-pointer text-left min-h-[36px]"
              title="Натисніть для пояснення показника Стабільності"
            >
              <Landmark className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] text-[#8E93A0]">Спокій:</span>
                <span className="font-bold text-[#F3EFE6]">{empire.stability}%</span>
              </div>
            </button>
          </div>

          {/* Right: Save Status & Settings (⚙) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className="flex items-center gap-1 text-[11px] text-[#8E93A0] font-mono px-1 py-1"
              title={isSaving ? 'Збереження у сховище браузера...' : 'Всі рішення автоматично збережені'}
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'text-[#FBBF24] animate-spin' : 'text-[#34D399]'}`} />
              <span className="hidden lg:inline text-[10px]">
                {isSaving ? 'Збереження...' : 'Збережено'}
              </span>
            </div>

            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-[#C9A96E] hover:text-[#F3EFE6] hover:bg-[#141A26] border border-[#232B3B] hover:border-[#C9A96E]/50 transition-colors cursor-pointer"
                title="Налаштування та керування грою"
                aria-label="Налаштування"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation Row */}
        <div className="hidden md:block border-t border-[#1C2331] bg-[#0C1017]">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <nav className="flex items-center space-x-1" aria-label="Головна навігація">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === 'rada') onOpenCouncil();
                    }}
                    className={`px-4 py-2.5 text-xs font-serif font-bold tracking-widest uppercase transition-all flex items-center gap-2 relative cursor-pointer ${
                      isActive
                        ? 'text-[#C9A96E] border-b-2 border-[#C9A96E] bg-[#141A26]/50'
                        : 'text-[#8E93A0] hover:text-[#F3EFE6] hover:bg-[#111622]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#8E2525] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="text-[11px] font-mono text-[#5A6273] flex items-center gap-2">
              <span>Хортицька Резиденція</span>
              <span>•</span>
              <span>1848</span>
            </div>
          </div>
        </div>
      </header>

      {/* Metric Explanation Modal */}
      <MetricModal
        metricKey={selectedMetric}
        metrics={empire}
        onClose={() => setSelectedMetric(null)}
      />
    </>
  );
};
