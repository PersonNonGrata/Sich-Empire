import React from 'react';

interface WaxSealProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  label = 'СІЧ',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-[9px]',
    md: 'w-14 h-14 text-xs',
    lg: 'w-20 h-20 text-sm',
  };

  return (
    <div
      className={`wax-seal rounded-full flex flex-col items-center justify-center font-serif font-bold text-[#F4EAD4] border-2 border-[#541111] select-none shadow-xl shrink-0 ${sizeClasses[size]} ${className}`}
      title="Державна сургучна печатка Гетьмана"
    >
      <div className="w-[82%] h-[82%] rounded-full border border-[#D97777]/40 flex flex-col items-center justify-center">
        <span className="tracking-widest leading-none font-black text-shadow">{label}</span>
        <span className="text-[7px] font-mono tracking-tighter opacity-80 mt-0.5">1848</span>
      </div>
    </div>
  );
};
