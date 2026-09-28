import React from 'react';
import { ImperialEvent } from '../../types/index.ts';
import { WaxSeal } from './WaxSeal.tsx';
import { Calendar, Bell, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface EventRevealModalProps {
  event: ImperialEvent | null;
  onDismiss: () => void;
}

export const EventRevealModal: React.FC<EventRevealModalProps> = ({ event, onDismiss }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)] bg-[#0D111A] border-2 border-[#C9A96E] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden text-[#F3EFE6] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#C9A96E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="p-6 md:p-8 border-b border-[#232A39] bg-[#121724]/90 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 font-bold text-[#1C1815] bg-[#C9A96E] px-2.5 py-0.5 rounded">
                <Calendar className="w-3 h-3 text-[#1C1815]" />
                {event.year} РІК
              </span>
              <span className="text-[#C9A96E] uppercase tracking-wider font-semibold">
                Державна Звістка
              </span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F3EFE6] tracking-tight leading-tight">
              {event.title}
            </h2>
          </div>

          <div className="shrink-0 hidden sm:block">
            <WaxSeal size="sm" label="СІЧ" />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 pb-4">
          {/* Source Attribution */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E93A0] bg-[#141A26] px-3.5 py-2 rounded-lg border border-[#222B3B]">
            <Bell className="w-4 h-4 text-[#C9A96E]" />
            <span>Джерело:</span>
            <strong className="text-[#E0DDD5]">{event.source}</strong>
          </div>

          {/* Description */}
          <p className="font-serif text-base md:text-lg text-[#D8DCE6] leading-relaxed italic border-l-2 border-[#C9A96E] pl-4">
            {event.description}
          </p>

          {/* Consequences Summary */}
          {event.consequencesSummary && event.consequencesSummary.length > 0 && (
            <div className="space-y-2 bg-[#0A0E16] border border-[#1E2536] p-4 rounded-xl">
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#C9A96E] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Наслідки для Держави:</span>
              </div>
              <ul className="space-y-1 text-xs font-mono text-[#C4C9D6]">
                {event.consequencesSummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#C9A96E]">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Action */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 bg-[#0D111A]/95 backdrop-blur border-t border-[#232A39] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-[#8E93A0] font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span>Зафіксовано в Літописі</span>
            </span>

            <button
              onClick={onDismiss}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-lg bg-[#C9A96E] hover:bg-[#DBBC82] text-[#0A0D14] font-serif font-bold text-sm tracking-wide flex items-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-[#C9A96E]/20"
            >
              <span>Прийняти до уваги</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
