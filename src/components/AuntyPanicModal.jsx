import React, { useState } from 'react';
import { X, Volume2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { speakAunty, getRandomAuntyLine, sounds } from '../utils/audio';

const PANIC_ROASTS = [
  "You say you want to be a top nurse in UK and run your fashion fashion empire, but you are lying down watching Instagram reels. See your mate!",
  "Procrastination is the thief of destiny. Put down the plantain chips and open the wound care textbook right now!",
  "If you don't cut those bodice pieces today, will the fabric sew itself? Tell me, will it grow zipper?",
  "Chakam! Stop deceiving yourself. Five minutes of action will kill that lazy spirit. Stand up now now!",
  "Remember the ₦50,000 budget! If you procrastinate and order food on Chowdeck again, shame will catch you!",
  "Ada is ready to collect her ₦500 shame tax. Are you ready to pay, or will you do the work?"
];

export default function AuntyPanicModal({ isOpen, onClose }) {
  const [currentQuote, setCurrentQuote] = useState(() => PANIC_ROASTS[0]);
  const [promised, setPromised] = useState(false);

  if (!isOpen) return null;

  const handleNextRoast = () => {
    const next = PANIC_ROASTS[Math.floor(Math.random() * PANIC_ROASTS.length)];
    setCurrentQuote(next);
    speakAunty(next);
    sounds.playStrike();
  };

  const handlePromise = () => {
    sounds.playSuccess();
    setPromised(true);
    speakAunty("Okay! You've promised Aunty. Now move your body!");
    setTimeout(() => {
      setPromised(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-neutral-900 border-2 border-red-600 rounded-2xl p-6 shadow-2xl shadow-red-950/80">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500 mb-3 text-3xl">
            🚨
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            Aunty Reality Check!
          </h2>
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mt-0.5">
            Emergency Anti-Procrastination Dose
          </p>
        </div>

        <div className="my-5 p-4 bg-neutral-950 border border-red-900/60 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-600/30 text-red-300 text-[10px] font-black uppercase rounded-bl">
            Strict Aunty Mode
          </div>
          <p className="text-neutral-200 text-sm font-semibold leading-relaxed italic">
            "{currentQuote}"
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleNextRoast}
            className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4 text-red-400" />
            Hit Me With Another Roast
          </button>

          <button
            onClick={handlePromise}
            disabled={promised}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-black rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {promised ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Promise Recorded! Aunty is Watching!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                I Promise Aunty: I Go Do Am Now!
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-neutral-500 mt-3 font-medium">
          Remember: Every excuse you make feeds the clown 🤡.
        </p>
      </div>
    </div>
  );
}
