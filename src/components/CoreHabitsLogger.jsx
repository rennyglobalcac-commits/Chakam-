import React, { useState } from 'react';
import { 
  Flame, CheckCircle2, Circle, BookOpen, Moon, Utensils, 
  Droplets, Plus, Sparkles, ChevronRight, Check, X, Award,
  Clock, Coffee, HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds, speakAunty } from '../utils/audio';

export default function CoreHabitsLogger({ habits = [], onUpdateHabits, readingState, onUpdateReading, apartmentState, onUpdateApartment }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('reading');
  const [newHabitTarget, setNewHabitTarget] = useState('15 mins');

  // Quick log detail modal state
  const [quickLogHabit, setQuickLogHabit] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Count stats
  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // fallback
    }
  };

  // Toggle habit completion directly
  const handleToggleHabit = (id) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;

    const nextDone = !target.completedToday;
    const newStreak = nextDone ? (target.streak || 0) + 1 : Math.max(0, (target.streak || 1) - 1);

    if (nextDone) {
      sounds.playSuccess();
      triggerConfetti();

      if (target.type === 'reading') {
        speakAunty("Knowledge is power! Keep your reading streak alive!");
      } else if (target.type === 'sleeping') {
        speakAunty("Rest well! Good sleep keeps Aunty smiling.");
      } else if (target.type === 'cooking') {
        speakAunty("Home cooking saves your money and keeps you healthy. Wonderful!");
      } else {
        speakAunty("Streak kept! Keep building discipline!");
      }
    } else {
      sounds.playStrike();
    }

    const updated = habits.map(h => {
      if (h.id === id) {
        return {
          ...h,
          completedToday: nextDone,
          streak: newStreak
        };
      }
      return h;
    });

    onUpdateHabits(updated);
  };

  // Open Quick Log Detail
  const handleOpenQuickLog = (habit) => {
    setQuickLogHabit(habit);
    setLogValue(habit.targetValue ? String(habit.targetValue) : '15');
    setLogNotes('');
  };

  // Save Quick Log Detail
  const handleSaveQuickLog = (e) => {
    e.preventDefault();
    if (!quickLogHabit) return;

    const habitId = quickLogHabit.id;
    const numValue = Number(logValue) || 1;

    sounds.playSuccess();
    triggerConfetti();

    // 1. Update Habit
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const nextStreak = (h.streak || 0) + 1;
        return {
          ...h,
          completedToday: true,
          streak: nextStreak,
          currentValue: (h.currentValue || 0) + numValue
        };
      }
      return h;
    });
    onUpdateHabits(updated);

    // 2. Cross-sync with reading state if reading habit
    if (quickLogHabit.type === 'reading' && onUpdateReading && readingState) {
      const currentBook = readingState.currentBook || {};
      const newPage = (currentBook.currentPage || 0) + numValue;
      onUpdateReading({
        ...readingState,
        currentBook: {
          ...currentBook,
          currentPage: newPage,
          pagesReadToday: (currentBook.pagesReadToday || 0) + numValue
        }
      });
    }

    // 3. Cross-sync with apartment checklist if cooking habit
    if (quickLogHabit.type === 'cooking' && onUpdateApartment && apartmentState) {
      const updatedChecklist = (apartmentState.checklist || []).map(item => {
        if (item.id === 'ac1' || item.label.toLowerCase().includes('cook')) {
          return { ...item, done: true };
        }
        return item;
      });
      onUpdateApartment({
        ...apartmentState,
        checklist: updatedChecklist
      });
    }

    setQuickLogHabit(null);
  };

  // Add a new custom habit
  const handleAddNewHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newH = {
      id: `h_${Date.now()}`,
      name: newHabitName.trim(),
      type: newHabitCategory,
      targetDesc: newHabitTarget.trim() || 'Daily habit',
      streak: 1,
      completedToday: true,
      currentValue: 1,
      targetValue: 1,
      unit: 'times',
      history: [true, false, false, false, false, false, false]
    };

    sounds.playSuccess();
    triggerConfetti();
    speakAunty(`New habit "${newHabitName.trim()}" locked in! Don't break this chain!`);
    onUpdateHabits([...habits, newH]);

    setNewHabitName('');
    setShowAddModal(false);
  };

  const getHabitIcon = (type) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'sleeping':
        return <Moon className="w-4 h-4 text-purple-400" />;
      case 'cooking':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'health':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStreakTier = (streak) => {
    if (streak >= 14) return { label: 'Inferno 🔥', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    if (streak >= 7) return { label: 'Blazing 🔥', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (streak >= 3) return { label: 'Hot Streak 🔥', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (streak >= 1) return { label: 'Spark ✨', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'Start Today 🌱', color: 'text-neutral-400 bg-neutral-800 border-neutral-700' };
  };

  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3.5 shadow-lg shadow-black/40">
      
      {/* Header with Streak Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
            <Flame className="w-4 h-4 fill-orange-500/40 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              Core Daily Habits ({completedCount}/{totalCount})
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold block">
              Reading • Sleeping • Cooking • Health
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Total Streak Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-950/60 border border-orange-700/50 text-orange-300 text-[10px] font-black">
            <Flame className="w-3 h-3 fill-orange-500" />
            <span>{totalStreaks}d total</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all active:scale-95"
            title="Add Habit"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400">
          <span>Today's Habit Discipline</span>
          <span className={completionPct === 100 ? 'text-emerald-400 font-black' : 'text-neutral-300'}>
            {completionPct}% Complete
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.map((habit) => {
          const isDone = habit.completedToday;
          const streak = habit.streak || 0;
          const tier = getStreakTier(streak);

          return (
            <div 
              key={habit.id}
              className={`p-3 rounded-xl border transition-all ${
                isDone 
                  ? 'bg-neutral-950/80 border-emerald-500/30 shadow-sm shadow-emerald-950/20' 
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                
                {/* Checkbox & Details */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="flex-shrink-0 transition-transform active:scale-90"
                    title={isDone ? "Mark incomplete" : "Mark done today"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-600 hover:text-neutral-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-neutral-900 border border-neutral-800">
                        {getHabitIcon(habit.type)}
                      </span>
                      <h4 className={`text-xs font-bold truncate ${isDone ? 'text-neutral-300' : 'text-white'}`}>
                        {habit.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-neutral-400">
                      <span>{habit.targetDesc || 'Daily target'}</span>
                      {habit.currentValue > 0 && (
                        <span className="text-emerald-400 font-mono font-bold">
                          • {habit.currentValue} {habit.unit || ''} logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Streak Badge & Quick Log Trigger */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  
                  {/* Visual Streak Pill */}
                  <div className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${tier.color}`}>
                    <Flame className={`w-3 h-3 ${streak > 0 ? 'fill-current animate-pulse' : 'text-neutral-500'}`} />
                    <span className="text-[11px] font-black">{streak}d</span>
                  </div>

                  {/* Quick Log button */}
                  <button
                    onClick={() => handleOpenQuickLog(habit)}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[10px] font-bold active:scale-95"
                    title="Log pages / hours / meal"
                  >
                    Log
                  </button>
                </div>
              </div>

              {/* 7-Day Mini Streak Dots */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-900 text-[9px] text-neutral-500">
                <span className="font-semibold uppercase tracking-wider text-[8px] text-neutral-500">Last 7 Days</span>
                <div className="flex gap-1.5 items-center">
                  {(habit.history || [false, false, false, false, false, false, false]).map((done, idx) => (
                    <div
                      key={idx}
                      title={`Day ${idx + 1}: ${done ? 'Kept' : 'Missed'}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        done 
                          ? 'bg-orange-500 shadow-sm shadow-orange-500/50' 
                          : 'bg-neutral-800 border border-neutral-700/60'
                      }`}
                    />
                  ))}
                  {/* Today dot */}
                  <div 
                    title={`Today: ${isDone ? 'Completed 🔥' : 'Pending'}`}
                    className={`w-3 h-3 rounded-full flex items-center justify-center ring-1 ring-neutral-700 ${
                      isDone 
                        ? 'bg-emerald-500 ring-emerald-400 shadow-sm shadow-emerald-500/60' 
                        : 'bg-neutral-900'
                    }`}
                  >
                    {isDone && <Check className="w-2 h-2 text-white stroke-[3]" />}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* QUICK LOG DETAIL MODAL */}
      {quickLogHabit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-neutral-800">
                  {getHabitIcon(quickLogHabit.type)}
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Log {quickLogHabit.name}</h3>
                  <span className="text-[10px] text-neutral-400">Current Streak: 🔥 {quickLogHabit.streak || 0} days</span>
                </div>
              </div>
              <button
                onClick={() => setQuickLogHabit(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickLog} className="space-y-3">
              {quickLogHabit.type === 'reading' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Pages Read Just Now:
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[5, 10, 15, 25].map((pages) => (
                      <button
                        key={pages}
                        type="button"
                        onClick={() => setLogValue(String(pages))}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                          logValue === String(pages)
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        +{pages}p
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter pages read..."
                  />
                </div>
              )}

              {quickLogHabit.type === 'sleeping' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Hours Slept:
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[6.5, 7, 7.5, 8, 8.5].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setLogValue(String(hrs))}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                          logValue === String(hrs)
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="14"
                    required
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter hours slept..."
                  />
                </div>
              )}

              {quickLogHabit.type === 'cooking' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Meal Cooked at Home:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['Breakfast', 'Lunch', 'Dinner', 'Meal Prep'].map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setLogValue(meal)}
                        className={`py-1.5 text-xs font-bold rounded-lg border ${
                          logValue === meal
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="E.g. Jollof rice, vegetable soup, steamed chicken..."
                  />
                </div>
              )}

              {quickLogHabit.type !== 'reading' && quickLogHabit.type !== 'sleeping' && quickLogHabit.type !== 'cooking' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Value / Amount:
                  </label>
                  <input
                    type="text"
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    placeholder="E.g. 2.5 Liters, 10 minutes..."
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickLogHabit(null)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-md"
                >
                  Log & Keep Streak 🔥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-orange-400" />
              Add Daily Habit
            </h3>

            <form onSubmit={handleAddNewHabit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Habit Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20m Evening Walk, Deep Work, Journaling"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category:</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="reading">Reading / Study</option>
                  <option value="sleeping">Sleep & Recovery</option>
                  <option value="cooking">Cooking & Nutrition</option>
                  <option value="health">Health & Hydration</option>
                  <option value="other">Personal Excellence</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Daily Target / Metric:</label>
                <input
                  type="text"
                  placeholder="e.g. 15 pages, 8 hours, 1 fresh meal"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl shadow-md shadow-orange-950"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
