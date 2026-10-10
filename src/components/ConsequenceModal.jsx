import React, { useState } from 'react';
import { 
  X, AlertOctagon, Skull, Camera, Share2, DollarSign, Video, 
  PhoneForwarded, RotateCcw, Check, Copy, Flame, HelpCircle, Upload, Play, Square
} from 'lucide-react';
import { speakAunty, sounds } from '../utils/audio';

const ROULETTE_PUNISHMENTS = [
  'Auto-transfer ₦500 to Ada with caption: "Chakam! Shame tax. I dey play."',
  'Post "Chakam! I dey play. I no do my task." on WhatsApp Status with clown emoji for 24h',
  'Record a 30-sec video confession explaining why you procrastinated on wound care',
  'Post on LinkedIn: "I procrastinated on my professional goals. Chakam! Fixing it today."',
  'Peel beans and make moi-moi from scratch (Deep kitchen reset)',
  'Voice note confession to accountability partner Ada: "Chakam! I dey play."',
  'Clown mode on all profile avatars for 24 hours'
];

export default function ConsequenceModal({
  isOpen,
  task,
  level = 1,
  onClose,
  onDoItNow,
  onReschedule,
  onDeleteTask,
  onValidReason,
  onApplyPunishment,
  onResolvePunishment,
}) {
  const [stage, setStage] = useState('DECISION'); // 'DECISION' | 'PUNISHMENT' | 'ROULETTE' | 'PROOF'
  const [currentLevel, setCurrentLevel] = useState(level);
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState('');
  const [proofPreview, setProofPreview] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(false);

  // Consequence resolution timer (10-minute countdown)
  const [timerSec, setTimerSec] = useState(600);

  useEffect(() => {
    if (!isOpen) return;
    setTimerSec(600); // reset to 10 minutes on modal open
    const interval = setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          sounds.playBuzzer();
          speakAunty("Time expired! Indecision has consequences! Escalating punishment level now!");
          setCurrentLevel(l => Math.min(5, l + 1));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpinRoulette = () => {
    setSpinning(true);
    sounds.playStrike();
    let counter = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * ROULETTE_PUNISHMENTS.length);
      setRouletteResult(ROULETTE_PUNISHMENTS[idx]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setSpinning(false);
        sounds.playBuzzer();
        speakAunty("The wheel has spoken! No appeals! Fulfill your shame!");
      }
    }, 80);
  };

  const handleSimulateCall = () => {
    setCallActive(true);
    sounds.playBuzzer();
    speakAunty("Chakam! Is it not you? You promised you would do this task! You moved it three times! Aunty is calling you directly! Stand up now now and do it!");
    setTimeout(() => {
      setCallActive(false);
    }, 7000);
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    }
  };

  const handleFinishProof = () => {
    sounds.playSuccess();
    speakAunty("Okay! Proof received. Clown mode cleared. But don't dare test me again!");
    onResolvePunishment(proofPreview || 'Verified proof');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border-2 border-red-600 rounded-2xl p-5 shadow-2xl shadow-red-950/90 my-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Chakam! Consequence Engine
              </h2>
              <p className="text-[11px] font-bold text-red-400">
                Level {currentLevel} • Strike Alert 🚨
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Trigger Banner */}
        <div className="p-3.5 bg-neutral-950 rounded-xl border border-red-900/50 mb-4">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="font-bold text-red-400 uppercase tracking-wider">Abandoned Commitment</span>
            <span className="bg-red-950 text-red-300 font-extrabold px-1.5 py-0.5 rounded border border-red-800">
              Moved {task.moveCount || 3}x
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-0.5">
            {task.title}
          </h3>
          <p className="text-xs text-neutral-400">
            Originally scheduled for <span className="text-neutral-200 font-semibold">{task.startTime} - {task.endTime}</span> ({task.tag})
          </p>
        </div>

        {/* Live Consequence Resolution Timer */}
        <div className="mb-4 p-3 bg-red-950/40 border border-red-600/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                Consequence Timer Running
              </span>
              <p className="text-[10px] text-neutral-300">
                Resolve before 00:00 or auto-escalate to Level {Math.min(5, currentLevel + 1)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono text-red-400">
              {formatTimer(timerSec)}
            </span>
          </div>
        </div>

        {/* STAGE 1: The Strict Commitment Prompt */}
        {stage === 'DECISION' && (
          <div className="space-y-4">
            <div className="text-center py-2 px-3 bg-red-600/10 border border-red-600/30 rounded-xl">
              <p className="text-xs font-bold text-red-200">
                "You moved this task three times. Are you still committed to it?"
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Choose deliberately. Indecision will escalate straight to Level {currentLevel} shame.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  sounds.playSuccess();
                  onDoItNow(task);
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Do It Now (Avoid Punishment)
              </button>

              <button
                onClick={() => {
                  setStage('PUNISHMENT');
                  onReschedule(task);
                }}
                className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Reschedule Deliberately (+1 Strike)
              </button>

              <button
                onClick={() => {
                  setStage('PUNISHMENT');
                  onDeleteTask(task);
                }}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-red-950/60 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl border border-red-900/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Skull className="w-4 h-4 text-red-500" />
                Delete It (Accept Failure & Punishment)
              </button>

              <button
                onClick={() => onValidReason(task)}
                className="w-full py-2 px-3 text-[11px] font-semibold text-neutral-400 hover:text-white flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                I have a valid reason (Submit explanation)
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Punishment Execution (Escalated Levels) */}
        {stage === 'PUNISHMENT' && (
          <div className="space-y-4">
            {/* Level Selector for testing/display */}
            <div className="flex items-center justify-between bg-neutral-950 p-2 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400">Punishment Level:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCurrentLevel(lvl)}
                    className={`w-6 h-6 rounded-lg text-xs font-black transition-all ${
                      currentLevel === lvl
                        ? 'bg-red-600 text-white ring-2 ring-red-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* LEVEL 1: Small Chakam */}
            {currentLevel === 1 && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤡</span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">Level 1: Small Chakam</h4>
                    <p className="text-[11px] text-neutral-400">In-App Shame • Clown Mode & Confession</p>
                  </div>
                </div>
                <div className="p-2.5 bg-neutral-900 rounded-lg text-xs text-neutral-300 border border-neutral-800">
                  <p className="font-bold text-red-400 mb-1">Status changed to:</p>
                  <p className="italic">"Currently avoiding my goals & playing with my destiny 🤡"</p>
                </div>
                <div className="p-2.5 bg-neutral-900 rounded-lg text-xs text-neutral-300 border border-neutral-800 space-y-2">
                  <p className="font-bold text-white">Record 10-Second Voice Confession:</p>
                  <p className="text-[11px] text-neutral-400">
                    Say: "Chakam! I dey play. I no do am."
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsRecording(!isRecording);
                        if (!isRecording) {
                          sounds.playStrike();
                          setTimeout(() => {
                            setIsRecording(false);
                            setRecordedAudio(true);
                            sounds.playSuccess();
                          }, 3000);
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${
                        isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5" />}
                      {isRecording ? 'Recording (Speaking)...' : recordedAudio ? 'Confession Recorded ✓' : 'Record Confession'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 2: Social Chakam */}
            {currentLevel === 2 && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-rose-600/20 text-rose-400 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">Level 2: Social Chakam</h4>
                    <p className="text-[11px] text-neutral-400">WhatsApp, Instagram & Threads Shame</p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                  <p className="text-[11px] font-bold text-neutral-400">Post this on your WhatsApp Status / IG:</p>
                  <div className="p-2 bg-neutral-950 rounded text-xs text-red-300 font-mono">
                    "Chakam! I dey play. I no do [{task.title}]. Aunty Chakam has caught me. 🤡"
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(`Chakam! I dey play. I no do [${task.title}]. Aunty Chakam has caught me. 🤡`)}
                      className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied Text' : 'Copy Status'}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Chakam! I dey play. I no do [${task.title}]. Aunty Chakam has caught me. 🤡`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 3: Money Chakam */}
            {currentLevel === 3 && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-600/20 text-amber-400 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">Level 3: Money Chakam (₦500 Shame Tax)</h4>
                    <p className="text-[11px] text-neutral-400">Shame Tax to Partner Ada</p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Recipient:</span>
                    <span className="font-bold text-white">Ada (Accountability Partner)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Amount:</span>
                    <span className="font-black text-red-400 text-base">₦500.00</span>
                  </div>
                  <div className="p-2 bg-neutral-950 rounded text-xs text-neutral-300 font-mono">
                    Memo: "Chakam! Shame tax. I dey play."
                  </div>
                  <p className="text-[10px] text-amber-400 font-semibold">
                    ⏱️ Pay within 10 minutes or escalate to Level 4 video shame!
                  </p>
                </div>
              </div>
            )}

            {/* LEVEL 4: Video Chakam */}
            {currentLevel === 4 && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                    <Video className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">Level 4: Video Chakam</h4>
                    <p className="text-[11px] text-neutral-400">30-Second Video Confession</p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2 text-xs">
                  <p className="text-neutral-300">
                    Record a 30-sec video saying: <br />
                    <span className="text-red-400 font-semibold italic">
                      "Chakam! I dey play. I no do [{task.title}]. I am correcting my ways today."
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Or post on LinkedIn without hashtags: "I procrastinated on my goals. Chakam! Fixing it today."
                  </p>
                </div>
              </div>
            )}

            {/* LEVEL 5: Final Boss */}
            {currentLevel === 5 && (
              <div className="p-4 bg-neutral-950 border border-red-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-red-600 text-white rounded-lg">
                    <Skull className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-red-500 uppercase">Level 5: Final Boss Chakam</h4>
                    <p className="text-[11px] text-neutral-400">Max Digital Shame & Aunty Calling</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSimulateCall}
                    disabled={callActive}
                    className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-red-950"
                  >
                    <PhoneForwarded className="w-4 h-4 animate-bounce" />
                    {callActive ? 'Aunty Chakam is Screaming...' : 'Simulate Aunty Chakam Voice Call'}
                  </button>

                  <button
                    onClick={handleSpinRoulette}
                    disabled={spinning}
                    className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {spinning ? 'Spinning Roulette...' : 'Spin Punishment Roulette 🎡'}
                  </button>

                  {rouletteResult && (
                    <div className="p-2.5 bg-neutral-900 border border-amber-500/50 rounded-lg text-xs text-amber-200">
                      <span className="font-bold block text-[10px] uppercase text-amber-400">Wheel Result:</span>
                      {rouletteResult}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proof Upload Area */}
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  Upload Screenshot / Video Proof:
                </span>
                {proofPreview && <span className="text-emerald-400 text-[11px] font-bold">Proof Attached ✓</span>}
              </div>

              {proofPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-neutral-700 h-28 bg-neutral-900 flex items-center justify-center">
                  <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setProofPreview(null)}
                    className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-neutral-700 hover:border-red-500 rounded-lg p-3 cursor-pointer bg-neutral-900/60 transition-all">
                  <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                  <span className="text-[11px] font-bold text-neutral-300">Tap to upload proof image/receipt</span>
                  <span className="text-[10px] text-neutral-500">Camera snapshot, WhatsApp screenshot, or transfer slip</span>
                  <input type="file" accept="image/*,video/*" onChange={handleProofUpload} className="hidden" />
                </label>
              )}

              <button
                onClick={handleFinishProof}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Submit Proof & Resolve Punishment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
