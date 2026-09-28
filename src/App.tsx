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
                <svg viewBox="0 0 600 445" className="absolute inset-0 w-full h-full" role="img" aria-label="Карта Імперії Січ, 1848">
                  <defs>
                    <linearGradient id="prologueLand" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D7B56A" />
                      <stop offset="55%" stopColor="#B58C45" />
                      <stop offset="100%" stopColor="#806334" />
                    </linearGradient>
                    <radialGradient id="prologueSea">
                      <stop offset="0%" stopColor="#203442" />
                      <stop offset="100%" stopColor="#0A151E" />
                    </radialGradient>
                  </defs>

                  <rect width="600" height="445" fill="url(#prologueSea)" />

                  {/* subdued neighbouring realms */}
                  <path d="M18 105 L68 73 L112 90 L106 145 L75 170 L25 155Z" fill="#514A43" stroke="#81796D" strokeWidth="1.5"/>
                  <path d="M24 185 L78 168 L116 190 L105 244 L51 253 L18 226Z" fill="#394B59" stroke="#81796D" strokeWidth="1.5"/>
                  <path d="M72 285 L120 265 L153 296 L133 347 L86 356 L57 326Z" fill="#4C4541" stroke="#81796D" strokeWidth="1.5"/>
                  <path d="M428 330 L492 315 L552 340 L574 391 L530 422 L459 407 L423 370Z" fill="#55463F" stroke="#81796D" strokeWidth="1.5"/>
                  <path d="M478 72 L536 52 L583 81 L575 136 L531 153 L491 126Z" fill="#4A4740" stroke="#81796D" strokeWidth="1.5"/>

                  {/* Empire of Sich: Kyiv-centered, west to the Polish-Lithuanian lands and east through Muscovy/Siberian frontier */}
                  <path
                    d="M151 78
                       C188 57 223 62 254 53
                       C291 42 326 49 357 42
                       C399 34 438 44 465 57
                       C493 70 530 69 552 91
                       C568 108 557 129 563 149
                       C570 173 554 191 561 213
                       C567 238 548 255 535 272
                       C522 291 532 312 513 327
                       C489 346 460 335 438 349
                       C414 365 392 354 367 366
                       C338 380 312 365 286 374
                       C257 384 231 368 208 373
                       C182 378 165 359 144 351
                       C122 343 112 323 119 302
                       C126 280 111 262 119 241
                       C128 220 116 198 124 177
                       C132 157 119 138 128 117
                       C134 101 139 89 151 78Z"
                    fill="url(#prologueLand)"
                    stroke="#D7AA4A"
                    strokeWidth="3"
                  />

                  {/* internal regional divisions: broad historical zones */}
                  <path d="M205 69 C214 116 204 156 216 196 C225 233 215 278 227 323 C233 342 240 357 252 370" fill="none" stroke="#735B37" strokeWidth="1.4" strokeDasharray="5 5" opacity=".75"/>
                  <path d="M313 51 C300 96 313 139 300 181 C291 222 304 262 291 306 C285 332 292 352 304 369" fill="none" stroke="#735B37" strokeWidth="1.4" strokeDasharray="5 5" opacity=".75"/>
                  <path d="M412 45 C398 88 416 127 403 166 C393 209 411 248 397 290 C390 317 399 341 412 355" fill="none" stroke="#735B37" strokeWidth="1.4" strokeDasharray="5 5" opacity=".75"/>

                  {/* major rivers */}
                  <path d="M250 72 C245 120 257 151 247 184 C237 218 247 251 238 286 C231 315 244 342 260 367" fill="none" stroke="#6D8D8C" strokeWidth="2.4" opacity=".8"/>
                  <path d="M247 184 C275 193 294 205 322 220 C346 233 366 239 396 242" fill="none" stroke="#6D8D8C" strokeWidth="1.8" opacity=".7"/>
                  <path d="M348 53 C343 91 352 124 344 155 C337 183 347 205 361 222 C372 237 380 262 375 292" fill="none" stroke="#6D8D8C" strokeWidth="1.7" opacity=".65"/>

                  {/* Kyiv capital marker */}
                  <circle cx="247" cy="184" r="10" fill="#171B1D" stroke="#E2BE65" strokeWidth="2"/>
                  <path d="M247 168 L241 178 L253 178Z" fill="#E2BE65"/>
                  <text x="261" y="180" fill="#FFF4D7" fontSize="14" fontFamily="serif" fontWeight="700">КИЇВ</text>
                  <text x="261" y="195" fill="#E2BE65" fontSize="9" fontFamily="monospace" letterSpacing="1">СТОЛИЦЯ</text>

                  {/* principal cities */}
                  <g fill="#171B1D" stroke="#E2BE65" strokeWidth="1.5">
                    <circle cx="179" cy="142" r="3.5"/><circle cx="190" cy="222" r="3.5"/>
                    <circle cx="273" cy="238" r="3.5"/><circle cx="335" cy="222" r="3.5"/>
                    <circle cx="319" cy="122" r="3.5"/><circle cx="385" cy="112" r="3.5"/>
                    <circle cx="435" cy="151" r="3.5"/><circle cx="451" cy="218" r="3.5"/>
                    <circle cx="484" cy="269" r="3.5"/><circle cx="395" cy="305" r="3.5"/>
                  </g>
                  <g fill="#EFE6D0" fontSize="9.5" fontFamily="serif">
                    <text x="164" y="135">ЛЬВІВ</text>
                    <text x="174" y="238">ВІЛЬНО</text>
                    <text x="280" y="252">ХАРКІВ</text>
                    <text x="342" y="216">МОСКВА</text>
                    <text x="305" y="113">МІНСЬК</text>
                    <text x="373" y="104">НОВГОРОД</text>
                    <text x="423" y="143">КАЗАНЬ</text>
                    <text x="459" y="213">САМАРА</text>
                    <text x="490" y="264">АСТРАХАНЬ</text>
                    <text x="401" y="319">ОДЕСА</text>
                  </g>

                  {/* terrain hints */}
                  <g fill="none" stroke="#5C4C32" strokeWidth="1.2" opacity=".55">
                    <path d="M430 76 l10 -12 l10 12 l10 -12 l10 12"/>
                    <path d="M475 292 l10 -13 l10 13 l10 -13 l10 13"/>
                    <path d="M165 300 l9 -11 l9 11 l9 -11 l9 11"/>
                  </g>
                  <g fill="#4F5D45" opacity=".55">
                    <path d="M295 82 l6 -12 l6 12Z M309 90 l6 -12 l6 12Z M324 80 l6 -12 l6 12Z"/>
                    <path d="M420 280 l6 -12 l6 12Z M434 288 l6 -12 l6 12Z M448 278 l6 -12 l6 12Z"/>
                  </g>

                  {/* map labels */}
                  <text x="302" y="291" fill="#2B241A" fontSize="22" fontFamily="serif" fontWeight="700" letterSpacing="5">ІМПЕРІЯ СІЧ</text>
                  <text x="34" y="31" fill="#C9A96E" fontSize="10" fontFamily="monospace" letterSpacing="2">ЄВРОПА · 1848</text>
                  <text x="43" y="394" fill="#8295A0" fontSize="10" fontFamily="serif">ЧОРНЕ МОРЕ</text>
                  <text x="91" y="78" fill="#8D9AA0" fontSize="9" fontFamily="serif">ЄВРОПА</text>
                  <text x="501" y="52" fill="#8D9AA0" fontSize="9" fontFamily="serif">СХІДНІ ЗЕМЛІ</text>

                  {/* simple compass */}
                  <g transform="translate(55 338)">
                    <circle r="22" fill="none" stroke="#B89A5B" strokeWidth="1"/>
                    <path d="M0 -17 L4 0 L0 17 L-4 0Z" fill="#B89A5B"/>
                    <text x="-3" y="-27" fill="#C9A96E" fontSize="8">N</text>
                  </g>
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
