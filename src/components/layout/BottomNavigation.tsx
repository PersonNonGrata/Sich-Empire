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
    {
      id: 'rada',
      label: 'РАДА',
      icon: <Landmark className="w-5 h-5" />,
      badge: availableScenariosCount,
    },
    {
      id: 'state',
      label: 'ДЕРЖАВА',
      icon: <Map className="w-5 h-5" />,
      badge: 0,
    },
    {
      id: 'chronicle',
      label: 'ЛІТОПИС',
      icon: <BookOpen className="w-5 h-5" />,
      badge: 0,
    },
    {
      id: 'hetman',
      label: 'ГЕТЬМАН',
      icon: <User className="w-5 h-5" />,
      badge: hasHetmanUpdates ? 1 : 0,
    },
  ];

  const navigation = (
    <nav
      className="mobile-bottom-nav bg-[#0A0D13]/98 backdrop-blur-md border-t border-[#232A39] shadow-2xl"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Мобільна навігація Гетьмана"
    >
  if (typeof document === 'undefined') return null;
  return createPortal(navigation, document.body);
};
