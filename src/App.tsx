import { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GameState } from './game/state/types.ts';
import { createInitialGameState } from './game/state/initialState.ts';
import { ChoiceResolutionResult } from './game/engine/scenarioEngine.ts';
import {
  startScenario,
  makeChoice,
  advanceYear,
  resetGame,
  dismissEvent,
  respondToReflection,
} from './game/state/gameOperations.ts';
import { saveGame, loadGame, deleteSave } from './persistence/storage.ts';
import { AppShell } from './components/layout/AppShell.tsx';
import { CouncilView } from './components/CouncilView.tsx';
import { ChronicleView } from './components/ChronicleView.tsx';
import { EmpireStateView } from './components/EmpireStateView.tsx';
import { HetmanView } from './components/hetman/HetmanView.tsx';
import { EngineDiagnostics } from './components/EngineDiagnosticsModal.tsx';
import { EventRevealModal } from './components/ui/EventRevealModal.tsx';
import { CoatOfArms } from './components/ui/CoatOfArms.tsx';
import { X } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('rada');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastExecutionLogs, setLastExecutionLogs] = useState<string[] | null>(null);
  const [lastResolutionResult, setLastResolutionResult] = useState<ChoiceResolutionResult | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [showPrologue, setShowPrologue] = useState<boolean>(false);

  // Load existing save or initialize new state
  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadGame();
        if (loaded) {
          setGameState(loaded);
          setBannerNotice('Кампанію 1848 року відновлено зі сховища.');
        } else {
          const fresh = createInitialGameState('Гетьман');
          setGameState(fresh);
          // Do not persist an unnamed ruler. The prologue is the save's first step.
          setShowPrologue(true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        const fresh = createInitialGameState('Богдан Островерхий');
        setGameState(fresh);
      }
    }
    init();
  }, []);

  // Central persistence trigger helper
  const persistState = useCallback(async (state: GameState) => {
    setIsSaving(true);
    try {
      await saveGame(state);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setTimeout(() => setIsSaving(false), 250);
    }
  }, []);

  // 1. Start a Scenario
  const handleStartScenario = (scenarioId: string) => {
    if (!gameState) return;
    try {
      const nextState = startScenario(gameState, scenarioId);
      setLastExecutionLogs(null);
      setLastResolutionResult(null);
      setGameState(nextState);
      persistState(nextState);
      setActiveTab('rada');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // 2. Make Choice in active Scenario
  const handleSelectChoice = (choiceId: string) => {
    if (!gameState || !gameState.currentScenarioId) return;

    try {
      const result = makeChoice(gameState, gameState.currentScenarioId, choiceId);
      setGameState(result.state);
      setLastExecutionLogs(result.logs);
      setLastResolutionResult(result);
      persistState(result.state);

      if (result.resolvedScheduledEvents && result.resolvedScheduledEvents.length > 0) {
        setBannerNotice(`Увага: Справдився відкладений наслідок: «${result.resolvedScheduledEvents[0].title}»!`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // 3. Continue after resolving scenario
  const handleContinueScenario = () => {
    setLastExecutionLogs(null);
    setLastResolutionResult(null);
    setActiveTab('rada');
  };

  // 4. Advance Time (+1 year or more)
  const handleAdvanceYear = (years = 1) => {
    if (!gameState) return;
    const result = advanceYear(gameState, years);
    setGameState(result.state);
    setLastExecutionLogs(null);
    setLastResolutionResult(null);
    persistState(result.state);

    if (result.resolved.length > 0) {
      setBannerNotice(
        `Настав ${result.state.identity.year} рік! Справдилося відкладених наслідків: ${result.resolved.length}.`
      );
    } else {
      setBannerNotice(`Час пливе: настав ${result.state.identity.year} рік правління.`);
    }
  };

  // 5. Dismiss imperial event from the modal queue
  const handleDismissEvent = (eventId: string) => {
    if (!gameState) return;
    const nextState = dismissEvent(gameState, eventId);
    setGameState(nextState);
    persistState(nextState);
  };

  // 6. Reset Game / New Game
  const handleResetGame = (rulerName?: string) => {
    const fresh = resetGame(rulerName);
    setGameState(fresh);
    setLastExecutionLogs(null);
    setActiveTab('rada');
    setIsDiagnosticsOpen(false);
    persistState(fresh);
    setBannerNotice(`Створено нову гру. Володар: ${fresh.identity.rulerName}. 1848 рік.`);
  };

  // 7. Force reload from disk
  const handleForceReload = async () => {
    setIsSaving(true);
    const loaded = await loadGame();
    setIsSaving(false);
    if (loaded) {
      setGameState(loaded);
      setLastExecutionLogs(null);
      setBannerNotice('Стан успішно перечитано зі сховища.');
    } else {
      setBannerNotice('Збережень у сховищі не знайдено.');
    }
  };

  // 8. Clear Save
  const handleClearSave = async () => {
    await deleteSave();
    const fresh = createInitialGameState('Богдан Островерхий');
    setGameState(fresh);
    setLastExecutionLogs(null);
    setIsDiagnosticsOpen(false);
    setBannerNotice('Сховище повністю очищено. Розпочато нову кампанію 1848 року.');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#080A0E] text-[#F3EFE6] flex items-center justify-center font-serif text-lg">
        <div className="text-center space-y-3 p-6">
          <CoatOfArms size={48} className="mx-auto animate-pulse" />
          <div className="text-[#C9A96E] font-bold tracking-widest uppercase text-xl">
            Імперія Січ
          </div>
          <div className="text-xs text-[#8E93A0] font-mono">
            Розгортання Кабінету Гетьмана 1848 року...
          </div>
        </div>
      </div>
    );
  }

  if (showPrologue) {
    const beginCampaign = async () => {
      const fresh = createInitialGameState('Гетьман');
      setGameState(fresh);
      setShowPrologue(false);
      await saveGame(fresh);
    };

    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#080A0E] text-[#F3EFE6] overflow-hidden">
        <main className="relative min-h-[100dvh] flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,110,0.12),transparent_42%)] pointer-events-none" />

          <section className="relative flex-1 flex flex-col justify-center px-5 pt-10 pb-6 sm:px-8">
            <div className="w-full max-w-2xl mx-auto space-y-7 text-center">
              <div className="space-y-2">
                <p className="text-[#C9A96E] text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase">
                  1848 · ВЕСНА НАРОДІВ
                </p>
                <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">
                  ІМПЕРІЯ СІЧ
                </h1>
              </div>

              <div className="relative mx-auto w-full max-w-xl aspect-[1.35/1] rounded-2xl overflow-hidden border border-[#3A4354] bg-[#0D121A] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <svg viewBox="0 0 600 445" className="absolute inset-0 w-full h-full" role="img" aria-label="Карта Імперії Січ">
                  <defs>
                    <linearGradient id="prologueLand" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#303B35" />
                      <stop offset="100%" stopColor="#18231F" />
                    </linearGradient>
                    <radialGradient id="prologueSea">
                      <stop offset="0%" stopColor="#182A38" />
                      <stop offset="100%" stopColor="#0B141D" />
                    </radialGradient>
                  </defs>
                  <rect width="600" height="445" fill="url(#prologueSea)" />
                  <path d="M105 58 C170 30 226 60 277 48 C332 35 372 65 425 58 C490 50 533 93 505 135 C475 176 508 205 475 239 C450 266 463 307 418 329 C370 353 330 334 287 365 C245 396 192 371 166 334 C139 296 94 286 84 243 C73 198 101 170 84 129 C72 98 82 72 105 58Z" fill="url(#prologueLand)" stroke="#8C7650" strokeWidth="3"/>
                  <path d="M154 111 C208 93 252 119 300 106 C349 93 392 109 424 139 C447 161 423 190 391 203 C353 218 339 246 304 255 C270 264 239 242 209 248 C177 255 151 233 160 203 C168 178 143 145 154 111Z" fill="#26342F" stroke="#526257" strokeWidth="2"/>
                  <path d="M118 266 C184 248 238 270 294 261 C347 253 393 270 454 251" fill="none" stroke="#B39A63" strokeWidth="2" strokeDasharray="7 8" opacity=".75"/>
                  <path d="M177 92 C191 146 205 201 224 253 C240 300 280 330 325 345" fill="none" stroke="#6F806F" strokeWidth="3" opacity=".7"/>
                  <circle cx="290" cy="226" r="8" fill="#C9A96E" />
                  <circle cx="290" cy="226" r="17" fill="none" stroke="#C9A96E" strokeOpacity=".35" />
                  <circle cx="218" cy="139" r="4" fill="#C9A96E" />
                  <circle cx="375" cy="174" r="4" fill="#C9A96E" />
                  <text x="303" y="221" fill="#F3EFE6" fontSize="16" fontFamily="serif">ХОРТИЦЯ</text>
                  <text x="195" y="130" fill="#B9C0C9" fontSize="13" fontFamily="serif">КИЇВ</text>
                  <text x="382" y="168" fill="#B9C0C9" fontSize="13" fontFamily="serif">ГАЛИЧИНА</text>
                  <text x="408" y="319" fill="#8093A0" fontSize="12" fontFamily="serif">ЧОРНЕ МОРЕ</text>
                  <text x="30" y="30" fill="#C9A96E" fontSize="11" fontFamily="monospace" letterSpacing="2">КАРТА ДЕРЖАВИ · 1848</text>
                </svg>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080A0E] to-transparent" />
              </div>

              <div className="max-w-xl mx-auto space-y-4">
                <p className="font-serif text-lg sm:text-2xl leading-relaxed text-[#E5E0D7]">
                  Європа входить у вогонь революцій. Імперії хитаються. Старі порядки тріщать.
                </p>
                <p className="font-serif text-base sm:text-lg leading-relaxed text-[#A8AFBD]">
                  На Хортиці постає держава, яка вирішила сама визначати свою долю. Ти отримуєш булаву в момент, коли кожне слово Ради може змінити шлях країни на десятиліття.
                </p>
                <p className="text-[#C9A96E] font-serif italic text-sm sm:text-base">
                  Перший рік твого правління починається зараз.
                </p>
              </div>
            </div>
          </section>

          <div className="relative px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8">
            <button
              onClick={beginCampaign}
              className="w-full max-w-xl mx-auto min-h-[58px] rounded-xl bg-[#C9A96E] text-[#0A0D14] font-serif font-bold text-sm sm:text-base tracking-[0.08em] flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-transform"
            >
              ПОЧАТИ ГРУ
            </button>
          </div>
        </main>
      </div>
    );
  }

  const activeEvent = gameState.eventQueue && gameState.eventQueue.length > 0 ? gameState.eventQueue[0] : null;

  return (
    <AppShell
      state={gameState}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSaving={isSaving}
      bannerNotice={bannerNotice}
      onCloseBanner={() => setBannerNotice(null)}
      onOpenCouncil={() => {
        setActiveTab('rada');
      }}
      onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
    >
      {/* Tab 1: РАДА (Council Hall & Active Scenario) */}
      {activeTab === 'rada' && (
        <CouncilView
          state={gameState}
          onStartScenario={handleStartScenario}
          onSelectChoice={handleSelectChoice}
          lastExecutionLogs={lastExecutionLogs}
          lastResolutionResult={lastResolutionResult}
          onContinue={handleContinueScenario}
          onAdvanceYear={() => handleAdvanceYear(1)}
        />
      )}

      {/* Tab 2: ДЕРЖАВА (Regions & Factions) */}
      {activeTab === 'state' && (
        <EmpireStateView state={gameState} />
      )}

      {/* Tab 3: ЛІТОПИС (Chronicles & Memory) */}
      {activeTab === 'chronicle' && (
        <ChronicleView
          events={gameState.history}
          scheduledConsequences={gameState.scheduledConsequences || gameState.consequences || []}
        />
      )}

      {/* Tab 4: ГЕТЬМАН (Ruler Profile & Psychology) */}
      {activeTab === 'hetman' && (
        <HetmanView
          state={gameState}
          onRespondToReflection={(reflId, resp, note) => {
            const nextState = respondToReflection(gameState, reflId, resp, note);
            setGameState(nextState);
            persistState(nextState);
            setBannerNotice(
              resp === 'AGREE'
                ? 'Спостереження підтверджено Гетьманом.'
                : resp === 'PARTIAL'
                ? 'Спостереження частково підтверджено.'
                : 'Особисту незгоду Гетьмана зафіксовано в профілі володаря.'
            );
          }}
        />
      )}

      {/* Imperial Event Modal */}
      {activeEvent && (
        <EventRevealModal
          event={activeEvent}
          onDismiss={() => handleDismissEvent(activeEvent.id)}
        />
      )}

      {/* Diagnostics Modal / Drawer */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0E121A] border-2 border-[#263145] rounded-xl shadow-2xl p-4 sm:p-6 text-[#F3EFE6]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#232A39] mb-4 sm:mb-6">
              <span className="font-serif text-lg sm:text-xl font-bold text-[#C9A96E]">
                Налаштування та Діагностика
              </span>
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-[#8E93A0] hover:text-[#F3EFE6] hover:bg-[#1A2232] transition-colors cursor-pointer"
                aria-label="Закрити"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <EngineDiagnostics
              state={gameState}
              onResetGame={handleResetGame}
              onForceReload={handleForceReload}
              onClearSave={handleClearSave}
              onAdvanceYear={handleAdvanceYear}
            />
          </div>
        </div>
      )}
      <Analytics />
    </AppShell>
  );
}
