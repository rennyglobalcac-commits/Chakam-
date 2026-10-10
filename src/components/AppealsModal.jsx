import React, { useState } from 'react';
import { X, Scale, AlertTriangle, CheckCircle, ShieldX, Upload } from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function AppealsModal({ 
  isOpen, 
  onClose, 
  appealUsedThisWeek = false,
  currentStrikeCount = 1,
  onResolveAppeal 
}) {
  const [reason, setReason] = useState('Emergency');
  const [explanation, setExplanation] = useState('');
  const [proofText, setProofText] = useState('');
  const [result, setResult] = useState(null); // { status: 'approved' | 'denied', message: '' }

  if (!isOpen) return null;

  const handleAppealSubmit = (e) => {
    e.preventDefault();

    if (appealUsedThisWeek) {
      sounds.playStrike();
      speakAunty("You have already used your ONE appeal for this week! No stories!");
      return;
    }

    // Auto-approve logic: Emergency, Sick, Travel
    const autoApproved = ['Emergency', 'Sick', 'Travel'].includes(reason);

    if (autoApproved) {
      sounds.playSuccess();
      speakAunty("Appeal granted! Aunty has shown mercy because of genuine situation. Do not abuse this grace!");
      const res = {
        status: 'approved',
        message: 'Appeal Auto-Approved: Genuine extenuating circumstance certified.'
      };
      setResult(res);
      onResolveAppeal(true, reason);
    } else {
      // Auto-deny logic: Forgot, Busy
      sounds.playBuzzer();
      speakAunty("Appeal DENIED! 'Forgot' and 'Busy' are pure laziness! Your strike has escalated! Oga you dey play!");
      const res = {
        status: 'denied',
        message: 'Appeal DENIED: "Forgot" or "Busy" is not an acceptable excuse. Consequence escalated +1 Level!'
      };
      setResult(res);
      onResolveAppeal(false, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl shadow-amber-950/80 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-2">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white">Chakam Appeals Court</h2>
          <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
            Strict Accountability Tribunal (1 per week)
          </p>
        </div>

        {appealUsedThisWeek ? (
          <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-center space-y-2">
            <ShieldX className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-sm font-black text-white">Weekly Appeal Already Exhausted</h3>
            <p className="text-xs text-neutral-300">
              You get exactly ONE appeal attempt every 7 days. Your appeal quota resets next Monday.
            </p>
            <p className="text-[11px] text-red-400 font-bold">
              Face your consequence or complete the task immediately.
            </p>
          </div>
        ) : result ? (
          <div className="p-5 text-center space-y-3">
            {result.status === 'approved' ? (
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            ) : (
              <ShieldX className="w-12 h-12 text-red-500 mx-auto animate-shake" />
            )}
            <h3 className="text-sm font-black text-white">{result.message}</h3>
            <p className="text-xs text-neutral-400">
              {result.status === 'approved' 
                ? 'Strike wiped clean. Resume your time-block schedule now.'
                : 'Strike penalty increased. Clown mode enforced.'}
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg"
            >
              Close Tribunal
            </button>
          </div>
        ) : (
          <form onSubmit={handleAppealSubmit} className="space-y-3.5">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-300">
              <span className="font-bold text-amber-400 block mb-0.5">⚠️ Rules of the Court:</span>
              <p className="text-[11px] text-neutral-400 leading-snug">
                • Genuine Emergency, Medical Sickness, or Urgent Travel are certified.<br />
                • "Forgot" or "Busy" will automatically REJECT and ESCALATE your shame level!
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Reason Category:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Emergency">🚨 Severe Emergency (Family / Safety)</option>
                <option value="Sick">🤒 Medical Sickness / Inability</option>
                <option value="Travel">✈️ Unplanned Urgent Travel</option>
                <option value="Forgot">🤦 I Forgot (Auto-Deny)</option>
                <option value="Busy">⏳ I Was Too Busy (Auto-Deny)</option>
                <option value="Other">❓ Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Detailed Justification:
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                required
                placeholder="Explain truthfully what transpired..."
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl p-2 text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Submit Appeal to Aunty Chakam
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
