import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, Flame, Plus, AlertTriangle, 
  Sparkles, ShieldCheck, Lock, Play, ChevronRight, BarChart2, 
  Calendar, RotateCcw, Trash2, ArrowUpRight, TrendingUp, BarChart3
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';
import { calculatePerformanceMetrics, getTodayDateString } from '../utils/storage';
import PerformanceChart from '../components/PerformanceChart';
import CoreHabitsLogger from '../components/CoreHabitsLogger';
import ConsequenceTimerWidget from '../components/ConsequenceTimerWidget';

export default function HomeTab({
  state,
  score,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onMoveTask,
  onTriggerConsequence,
  onLockMorningPlan,
  onAddMorningPriority,
  onDeleteMorningPriority,
  onToggleMorningPriority,
  onManualDailyReset,
  onNavigateTab,
  onUpdateHabits,
  onUpdateReading,
  onUpdateApartment,
  onStartConsequenceTimer,
  onStopConsequenceTimer,
  onCompleteTaskWithTimer,
  onExpireConsequenceTimer
}) {
  const [showChart, setShowChart] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('09:00');
  const [newTaskDuration, setNewTaskDuration] = useState(45);
  const [newTaskTag, setNewTaskTag] = useState('Nurse');

  const [showAddPriorityModal, setShowAddPriorityModal] = useState(false);
  const [newPriorityTitle, setNewPriorityTitle] = useState('');
  const [newPriorityTag, setNewPriorityTag] = useState('Nurse');
  const [newPriorityTime, setNewPriorityTime] = useState('09:00 - 10:00');

  const { tasks, morningPriorities, morningPlanLocked, user } = state;

  // Performance metrics calculation for "How well I am doing every week and every day"
  const performance = calculatePerformanceMetrics(state);

  // Filter tasks if Work Day Mode is active
  const displayedTasks = (tasks || []).map(task => {
    if (user?.workDayMode && task.isWorkShift) {
      return { ...task, title: '🏥 Clinical Shift (Work Day Mode Active - Locked)', duration: 420 };
    }
    return task;
  });

  const totalMinutesScheduled = displayedTasks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const totalHoursScheduled = (totalMinutesScheduled / 60).toFixed(1);

  // Handle Add New Task
  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (totalMinutesScheduled + Number(newTaskDuration) > 24 * 60) {
      sounds.playStrike();
      alert("Chakam! You cannot schedule more than 24 hours in a day! Stop overcommitting!");
      return;
    }

    const startH = parseInt(newTaskStartTime.split(':')[0]);
    const startM = parseInt(newTaskStartTime.split(':')[1]);
    const endTotalM = startH * 60 + startM + Number(newTaskDuration);
    const endH = Math.floor(endTotalM / 60) % 24;
    const endM = endTotalM % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    onAddTask({
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      startTime: newTaskStartTime,
      endTime: endTime,
      duration: Number(newTaskDuration),
      tag: newTaskTag,
      done: false,
      moveCount: 0,
      deadline: endTime
    });

    sounds.playSuccess();
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Handle Add Priority
  const handleAddNewPriority = (e) => {
    e.preventDefault();
    if (!newPriorityTitle.trim()) return;

    onAddMorningPriority({
      id: `mp_${Date.now()}`,
      title: newPriorityTitle.trim(),
      tag: newPriorityTag,
      timeBlock: newPriorityTime.trim() || 'Morning',
      done: false
    });

    sounds.playSuccess();
    setNewPriorityTitle('');
    setShowAddPriorityModal(false);
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'Nurse': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Designer': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Friend': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Budget': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">

      {/* 1. HOW WELL I AM DOING: DAILY & WEEKLY PERFORMANCE SCORE CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-5 shadow-xl shadow-black/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              Performance Monitor
            </span>
            <h2 className="text-sm font-black text-white mt-1">How Well I Am Doing</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`p-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all ${
                showChart 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {showChart ? 'Hide Chart' : 'View Chart'}
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('SETTINGS_REVIEW')}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold flex items-center gap-1 active:scale-95"
            >
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              Full Review
            </button>
          </div>
        </div>

        {/* Daily & Weekly Side-by-Side Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Daily Card */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase">Today's Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl font-black ${performance.today.score >= 80 ? 'text-emerald-400' : performance.today.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {performance.today.score}%
              </span>
              <span className="text-[10px] text-neutral-500 font-bold">
                ({performance.today.tasksCompleted}/{performance.today.tasksTotal} tasks)
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full ${performance.today.score >= 80 ? 'bg-emerald-500' : performance.today.score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                style={{ width: `${performance.today.score}%` }}
              />
            </div>
          </div>

          {/* Weekly Card */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase">Weekly Avg</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-cyan-400">
                {performance.weekly.averageScore}%
              </span>
              <span className="text-[10px] text-neutral-500 font-bold">
                ({performance.weekly.totalTasksCompleted} completed)
              </span>
            </div>
            {/* 7-day mini sparkline dots */}
            <div className="flex gap-1 mt-2">
              {performance.weekly.days.map((d, i) => (
                <div 
                  key={i} 
                  title={`${d.dayLabel}: ${d.score}%`}
                  className={`flex-1 h-1.5 rounded-full ${d.isToday ? 'bg-red-500' : d.score >= 80 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-amber-400' : 'bg-neutral-700'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Aunty's Verdict */}
        <p className="text-xs text-neutral-300 font-medium italic bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
          "{performance.today.feedback}"
        </p>
      </div>

      {/* Recharts Completion Rates Chart (Collapsible in Home) */}
      {showChart && (
        <PerformanceChart metrics={performance} />
      )}

      {/* 2. CONSEQUENCE TIMER (ANTI-PROCRASTINATION COUNTDOWN WITH STAKES) */}
      <ConsequenceTimerWidget
        timerState={state.consequenceTimer}
        tasks={displayedTasks}
        onStartTimer={onStartConsequenceTimer}
        onStopTimer={onStopConsequenceTimer}
        onCompleteTaskWithTimer={onCompleteTaskWithTimer}
        onExpireTimer={onExpireConsequenceTimer}
        onTriggerConsequenceModal={onTriggerConsequence}
      />

      {/* 3. CORE HABITS: QUICK LOG FOR READING, SLEEPING & COOKING WITH STREAK INDICATOR */}
      <CoreHabitsLogger
        habits={state.me?.habits || []}
        onUpdateHabits={onUpdateHabits}
        readingState={state.me?.reading}
        onUpdateReading={onUpdateReading}
        apartmentState={state.me?.apartment}
        onUpdateApartment={onUpdateApartment}
      />

      {/* 4. MORNING TOP 3 PRIORITIES */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Morning Top Priorities ({(morningPriorities || []).length}/3)
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5">
            {(!morningPriorities || morningPriorities.length < 3) && !morningPlanLocked && (
              <button
                onClick={() => setShowAddPriorityModal(true)}
                className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                Add Priority
              </button>
            )}
            
            {!morningPlanLocked && morningPriorities && morningPriorities.length > 0 && (
              <button
                onClick={onLockMorningPlan}
                className="text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-500 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 active:scale-95"
              >
                <Lock className="w-3 h-3" />
                Lock Plan
              </button>
            )}
          </div>
        </div>

        {(!morningPriorities || morningPriorities.length === 0) ? (
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-dashed border-neutral-800 text-center">
            <p className="text-xs text-neutral-400 font-bold">No morning priorities set yet.</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Pick the 3 non-negotiable things you must achieve today.</p>
            <button
              onClick={() => setShowAddPriorityModal(true)}
              className="mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg active:scale-95"
            >
              + Add First Priority
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {morningPriorities.map((p) => (
              <div 
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  p.done 
                    ? 'bg-neutral-950/60 border-neutral-800/60 opacity-60' 
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 mr-2">
                  <button
                    onClick={() => onToggleMorningPriority(p.id)}
                    className="text-neutral-400 hover:text-white"
                  >
                    {p.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  <div>
                    <span className={`text-xs font-bold ${p.done ? 'line-through text-neutral-500' : 'text-white'}`}>
                      {p.title}
                    </span>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getTagColor(p.tag)}`}>
                        {p.tag}
                      </span>
                      <span>{p.timeBlock}</span>
                    </div>
                  </div>
                </div>

                {!morningPlanLocked && (
                  <button
                    onClick={() => onDeleteMorningPriority(p.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                    title="Remove priority"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. TIME-BLOCKED SCHEDULE & DAILY TO-DO LIST (WITH DAILY AUTO-RESET) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-500" />
              Daily To-Do Schedule ({(tasks || []).length})
            </h3>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Auto-clears each day • Past lists preserved in Review Archive
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onManualDailyReset}
              className="text-[11px] font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-2 py-1.5 rounded-lg flex items-center gap-1 active:scale-95"
              title="Archive and clear today's tasks"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Day
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        {(!tasks || tasks.length === 0) ? (
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400 font-bold">No tasks scheduled for today.</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Your day starts fresh! Tap "Add Task" to schedule your nursing study, sewing studio, or errands.
            </p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="mt-3 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3.5 py-1.5 rounded-xl hover:bg-red-500/20 active:scale-95"
            >
              + Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedTasks.map((task) => {
              const hasStrikes = (task.moveCount || 0) > 0;
              const isOvermoved = (task.moveCount || 0) >= 3;

              return (
                <div 
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    task.done 
                      ? 'bg-neutral-950/70 border-neutral-800/60 opacity-60' 
                      : isOvermoved 
                      ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30' 
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-white"
                      >
                        {task.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>

                      <div className="flex-1">
                        <span className={`text-xs font-bold ${task.done ? 'line-through text-neutral-400' : 'text-white'}`}>
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getTagColor(task.tag)}`}>
                            {task.tag}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {task.startTime} - {task.endTime} ({task.duration}m)
                          </span>
                          {hasStrikes && (
                            <span className="text-[9px] font-black text-red-400 bg-red-950 px-1 rounded border border-red-800 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" />
                              Moved {task.moveCount}x
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!task.done && (
                        <>
                          <button
                            onClick={() => {
                              onStartConsequenceTimer({
                                active: true,
                                taskId: task.id,
                                taskTitle: task.title,
                                durationSeconds: (task.duration || 15) * 60,
                                remainingSeconds: (task.duration || 15) * 60,
                                isRunning: true,
                                startedAt: Date.now()
                              });
                              sounds.playStrike();
                              speakAunty(`Consequence timer locked for "${task.title}"! ${task.duration || 15} minutes on the clock! Finish or face punishment!`);
                            }}
                            className="text-[10px] font-black bg-red-950 hover:bg-red-900 text-red-300 px-2 py-1 rounded-lg border border-red-800/60 active:scale-95 flex items-center gap-1 shadow-sm"
                            title="Put this task on the consequence timer!"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            Timer
                          </button>

                          <button
                            onClick={() => onMoveTask(task.id)}
                            className="text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 px-2 py-1 rounded-lg border border-neutral-700 active:scale-95"
                            title="Move or Reschedule (Beware consequence!)"
                          >
                            Move
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-500" />
              Schedule New Task
            </h3>

            <form onSubmit={handleAddNewTask} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Task Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cut bodice pieces, Study pharmacology"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Start Time:</label>
                  <input
                    type="time"
                    value={newTaskStartTime}
                    onChange={(e) => setNewTaskStartTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Duration (min):</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category Tag:</label>
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Nurse">Nurse (Clinical / Exam Prep)</option>
                  <option value="Designer">Designer (Sewing / Atelier)</option>
                  <option value="Budget">Budget / Shopping</option>
                  <option value="Friend">Friend / Connection</option>
                  <option value="Me">Personal / Rest / Apartment</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Priority */}
      {showAddPriorityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Add Morning Priority
            </h3>

            <form onSubmit={handleAddNewPriority} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Priority Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cut 3 dress panels"
                  value={newPriorityTitle}
                  onChange={(e) => setNewPriorityTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category Tag:</label>
                  <select
                    value={newPriorityTag}
                    onChange={(e) => setNewPriorityTag(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Designer">Designer</option>
                    <option value="Friend">Friend</option>
                    <option value="Me">Me</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Time Block:</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 - 10:00"
                    value={newPriorityTime}
                    onChange={(e) => setNewPriorityTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPriorityModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
