import React, { useState } from 'react';
import { GameState } from '../game/state/types.ts';
import { ProgressBar } from './ui/ProgressBar.tsx';
import {
  Map,
  Shield,
  Coins,
  Flame,
  AlertTriangle,
  Users,
  Compass,
  Building,
  UserCheck,
  ChevronRight,
  Scale,
  History,
  Crown,
  BookOpen,
  Award,
  Scroll,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Anchor,
  Train,
  Hammer,
  Percent,
  Banknote,
  GraduationCap,
  ShieldAlert,
  Boxes,
  Truck,
  Zap,
} from 'lucide-react';
import { calculateLegitimacy } from '../game/politics/evaluator.ts';
import { DetailedFaction } from '../game/politics/factionsData.ts';
import { DetailedRegion } from '../game/politics/regionsData.ts';

interface EmpireStateViewProps {
  state: GameState;
}

type StateTab =
  | 'economy'
  | 'military'
  | 'regions'
  | 'factions'
  | 'characters'
  | 'institutions'
  | 'tensions'
  | 'legitimacy'
  | 'promises';

export const EmpireStateView: React.FC<EmpireStateViewProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<StateTab>('economy');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('region_sich_core');

  const {
    regions,
    factions,
    characters,
    tensionRecords,
    institutions = [],
    promises = [],
    crises = [],
    politicalCapital = 55,
    empire,
    economy,
    military,
  } = state;

  const legitimacyCalc = calculateLegitimacy(state);
  const legitimacy = state.legitimacy || legitimacyCalc.components;
  const aggregateLegitimacy = legitimacyCalc.aggregate;

  const politicalCrises = crises.filter((c) => c.active);
  const ecoCrises = (economy?.crises || []).filter((c) => c.active);
  const totalActiveCrises = politicalCrises.length + ecoCrises.length;

  const renderMeter = (value: number, min = 0, max = 100, blocks = 10) => {
    const normalized = Math.max(0, Math.min(blocks, Math.round(((value - min) / (max - min)) * blocks)));
    const filled = '█'.repeat(normalized);
    const empty = '░'.repeat(blocks - normalized);
    return `${filled}${empty}`;
  };

  const selectedRegion =
    (regions as DetailedRegion[]).find((r) => r.id === selectedRegionId) ||
    (regions[0] as DetailedRegion);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. ПОЛІТИЧНО-МАТЕРІАЛЬНИЙ ДАШБОРД                                */}
      {/* ============================================================== */}
      <section className="bg-[#0C1018] border-2 border-[#232B3C] rounded-xl p-4 sm:p-5 md:p-6 shadow-2xl space-y-4 md:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2638] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C9A96E] uppercase tracking-widest font-semibold">
              <span>Державна Колегія Січі</span>
              <span>·</span>
              <span>{state.identity.year} РІК</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#F3EFE6] tracking-wide mt-1">
              Держава: Матеріальне Серце Імперії
            </h2>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {totalActiveCrises > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#3B1212] border border-[#EF4444] text-[#FCA5A5] text-xs font-mono font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                КРИЗ: {totalActiveCrises}
              </span>
            )}
            <div className="text-xs font-mono text-[#8E93A0] bg-[#121622] px-3 py-1.5 rounded-lg border border-[#232B3B]">
              Рік {state.identity.year}
            </div>
          </div>
        </div>

        {/* 3 Dashboard Columns: Single column on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-xs font-mono">
          {/* Col 1: Скарбниця та Бюджет */}
          <div className="bg-[#101420] border border-[#1E2536] rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[#FBBF24] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>СКАРБНИЦЯ ТА БЮДЖЕТ</span>
              </span>
              {economy && (
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${economy.trends.treasury >= 0 ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
                  {economy.trends.treasury >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {economy.trends.treasury >= 0 ? `+${economy.trends.treasury}` : economy.trends.treasury}M
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-[#E0E4EE]">
              <div className="flex justify-between items-center">
                <span className="text-[#8E93A0]">Скарбниця:</span>
                <span className="text-[#FBBF24] font-bold text-sm">{economy?.treasury ?? empire.treasury} млн крб</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Річний дохід / витрати:</span>
                <span>
                  <strong className="text-[#34D399]">+{economy?.income ?? 44}</strong> /{' '}
                  <strong className="text-[#EF4444]">-{economy?.expenses ?? 38}</strong>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Державний борг:</span>
                <span className={`font-bold ${(economy?.debt ?? 0) > 30 ? 'text-[#EF4444]' : 'text-[#F3EFE6]'}`}>
                  {economy?.debt ?? 0} / {economy?.creditLimit ?? 60} млн
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Добробут краю:</span>
                <span className="text-[#34D399] font-bold">{economy?.publicProsperity ?? empire.prosperity}%</span>
              </div>
            </div>
          </div>

          {/* Col 2: Військо: Сила ≠ Готовність */}
          <div className="bg-[#101420] border border-[#1E2536] rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[#EF4444] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>ВІЙСЬКОВА ГОТОВНІСТЬ</span>
              </span>
              {military && (
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${military.trends.readiness >= 0 ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
                  {military.trends.readiness >= 0 ? '↑' : '↓'} {military.trends.readiness}%
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-[#E0E4EE]">
              <div className="flex justify-between items-center">
                <span className="text-[#8E93A0]">Бойова готовність:</span>
                <span className="text-[#EF4444] font-bold text-sm">{military?.readiness ?? 70}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Потенційна міць:</span>
                <span className="text-[#F3EFE6] font-bold">{military?.strength ?? empire.militaryStrength}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Логістика & обози:</span>
                <span className="text-[#60A5FA] font-bold">{military?.logistics ?? 56}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E93A0]">Утримання армії:</span>
                <span className="text-[#FBBF24] font-bold">{military?.militaryExpenses ?? 16} млн/рік</span>
              </div>
            </div>
          </div>

          {/* Col 3: Політична Вага та Легітимність */}
          <div className="bg-[#101420] border border-[#1E2536] rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[#C9A96E] font-bold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>ЛЕГІТИМНІСТЬ І ВЛАДА</span>
            </div>
            <div className="space-y-2 text-[#E0E4EE]">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8E93A0]">Легітимність володаря:</span>
                  <span className="text-[#C9A96E] font-bold">{aggregateLegitimacy}%</span>
                </div>
                <div className="w-full bg-[#0A0D14] h-1.5 rounded-full overflow-hidden border border-[#232B3B]">
                  <div
                    className="h-full bg-gradient-to-r from-[#D97706] to-[#FBBF24]"
                    style={{ width: `${aggregateLegitimacy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8E93A0]">Політичний капітал:</span>
                  <span className="text-[#38BDF8] font-bold">{politicalCapital}%</span>
                </div>
                <div className="w-full bg-[#0A0D14] h-1.5 rounded-full overflow-hidden border border-[#232B3B]">
                  <div
                    className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8]"
                    style={{ width: `${politicalCapital}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ТАБИ НАВІГАЦІЇ                                              */}
      {/* ============================================================== */}
      <div className="border-b border-[#232A39] overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'economy', label: 'ЕКОНОМІКА', icon: <Coins className="w-4 h-4" /> },
            { id: 'military', label: 'ВІЙСЬКО', icon: <Shield className="w-4 h-4" /> },
            { id: 'regions', label: 'РЕГІОНИ', icon: <Map className="w-4 h-4" />, count: regions.length },
            { id: 'factions', label: 'ФРАКЦІЇ', icon: <Users className="w-4 h-4" />, count: factions.length },
            { id: 'characters', label: 'ПЕРСОНАЖІ', icon: <UserCheck className="w-4 h-4" />, count: characters.length },
            { id: 'institutions', label: 'УСТАНОВИ', icon: <Building className="w-4 h-4" />, count: institutions.length },
            { id: 'tensions', label: 'НАПРУГИ', icon: <Scale className="w-4 h-4" />, count: tensionRecords?.length || 6 },
            { id: 'legitimacy', label: 'ЛЕГІТИМНІСТЬ', icon: <Crown className="w-4 h-4" /> },
            {
              id: 'promises',
              label: 'ОБІЦЯНКИ ТА КРИЗИ',
              icon: <Scroll className="w-4 h-4" />,
              badge: totalActiveCrises > 0 ? totalActiveCrises : undefined,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StateTab)}
                className={`px-3.5 py-2 text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A96E] text-[#0A0D14] font-bold shadow-md'
                    : 'bg-[#10141E] text-[#8E93A0] hover:text-[#F3EFE6] border border-[#1E2536]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-[#0A0D14] text-[#C9A96E]' : 'bg-[#18202E] text-[#8E93A0]'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#EF4444] text-white font-bold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ЕКОНОМІКА (Requirement 27)                              */}
      {/* ============================================================== */}
      {activeTab === 'economy' && economy && (
        <div className="space-y-6">
          {/* A. Hero: Treasury & Budget Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Скарбниця та Баланс Року */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2331] pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#FBBF24]" />
                  <span className="font-serif text-lg font-bold text-[#F3EFE6]">Гетьманська Скарбниця</span>
                </div>
                <div className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 ${
                  economy.trends.treasury >= 0 ? 'bg-[#0E2016] text-[#34D399] border border-[#10B981]/40' : 'bg-[#2A1010] text-[#F87171] border border-[#EF4444]/40'
                }`}>
                  {economy.trends.treasury >= 0 ? '↑ Профіцит' : '↓ Дефіцит'} {economy.trends.treasury >= 0 ? `+${economy.trends.treasury}` : economy.trends.treasury} млн
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-[#FBBF24]">{economy.treasury}</span>
                <span className="text-xs font-mono text-[#8E93A0]">мільйонів карбованців золотом</span>
              </div>

              <div className="p-3 rounded bg-[#121622] border border-[#1E2536] text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase text-[#8E93A0] font-bold">Причини динаміки:</div>
                <div className="text-[#D8DCE6]">{economy.trends.treasuryReason}</div>
              </div>

              {/* Debt meter */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8E93A0]">Державний борг ({economy.debtInterest}% річних):</span>
                  <span className={`font-bold ${economy.debt > economy.creditLimit * 0.7 ? 'text-[#EF4444]' : 'text-[#F3EFE6]'}`}>
                    {economy.debt} / {economy.creditLimit} млн крб
                  </span>
                </div>
                <div className="w-full bg-[#0A0D14] h-2 rounded-full overflow-hidden border border-[#20293C]">
                  <div
                    className={`h-full ${economy.debt > economy.creditLimit * 0.7 ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`}
                    style={{ width: `${Math.min(100, (economy.debt / economy.creditLimit) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#717A8C]">
                  {economy.debt === 0
                    ? 'Держава вільна від лихварських зобов’язань'
                    : `Щорічна сплата відсотків кредиторам: -${Math.round(economy.debt * (economy.debtInterest / 100))} млн крб`}
                </div>
              </div>
            </div>

            {/* Box 2: Доходи проти Витрат */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2331] pb-3">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-[#34D399]" />
                  <span className="font-serif text-lg font-bold text-[#F3EFE6]">Річний Баланс</span>
                </div>
                <div className="text-xs font-mono text-[#8E93A0]">
                  Баланс: <strong className={economy.income >= economy.expenses ? 'text-[#34D399]' : 'text-[#EF4444]'}>
                    {economy.income - economy.expenses >= 0 ? `+${economy.income - economy.expenses}` : economy.income - economy.expenses} млн
                  </strong>
                </div>
              </div>

              {/* Revenues Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-[11px] uppercase tracking-wider text-[#34D399] font-bold">
                  ДОХОДИ: +{economy.income} млн
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A8B2C4]">
                  <div>• Податки: <strong className="text-[#F3EFE6]">+{economy.taxRevenue} млн</strong></div>
                  <div>• Торгівля: <strong className="text-[#F3EFE6]">+{economy.tradeRevenue} млн</strong></div>
                  <div>• Мита гаваней: <strong className="text-[#F3EFE6]">+{economy.customsRevenue} млн</strong></div>
                  <div>• Ресурси (сіль/руда): <strong className="text-[#F3EFE6]">+{economy.resourceRevenue} млн</strong></div>
                </div>
              </div>

              {/* Expenses Breakdown */}
              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#1C2331]">
                <div className="text-[11px] uppercase tracking-wider text-[#EF4444] font-bold">
                  ВИТРАТИ: -{economy.expenses} млн
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A8B2C4]">
                  <div>• Армія та флот: <strong className="text-[#F3EFE6]">-{economy.militaryExpenses} млн</strong></div>
                  <div>• Суди й канцелярія: <strong className="text-[#F3EFE6]">-{economy.administrativeExpenses} млн</strong></div>
                  <div>• Шляхи й тракти: <strong className="text-[#F3EFE6]">-{economy.infrastructureExpenses} млн</strong></div>
                  <div>• Освіта й колегії: <strong className="text-[#F3EFE6]">-{economy.educationExpenses} млн</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Core Pillars: Податки, Торгівля, Добробут */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Податки */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-[#C9A96E]" />
                  <span>Податковий Устрій</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18202E] text-[#C9A96E] uppercase border border-[#2B3548]">
                  {economy.taxPolicy}
                </span>
              </div>
              <div className="space-y-2">
                <ProgressBar
                  label="Податковий тягар"
                  value={economy.taxBurden}
                  unit="%"
                  color={economy.taxBurden > 50 ? 'red' : 'amber'}
                  showBlocks={false}
                />
                <ProgressBar
                  label="Збираність податків"
                  value={economy.taxEfficiency}
                  unit="%"
                  color="blue"
                  showBlocks={false}
                />
              </div>
              <p className="text-[11px] text-[#8E93A0] leading-snug">
                Помірний тягар підтримує добробут, але високі податки живлять арсенали Січі.
              </p>
            </div>

            {/* 2. Торгівля */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-[#38BDF8]" />
                  <span>Торгівля та Порти</span>
                </span>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold">
                  Мито: {economy.trade.tariffsRate}%
                </span>
              </div>
              <div className="space-y-2">
                <ProgressBar
                  label="Вантажообіг"
                  value={economy.trade.tradeVolume}
                  unit="%"
                  color="blue"
                  showBlocks={false}
                />
                <ProgressBar
                  label="Торговельна свобода"
                  value={economy.trade.tradeFreedom}
                  unit="%"
                  color="green"
                  showBlocks={false}
                />
                <ProgressBar
                  label="Ефективність портів"
                  value={economy.trade.portEfficiency}
                  unit="%"
                  color="purple"
                  showBlocks={false}
                />
              </div>
            </div>

            {/* 3. Добробут та Зростання */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#34D399]" />
                  <span>Добробут Краю</span>
                </span>
                <span className="text-[10px] font-mono text-[#34D399] font-bold">
                  Ріст: +{economy.economicGrowth}%
                </span>
              </div>
              <div className="space-y-2">
                <ProgressBar
                  label="Рівень добробуту"
                  value={economy.publicProsperity}
                  unit="%"
                  color="green"
                  showBlocks={false}
                />
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8E93A0]">Інфляційний тиск:</span>
                  <span className={economy.inflation > 10 ? 'text-[#EF4444]' : 'text-[#F3EFE6]'}>{economy.inflation}%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8E93A0]">Освіта народу:</span>
                  <span className="text-[#C9A96E]">{economy.educationLevel}%</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8E93A0] leading-snug">
                {economy.trends.prosperityReason}
              </p>
            </div>
          </div>

          {/* C. Державні Проєкти та Інвестиції (Requirements 24 & 25) */}
          <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C2331] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
                <Train className="w-5 h-5 text-[#C9A96E]" />
                <span>Державні Проєкти та Довгострокові Інвестиції</span>
              </h3>
              <span className="text-xs font-mono text-[#8E93A0]">
                {economy.stateProjects.length} активних проєктів
              </span>
            </div>

            {economy.stateProjects.length === 0 && economy.investments.length === 0 ? (
              <div className="p-6 rounded-lg bg-[#121622] text-center text-xs font-mono text-[#8E93A0]">
                Наразі у Раді немає відкритих масштабних проєктів. Ухвалюйте рішення в Раді (наприклад, кредит на залізницю 1850 р.) для запуску будівництва.
              </div>
            ) : (
              <div className="space-y-3">
                {economy.stateProjects.map((prj) => (
                  <div
                    key={prj.id}
                    className={`p-4 rounded-xl border-2 space-y-3 ${
                      prj.completed ? 'bg-[#0E1C14] border-[#10B981]/50' : 'bg-[#121724] border-[#2A354A]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#F3EFE6] flex items-center gap-1.5">
                        <Hammer className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{prj.name}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${prj.completed ? 'bg-[#10B981] text-[#0A0D14]' : 'bg-[#C9A96E]/20 text-[#C9A96E]'}`}>
                        {prj.completed ? 'ЗАВЕРШЕНО' : `ПОСТУП: ${prj.yearsProgress} / ${prj.duration} РОКІВ`}
                      </span>
                    </div>

                    <p className="text-xs text-[#8E93A0]">{prj.description}</p>

                    <div className="w-full bg-[#0A0D14] h-2 rounded-full overflow-hidden border border-[#232B3B]">
                      <div
                        className="h-full bg-[#C9A96E]"
                        style={{ width: `${Math.min(100, (prj.yearsProgress / prj.duration) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ВІЙСЬКО (Requirement 28)                                */}
      {/* ============================================================== */}
      {activeTab === 'military' && military && (
        <div className="space-y-6">
          {/* A. Hero: Strength ≠ Readiness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Бойова Готовність (Readiness) */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2331] pb-3">
                <span className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#EF4444]" />
                  <span>Бойова Готовність Похідних Полків</span>
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  military.readiness >= 65 ? 'bg-[#0E2016] text-[#34D399]' : 'bg-[#2A1010] text-[#F87171]'
                }`}>
                  {military.readiness}%
                </span>
              </div>

              <div className="space-y-2">
                <ProgressBar
                  label="Оперативна готовність діяти зараз"
                  value={military.readiness}
                  unit="%"
                  color={military.readiness > 60 ? 'green' : 'red'}
                  showBlocks={false}
                />
              </div>

              <div className="p-3 rounded bg-[#121622] border border-[#1E2536] text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase text-[#8E93A0] font-bold">Фактори боєготовності:</div>
                <div className="text-[#D8DCE6]">{military.trends.readinessReason}</div>
              </div>
            </div>

            {/* Box 2: Потенційна Сила (Strength) */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2331] pb-3">
                <span className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C9A96E]" />
                  <span>Потенційна Військова Міць</span>
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#141A26] text-[#C9A96E]">
                  {military.strength}%
                </span>
              </div>

              <div className="space-y-2">
                <ProgressBar
                  label="Кадровий резерв та артилерійські парки"
                  value={military.strength}
                  unit="%"
                  color="purple"
                  showBlocks={false}
                />
              </div>

              <div className="p-3 rounded bg-[#121622] border border-[#1E2536] text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase text-[#8E93A0] font-bold">Стратегічна оцінка:</div>
                <div className="text-[#D8DCE6]">{military.trends.strengthReason}</div>
              </div>
            </div>
          </div>

          {/* B. Detailed Military Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Мораль & Лояльність офіцерів */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span>Дух Війська</span>
              </div>
              <ProgressBar
                label="Моральний стан козацтва"
                value={military.morale}
                unit="%"
                color={military.morale > 60 ? 'amber' : 'red'}
                showBlocks={false}
              />
              <ProgressBar
                label="Підтримка офіцерського корпусу"
                value={military.officerLoyalty}
                unit="%"
                color="blue"
                showBlocks={false}
              />
              <ProgressBar
                label="Вплив ветеранів Старої Січі"
                value={military.veteranInfluence}
                unit="%"
                color="purple"
                showBlocks={false}
              />
            </div>

            {/* Box 2: Оснащення & Арсенали */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                <Hammer className="w-4 h-4 text-[#C9A96E]" />
                <span>Оснащення та Арсенали</span>
              </div>
              <ProgressBar
                label="Стан озброєння та набоїв"
                value={military.equipment}
                unit="%"
                color="amber"
                showBlocks={false}
              />
              <ProgressBar
                label="Людський ресурс (рекрут)"
                value={military.manpower}
                unit="%"
                color="green"
                showBlocks={false}
              />
              <div className="text-xs font-mono text-[#8E93A0] pt-1">
                Річні витрати на утримання: <strong className="text-[#FBBF24]">{military.militaryExpenses} млн</strong>
              </div>
            </div>

            {/* Box 3: Логістика та Обози */}
            <div className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="font-serif text-base font-bold text-[#F3EFE6] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#60A5FA]" />
                <span>Логістика та Транспорт</span>
              </div>
              <ProgressBar
                label="Швидкість постачання полків"
                value={military.logistics}
                unit="%"
                color="blue"
                showBlocks={false}
              />
              <p className="text-[11px] text-[#8E93A0] leading-snug">
                Залежить від стану доріг, залізниць та захищеності поштових трактів.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: РЕГІОНИ ТА ПОЛІТИЧНА КАРТА (Requirement 29)             */}
      {/* ============================================================== */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          {/* Схема Воєводств */}
          <div className="bg-[#0E131E] border-2 border-[#232B3C] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#F3EFE6] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C9A96E]" />
                <span>Воєводства Імперії Січ</span>
              </h3>
              <span className="text-xs font-mono text-[#8E93A0]">
                Оберіть терен
              </span>
            </div>

            {/* 1 Column on Mobile, 2 on Tablet, 4 on Desktop (Section 14 Specification) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { id: 'region_galicia', name: 'Галичина', sub: 'Шляхта й соляні родовища' },
                { id: 'region_podillia', name: 'Київ', sub: 'Золотоверхий центр' },
                { id: 'region_sich_core', name: 'Запоріжжя', sub: 'Курені та арсенали' },
                { id: 'region_muscovy', name: 'Московська земля', sub: 'Східний домен' },
              ].map((mapNode) => {
                const reg = (regions as DetailedRegion[]).find((r) => r.id === mapNode.id);
                const isSelected = selectedRegionId === mapNode.id;
                const loyaltyVal = reg?.loyalty ?? reg?.stability ?? 70;
                const prosperityVal = reg?.prosperity ?? 60;
                const autonomyVal = reg?.autonomy ?? 40;
                const tensionVal = reg?.tension ?? 15;

                return (
                  <div
                    key={mapNode.id}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-[#1D2536] border-[#C9A96E] shadow-xl shadow-[#C9A96E]/10'
                        : 'bg-[#101420] border-[#222B3D] hover:border-[#C9A96E]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
                          {isSelected ? '● ОБРАНИЙ ТЕРЕН' : 'ВОЄВОДСТВО'}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-serif text-xl font-bold text-[#F3EFE6] mt-0.5">
                        {mapNode.name}
                      </h4>
                      <p className="text-xs text-[#8E93A0] mt-0.5">{mapNode.sub}</p>
                    </div>

                    {/* 4 Core Metrics per Section 14 */}
                    <div className="pt-2 border-t border-[#1F2738] space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E93A0]">Лояльність:</span>
                        <span className="text-[#34D399] font-bold">{loyaltyVal}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E93A0]">Добробут:</span>
                        <span className="text-[#FBBF24] font-bold">{prosperityVal}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E93A0]">Автономія:</span>
                        <span className="text-[#A78BFA] font-bold">{autonomyVal}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8E93A0]">Напруження:</span>
                        <span className={`font-bold ${tensionVal > 30 ? 'text-[#EF4444]' : 'text-[#38BDF8]'}`}>
                          {tensionVal}%
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setSelectedRegionId(mapNode.id)}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A96E] text-[#0A0D14]'
                          : 'bg-[#151C2A] text-[#C9A96E] hover:bg-[#1E273A] border border-[#27344D]'
                      }`}
                    >
                      <span>{isSelected ? 'Терен відкрито' : 'Відкрити регіон →'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Детальна Регіональна Панель (Requirement 29: Економіка, Інфраструктура, Політика, Безпека) */}
          {selectedRegion && (
            <div className="bg-[#0E121A] border-2 border-[#C9A96E]/50 rounded-xl p-6 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#232B3C] pb-4">
                <div>
                  <div className="text-xs font-mono uppercase text-[#C9A96E] tracking-widest">
                    Регіональний Реєстр
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[#F3EFE6]">
                    {selectedRegion.name}
                  </h4>
                  <p className="text-xs text-[#8E93A0] mt-1 max-w-2xl leading-relaxed">
                    {selectedRegion.description}
                  </p>
                </div>
                <div className="bg-[#121622] px-3.5 py-2 rounded-lg border border-[#232B3B] font-mono text-xs text-right">
                  <div className="text-[#8E93A0]">Населення:</div>
                  <div className="text-[#E0DDD5] font-bold">{selectedRegion.population || '3.5M'}</div>
                </div>
              </div>

              {/* 4 Quadrants per Requirement 29 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                {/* 1. ЕКОНОМІКА */}
                <div className="bg-[#111624] p-4 rounded-lg border border-[#212B3E] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#FBBF24] flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>ЕКОНОМІКА</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Добробут:</span>
                    <span className="text-[#34D399] font-bold">{selectedRegion.prosperity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Багатство:</span>
                    <span className="text-[#FBBF24] font-bold">{selectedRegion.wealth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Внесок податків:</span>
                    <span className="text-[#F3EFE6] font-bold">+{selectedRegion.taxContribution ?? 15} млн</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Торгівля краю:</span>
                    <span className="text-[#38BDF8] font-bold">{selectedRegion.tradeContribution ?? 50}%</span>
                  </div>
                </div>

                {/* 2. ІНФРАСТРУКТУРА */}
                <div className="bg-[#111624] p-4 rounded-lg border border-[#212B3E] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#60A5FA] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>ІНФРАСТРУКТУРА</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Дороги та тракти:</span>
                    <span className="text-[#F3EFE6] font-bold">{selectedRegion.infrastructure?.roads ?? 50}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Порти та пристані:</span>
                    <span className="text-[#F3EFE6] font-bold">{selectedRegion.infrastructure?.ports ?? 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Залізниця:</span>
                    <span className="text-[#F3EFE6] font-bold">{selectedRegion.infrastructure?.railways ?? 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Адміністрація:</span>
                    <span className="text-[#F3EFE6] font-bold">{selectedRegion.infrastructure?.administration ?? 50}%</span>
                  </div>
                </div>

                {/* 3. ПОЛІТИКА */}
                <div className="bg-[#111624] p-4 rounded-lg border border-[#212B3E] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#C9A96E] flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>ПОЛІТИКА</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Лояльність:</span>
                    <span className="text-[#34D399] font-bold">{selectedRegion.loyalty ?? selectedRegion.stability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Автономія краю:</span>
                    <span className="text-[#A78BFA] font-bold">{selectedRegion.autonomy ?? 40}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Напруження / Бунт:</span>
                    <span className={`font-bold ${(selectedRegion.tension ?? 15) > 40 ? 'text-[#EF4444]' : 'text-[#34D399]'}`}>
                      {selectedRegion.tension ?? 15}%
                    </span>
                  </div>
                </div>

                {/* 4. БЕЗПЕКА */}
                <div className="bg-[#111624] p-4 rounded-lg border border-[#212B3E] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#EF4444] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>БЕЗПЕКА</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Загальна безпека:</span>
                    <span className="text-[#34D399] font-bold">{selectedRegion.security ?? 60}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E93A0]">Військова залога:</span>
                    <span className="text-[#EF4444] font-bold">{selectedRegion.garrisonStrength ?? 60}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ФРАКЦІЇ                                                 */}
      {/* ============================================================== */}
      {activeTab === 'factions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(factions as unknown as DetailedFaction[]).map((f) => (
            <div
              key={f.id}
              className="bg-[#0E121A] border-2 border-[#232A39] hover:border-[#C9A96E]/50 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E]">
                      Станова Сила
                    </div>
                    <h4 className="font-serif text-xl font-bold text-[#F3EFE6]">{f.name}</h4>
                    <div className="text-xs text-[#8E93A0] font-mono mt-0.5">
                      Лідер: <span className="text-[#E0DDD5]">{f.leaderName}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono bg-[#141926] px-2.5 py-1 rounded border border-[#232C3E]">
                    <div className="text-[#8E93A0]">Багатство: <strong className="text-[#FBBF24]">{f.wealth ?? 50}%</strong></div>
                    <div className="text-[#8E93A0]">Влада: <strong className="text-[#A78BFA]">{f.politicalPower ?? 50}%</strong></div>
                  </div>
                </div>
                <p className="text-xs text-[#8E93A0] mt-2.5 leading-relaxed">{f.description}</p>
                <div className="text-xs text-[#C9A96E] italic mt-1 font-serif">«{f.ideology}»</div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#1C2331]">
                <ProgressBar label="Вплив у Раді" value={f.influence} unit="%" color="purple" showBlocks={false} />
                <ProgressBar
                  label="Лояльність до Гетьмана"
                  value={f.loyalty}
                  unit="%"
                  color={f.loyalty >= 50 ? 'green' : 'amber'}
                  showBlocks={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ПЕРСОНАЖІ                                               */}
      {/* ============================================================== */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((char) => {
            const trust = char.trust ?? 0;
            const respect = char.respect ?? 0;
            const loyalty = char.loyalty ?? 0;
            const fear = char.fear ?? 0;
            const factionName = factions.find((f) => f.id === char.factionId)?.name || 'Вільний';

            return (
              <div
                key={char.id}
                className="bg-[#0E121A] border-2 border-[#232A39] hover:border-[#C9A96E]/50 rounded-xl p-5 md:p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-[#F3EFE6]">{char.name}</h4>
                      <div className="text-xs text-[#C9A96E] font-mono mt-0.5">{char.role}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C28] text-[#8E93A0] border border-[#232A3B]">
                      {factionName}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E93A0] mt-2.5 leading-relaxed">{char.bio}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#1C2331] font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E93A0]">Довіра ({trust > 0 ? `+${trust}` : trust}):</span>
                    <span className="text-[#34D399] tracking-tighter">{renderMeter(trust, -20, 20)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E93A0]">Повага ({respect > 0 ? `+${respect}` : respect}):</span>
                    <span className="text-[#60A5FA] tracking-tighter">{renderMeter(respect, -20, 20)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E93A0]">Лояльність ({loyalty > 0 ? `+${loyalty}` : loyalty}):</span>
                    <span className="text-[#C9A96E] tracking-tighter">{renderMeter(loyalty, -20, 20)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: УСТАНОВИ                                                */}
      {/* ============================================================== */}
      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className="bg-[#0E121A] border-2 border-[#232A39] rounded-xl p-5 md:p-6 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#F3EFE6]">{inst.name}</h4>
                    <div className="text-xs text-[#8E93A0] font-mono mt-0.5">
                      Очільник: <span className="text-[#E0DDD5]">{inst.headTitle}</span>
                    </div>
                  </div>
                  <Building className="w-5 h-5 text-[#C9A96E]" />
                </div>
                <p className="text-xs text-[#8E93A0] mt-2.5 leading-relaxed">{inst.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#1C2331]">
                <ProgressBar label="Вплив в державі" value={inst.influence} unit="%" color="purple" showBlocks={false} />
                <ProgressBar label="Авторитет" value={inst.authority} unit="%" color="blue" showBlocks={false} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: НАПРУГИ                                                 */}
      {/* ============================================================== */}
      {activeTab === 'tensions' && (
        <div className="bg-[#0E131E] border-2 border-[#2A354A] rounded-xl p-5 md:p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1E273A] pb-3">
            <h3 className="font-serif text-xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#C9A96E]" />
              <span>Фундаментальні Полярні Напруги</span>
            </h3>
            <span className="text-xs font-mono text-[#8E93A0]">Будь-яка дія породжує протидію</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tensionRecords || []).map((t) => {
              const val = t.value ?? 50;
              return (
                <div key={t.id} className="bg-[#121724] border border-[#212A3B] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider text-[#C9A96E]">{t.poleA}</span>
                    <span className="text-[11px] text-[#636B7E]">{val}%</span>
                    <span className="font-bold uppercase tracking-wider text-[#8E93A0]">{t.poleB}</span>
                  </div>
                  <div className="relative w-full h-3 bg-[#0A0D14] rounded-full overflow-hidden border border-[#20293C]">
                    <div className="h-full bg-gradient-to-r from-[#8E2525] via-[#C9A96E] to-[#3B82F6]" style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: ЛЕГІТИМНІСТЬ                                            */}
      {/* ============================================================== */}
      {activeTab === 'legitimacy' && (
        <div className="bg-[#0E131E] border-2 border-[#232B3C] rounded-xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
            <div>
              <div className="text-xs font-mono uppercase text-[#C9A96E] tracking-widest">
                Фундамент Гетьманської Влади
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#F3EFE6] mt-0.5">
                Джерела Легітимності Володаря
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#8E93A0]">Агрегована Легітимність: </span>
              <span className="text-xl font-serif font-bold text-[#C9A96E]">{aggregateLegitimacy}%</span>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {[
              { label: 'Традиція', val: legitimacy.tradition, note: 'Козацький звичай та присяга Низової Січі' },
              { label: 'Право', val: legitimacy.law, note: 'Непорушність Статуту та інституцій' },
              { label: 'Успіх', val: legitimacy.success, note: 'Наповненість скарбниці та народний добробут' },
              { label: 'Підтримка суспільства', val: legitimacy.popularSupport, note: 'Довіра міських магістратів та громад' },
              { label: 'Підтримка еліт', val: legitimacy.eliteSupport, note: 'Згода шляхти та купецьких гільдій' },
              { label: 'Підтримка війська', val: legitimacy.militarySupport, note: 'Авторитет серед генералітету та полків' },
            ].map((pillar) => (
              <div key={pillar.label} className="bg-[#121624] border border-[#212A3D] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[#F3EFE6]">{pillar.label}</span>
                  <span className="text-[#C9A96E] font-bold">{pillar.val}%</span>
                </div>
                <div className="text-base text-[#C9A96E] tracking-tight">{renderMeter(pillar.val, 0, 100, 20)}</div>
                <p className="text-[11px] text-[#8E93A0] italic">{pillar.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 9: ОБІЦЯНКИ ТА КРИЗИ                                       */}
      {/* ============================================================== */}
      {activeTab === 'promises' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              <span>Державні та Економічні Кризи</span>
            </h3>

            {totalActiveCrises === 0 ? (
              <div className="p-5 rounded-xl bg-[#0E121A] border border-[#232A39] text-center text-[#8E93A0] text-xs font-mono">
                Наразі гострих відкритих криз не зафіксовано. Рівновага між станами та фінансами утримується.
              </div>
            ) : (
              <div className="space-y-3">
                {[...politicalCrises, ...ecoCrises].map((crisis) => (
                  <div
                    key={crisis.id}
                    className="p-5 rounded-xl bg-[#1C0E12] border-2 border-[#EF4444] space-y-2 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#F87171] font-bold">
                        ● ГОСТРА КРИЗА ДЕРЖАВИ
                      </span>
                      <span className="text-xs font-mono text-[#8E93A0]">Рік спалаху: {crisis.triggeredYear}</span>
                    </div>
                    <h4 className="font-serif text-xl font-bold text-[#FEE2E2]">{crisis.title}</h4>
                    <p className="text-xs text-[#E5B5B5] leading-relaxed">{crisis.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 pt-4 border-t border-[#1E2536]">
            <h3 className="font-serif text-xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Scroll className="w-5 h-5 text-[#C9A96E]" />
              <span>Обіцянки Гетьмана перед Станами</span>
            </h3>
            {promises.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#0E121A] border border-[#232A39] text-center text-[#8E93A0] text-xs font-mono">
                Гетьман не давав офіційних строкових зобов’язань перед окремими станами.
              </div>
            ) : (
              <div className="space-y-3">
                {promises.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border-2 space-y-2 ${
                      p.broken ? 'bg-[#180E10] border-[#EF4444]/60' : p.fulfilled ? 'bg-[#0E1C14] border-[#10B981]/60' : 'bg-[#101420] border-[#C9A96E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8E93A0]">Перед станом: <strong className="text-[#F3EFE6]">{p.targetFaction}</strong></span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.broken ? 'bg-[#EF4444]/20 text-[#FCA5A5]' : p.fulfilled ? 'bg-[#10B981]/20 text-[#6EE7B7]' : 'bg-[#C9A96E]/20 text-[#C9A96E]'
                      }`}>
                        {p.broken ? 'ПОРУШЕНО' : p.fulfilled ? 'ВИКОНАНО' : `ТЕРМІН: ${p.deadlineYear} р.`}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#F3EFE6]">«{p.text}»</h4>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
