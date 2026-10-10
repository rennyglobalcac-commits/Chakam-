import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertOctagon, Flame, ShieldAlert, Play, Pause, 
  RotateCcw, CheckCircle2, Skull, Plus, ChevronRight, X, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds, speakAunty } from '../utils/audio';

export default function ConsequenceTimerWidget({
  timerState,
  tasks = [],
  onStartTimer,
  onStopTimer,
  onCompleteTaskWithTimer,
  onExpireTimer,
  onTriggerConsequenceModal
}) {
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(15); // in minutes
  const [customMinutes, setCustomMinutes] = useState('');

  // Local tick countdown if timer is active and running
  const [remainingSec, setRemainingSec] = useState(timerState?.remainingSeconds || 15 * 60);
  const [isRunning, setIsRunning] = useState(timerState?.isRunning || false);

  // Sync with prop changes
  useEffect(() => {
    if (timerState) {
      setRemainingSec(timerState.remainingSeconds);
      setIsRunning(timerState.isRunning);
    }
  }, [timerState?.remainingSeconds, timerState?.isRunning]);

  // Real-time Countdown Interval
  useEffect(() => {
    let interval = null;
    if (timerState?.active && isRunning && remainingSec > 0) {
      interval = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            // Expire consequence!
            sounds.playBuzzer();
            sounds.playStrike();
            speakAunty("Time is up! Chakam! You failed to finish within the consequence timer! Indecision has caught you!");
            if (onExpireTimer) {
              onExpireTimer(timerState);
            }
            return 0;
          }

          // Audio warning at 60s and 30s
          if (prev === 60) {
            sounds.playStrike();
            speakAunty("One minute remaining! Hurry up now now!");
          } else if (prev === 30) {
            sounds.playBuzzer();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState?.active, isRunning, remainingSec]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const initialDuration = timerState?.durationSeconds || (15 * 60);
  const progressPct = initialDuration > 0 ? Math.min(100, Math.max(0, ((initialDuration - remainingSec) / initialDuration) * 100)) : 0;

  // Launch a new consequence timer
  const handleLaunch = (e) => {
    e.preventDefault();
    const task = tasks.find(t => t.id === selectedTaskId);
    const taskTitle = task ? task.title : 'Selected Task';
    const duration = customMinutes ? Number(customMinutes) : selectedDuration;
    const durationSec = duration * 60;

    sounds.playStrike();
    speakAunty(`Consequence timer locked in! You have ${duration} minutes to finish "${taskTitle}". If you fail, Aunty has no mercy!`);

    onStartTimer({
      active: true,
      taskId: selectedTaskId || null,
      taskTitle: taskTitle,
      durationSeconds: durationSec,
      remainingSeconds: durationSec,
      isRunning: true,
      startedAt: Date.now()
    });

    setShowLaunchModal(false);
    setSelectedTaskId('');
    setCustomMinutes('');
  };

  // Mark task completed and disarm timer
  const handleDisarmSuccess = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    sounds.playSuccess();
    speakAunty("Chakam disarmed! Task completed on time! Aunty is proud of your hustle!");

    if (onCompleteTaskWithTimer) {
      onCompleteTaskWithTimer(timerState?.taskId);
    }
  };

  // Pause / Resume toggle
  const handleTogglePause = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (!nextRunning) {
      sounds.playStrike();
      speakAunty("Why are you pausing the consequence timer?! Procrastination is knocking!");
    } else {
      sounds.playSuccess();
    }
    if (onStopTimer) {
      onStopTimer({ ...timerState, isRunning: nextRunning, remainingSeconds: remainingSec });
    }
  };

  // Add 3 minutes emergency grace
  const handleEmergencyGrace = () => {
    sounds.playStrike();
    speakAunty("Emergency 3 minutes added! But this is your final warning!");
    setRemainingSec(prev => prev + 180);
  };

  // Surrender
  const handleSurrender = () => {
    sounds.playBuzzer();
    speakAunty("You surrendered to the consequence! Face your shame!");
    if (onTriggerConsequenceModal) {
      onTriggerConsequenceModal({
        id: timerState?.taskId || 'timed_task',
        title: timerState?.taskTitle || 'Consequence Timer Task',
        moveCount: 3
      });
    }
  };

  // 1. ACTIVE CONSEQUENCE TIMER VIEW
  if (timerState?.active) {
    const isCritical = remainingSec <= 180; // under 3 min

    return (
      <div className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden shadow-2xl ${
        isCritical 
          ? 'bg-gradient-to-br from-red-950 via-neutral-900 to-black border-red-500 shadow-red-950/80 animate-pulse' 
          : 'bg-gradient-to-br from-red-950/50 via-neutral-900 to-neutral-950 border-red-600/70 shadow-black'
      }`}>
        
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between mb-3 border-b border-red-900/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <AlertOctagon className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
                Consequence Countdown Active
              </span>
              <h3 className="text-xs font-black text-white truncate max-w-[200px]">
                {timerState.taskTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
              isCritical 
                ? 'bg-red-600 text-white border-red-400 animate-bounce' 
                : 'bg-red-950 text-red-400 border-red-800'
            }`}>
              {isCritical ? 'CRITICAL 🚨' : 'STAKES: +1 STRIKE'}
            </span>
          </div>
        </div>

        {/* Big Digital Timer Display */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono tracking-tight ${
                isCritical ? 'text-red-400' : 'text-white'
              }`}>
                {formatTime(remainingSec)}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 uppercase">
                remaining
              </span>
            </div>
            <p className="text-[10px] text-red-300/80 font-medium mt-0.5">
              {isCritical ? '⚠️ Penalty escalates when timer reaches 00:00!' : 'Complete task to avoid shame penalty'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePause}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 active:scale-95"
              title={isRunning ? "Pause" : "Resume"}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleEmergencyGrace}
              className="px-2 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-[10px] font-bold active:scale-95"
              title="Add 3 minutes emergency grace"
            >
              +3m Grace
            </button>
          </div>
        </div>

        {/* Progress Bar of Time Elapsed */}
        <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-red-950 my-2.5">
          <div 
            className={`h-full transition-all duration-300 ${
              isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-red-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDisarmSuccess}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            Mark Done & Disarm
          </button>

          <button
            onClick={handleSurrender}
            className="py-2.5 px-3 bg-neutral-900 hover:bg-red-950 text-red-400 text-xs font-bold rounded-xl border border-red-900/40 flex items-center justify-center gap-1 active:scale-95"
            title="Accept failure and view punishment"
          >
            <Skull className="w-3.5 h-3.5" />
            Surrender
          </button>
        </div>

      </div>
    );
  }

  // 2. INACTIVE: LAUNCH BUTTON VIEW
  return (
    <>
      <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1">
              Consequence Anti-Procrastination Timer
            </h4>
            <span className="text-[10px] text-neutral-400 font-medium block">
              Set real stakes: finish before time runs out or face +1 Strike
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowLaunchModal(true)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-950 flex items-center gap-1 active:scale-95 transition-all"
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          Start Timer
        </button>
      </div>

      {/* LAUNCH TIMER MODAL */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-red-600/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                  <AlertOctagon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Start Consequence Timer</h3>
                  <span className="text-[10px] text-red-400 font-bold">Stakes: Strike + Clown Mode penalty</span>
                </div>
              </div>
              <button
                onClick={() => setShowLaunchModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunch} className="space-y-3.5">
              {/* Select Task */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Select Task on the Line:
                </label>
                {tasks.length > 0 ? (
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Choose a scheduled task --</option>
                    {tasks.filter(t => !t.done).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.startTime} - {t.duration}m)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    No pending tasks in schedule. We will lock in a general 15m focus commitment!
                  </p>
                )}
              </div>

              {/* Preset Durations */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Commitment Duration:
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[5, 10, 15, 25].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(mins);
                        setCustomMinutes('');
                      }}
                      className={`py-1.5 text-xs font-black rounded-lg border transition-all ${
                        selectedDuration === mins && !customMinutes
                          ? 'bg-red-600 text-white border-red-500 shadow-sm'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Or enter custom minutes..."
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Warning Quote */}
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-red-950/80 text-[11px] text-neutral-300 italic">
                "If the countdown hits zero before you mark the task done, Aunty automatically issues a Strike and activates Level 1 Clown Mode!"
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-950 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Lock In Stakes & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
