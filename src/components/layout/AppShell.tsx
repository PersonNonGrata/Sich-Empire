import React from 'react';
import { GameState } from '../../game/state/types.ts';
import { TopBar } from '../TopBar.tsx';
import { HetmanDesk } from '../cabinet/HetmanDesk.tsx';
import { Bell, Sparkles } from 'lucide-react';
class ViewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-xl border border-[#5B1B1B] bg-[#141014] p-6 text-center space-y-3">
            <div className="text-[#EF4444] font-mono text-xs uppercase tracking-widest">Помилка відображення</div>
            <p className="font-serif text-xl text-[#F3EFE6]">Профіль Гетьмана не вдалося відкрити.</p>
            <p className="text-xs text-[#8E93A0]">Навігація залишається доступною. Перейдіть до іншої вкладки та поверніться ще раз.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-lg bg-[#1C2535] border border-[#384868] text-[#C9A96E] text-xs font-mono"
            >
              Спробувати ще раз
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


interface AppShellProps {
  state: GameState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSaving: boolean;
  bannerNotice: string | null;
  onCloseBanner: () => void;
  onOpenCouncil: () => void;
  onOpenDiagnostics: () => void;
  hasHetmanUpdates: boolean;
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
  hasHetmanUpdates,
  children,
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#080A0E] text-[#F3EFE6] flex flex-col selection:bg-[#C9A96E]/30 selection:text-[#F3EFE6]">
      {/* 1. Upper Status Bar */}
      <TopBar
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasHetmanUpdates={hasHetmanUpdates}
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

      {hasHetmanUpdates && activeTab !== 'hetman' && (
        <aside className="border-b border-[#5B1B1B] bg-[#241014] px-4 py-2.5 animate-in fade-in duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.7)] shrink-0 animate-pulse" />
              <span className="text-xs text-[#F3D0D0] font-medium truncate">Наприкінці року профіль Гетьмана змінився. Варто переглянути нові записи.</span>
            </div>
            <button onClick={() => setActiveTab('hetman')} className="shrink-0 px-3 py-1.5 rounded-lg bg-[#8E2525] hover:bg-[#A82D2D] text-[#FFF5F5] border border-[#EF4444]/60 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors">Переглянути</button>
          </div>
        </aside>
      )}

      {/* 2. Central Working Space */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-4 md:px-6 py-4 md:py-6 pb-28 md:pb-12 overflow-x-hidden">
        {/* Keep the active Council screen focused: the document desk is navigation, not part of the decision itself. */}
        {activeTab !== 'rada' && (
          <HetmanDesk
            state={state}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenCouncil={onOpenCouncil}
            hasHetmanUpdates={hasHetmanUpdates}
          />
        )}

        {/* Section View Content */}
        <div className="mt-2 md:mt-4">
          <ViewErrorBoundary>{children}</ViewErrorBoundary>
        </div>
      </main>

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
