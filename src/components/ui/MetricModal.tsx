import React from 'react';
import { X, Coins, Shield, Landmark, Users, Flame, Info } from 'lucide-react';
import { EmpireMetrics } from '../../game/state/types.ts';

export type MetricType = 'treasury' | 'militaryStrength' | 'stability' | 'unity' | 'prosperity';

interface MetricModalProps {
  metricKey: MetricType | null;
  metrics: EmpireMetrics;
  onClose: () => void;
}

interface MetricDetail {
  title: string;
  icon: React.ReactNode;
  unit: string;
  category: string;
  description: string;
  strategicSignificance: string;
  criticalThresholds: string;
}

const METRIC_DEFINITIONS: Record<MetricType, MetricDetail> = {
  treasury: {
    title: 'СКАРБНИЦЯ',
    icon: <Coins className="w-6 h-6 text-[#FBBF24]" />,
    unit: 'млн карбованців',
    category: 'Державний золотий запас',
    description:
      'Доступні державні кошти та золотий запас Імперії Січ у Хортицькій палаті.',
    strategicSignificance:
      'Низька скарбниця позбавляє уряд можливості фінансувати регулярне військо, утримувати артилерійські заводи та запускати модернізаційні реформи. Висока скарбниця відкриває шлях до економічного прориву.',
    criticalThresholds:
      'При падінні нижче 20 млн виникає ризик дефолту платні війську та бунту старшини.',
  },
  militaryStrength: {
    title: 'ВІЙСЬКО',
    icon: <Shield className="w-6 h-6 text-[#EF4444]" />,
    unit: '%',
    category: 'Бойова міць та дисципліна',
    description:
      'Боєздатність регулярних корпусів, козацької кінноти та артилерійських бригад.',
    strategicSignificance:
      'Сильне військо гарантує непорушність кордонів 1848 року перед загрозою сусідніх імперій та приборкує заколоти. Недофінансоване або ображене військо стає джерелом внутрішнього заколоту.',
    criticalThresholds:
      'При рівні нижче 40% іноземні держави починають висувати територіальні ультиматуми.',
  },
  stability: {
    title: 'СТАБІЛЬНІСТЬ',
    icon: <Landmark className="w-6 h-6 text-[#60A5FA]" />,
    unit: '%',
    category: 'Правопорядок та влада',
    description:
      'Внутрішній спокій, дотримання законів та авторитет Гетьманського універсалу в усіх воєводствах.',
    strategicSignificance:
      'Висока стабільність дозволяє безперешкодно впроваджувати складні реформи. Низька стабільність паралізує державний апарат, породжує розбій на трактах і сепаратизм провінцій.',
    criticalThresholds:
      'При падінні нижче 30% виникають загрози збройних заворушень у регіонах.',
  },
  unity: {
    title: 'ЄДНІСТЬ',
    icon: <Users className="w-6 h-6 text-[#A78BFA]" />,
    unit: '%',
    category: 'Злагода станів та фракцій',
    description:
      'Рівень згоди між Військовою Старшиною, купецькими гільдіями, духовенством та вченими Академії.',
    strategicSignificance:
      'Коли старшина й міщани діють узгоджено, рішення Ради виконуються блискавично. Розкол між станами веде до блокування реформ та інтриг у канцелярії.',
    criticalThresholds:
      'При розколі нижче 35% фракції починають саботувати накази Гетьмана.',
  },
  prosperity: {
    title: 'ПРОЦВІТАННЯ',
    icon: <Flame className="w-6 h-6 text-[#34D399]" />,
    unit: '%',
    category: 'Економічний добробут',
    description:
      'Розвиток чорноземного хліборобства, річкової торгівлі Дніпром, цехів та парових мануфактур.',
    strategicSignificance:
      'Багаті міщани й козаки наповнюють скарбницю податками й не схильні до заколотів. Бідність провокує протести та зменшує мобілізаційний потенціал держави.',
    criticalThresholds:
      'Низький добробут сповільнює будь-які наукові й технічні досягнення.',
  },
};

export const MetricModal: React.FC<MetricModalProps> = ({
  metricKey,
  metrics,
  onClose,
}) => {
  if (!metricKey) return null;

  const detail = METRIC_DEFINITIONS[metricKey];
  const value = metrics[metricKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0E131C] border border-[#2B3548] rounded-xl shadow-2xl overflow-hidden text-[#F3EFE6]">
        {/* Header decoration */}
        <div className="bg-[#141A26] border-b border-[#242D3E] p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#1B2333] border border-[#C9A96E]/40 flex items-center justify-center shrink-0">
              {detail.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E]">
                {detail.category}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#F3EFE6] truncate">
                {detail.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-[#8E93A0] hover:text-[#F3EFE6] hover:bg-[#1E273A] transition-colors cursor-pointer shrink-0"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-sm overflow-y-auto flex-1">
          {/* Current reading */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#121824] border border-[#222B3B]">
            <span className="font-serif text-sm text-[#8E93A0]">
              Поточне значення показника:
            </span>
            <span className="font-mono text-xl font-bold text-[#C9A96E]">
              {value} {detail.unit}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="text-xs uppercase font-mono text-[#8E93A0] font-semibold">
              Сутність показника
            </div>
            <p className="font-serif text-base text-[#E5E2DC] leading-relaxed italic">
              «{detail.description}»
            </p>
          </div>

          {/* Strategic significance */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C2331]">
            <div className="text-xs uppercase font-mono text-[#C9A96E] font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Державне значення для Гетьмана</span>
            </div>
            <p className="text-xs sm:text-sm text-[#B2B8C6] leading-relaxed">
              {detail.strategicSignificance}
            </p>
          </div>

          {/* Critical Threshold */}
          <div className="p-3 rounded-lg bg-[#1A181C] border border-[#482828] text-xs text-[#E8A5A5] leading-relaxed">
            <span className="font-semibold text-[#F87171] block mb-0.5">
              Критична межа:
            </span>
            {detail.criticalThresholds}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#121722] border-t border-[#1E2636] px-4 sm:px-6 py-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded bg-[#C9A96E] hover:bg-[#DBBC82] text-[#0A0D14] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
