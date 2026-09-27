import React from 'react';
import { ScheduledConsequence } from '../game/consequences/types.ts';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, FastForward } from 'lucide-react';

interface TimelineViewProps {
  consequences: ScheduledConsequence[];
  currentYear: number;
  onAdvanceYear: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  consequences,
  currentYear,
  onAdvanceYear,
}) => {
  const pending = consequences.filter((c) => !c.resolved);
  const resolved = consequences.filter((c) => c.resolved);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232938] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C9A96E]" />
            <span>Хронограф Відкладених Наслідків</span>
          </h2>
          <p className="text-xs text-[#8E929E] mt-1">
            Рішення 1848 року можуть вибухнути тріумфом чи катастрофою через роки або десятиліття.
          </p>
        </div>

        <button
          onClick={onAdvanceYear}
          className="px-4 py-2 rounded bg-[#1A2233] hover:bg-[#253047] text-[#C9A96E] border border-[#C9A96E]/40 font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <FastForward className="w-4 h-4" />
          <span>Перевести час на +1 рік (зараз {currentYear})</span>
        </button>
      </div>

      {/* Pending Consequences */}
      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#FBBF24] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Очікують свого часу ({pending.length})</span>
        </h3>

        {pending.length === 0 ? (
          <div className="text-center py-8 text-[#8E929E] bg-[#0F131C] rounded border border-[#1F2636] text-xs">
            Наразі немає активних відкладених наслідків. Вони формуються під час доленосних виборів у Раді.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((sc) => (
              <div
                key={sc.id}
                className="bg-[#0F131C] border border-[#2B354A] rounded-lg p-5 hover:border-[#FBBF24]/50 transition-colors shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#FBBF24] bg-[#2A2315] px-2.5 py-0.5 rounded border border-[#FBBF24]/30">
                      Рік активації: {sc.triggerYear} (через {Math.max(0, sc.triggerYear - currentYear)} р.)
                    </span>
                    {sc.sourceScenarioTitle && (
                      <span className="text-[11px] text-[#8E929E]">
                        Витоки: «{sc.sourceScenarioTitle}»
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    ID: {sc.id}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-[#F3EFE6] mb-1">
                  {sc.title}
                </h4>
                <p className="text-xs text-[#C5C9D3] leading-relaxed mb-3">
                  {sc.description}
                </p>

                <div className="text-[11px] font-mono text-[#8E929E] bg-[#141824] p-2.5 rounded border border-[#202738]">
                  <span className="text-[#C9A96E] font-semibold">Запрограмовані наслідки:</span>{' '}
                  {sc.consequences.map((c, i) => (
                    <span key={i} className="inline-block mr-2 text-[#A7F3D0]">
                      [{c.type}]
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resolved Consequences */}
      {resolved.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[#1F2636]">
          <h3 className="font-serif text-lg font-semibold text-[#34D399] flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Вже настали в історії ({resolved.length})</span>
          </h3>

          <div className="space-y-3">
            {resolved.map((sc) => (
              <div
                key={sc.id}
                className="bg-[#0D121A] border border-[#1A2520] rounded-lg p-4 opacity-80"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#34D399] mb-1">
                  <span>Справдилося у {sc.resolvedYear || sc.triggerYear} році</span>
                  <span className="text-[#64748B]">Зв'язок з рішенням: {sc.sourceDecisionId}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#F3EFE6]">
                  {sc.title}
                </h4>
                <p className="text-xs text-[#8E929E] mt-1">{sc.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
