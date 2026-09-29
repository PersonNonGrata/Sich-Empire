import { useState } from 'react';
import { X } from 'lucide-react';
import { SichEmpireMap } from './SichEmpireMap.tsx';

type PrologueScene = {
  year: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
};

const SCENES: PrologueScene[] = [
  { year: '1648', eyebrow: 'ПОВСТАННЯ ХМЕЛЬНИЦЬКОГО', title: 'Народжується Січ', body: 'Повстання Хмельницького стає початком нового порядку у Східній Європі.', accent: 'Початок' },
  { year: '1654', eyebrow: 'ПЕРЕМОГА ХМЕЛЬНИЦЬКОГО', title: 'Протекторат Січі', body: 'Польща та Литва переходять під протекторат Січі. Київ стає центром нової політичної системи.', accent: 'Новий порядок' },
  { year: '1700', eyebrow: 'ПАДІННЯ МОСКОВІЇ', title: 'Схід відкритий', body: 'Січ перемагає Московське царство, а його землі переходять під владу Січі.', accent: 'Імперія' },
  { year: '1805–1815', eyebrow: 'НАПОЛЕОНІВСЬКІ ВІЙНИ', title: 'Велика війна', body: 'Наполеон кидає виклик Січі. Франція зазнає поразки, але перемога дорого коштує обом сторонам.', accent: 'Випробування' },
  { year: '1848', eyebrow: 'ВЕСНА НАРОДІВ', title: 'Тепер твоя черга', body: 'Січ входить у нову епоху. Європа знову змінюється, і майбутнє імперії залежатиме від рішень Гетьмана.', accent: 'Початок гри' },
];

type Props = {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
};

export function MainMenu({ hasSave, onNewGame, onContinue }: Props) {
  const [yearIndex, setYearIndex] = useState(SCENES.length - 1);
  const [menuOpen, setMenuOpen] = useState(false);
  const scene = SCENES[yearIndex];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#080A0E] text-[#F3EFE6] overflow-hidden">
      <main className="relative min-h-[100dvh] flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-[-8%] scale-110 opacity-55 blur-[5px]">
            <SichEmpireMap variant="prologue" />
          </div>
          <div className="absolute inset-0 bg-[#080A0E]/58" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,169,110,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,10,14,0.25),rgba(8,10,14,0.72))]" />
        </div>

        <section className="relative flex-1 flex flex-col justify-center px-5 pt-10 pb-6 sm:px-8">
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-center space-y-1">
              <p className="text-[#C9A96E] text-[10px] sm:text-xs font-mono tracking-[0.34em] uppercase">СХОДЖЕННЯ ГЕТЬМАНА</p>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">ІМПЕРІЯ СІЧ</h1>
            </div>

            <div className="mt-8 rounded-2xl border border-[#4A4A42]/80 bg-[#090C12]/62 backdrop-blur-sm shadow-[0_24px_90px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="px-4 sm:px-7 pt-4">
                <div className="flex items-center justify-between gap-2">
                  {SCENES.map((item, index) => (
                    <button
                      key={item.year}
                      onClick={() => setYearIndex(index)}
                      className={'group relative flex-1 min-w-0 py-2 text-center transition' + (index === yearIndex ? ' text-[#E7C985]' : ' text-[#8E93A0] hover:text-[#D8D2C7]')}
                    >
                      <span className="block font-mono text-[11px] sm:text-xs tracking-[0.08em] font-bold">{item.year}</span>
                      <span className={'mx-auto mt-2 block h-[2px] rounded-full transition-all' + (index === yearIndex ? ' w-full bg-[#C9A96E]' : ' w-2/3 bg-[#3B414B] group-hover:bg-[#676E7A]')} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 sm:px-8 py-6 sm:py-8 text-center min-h-[190px] flex flex-col justify-center">
                <p className="text-[#C9A96E] text-[9px] sm:text-[10px] font-mono tracking-[0.27em] uppercase">{scene.year} · {scene.eyebrow}</p>
                <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold">{scene.title}</h2>
                <p className="mt-2 text-[#777F8E] text-[9px] font-mono tracking-[0.2em] uppercase">{scene.accent}</p>
                <p className="mt-5 max-w-2xl mx-auto font-serif text-sm sm:text-lg leading-relaxed text-[#E5E0D7]">{scene.body}</p>
              </div>
            </div>

            <div className="mt-6 max-w-md mx-auto space-y-2.5">
              {hasSave ? (
                <>
                  <button onClick={onContinue} className="w-full min-h-[56px] rounded-xl bg-[#C9A96E] text-[#0A0D14] font-serif font-bold text-sm tracking-[0.08em]">ПРОДОВЖИТИ ГРУ</button>
                  <button onClick={onNewGame} className="w-full min-h-[50px] rounded-xl border border-[#596273] bg-[#10151E]/80 text-[#F3EFE6] font-serif font-bold text-xs tracking-[0.08em]">ПОЧАТИ НОВУ ГРУ</button>
                </>
              ) : (
                <button onClick={onNewGame} className="w-full min-h-[58px] rounded-xl bg-[#C9A96E] text-[#0A0D14] font-serif font-bold text-sm tracking-[0.08em]">ПОЧАТИ ГРУ</button>
              )}
              <button onClick={() => setMenuOpen(true)} className="w-full min-h-[42px] text-[#8E93A0] font-mono text-[9px] tracking-[0.2em] uppercase hover:text-[#C9A96E]">МЕНЮ</button>
            </div>
          </div>
        </section>

        {menuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/78 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#3A4354] bg-[#0D121A] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div><p className="text-[#C9A96E] text-[10px] font-mono tracking-[0.25em] uppercase">ІМПЕРІЯ СІЧ</p><h2 className="font-serif text-2xl font-bold mt-1">Меню</h2></div>
                <button onClick={() => setMenuOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#8E93A0]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                {hasSave && <button onClick={onContinue} className="w-full min-h-[54px] rounded-xl bg-[#C9A96E] text-[#0A0D14] font-serif font-bold text-sm">ПРОДОВЖИТИ ГРУ</button>}
                <button onClick={onNewGame} className="w-full min-h-[54px] rounded-xl border border-[#596273] bg-[#151B25] text-[#F3EFE6] font-serif font-bold text-sm">ПОЧАТИ НОВУ ГРУ</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
