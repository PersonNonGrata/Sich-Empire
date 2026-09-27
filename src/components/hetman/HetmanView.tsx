import React from 'react';
import { GameState } from '../../game/state/types.ts';
import { DIMENSION_DETAILS, getPsychologicalSummary } from '../../game/psychology/manager.ts';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { WaxSeal } from '../ui/WaxSeal.tsx';
import { CoatOfArms } from '../ui/CoatOfArms.tsx';
import {
  User,
  Calendar,
  CheckSquare,
  BookOpen,
  Brain,
  Award,
  AlertTriangle,
  History,
  Shield,
} from 'lucide-react';
import { PsychologicalDimension } from '../../game/psychology/types.ts';

interface HetmanViewProps {
  state: GameState;
}

export const HetmanView: React.FC<HetmanViewProps> = ({ state }) => {
  const { identity, decisions, history, psychology, archetypeProfile } = state;
  const summary = getPsychologicalSummary(psychology);

  // Key primary dimensions explicitly requested by Section 9:
  const primaryDimensions: PsychologicalDimension[] = [
    'ORDER',      // ПОРЯДОК
    'FREEDOM',    // СВОБОДА
    'RISK',       // РИЗИК
    'POWER',      // ВЛАДА
    'KNOWLEDGE',  // ЗНАННЯ
    'TRADITION',  // ТРАДИЦІЯ
    'CREATION',   // ТВОРЕННЯ
    'ECONOMY',    // ЕКОНОМІКА
  ];

  // Count critical / major historical events
  const majorEventsCount = history.filter(
    (h) => h.importance === 'critical' || h.importance === 'major'
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. ГЕТЬМАН · 1848 · [ІМ'Я ГРАВЦЯ] (Section 9 Header)          */}
      {/* ============================================================== */}
      <section className="bg-[#0E131D] border-2 border-[#263145] rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 pb-4 sm:pb-6 border-b border-[#1E273A]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#141A26] border-2 border-[#C9A96E] flex items-center justify-center text-[#C9A96E] shadow-inner shrink-0">
              <CoatOfArms size={38} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{identity.year} РІК</span>
                <span>·</span>
                <span>{identity.rulerTitle}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#F3EFE6] tracking-wide">
                {identity.rulerName}
              </h2>
              <p className="text-xs text-[#8E93A0]">
                Обраний на Великій Січовій Раді. Суверенний правитель та головнокомандувач збройних сил Імперії.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. РІШЕННЯ ТА ІСТОРІЯ (Core stats counters)                   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4 md:pt-6">
          {/* Decisions Count */}
          <div className="bg-[#121824] border border-[#232D40] rounded-lg p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#C9A96E]">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>РІШЕННЯ</span>
            </div>
            <div className="font-mono text-2xl md:text-3xl font-bold text-[#F3EFE6]">
              {decisions.length}
            </div>
            <div className="text-[11px] text-[#8E93A0]">
              Універсалів ухвалено
            </div>
          </div>

          {/* History Events Count */}
          <div className="bg-[#121824] border border-[#232D40] rounded-lg p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#60A5FA]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ІСТОРІЯ</span>
            </div>
            <div className="font-mono text-2xl md:text-3xl font-bold text-[#F3EFE6]">
              {history.length}
            </div>
            <div className="text-[11px] text-[#8E93A0]">
              Подій у Літописі ({majorEventsCount} ключових)
            </div>
          </div>

          {/* Tentative Direction */}
          <div className="bg-[#121824] border border-[#232D40] rounded-lg p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#A78BFA]">
              <Brain className="w-3.5 h-3.5" />
              <span>ОРІЄНТИР</span>
            </div>
            <div className="font-serif text-sm font-bold text-[#E8D7B8] truncate" title={archetypeProfile.tentativeArchetypeTitle}>
              {archetypeProfile.tentativeArchetypeTitle}
            </div>
            <div className="text-[11px] text-[#8E93A0]">
              Обраховано на {archetypeProfile.calculatedAtYear} р.
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ПСИХОЛОГІЧНИЙ ПРОФІЛЬ (Section 9 Specification)             */}
      {/* ============================================================== */}
      <section className="bg-[#0E131D] border border-[#232A39] rounded-xl p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 shadow-xl">
        <div className="border-b border-[#1E2536] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#C9A96E]" />
              <span>Психологічний Профіль</span>
            </h3>
            <p className="text-xs text-[#C9A96E] font-serif italic mt-1">
              «Профіль формується з рішень, а не з одного тесту.»
            </p>
          </div>

          <div className="text-[11px] font-mono text-[#8E93A0] bg-[#121622] px-3 py-1.5 rounded border border-[#232B3B] self-start sm:self-auto">
            Сигналів зафіксовано: <span className="text-[#F3EFE6] font-bold">{psychology.length}</span>
          </div>
        </div>

        {/* Signals Gauge Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {primaryDimensions.map((dim) => {
            const rawScore = summary[dim] ?? 0;
            const detail = DIMENSION_DETAILS[dim];

            // Normalize for visual presentation (e.g. scale of 0 to 10 for MVP)
            // Base minimum visual weight is 2 so it shows as a tangible spectrum
            const displayVal = Math.max(0, rawScore);
            const maxVal = Math.max(10, Math.ceil((displayVal + 2) / 5) * 5);

            return (
              <div
                key={dim}
                className="bg-[#121722] border border-[#222B3B] p-3.5 sm:p-4 rounded-lg space-y-2 hover:border-[#C9A96E]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-serif font-bold text-sm text-[#F3EFE6]">
                    {detail.label.toUpperCase()}
                  </div>
                  <div className="font-mono text-xs font-bold text-[#C9A96E]">
                    +{displayVal}
                  </div>
                </div>

                <ProgressBar
                  label=""
                  value={displayVal}
                  max={maxVal}
                  color="gold"
                  showBlocks={true}
                />

                <p className="text-[11px] text-[#8E93A0] leading-relaxed pt-1">
                  {detail.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Note of Philosophy */}
        <div className="p-4 rounded-lg bg-[#141A26] border border-[#263145] text-xs sm:text-sm text-[#A8B2C4] leading-relaxed italic">
          <strong className="text-[#C9A96E] not-italic block mb-1">
            Закон Характеру Володаря:
          </strong>
          Цей психологічний компас не є остаточним діагнозом. Він фіксує кожен поворот вашої волі: чи схиляєтеся ви до мілітарного порядку, чи бережете козацьку волю, чи робите ставку на технологічний розрахунок Академії.
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. ОСНОВА АРХЕТИПУ ТА СИЛЬНІ СТОРОНИ                           */}
      {/* ============================================================== */}
      <section className="bg-[#0E131D] border border-[#232A39] rounded-xl p-4 sm:p-6 md:p-8 space-y-4 md:space-y-5 shadow-xl">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F3EFE6] flex items-center gap-2 border-b border-[#1E2536] pb-3">
          <Award className="w-5 h-5 text-[#C9A96E]" />
          <span>Виявлені Чесноти та Історичні Попередники</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Recognized Strengths */}
          <div className="space-y-2 bg-[#121722] p-4 rounded-lg border border-[#222B3B]">
            <div className="text-xs uppercase font-mono text-[#34D399] font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Державні Опори</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#C8CDD8]">
              {archetypeProfile.recognizedStrengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#34D399]">›</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Precedents */}
          <div className="space-y-2 bg-[#121722] p-4 rounded-lg border border-[#222B3B]">
            <div className="text-xs uppercase font-mono text-[#C9A96E] font-semibold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Історичні Аналогії</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#C8CDD8]">
              {archetypeProfile.historicalPrecedents.map((prec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C9A96E]">›</span>
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
