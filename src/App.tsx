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
import { SichEmpireMap } from './components/ui/SichEmpireMap.tsx';
import { X } from 'lucide-react';


type PrologueScene = {
  year: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
};

const PROLOGUE_SCENES: PrologueScene[] = [
  {
    year: '1648',
    eyebrow: 'ПОВСТАННЯ ХМЕЛЬНИЦЬКОГО',
    title: 'Народжується Січ',
    body: 'Повстання Хмельницького перетворюється на війну за новий порядок у Східній Європі. Січ виходить із боротьби сильнішою та починає будувати власну державу.',
    accent: 'Початок',
  },
  {
    year: '1654',
    eyebrow: 'ПЕРЕМОГА ХМЕЛЬНИЦЬКОГО',
    title: 'Протекторат Січі',
    body: 'Хмельницький перемагає. Польща та Литва переходять під протекторат Січі. Київ стає центром нової політичної системи.',
    accent: 'Новий порядок',
  },
  {
    year: '1700',
    eyebrow: 'ПАДІННЯ МОСКОВІЇ',
    title: 'Схід відкритий',
    body: 'Січ вступає у вирішальну війну з Московським царством. Москва зазнає поразки, а її землі переходять під владу Січі.',
    accent: 'Імперія',
  },
  {
    year: '1805–1815',
    eyebrow: 'НАПОЛЕОНІВСЬКІ ВІЙНИ',
    title: 'Велика війна',
    body: 'Наполеон кидає виклик Січі. Французька армія зазнає поразки, але перемога коштує дорого обом сторонам. Європа виходить із війни зміненою.',
    accent: 'Випробування',
  },
  {
    year: '1848',
    eyebrow: 'ВЕСНА НАРОДІВ',
    title: 'Тепер твоя черга',
    body: 'Минуло два століття від початку повстання. Січ стала однією з головних сил Європи. Але старий порядок знову тріщить, і нова епоха починається саме зараз.',
    accent: 'Початок гри',
  },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('rada');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastExecutionLogs, setLastExecutionLogs] = useState<string[] | null>(null);
  const [lastResolutionResult, setLastResolutionResult] = useState<ChoiceResolutionResult | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [showPrologue, setShowPrologue] = useState<boolean>(false);
  const [prologueScene, setPrologueScene] = useState<number>(0);

  // Load existing save or initialize new state
  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadGame();
        if (loaded) {
          setGameState(loaded);
          setBannerNotice('Кампанію 1848 року відновлено.');
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
    setBannerNotice(`Створено нову гру. Володар: ${fresh.identity.rulerName}.`);
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
    setBannerNotice('Сховище повністю очищено. Розпочато нову кампанію.');
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
            Розгортання Кабінету Гетьмана...
          </div>
        </div>
      </div>
    );
  }

  if (showPrologue) {
    const scene = PROLOGUE_SCENES[prologueScene];
    const isLastScene = prologueScene === PROLOGUE_SCENES.length - 1;

    const continuePrologue = async () => {
      if (!isLastScene) {
        setPrologueScene((current) => current + 1);
        return;
      }

      const fresh = createInitialGameState('Гетьман');
      setGameState(fresh);
      setShowPrologue(false);
      await saveGame(fresh);
    };

    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#080A0E] text-[#F3EFE6] overflow-hidden">
        <main className="relative min-h-[100dvh] flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,110,0.12),transparent_42%)] pointer-events-none" />

          <section className="relative flex-1 flex flex-col justify-center px-5 pt-8 pb-5 sm:px-8">
            <div className="w-full max-w-2xl mx-auto space-y-5 sm:space-y-7 text-center">
              <div className="flex items-center justify-center gap-2">
                {PROLOGUE_SCENES.map((item, index) => (
                  <span
                    key={item.year}
                    className={index === prologueScene
                      ? "h-1.5 w-8 rounded-full bg-[#C9A96E]"
                      : index < prologueScene
                        ? "h-1.5 w-4 rounded-full bg-[#6F6043]"
                        : "h-1.5 w-4 rounded-full bg-[#2B3038]"}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[#C9A96E] text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase">
                  {scene.year} · {scene.eyebrow}
                </p>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
                  {scene.title}
                </h1>
                <p className="text-[#777F8E] text-[10px] font-mono tracking-[0.22em] uppercase">
                  {scene.accent}
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-xl aspect-[1.35/1] rounded-2xl overflow-hidden border border-[#3A4354] bg-[#0D121A] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <SichEmpireMap variant="prologue" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080A0E] to-transparent" />
              </div>

              <div className="max-w-xl mx-auto space-y-4">
                <p className="font-serif text-base sm:text-xl leading-relaxed text-[#E5E0D7]">
                  {scene.body}
                </p>
                {isLastScene && (
                  <p className="text-[#C9A96E] font-serif italic text-sm sm:text-base">
                    Твоя Рада збирається вперше.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="relative px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8">
            <button
              onClick={continuePrologue}
              className="w-full max-w-xl mx-auto min-h-[58px] rounded-xl bg-[#C9A96E] text-[#0A0D14] font-serif font-bold text-sm sm:text-base tracking-[0.08em] flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-transform"
            >
              {isLastScene ? 'ПОЧАТИ ГРУ' : 'ДАЛІ'}
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
