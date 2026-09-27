import React from 'react';
import { GameState } from '../../game/state/types.ts';
import { TopBar } from '../TopBar.tsx';
import { BottomNavigation } from './BottomNavigation.tsx';
import { HetmanDesk } from '../cabinet/HetmanDesk.tsx';
import { Bell, Sparkles } from 'lucide-react';

interface AppShellProps {
  state: GameState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSaving: boolean;
  bannerNotice: string | null;
  onCloseBanner: () => void;
  onOpenCouncil: () => void;
  onOpenDiagnostics: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  state,
  activeTab,
  setActiveTab,
  isSaving,
  bannerNotice,
  onCloseBanner,
  onOpenCouncil,
  onOpenDiagnostics,
  children,
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#080A0E] text-[#F3EFE6] flex flex-col selection:bg-[#C9A96E]/30 selection:text-[#F3EFE6]">
      {/* 1. Upper Status Bar */}
      <TopBar
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableScenariosCount={state.availableScenarioIds.length}
        isSaving={isSaving}
        onOpenCouncil={onOpenCouncil}
        onOpenDiagnostics={onOpenDiagnostics}
      />

      {/* Ephemeral Alert Banner */}
      {bannerNotice && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-[#141C29] border-b border-[#24334C] px-4 py-2.5 text-xs text-[#D8DCE6] animate-in fade-in duration-200"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C9A96E] shrink-0" />
              <span className="font-medium">{bannerNotice}</span>
            </div>
            <button
              onClick={onCloseBanner}
              className="text-[#8E93A0] hover:text-[#F3EFE6] font-mono text-xs px-2 py-0.5 rounded hover:bg-[#1D283B] transition-colors shrink-0 min-h-[32px] flex items-center"
            >
              [закрити]
            </button>
          </div>
        </aside>
      )}

      {/* 2. Central Working Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 pb-28 md:pb-12">
        {/* Hetman's Desk Workspace Switcher */}
        <HetmanDesk
          state={state}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCouncil={onOpenCouncil}
        />

        {/* Section View Content */}
        <div className="mt-2 md:mt-4">{children}</div>
      </main>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        availableScenariosCount={state.availableScenarioIds.length}
      />

      {/* Desktop Footer */}
      <footer className="border-t border-[#1C2331] bg-[#0A0D13] py-4 text-center text-xs text-[#626B7E] font-mono hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>«ІМПЕРІЯ СІЧ» • Кабінет Гетьмана 1848 року</span>
          <span className="text-[#8E93A0]">
            Сховище: v{state.version} • {state.decisions.length} рішень ухвалено • {state.history.length} подій зафіксовано
          </span>
        </div>
      </footer>
    </div>
  );
};
