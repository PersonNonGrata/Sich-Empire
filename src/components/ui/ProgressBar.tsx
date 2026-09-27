import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  min?: number;
  unit?: string;
  color?: 'gold' | 'red' | 'blue' | 'purple' | 'green' | 'amber';
  showBlocks?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  min = 0,
  unit = '',
  color = 'gold',
  showBlocks = true,
  className = '',
  onClick,
}) => {
  // Normalize percent between 0 and 100
  const range = max - min;
  const clampedVal = Math.max(min, Math.min(max, value));
  const percent = range > 0 ? Math.round(((clampedVal - min) / range) * 100) : 0;

  // Calculate 10 block representation for authentic 1848 terminal / ledger feel
  const filledBlocks = Math.round((percent / 100) * 10);
  const blockString = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);

  const colorVariants = {
    gold: {
      bar: 'bg-[#C9A96E]',
      text: 'text-[#C9A96E]',
      border: 'border-[#C9A96E]/30',
      glow: 'shadow-[#C9A96E]/20',
    },
    red: {
      bar: 'bg-[#EF4444]',
      text: 'text-[#F87171]',
      border: 'border-[#EF4444]/30',
      glow: 'shadow-[#EF4444]/20',
    },
    blue: {
      bar: 'bg-[#60A5FA]',
      text: 'text-[#93C5FD]',
      border: 'border-[#60A5FA]/30',
      glow: 'shadow-[#60A5FA]/20',
    },
    purple: {
      bar: 'bg-[#A78BFA]',
      text: 'text-[#C4B5FD]',
      border: 'border-[#A78BFA]/30',
      glow: 'shadow-[#A78BFA]/20',
    },
    green: {
      bar: 'bg-[#34D399]',
      text: 'text-[#6EE7B7]',
      border: 'border-[#34D399]/30',
      glow: 'shadow-[#34D399]/20',
    },
    amber: {
      bar: 'bg-[#FBBF24]',
      text: 'text-[#FCD34D]',
      border: 'border-[#FBBF24]/30',
      glow: 'shadow-[#FBBF24]/20',
    },
  };

  const theme = colorVariants[color];

  return (
    <div
      onClick={onClick}
      className={`space-y-1.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-serif text-[#D6D3CD] tracking-wider uppercase group-hover:text-[#F3EFE6] transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {showBlocks && (
            <span className={`font-mono text-[11px] tracking-tighter ${theme.text} hidden sm:inline select-none opacity-85`}>
              {blockString}
            </span>
          )}
          <span className="font-mono font-semibold text-xs text-[#F3EFE6]">
            {value}
            {unit}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2 w-full bg-[#141824] rounded border border-[#232B3A] overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-sm transition-all duration-500 ${theme.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
