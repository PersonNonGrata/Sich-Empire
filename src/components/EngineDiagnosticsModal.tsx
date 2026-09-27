import React, { useState } from 'react';
import { GameState } from '../game/state/types.ts';
import { Terminal, RefreshCw, Trash2, Download, Upload, PlusCircle, CheckCircle, Clock, Play, ShieldCheck } from 'lucide-react';
import { runPoliticalEngineTests } from '../game/politics/politicsEngine.test.ts';
import { runEconomyEngineTests } from '../game/economy/economyEngine.test.ts';

interface EngineDiagnosticsProps {
  state: GameState;
  onResetGame: (rulerName?: string) => void;
  onForceReload: () => void;
  onClearSave: () => void;
  onAdvanceYear: (years: number) => void;
}

export const EngineDiagnostics: React.FC<EngineDiagnosticsProps> = ({
  state,
  onResetGame,
  onForceReload,
  onClearSave,
  onAdvanceYear,
}) => {
  const [newRulerInput, setNewRulerInput] = useState('');
  const [exportJson, setExportJson] = useState(false);
  const [testResults, setTestResults] = useState<{ success: boolean; results: string[] } | null>(null);

  const handleRunTests = () => {
    const polRes = runPoliticalEngineTests();
    const ecoRes = runEconomyEngineTests();
    setTestResults({
      success: polRes.success && ecoRes.success,
      results: [
        '=== ЕТАП 4: ПОЛІТИЧНА МАШИНА ===',
        ...polRes.results,
        '=== ЕТАП 5: МАТЕРІАЛЬНА МАШИНА (ЕКОНОМІКА ТА ВІЙСЬКО) ===',
        ...ecoRes.results,
      ],
    });
  };


  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `imperiya_sich_save_${state.identity.year}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#232938] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#C9A96E] shrink-0" />
            <span>Інженерна Панель та Налаштування</span>
          </h2>
          <p className="text-xs text-[#8E929E] mt-1">
            Тестування циклу стану, перевірка незмінності, ручна зміна часу та валідація збереження.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunTests}
            className="min-h-[40px] px-3 py-2 rounded bg-[#C9A96E] hover:bg-[#D9B97E] text-[#0A0D14] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Запустити Тести</span>
          </button>
          <span className="font-mono text-xs text-[#34D399] bg-[#111C18] border border-[#10B981]/40 px-2.5 py-1.5 rounded flex items-center gap-1.5 min-h-[40px]">
            <CheckCircle className="w-3.5 h-3.5" />
            Схема V{state.version} OK
          </span>
        </div>
      </div>

      {/* Test Results Output Banner */}
      {testResults && (
        <div className={`p-4 rounded-xl border-2 space-y-2 font-mono text-xs ${
          testResults.success ? 'bg-[#0E1C14] border-[#10B981]/60' : 'bg-[#261010] border-[#EF4444]/60'
        }`}>
          <div className="flex items-center justify-between border-b border-[#23352A] pb-2">
            <span className="font-bold flex items-center gap-1.5 text-[#F3EFE6]">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>РЕЗУЛЬТАТИ ВАЛІДАЦІЇ ПОЛІТИЧНОЇ МАШИНИ ({testResults.results.length} перевірок):</span>
            </span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              testResults.success ? 'bg-[#10B981] text-[#0A0D14]' : 'bg-[#EF4444] text-white'
            }`}>
              {testResults.success ? 'УСІ ТЕСТИ ПРОЙДЕНО УСПІШНО' : 'ВИЯВЛЕНО ПОМИЛКИ'}
            </span>
          </div>
          <div className="space-y-1 text-[11px] max-h-48 overflow-y-auto pt-1">
            {testResults.results.map((res, i) => (
              <div key={i} className={res.startsWith('✓') ? 'text-[#34D399]' : 'text-[#EF4444] font-bold'}>
                {res}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Control Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Reset / New Game */}
        <div className="bg-[#0F131C] border border-[#232938] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F3EFE6]">
            <PlusCircle className="w-4 h-4 text-[#C9A96E]" />
            <span>Нова Гра (Скидання Стану)</span>
          </div>
          <p className="text-xs text-[#8E929E]">
            Створює чистий первинний GameState на 1848 рік.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ім'я Гетьмана..."
              value={newRulerInput}
              onChange={(e) => setNewRulerInput(e.target.value)}
              className="w-full bg-[#161B26] border border-[#262E40] rounded px-3 py-1.5 text-xs text-[#F3EFE6] focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              onClick={() => {
                onResetGame(newRulerInput.trim() || undefined);
                setNewRulerInput('');
              }}
              className="px-3 py-1.5 rounded bg-[#C9A96E] hover:bg-[#D9B97E] text-[#0A0D14] text-xs font-bold shrink-0 cursor-pointer transition-colors"
            >
              Створити
            </button>
          </div>
        </div>

        {/* Time Control */}
        <div className="bg-[#0F131C] border border-[#232938] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F3EFE6]">
            <Clock className="w-4 h-4 text-[#60A5FA]" />
            <span>Перемотування Років</span>
          </div>
          <p className="text-xs text-[#8E929E]">
            Стрибок уперед у часі для активації відкладених наслідків.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onAdvanceYear(1)}
              className="flex-1 py-1.5 rounded bg-[#161B26] hover:bg-[#1E2536] border border-[#262E40] text-xs font-mono text-[#F3EFE6] cursor-pointer"
            >
              +1 Рік
            </button>
            <button
              onClick={() => onAdvanceYear(2)}
              className="flex-1 py-1.5 rounded bg-[#161B26] hover:bg-[#1E2536] border border-[#262E40] text-xs font-mono text-[#C9A96E] cursor-pointer"
            >
              +2 Роки
            </button>
          </div>
        </div>

        {/* Storage Controls */}
        <div className="bg-[#0F131C] border border-[#232938] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F3EFE6]">
            <RefreshCw className="w-4 h-4 text-[#A78BFA]" />
            <span>Керування Сховищем</span>
          </div>
          <p className="text-xs text-[#8E929E]">
            Перезавантажити з IndexedDB або повністю очистити.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onForceReload}
              className="flex-1 py-1.5 rounded bg-[#161B26] hover:bg-[#1E2536] border border-[#262E40] text-xs font-mono text-[#F3EFE6] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#A78BFA]" />
              <span>Зчитати</span>
            </button>
            <button
              onClick={onClearSave}
              className="flex-1 py-1.5 rounded bg-[#2A1515] hover:bg-[#3D1E1E] border border-[#EF4444]/40 text-xs font-mono text-[#F87171] flex items-center justify-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Очистити</span>
            </button>
          </div>
        </div>
      </div>

      {/* JSON Viewer & Diagnostics */}
      <div className="bg-[#0A0D14] border border-[#232938] rounded-lg p-5 font-mono text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#1C2230] pb-2">
          <span className="text-[#8E929E]">
            Дзеркало GameState (JSON Memory Dump)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExportJson(!exportJson)}
              className="text-[#C9A96E] hover:underline"
            >
              {exportJson ? 'Згорнути' : 'Розгорнути'}
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-2 py-1 rounded bg-[#161B26] border border-[#262E40] hover:text-[#C9A96E] text-[#8E929E] flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Експорт</span>
            </button>
          </div>
        </div>

        {exportJson && (
          <pre className="max-h-96 overflow-auto text-[#A5B4FC] bg-[#07090E] p-4 rounded border border-[#1A202C] leading-normal text-[11px]">
            {JSON.stringify(state, null, 2)}
          </pre>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-[#8E929E] pt-2">
          <div>gameId: <span className="text-[#F3EFE6]">{state.identity.gameId}</span></div>
          <div>Рішень: <span className="text-[#F3EFE6]">{state.decisions.length}</span></div>
          <div>Завершено сцен: <span className="text-[#F3EFE6]">{state.completedScenarioIds.length}</span></div>
          <div>Доступно сцен: <span className="text-[#F3EFE6]">{state.availableScenarioIds.length}</span></div>
        </div>
      </div>
    </div>
  );
};
