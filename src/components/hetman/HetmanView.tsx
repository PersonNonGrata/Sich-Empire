import React from 'react';
import { GameState } from '../../game/state/types.ts';
import { WaxSeal } from '../ui/WaxSeal.tsx';
import { CoatOfArms } from '../ui/CoatOfArms.tsx';
import {
  Calendar,
  Compass,
  Scale,
  Sparkles,
  HelpCircle,
  Shield,
  Eye,
  CheckCircle,
  HelpCircle as QuestionIcon,
  Flame,
  Milestone,
  ArrowRight,
  GitBranch,
  Bookmark,
  Users,
  BookOpen,
} from 'lucide-react';
import { ReflectionResponse } from '../../game/psychology/types.ts';
import { deriveCharacterExpectation } from '../../game/narrative/narrativeEngine.ts';

interface HetmanViewProps {
  state: GameState;
  onRespondToReflection?: (reflectionId: string, response: ReflectionResponse, note?: string) => void;
}

const ASCENSION_STAGE_NAMES: Record<
  string,
  { label: string; description: string; step: number }
> = {
  EXPERIENCE: {
    label: 'Досвід',
    description: 'Накопичення перших історичних ухвал та сигналів.',
    step: 1,
  },
  PATTERN: {
    label: 'Патерн',
    description: 'Виявлення стійких звичок та схильностей у виборі шляху.',
    step: 2,
  },
  TENSION: {
    label: 'Напруга',
    description: 'Зіткнення протилежних полюсів влади та прагнень.',
    step: 3,
  },
  REFLECTION: {
    label: 'Відображення',
    description: 'Дзеркальні моменти самоусвідомлення володаря.',
    step: 4,
  },
  INSIGHT: {
    label: 'Усвідомлення',
    description: 'Глибинні висновки з власної політичної практики.',
    step: 5,
  },
  STRESS_TEST: {
    label: 'Випробування',
    description: 'Стрес-тести характеру перед лицем криз.',
    step: 6,
  },
  TRANSFORMATION: {
    label: 'Трансформація',
    description: 'Перелом та вихід на новий рівень державного ладу.',
    step: 7,
  },
};

export const HetmanView: React.FC<HetmanViewProps> = ({ state, onRespondToReflection }) => {
  const {
    identity,
    archetypeProfile,
    behaviorPatterns = [],
    contradictions = [],
    psychologicalTensions = [],
    reflections = [],
    insights = [],
    stressTests = [],
    transformations = [],
    ascensionStage = 'EXPERIENCE',
    reputationTags = [],
    narrativeMirrors = [],
    characters = [],
  } = state;

  const currentStageInfo = ASCENSION_STAGE_NAMES[ascensionStage] || ASCENSION_STAGE_NAMES.EXPERIENCE;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. ГЕТЬМАН · ІМ'Я · РІК · ТИТУЛ                                */}
      {/* ============================================================== */}
      <section className="bg-[#0B0D13] border-2 border-[#C9A96E]/50 rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle cosmic starlight glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 pb-6 border-b border-[#1E2536]">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121622] border-2 border-[#C9A96E] flex items-center justify-center text-[#C9A96E] shadow-xl shrink-0">
              <CoatOfArms size={44} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{identity.year} РІК</span>
                <span>·</span>
                <span>{identity.rulerTitle}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#F3EFE6] tracking-wide">
                {identity.rulerName}
              </h1>
              <p className="text-xs sm:text-sm text-[#8E929E] max-w-xl">
                Обраний на Великій Січовій Раді. Суверенний володар та будівничий долі нації.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <WaxSeal size="md" label="СІЧ" />
          </div>
        </div>

        {/* Dynamic Trajectory Badge */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#8E929E]">
            <Compass className="w-4 h-4 text-[#C9A96E]" />
            <span>СТУПІНЬ СХОДЖЕННЯ:</span>
            <span className="text-[#F3EFE6] font-bold bg-[#141B28] px-2.5 py-1 rounded border border-[#232F44]">
              Сходинка {currentStageInfo.step} з 7 · {currentStageInfo.label.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] text-[#A6ADB9]">
            {currentStageInfo.description}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ШЛЯХ (Ascension Ladder)                                     */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F3EFE6] flex items-center gap-2">
            <Milestone className="w-5 h-5 text-[#C9A96E]" />
            <span>Шлях Психологічного Сходження</span>
          </h2>
          <span className="text-xs font-mono text-[#8E929E]">
            Цикл внутрішнього гартування
          </span>
        </div>

        {/* 7-Step Horizontal / Flow Sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 font-mono text-xs">
          {Object.entries(ASCENSION_STAGE_NAMES).map(([key, info]) => {
            const isCurrent = ascensionStage === key;
            const isCompleted = info.step < currentStageInfo.step;

            return (
              <div
                key={key}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#151D2C] border-[#C9A96E] text-[#F3EFE6] shadow-lg ring-1 ring-[#C9A96E]/50'
                    : isCompleted
                    ? 'bg-[#0E131E] border-[#222C3E] text-[#8E929E]'
                    : 'bg-[#080B10] border-[#161B24] text-[#4B5563] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold">
                    0{info.step}
                  </span>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-[#34D399]" />}
                  {isCurrent && <Flame className="w-3.5 h-3.5 text-[#C9A96E] animate-pulse" />}
                </div>
                <div className="font-serif font-bold text-sm text-[#F3EFE6]">
                  {info.label}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#8E929E] italic pt-1 leading-relaxed">
          «Сходження не є готовим тестом. Воно викристалізовується з досвіду ухвалених наказів, напруги між обов’язком та волею, і перевіряється стрес-тестами криз.»
        </p>
      </section>

      {/* ============================================================== */}
      {/* 3. АРХЕТИП ПРАВЛІННЯ ТА ЙОГО ТІНЬ (Requirement 18, 19, 20)      */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-b from-[#121622] to-[#0A0D15] border-2 border-[#C9A96E] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="border-b border-[#242F46] pb-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] uppercase font-mono tracking-widest text-[#C9A96E] font-bold">
              АРХЕТИПНИЙ ПРОФІЛЬ ПРАВЛІННЯ (ОБРАХОВАНО З ІСТОРІЇ)
            </div>
            {archetypeProfile.crystallizationStage && (
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                archetypeProfile.crystallizationStage === 'REVEALED'
                  ? 'bg-[#0E2C1A] text-[#34D399] border-[#10B981]/50'
                  : archetypeProfile.crystallizationStage === 'CRYSTALLIZING'
                  ? 'bg-[#291F0E] text-[#FBBF24] border-[#F59E0B]/50'
                  : 'bg-[#182030] text-[#93C5FD] border-[#3B82F6]/50'
              }`}>
                {archetypeProfile.crystallizationStage === 'REVEALED'
                  ? '✓ ЯВЛЕНИЙ АРХЕТИП'
                  : archetypeProfile.crystallizationStage === 'CRYSTALLIZING'
                  ? '≈ КРИСТАЛІЗАЦІЯ ХАРАКТЕРУ'
                  : '• РАННЄ ЗАРОДЖЕННЯ'}
              </span>
            )}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3EFE6] tracking-wide">
            {archetypeProfile.archetype}
          </h2>
          <p className="font-serif text-base sm:text-lg text-[#C9A96E] italic">
            {archetypeProfile.summaryQuote}
          </p>
          {archetypeProfile.progressionNote && (
            <div className="pt-2 text-xs font-mono text-[#D1D5DB] bg-[#101522] p-3 rounded-lg border border-[#232F46] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A96E] shrink-0" />
              <span>{archetypeProfile.progressionNote}</span>
            </div>
          )}
        </div>

        {/* Strength & Shadow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strength */}
          <div className="p-5 rounded-xl bg-[#0E131E] border border-[#222E45] space-y-2">
            <div className="text-xs uppercase font-mono tracking-wider text-[#34D399] font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#34D399]" />
              <span>Державна Сила та Чеснота</span>
            </div>
            <p className="text-xs sm:text-sm text-[#E2E6EF] leading-relaxed">
              {archetypeProfile.strength}
            </p>
          </div>

          {/* Shadow */}
          <div className="p-5 rounded-xl bg-[#0E131E] border border-[#222E45] space-y-2">
            <div className="text-xs uppercase font-mono tracking-wider text-[#F87171] font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#F87171]" />
              <span>Тінь (Глибинний Ризик Характеру)</span>
            </div>
            <p className="text-xs sm:text-sm text-[#E2E6EF] leading-relaxed">
              {archetypeProfile.shadow}
            </p>
          </div>
        </div>

        {/* Evidence from real history */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] uppercase font-mono tracking-wider text-[#8E929E] font-semibold">
            Історичні свідчення стилю правління:
          </div>
          <ul className="space-y-1.5 text-xs text-[#C8CDD8]">
            {archetypeProfile.evidence.map((ev, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#0E131E]/60 p-2.5 rounded border border-[#1E2638]">
                <span className="text-[#C9A96E] font-bold">›</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. ПАТЕРНИ ПОВЕДІНКИ (Requirement 5 & 24 — NO NUMBERS)         */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="border-b border-[#1E2536] pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#C9A96E]" />
              <span>Поведінкові Патерни Володаря</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Стійкі способи ухвалення рішень, зафіксовані рушієм
            </p>
          </div>
          <span className="text-xs font-mono text-[#8E929E]">
            {behaviorPatterns.length} патернів
          </span>
        </div>

        {behaviorPatterns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {behaviorPatterns.map((pat) => (
              <div
                key={pat.id}
                className="p-4 sm:p-5 rounded-xl bg-[#101522] border border-[#222B3D] space-y-2.5 hover:border-[#C9A96E]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#F3EFE6]">
                    «{pat.title}»
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161E2E] text-[#C9A96E] border border-[#C9A96E]/30 shrink-0 uppercase font-semibold">
                    {pat.firstObservedYear}–{pat.lastObservedYear} рр.
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#A6AFBD] leading-relaxed">
                  {pat.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#8E929E]">
                  <span className="text-[#C9A96E]">Контекст:</span>
                  {pat.contexts.map((ctx, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#151C2A] text-[#C8CDD8] border border-[#253147]"
                    >
                      {ctx}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#10141E] border border-[#1E2536] text-center space-y-2">
            <p className="text-sm font-serif text-[#C8CDD8]">
              Поведінкові патерни ще формуються.
            </p>
            <p className="text-xs text-[#8E929E]">
              Ухвалюйте подальші рішення на Великій Раді, аби рушій побачив вашу глибинну лінію дій.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. СВІТ ПАМ'ЯТАЄ ГЕТЬМАНА (Stage 7 Requirement 2 & 3)           */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="border-b border-[#1E2536] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#C9A96E]" />
              <span>Світ Пам'ятає Гетьмана</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Карби історичної репутації та очікування ключових діячів держави
            </p>
          </div>
          <span className="text-xs font-mono text-[#C9A96E]">
            {reputationTags.length} карбів пам'яті
          </span>
        </div>

        {/* 1. Historical Memory & Reputation Tags */}
        <div className="space-y-3">
          <div className="text-[11px] uppercase font-mono tracking-widest text-[#8E929E] font-bold">
            КАРБИ ДЕРЖАВНОЇ РЕПУТАЦІЇ (MEMORY TAGS):
          </div>

          {reputationTags.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {reputationTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-lg bg-[#141B28] border border-[#C9A96E]/50 text-xs font-mono text-[#F3EFE6] flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />
                  <span className="font-bold">«{tag}»</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#10141E] border border-[#1E2536] text-xs text-[#8E929E] font-mono">
              Перші державні ухвали ще не сформували стійких репутаційних карбів. Кожне наступне рішення на Раді додасть свій запис у пам'ять станів.
            </div>
          )}
        </div>

        {/* 2. Character Perceptions & Expectations */}
        <div className="space-y-3 pt-2 border-t border-[#1C2433]">
          <div className="text-[11px] uppercase font-mono tracking-widest text-[#8E929E] font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C9A96E]" />
            <span>ЯК ВАС БАЧАТЬ ДІЯЧІ ДЕРЖАВИ (СПРИЙНЯТТЯ ТА ОЧІКУВАННЯ):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {characters.slice(0, 6).map((char) => {
              const currentExp = deriveCharacterExpectation(char, state);
              const trust = char.trust ?? 0;
              const fear = char.fear ?? 0;
              const respect = char.respect ?? 0;

              return (
                <div
                  key={char.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#101522] border border-[#222B3D] space-y-2 hover:border-[#384868] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-[#F3EFE6]">
                        {char.name}
                      </h4>
                      <p className="text-[11px] text-[#8E929E] truncate">
                        {char.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-[#0E2016] text-[#34D399] border border-[#10B981]/30" title="Довіра">
                        Д: {trust}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#181E2E] text-[#60A5FA] border border-[#3B82F6]/30" title="Повага">
                        П: {respect}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2A1014] text-[#F87171] border border-[#EF4444]/30" title="Страх">
                        С: {fear}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#151D2C] p-2.5 rounded-lg border border-[#263348] text-xs font-serif text-[#C8D1DF] italic">
                    <span className="font-mono not-italic text-[10px] uppercase tracking-wider text-[#C9A96E] block mb-0.5">
                      Очікування від Гетьмана:
                    </span>
                    «{char.expectation || currentExp}»
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ДЗЕРКАЛА ВОЛОДАРЯ (Stage 7 Requirement 7: NARRATIVE MIRRORS) */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="border-b border-[#1E2536] pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C9A96E]" />
              <span>Дзеркала Володаря (Наративні Відбитки)</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Моменти, коли світ повертає вам наслідки вашого власного правління
            </p>
          </div>
          <span className="text-xs font-mono text-[#8E929E]">
            {narrativeMirrors.length} відбитків
          </span>
        </div>

        {narrativeMirrors.length > 0 ? (
          <div className="space-y-3.5">
            {narrativeMirrors.map((mirror) => (
              <div
                key={mirror.id}
                className="p-5 rounded-xl bg-gradient-to-r from-[#141B28] to-[#0E131E] border-2 border-[#C9A96E]/60 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between text-xs font-mono border-b border-[#232F46] pb-2">
                  <span className="text-[#C9A96E] font-bold uppercase tracking-wider">
                    {mirror.title}
                  </span>
                  <span className="text-[#8E929E]">
                    {mirror.year} рік правління
                  </span>
                </div>

                <p className="font-serif text-sm sm:text-base text-[#F3EFE6] leading-relaxed italic border-l-2 border-[#C9A96E] pl-4">
                  «{mirror.text}»
                </p>

                {mirror.reflectionPrompt && (
                  <div className="pt-2 border-t border-[#1C2536] text-xs font-mono text-[#D1D5DB] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Усвідомлення: {mirror.reflectionPrompt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#10141E] border border-[#1E2536] text-center space-y-2">
            <p className="text-sm font-serif text-[#C8CDD8]">
              Дзеркала володаря ще не проявилися.
            </p>
            <p className="text-xs text-[#8E929E]">
              Вони виникають на переломі років або криз, коли накопичений вектор вашої поведінки починає вимагати від вас відповіді.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 7. НАПРУГИ (Requirement 8 & 24)                                */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="border-b border-[#1E2536] pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#C9A96E]" />
              <span>Психологічні Напруги Правління</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Протистояння двох рівноправних засад державотворення
            </p>
          </div>
          <span className="text-xs font-mono text-[#8E929E]">
            {psychologicalTensions.length} осей
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {psychologicalTensions.map((t) => {
            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-xl bg-[#101522] border border-[#222B3D] space-y-3"
              >
                {/* Dual Poles Header */}
                <div className="flex items-center justify-between text-sm sm:text-base font-serif font-bold">
                  <span className="text-[#F3EFE6] uppercase tracking-wide">
                    {t.labelA}
                  </span>
                  <span className="text-[#C9A96E] font-mono text-xs">↔</span>
                  <span className="text-[#F3EFE6] uppercase tracking-wide">
                    {t.labelB}
                  </span>
                </div>

                {/* Qualitative Balance Bar without raw numbers */}
                <div className="w-full bg-[#182030] h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#60A5FA] via-[#C9A96E] to-[#F87171] transition-all duration-300"
                    style={{
                      width: `${Math.max(10, Math.min(90, 50 + t.value / 2))}%`,
                    }}
                  />
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#F3EFE6]/40 -translate-x-1/2 pointer-events-none" />
                </div>

                {/* Status description */}
                <p className="text-xs text-[#C8CDD8] leading-relaxed pt-1">
                  {t.description}
                </p>

                {/* Real decision evidence */}
                {t.evidence && t.evidence.length > 0 && (
                  <div className="pt-2 border-t border-[#1C2433] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E929E]">
                      Опора у рішеннях:
                    </span>
                    <p className="text-[11px] text-[#A6ADB9] italic line-clamp-2">
                      {t.evidence[0]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ВІДОБРАЖЕННЯ (REFLECTIONS) & ЗГОДА / НЕЗГОДА (Req 9, 10)     */}
      {/* ============================================================== */}
      <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="border-b border-[#1E2536] pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C9A96E]" />
              <span>Дзеркальні Відображення (Рефлексія)</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Спостереження рушія над вашою поведінкою — останнє слово за вами
            </p>
          </div>
          <span className="text-xs font-mono text-[#8E929E]">
            {reflections.length} записів
          </span>
        </div>

        {reflections.length > 0 ? (
          <div className="space-y-4">
            {reflections.map((refl) => {
              const isPending = refl.status === 'pending';

              return (
                <div
                  key={refl.id}
                  className="p-5 sm:p-6 rounded-xl bg-[#111624] border-2 border-[#26334A] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E283C] pb-3">
                    <h3 className="font-serif text-lg font-bold text-[#F3EFE6]">
                      {refl.title}
                    </h3>

                    {/* Status Badge */}
                    <div className="text-xs font-mono">
                      {refl.status === 'confirmed' && (
                        <span className="px-2.5 py-1 rounded bg-[#064E3B] text-[#34D399] border border-[#10B981]/40 font-bold">
                          ✓ ПІДТВЕРДЖЕНО: ТОЧНО
                        </span>
                      )}
                      {refl.status === 'partially_confirmed' && (
                        <span className="px-2.5 py-1 rounded bg-[#2D2411] text-[#FBBF24] border border-[#F59E0B]/40 font-bold">
                          ≈ ПІДТВЕРДЖЕНО: ЧАСТКОВО
                        </span>
                      )}
                      {refl.status === 'disputed' && (
                        <span className="px-2.5 py-1 rounded bg-[#3B151A] text-[#F87171] border border-[#EF4444]/40 font-bold">
                          ✕ ВОЛОДАР НЕ ЗГОДЕН (думку збережено)
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-1 rounded bg-[#1E293B] text-[#94A3B8] border border-[#475569]/40 animate-pulse">
                          Очікує вашої відповіді
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-serif text-sm sm:text-base text-[#E2E6F0] leading-relaxed italic border-l-2 border-[#C9A96E] pl-4">
                    {refl.observation}
                  </p>

                  {/* Player Decision Buttons */}
                  {isPending && onRespondToReflection && (
                    <div className="pt-2 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onRespondToReflection(refl.id, 'AGREE')}
                        className="px-4 py-2 rounded-lg bg-[#C9A96E] hover:bg-[#DCBE84] text-[#0A0D14] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow hover:shadow-lg active:scale-95"
                      >
                        Точно
                      </button>

                      <button
                        onClick={() => onRespondToReflection(refl.id, 'PARTIAL')}
                        className="px-4 py-2 rounded-lg bg-[#1F293D] hover:bg-[#2A3752] text-[#F3EFE6] border border-[#384868] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                      >
                        Частково
                      </button>

                      <button
                        onClick={() => onRespondToReflection(refl.id, 'DISAGREE')}
                        className="px-4 py-2 rounded-lg bg-[#1A1820] hover:bg-[#282432] text-[#F87171] border border-[#4B2F38] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                      >
                        Не згоден
                      </button>
                    </div>
                  )}

                  {refl.playerNote && (
                    <div className="text-xs font-mono text-[#8E929E] pt-1">
                      {refl.playerNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#10141E] border border-[#1E2536] text-center space-y-2">
            <p className="text-sm font-serif text-[#C8CDD8]">
              Дзеркальні спостереження ще не відкрилися.
            </p>
            <p className="text-xs text-[#8E929E]">
              Коли ваші рішення виявлять повторюваний патерн або глибинну суперечність, система зафіксує першу рефлексію.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 7. УСВІДОМЛЕННЯ (INSIGHTS) (Requirement 11)                   */}
      {/* ============================================================== */}
      {insights.length > 0 && (
        <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="border-b border-[#1E2536] pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A96E]" />
              <span>Державні Усвідомлення</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Глибинні істини, народжені з досвіду та перевірені історією
            </p>
          </div>

          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 sm:p-5 rounded-xl bg-[#121826] border border-[#232F46] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#C9A96E] font-bold uppercase">
                    {ins.title}
                  </span>
                  <span className="text-[#8E929E]">
                    {ins.year} рік
                  </span>
                </div>
                <p className="font-serif text-sm sm:text-base text-[#F3EFE6] leading-relaxed">
                  {ins.text}
                </p>
                <div className="text-[11px] text-[#8E929E] font-mono italic pt-1">
                  Основа: {ins.basis}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 8. ВИПРОБУВАННЯ ТА ТРАНСФОРМАЦІЇ (Req 12 & 14)                */}
      {/* ============================================================== */}
      {(stressTests.length > 0 || transformations.length > 0) && (
        <section className="bg-[#0B0E15] border border-[#1E2536] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="border-b border-[#1E2536] pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3EFE6] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#EF4444]" />
              <span>Випробування та Трансформації Правління</span>
            </h2>
            <p className="text-xs text-[#8E929E]">
              Критичні стрес-тести характеру та якісні переломи стилю влади
            </p>
          </div>

          <div className="space-y-3">
            {stressTests.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-[#121622] border border-[#222B3D] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#EF4444] font-bold uppercase">
                    {st.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    st.status === 'passed_transformed'
                      ? 'bg-[#064E3B] text-[#34D399]'
                      : st.status === 'passed_retained'
                      ? 'bg-[#1E283C] text-[#8E929E]'
                      : 'bg-[#2A1810] text-[#FBBF24]'
                  }`}>
                    {st.status === 'passed_transformed'
                      ? 'ТРАНСФОРМАЦІЮ ЗДІЙСНЕНО'
                      : st.status === 'passed_retained'
                      ? 'СТАРУ МОДЕЛЬ ЗБЕРЕЖЕНО'
                      : 'ВИПРОБУВАННЯ ТРИВАЄ'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#C8CDD8] leading-relaxed">
                  {st.premise}
                </p>
                {st.resolutionNote && (
                  <p className="text-xs text-[#A8B2C4] italic pt-1 border-t border-[#1C2333]">
                    {st.resolutionNote}
                  </p>
                )}
              </div>
            ))}

            {transformations.map((trans) => (
              <div
                key={trans.id}
                className="p-4 rounded-xl bg-gradient-to-r from-[#172030] to-[#111624] border border-[#C9A96E]/60 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-[#C9A96E] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ІСТОРИЧНИЙ ЗСУВ: {trans.title}</span>
                </div>
                <div className="text-xs font-mono text-[#8E929E] flex items-center gap-2">
                  <span>Було: «{trans.fromState}»</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span className="text-[#34D399]">Стало: «{trans.toState}»</span>
                </div>
                <p className="text-xs text-[#E2E6EF] leading-relaxed">
                  {trans.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 9. НЕВИРІШЕНЕ ПИТАННЯ (Requirement 20)                         */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border-2 border-[#C9A96E] rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
            <HelpCircle className="w-4 h-4 text-[#C9A96E]" />
            <span>НЕВИРІШЕНЕ ПИТАННЯ ПРАВЛІННЯ</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#F3EFE6] leading-tight">
            «{archetypeProfile.unresolvedQuestion}»
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#A8B2C4] leading-relaxed max-w-2xl">
          Це питання випливає не з випадкового жеребу, а зі справжніх суперечностей ваших ухвал. Воно стоятиме перед кожним наступним універсалом, доки історія не винесе свій остаточний вердикт.
        </p>

        <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#8E929E]">
          <QuestionIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span>Відповідь формується наступними роками вашого гетьманування.</span>
        </div>
      </section>
    </div>
  );
};
