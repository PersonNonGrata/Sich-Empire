import React from 'react';
import { createPortal } from 'react-dom';
import { Landmark, Map, BookOpen, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  availableScenariosCount: number;
  hasHetmanUpdates: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  availableScenariosCount,
  hasHetmanUpdates,
}) => {
  const tabs = [
    { id: 'rada', label: 'РАДА', icon: <Landmark className="w-5 h-5" />, badge: availableScenariosCount },
    { id: 'state', label: 'ДЕРЖАВА', icon: <Map className="w-5 h-5" />, badge: 0 },
    { id: 'chronicle', label: 'ЛІТОПИС', icon: <BookOpen className="w-5 h-5" />, badge: 0 },
    { id: 'hetman', label: 'ГЕТЬМАН', icon: <User className="w-5 h-5" />, badge: hasHetmanUpdates ? 1 : 0 },
  ];

  const navigation = (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483000,
        display: 'block',
        width: '100%',
        background: 'rgba(10, 13, 19, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #232A39',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.35)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Мобільна навігація Гетьмана"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 cursor-pointer transition-colors active:scale-95 ${isActive ? 'text-[#C9A96E]' : 'text-[#8E93A0] hover:text-[#F3EFE6]'}`}
            >
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-0.5 bg-[#C9A96E] shadow-[0_0_8px_rgba(201,169,110,0.5)]" />
              )}
              <div className="relative flex items-center justify-center w-7 h-7">
                {tab.icon}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#8E2525] text-[#F3EFE6] border border-[#F87171] leading-none animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-serif font-bold tracking-wider uppercase mt-0.5 ${isActive ? 'text-[#C9A96E]' : 'text-[#8E93A0]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(navigation, document.body);
};
