import React, { useState } from 'react';
import { X, Moon, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

const STOP_REASONS = [
  { id: 'Phone', label: '📱 Phone & Social Media Scroll', desc: 'Lost track of time on Instagram, TikTok or WhatsApp' },
  { id: 'Tired', label: '😴 Extreme Fatigue / Low Energy', desc: 'Clinical shift drain or insufficient sleep' },
  { id: 'Poor planning', label: '📝 Poor Planning / Unrealistic Timing', desc: 'Did not prep tools, fabric, or schedule in advance' },
  { id: 'Procrastination', label: '⏳ Resistance & Procrastination', desc: 'Delayed starting difficult tasks or wound care study' },
  { id: 'Unexpected event', label: '⚡ Unexpected Emergency / Errand', desc: 'Unplanned visitor, urgent errand, or shift change' },
  { id: 'Lack of motivation', label: '🌧️ Lack of Motivation', desc: 'Emotional overwhelm or self-doubt' },
  { id: 'Overcommitted', label: '🏋️ Overcommitted Schedule', desc: 'Attempted more tasks than hours in the day' },
  { id: 'Other', label: '❓ Other Reason', desc: 'Miscellaneous personal distraction' }
];

export default function EveningCheckinModal({ isOpen, onClose, existingReasons = [], onSaveCheckin }) {
  const [selectedReason, setSelectedReason] = useState('Phone');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playSuccess();
    speakAunty(`Aunty has noted that ${selectedReason} stopped you today. Tomorrow, no stories! We correct it!`);
    onSaveCheckin({
      date: new Date().toISOString().split('T')[0],
      reason: selectedReason,
      notes: notes.trim()
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  // Calculate pattern counts
  const reasonCounts = existingReasons.reduce((acc, curr) => {
    acc[curr.reason] = (acc[curr.reason] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border-2 border-indigo-500 rounded-2xl p-5 shadow-2xl shadow-indigo-950/80 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mb-2">
            <Moon className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white">Evening Check-In</h2>
          <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
            Identify Procrastination Patterns
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-white">Evening Check-In Saved!</h3>
            <p className="text-xs text-neutral-300">
              Pattern logged. Plan tomorrow carefully and rest well.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
              <p className="text-xs font-bold text-neutral-200">
                "What stopped you today?"
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Chakam tracks your repeat blockers over time to break the cycle.
              </p>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {STOP_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-neutral-950 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{r.label}</span>
                        {reasonCounts[r.id] && (
                          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                            {reasonCounts[r.id]}x logged
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Reflection Notes (What happened?):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Stayed on TikTok until 11pm instead of cutting the bodice pieces..."
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Lock In Evening Reflection
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
