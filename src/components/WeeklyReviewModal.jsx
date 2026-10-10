import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Award, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function WeeklyReviewModal({ 
  isOpen, 
  onClose, 
  state,
  accountabilityScore
}) {
  const [step, setStep] = useState(1);
  const [avoidedTask, setAvoidedTask] = useState('Cutting bodice pieces & wound care MCQs');
  const [avoidReason, setAvoidReason] = useState('Phone distraction after evening hospital shift');
  const [investedRoles, setInvestedRoles] = useState({
    Nurse: true,
    Designer: true,
    Friend: false,
    Me: true
  });

  if (!isOpen) return null;

  const toggleRole = (role) => {
    setInvestedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const completedCount = state.tasks.filter(t => t.done).length;
  const totalCount = state.tasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border-2 border-rose-600 rounded-2xl p-5 shadow-2xl shadow-rose-950/80 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 mb-2">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white">Sunday Life Review</h2>
          <p className="text-[11px] text-rose-400 font-bold uppercase tracking-wider mt-0.5">
            Weekly 4-Persona Audit
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-3.5">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Weekly Score:</span>
                <span className="text-lg font-black text-emerald-400">{accountabilityScore.total}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Tasks Completed:</span>
                <span className="font-bold text-white">{completedCount} of {totalCount} tasks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Strikes / Punishments:</span>
                <span className="font-bold text-red-400">{state.user.strikeCount} registered</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                1. What did you avoid this week?
              </label>
              <input
                type="text"
                value={avoidedTask}
                onChange={(e) => setAvoidedTask(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                2. Why did you avoid it? (Root cause):
              </label>
              <textarea
                value={avoidReason}
                onChange={(e) => setAvoidReason(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Next: Check All 4 Versions of Yourself →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
              <p className="text-xs font-bold text-white">
                "Did you invest in all 4 versions of yourself this week?"
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                A whole life balances nursing, creativity, relationships, and your inner self.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Nurse', desc: 'Clinical study, wound care, career apps', icon: '🩺' },
                { role: 'Designer', desc: 'Sewing, cutting patterns, fabric craft', icon: '🪡' },
                { role: 'Friend', desc: 'Ada check-ins, calls, quality time', icon: '👥' },
                { role: 'Me', desc: '₦50k budget, apartment reset, habits', icon: '🏡' }
              ].map(({ role, desc, icon }) => {
                const isSelected = investedRoles[role];
                return (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-500 text-white ring-1 ring-rose-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xl block mb-1">{icon}</span>
                    <p className="text-xs font-black text-white">{role}</p>
                    <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">{desc}</p>
                    <span className={`text-[10px] font-bold mt-2 block ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {isSelected ? '✓ Invested' : '○ Neglected'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-1">
              <p className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Aunty's Pattern Insight:
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                "Your most frequent breakdown occurs between 8:00 PM and 11:00 PM due to unguided phone scrolling. Put your phone in the kitchen by 8:30 PM!"
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playSuccess();
                speakAunty("Weekly review sealed! You see your gaps clearly now. Next week, no slacking!");
                onClose();
                setStep(1);
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Review & Set New Week
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
