import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

const ALTERNATIVES = [
  { id: 'a1', title: 'Read 5 pages of nonfiction', icon: '📖', time: '10 min', tag: 'Reading' },
  { id: 'a2', title: 'Clean and reset one area of room', icon: '🧹', time: '10 min', tag: 'Apartment' },
  { id: 'a3', title: 'Stretch body & drink 500ml water', icon: '🧘', time: '5 min', tag: 'Wellness' },
  { id: 'a4', title: 'Sew fabric scraps or pin a seam', icon: '🪡', time: '10 min', tag: 'Designer' },
  { id: 'a5', title: 'Revise 5 nursing wound care questions', icon: '🩺', time: '10 min', tag: 'Nurse' },
  { id: 'a6', title: 'Prepare fresh fruits or tea', icon: '🍳', time: '10 min', tag: 'Nutrition' },
  { id: 'a7', title: 'Send a warm voice note to Ada', icon: '📞', time: '3 min', tag: 'Friend' },
  { id: 'a8', title: 'Write 3 things in gratitude journal', icon: '✍️', time: '5 min', tag: 'Mindset' },
];

export default function DoomScrollModal({ isOpen, onClose, onLogIntervention }) {
  const [step, setStep] = useState('INTENT'); // 'INTENT' | 'ALTERNATIVES' | 'CONFIRMED'
  const [selectedAlt, setSelectedAlt] = useState(null);

  if (!isOpen) return null;

  const handleIntentSelect = (intent) => {
    if (intent === 'IDK') {
      sounds.playStrike();
      speakAunty("You don't know? Chakam! That is how hours disappear into TikTok! Pick a 10-minute alternative right now!");
      setStep('ALTERNATIVES');
    } else {
      sounds.playSuccess();
      onLogIntervention({ intent, prevented: false });
      onClose();
    }
  };

  const handleSelectAlternative = (alt) => {
    setSelectedAlt(alt);
    sounds.playSuccess();
    speakAunty(`Good girl! Do 10 minutes of ${alt.title}. Aunty is watching you!`);
    onLogIntervention({ choice: alt.title, prevented: true });
    setStep('CONFIRMED');
    setTimeout(() => {
      onClose();
      setStep('INTENT');
      setSelectedAlt(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-neutral-900 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl shadow-amber-950/80">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white">Pause Before Scroll</h2>
          <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
            Doom-Scroll Intervention Shield
          </p>
        </div>

        {step === 'INTENT' && (
          <div className="space-y-3">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
              <p className="text-xs font-bold text-neutral-200">
                "What are you opening this app for?"
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Be honest with yourself. Aunty already knows.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleIntentSelect('Reply to a message')}
                className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 text-left flex items-center justify-between"
              >
                <span>💬 Reply to an urgent message</span>
                <span className="text-[10px] text-neutral-500">2 min</span>
              </button>

              <button
                onClick={() => handleIntentSelect('Post something')}
                className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 text-left flex items-center justify-between"
              >
                <span>📸 Post work / brand update</span>
                <span className="text-[10px] text-neutral-500">Intentional</span>
              </button>

              <button
                onClick={() => handleIntentSelect('Watch intentionally')}
                className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 text-left flex items-center justify-between"
              >
                <span>🎯 Specific tutorial / educational video</span>
                <span className="text-[10px] text-neutral-500">Scheduled</span>
              </button>

              <button
                onClick={() => handleIntentSelect('IDK')}
                className="w-full py-3 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-black rounded-xl border border-red-500/50 text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <span>🤷‍♀️</span> I don't know / Bored / Procrastinating
                </span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                  Chakam!
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 'ALTERNATIVES' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-red-900/60 text-center">
              <p className="text-xs font-black text-red-400">
                10-Minute High-Value Alternatives
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Pick ONE productive action before touching this phone again:
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {ALTERNATIVES.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleSelectAlternative(alt)}
                  className="w-full p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded-xl text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{alt.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-neutral-200 group-hover:text-white">
                        {alt.title}
                      </p>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-500 group-hover:text-amber-400">
                        {alt.tag}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alt.time}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'CONFIRMED' && (
          <div className="py-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-white">Discipline Secured!</h3>
            <p className="text-xs text-neutral-300">
              Go spend 10 minutes on <span className="text-amber-400 font-bold">{selectedAlt?.title}</span>.
            </p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Phone Discipline Score: +5% Boost
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
