import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeTab from './tabs/HomeTab';
import NurseTab from './tabs/NurseTab';
import DesignerTab from './tabs/DesignerTab';
import BudgetTab from './tabs/BudgetTab';
import MeTab from './tabs/MeTab';
import SettingsReviewTab from './tabs/SettingsReviewTab';

// Modals
import AuntyPanicModal from './components/AuntyPanicModal';
import ConsequenceModal from './components/ConsequenceModal';
import DoomScrollModal from './components/DoomScrollModal';
import EveningCheckinModal from './components/EveningCheckinModal';
import AppealsModal from './components/AppealsModal';
import WeeklyReviewModal from './components/WeeklyReviewModal';
import MonthlyDashboardModal from './components/MonthlyDashboardModal';

import { 
  loadState, 
  saveState, 
  calculateScore, 
  manualDailyReset, 
  clearAllDemoData,
  performDailyResetCheck 
} from './utils/storage';
import { sounds, speakAunty } from './utils/audio';

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [currentTab, setCurrentTab] = useState('HOME');

  // Modals state
  const [panicOpen, setPanicOpen] = useState(false);
  const [doomScrollOpen, setDoomScrollOpen] = useState(false);
  const [eveningCheckinOpen, setEveningCheckinOpen] = useState(false);
  const [appealsOpen, setAppealsOpen] = useState(false);
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);
  const [monthlyDashboardOpen, setMonthlyDashboardOpen] = useState(false);

  // Active Consequence Trigger State
  const [consequenceModalOpen, setConsequenceModalOpen] = useState(false);
  const [consequenceTargetTask, setConsequenceTargetTask] = useState(null);

  // Auto-save on state change and check daily reset
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Periodic check if midnight has crossed for daily auto-reset
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => performDailyResetCheck(prev));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const score = calculateScore(state);

  // Handlers for Home Tab
  const handleToggleTask = (taskId) => {
    const updatedTasks = (state.tasks || []).map(t => {
      if (t.id === taskId) {
        const nextDone = !t.done;
        if (nextDone) {
          sounds.playSuccess();
        }
        return { ...t, done: nextDone };
      }
      return t;
    });

    setState(prev => ({ ...prev, tasks: updatedTasks }));
  };

  const handleAddTask = (newTask) => {
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...(prev.tasks || [])]
    }));
  };

  const handleDeleteTask = (taskId) => {
    setState(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== taskId)
    }));
    sounds.playSuccess();
  };

  const handleMoveTask = (taskId) => {
    const target = (state.tasks || []).find(t => t.id === taskId);
    if (!target) return;

    const nextCount = (target.moveCount || 0) + 1;
    const updatedTasks = (state.tasks || []).map(t => {
      if (t.id === taskId) {
        return { ...t, moveCount: nextCount };
      }
      return t;
    });

    if (nextCount >= 3) {
      // Trigger Consequence System!
      sounds.playStrike();
      speakAunty("You moved this task three times! Are you still committed to it? Chakam has caught you!");
      setConsequenceTargetTask({ ...target, moveCount: nextCount });
      setConsequenceModalOpen(true);
    } else {
      sounds.playStrike();
    }

    setState(prev => ({ ...prev, tasks: updatedTasks }));
  };

  const handleTriggerConsequence = (task) => {
    sounds.playStrike();
    setConsequenceTargetTask(task);
    setConsequenceModalOpen(true);
  };

  const handleLockMorningPlan = () => {
    sounds.playSuccess();
    speakAunty("Morning priorities locked in! Go conquer your day without excuses!");
    setState(prev => ({ ...prev, morningPlanLocked: true }));
  };

  const handleAddMorningPriority = (newPriority) => {
    setState(prev => ({
      ...prev,
      morningPriorities: [...(prev.morningPriorities || []), newPriority]
    }));
  };

  const handleDeleteMorningPriority = (priorityId) => {
    setState(prev => ({
      ...prev,
      morningPriorities: (prev.morningPriorities || []).filter(p => p.id !== priorityId)
    }));
  };

  const handleToggleMorningPriority = (priorityId) => {
    setState(prev => ({
      ...prev,
      morningPriorities: (prev.morningPriorities || []).map(p => {
        if (p.id === priorityId) {
          const next = !p.done;
          if (next) sounds.playSuccess();
          return { ...p, done: next };
        }
        return p;
      })
    }));
  };

  // Manual Daily Reset (Archives current tasks to review and clears today)
  const handleManualDailyReset = () => {
    setState(prev => manualDailyReset(prev));
  };

  // Clear all demo data
  const handleClearDemoData = () => {
    setState(prev => clearAllDemoData(prev));
  };

  // Consequence Actions
  const handleDoItNow = (task) => {
    const updatedTasks = (state.tasks || []).map(t => {
      if (t.id === task.id) return { ...t, moveCount: 0 };
      return t;
    });
    setState(prev => ({ ...prev, tasks: updatedTasks }));
    setConsequenceModalOpen(false);
  };

  const handleRescheduleWithPenalty = (task) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        strikeCount: Math.min(5, (prev.user?.strikeCount || 0) + 1),
        currentLevel: Math.min(5, (prev.user?.currentLevel || 1) + 1)
      }
    }));
  };

  const handleDeleteWithPenalty = (task) => {
    setState(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== task.id),
      user: {
        ...prev.user,
        strikeCount: Math.min(5, (prev.user?.strikeCount || 0) + 1),
        currentLevel: Math.min(5, (prev.user?.currentLevel || 1) + 1),
        clownMode: true
      }
    }));
  };

  const handleResolvePunishment = (proofUrl) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        clownMode: false,
        strikeCount: Math.max(0, (prev.user?.strikeCount || 1) - 1)
      },
      punishmentHistory: [
        {
          id: `ph_${Date.now()}`,
          level: prev.user?.currentLevel || 1,
          task: consequenceTargetTask?.title || 'Missed task',
          resolved: true,
          date: new Date().toISOString().split('T')[0],
          proof: proofUrl
        },
        ...(prev.punishmentHistory || [])
      ]
    }));
    setConsequenceModalOpen(false);
  };

  // Mode Toggles
  const handleToggleWorkMode = () => {
    const next = !state.user?.workDayMode;
    if (next) {
      speakAunty("Work Day Mode activated! 9:00 AM to 4:00 PM blocked for clinical shift. Focus on hospital duties!");
    }
    setState(prev => ({
      ...prev,
      user: { ...prev.user, workDayMode: next }
    }));
  };

  const handleToggleVolunteeringMode = () => {
    const next = !state.user?.volunteeringDayMode;
    if (next) {
      speakAunty("Volunteering Day Mode activated! Give your best service to the community!");
    }
    setState(prev => ({
      ...prev,
      user: { ...prev.user, volunteeringDayMode: next }
    }));
  };

  const handleToggleGrayscale = () => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, grayscaleMode: !prev.user?.grayscaleMode }
    }));
  };

  const handleToggleClown = () => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, clownMode: !prev.user?.clownMode }
    }));
  };

  // Appeal Resolution
  const handleResolveAppeal = (approved, reason) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        appealUsedThisWeek: true,
        strikeCount: approved ? Math.max(0, (prev.user?.strikeCount || 0) - 1) : Math.min(5, (prev.user?.strikeCount || 0) + 1),
        currentLevel: approved ? Math.max(1, (prev.user?.currentLevel || 1) - 1) : Math.min(5, (prev.user?.currentLevel || 1) + 1),
        clownMode: !approved
      }
    }));
  };

  // Habit Logging Handlers
  const handleUpdateHabits = (updatedHabits) => {
    setState(prev => ({
      ...prev,
      me: {
        ...prev.me,
        habits: updatedHabits
      }
    }));
  };

  const handleUpdateReading = (updatedReading) => {
    setState(prev => ({
      ...prev,
      me: {
        ...prev.me,
        reading: updatedReading
      }
    }));
  };

  const handleUpdateApartment = (updatedApartment) => {
    setState(prev => ({
      ...prev,
      me: {
        ...prev.me,
        apartment: updatedApartment
      }
    }));
  };

  // Consequence Timer Handlers
  const handleStartConsequenceTimer = (timer) => {
    setState(prev => ({
      ...prev,
      consequenceTimer: timer
    }));
  };

  const handleStopConsequenceTimer = (timer) => {
    setState(prev => ({
      ...prev,
      consequenceTimer: timer
    }));
  };

  const handleCompleteTaskWithTimer = (taskId) => {
    setState(prev => {
      const updatedTasks = (prev.tasks || []).map(t => {
        if (t.id === taskId) {
          return { ...t, done: true };
        }
        return t;
      });
      return {
        ...prev,
        tasks: updatedTasks,
        consequenceTimer: {
          active: false,
          taskId: null,
          taskTitle: '',
          durationSeconds: 15 * 60,
          remainingSeconds: 15 * 60,
          isRunning: false
        }
      };
    });
  };

  const handleExpireConsequenceTimer = (timer) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        strikeCount: Math.min(5, (prev.user?.strikeCount || 0) + 1),
        currentLevel: Math.min(5, (prev.user?.currentLevel || 1) + 1),
        clownMode: true
      },
      consequenceTimer: {
        ...timer,
        active: false,
        isRunning: false
      }
    }));

    const task = (state.tasks || []).find(t => t.id === timer?.taskId) || {
      id: timer?.taskId || 'timed_task',
      title: timer?.taskTitle || 'Consequence Timer Task',
      moveCount: 3
    };
    setConsequenceTargetTask(task);
    setConsequenceModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col ${state.user?.grayscaleMode ? 'grayscale-mode' : ''}`}>
      
      {/* Top Header */}
      <Header
        state={state}
        onToggleWorkMode={handleToggleWorkMode}
        onToggleVolunteeringMode={handleToggleVolunteeringMode}
        onOpenPanic={() => setPanicOpen(true)}
        onOpenDoomScroll={() => setDoomScrollOpen(true)}
        onOpenEveningCheckin={() => setEveningCheckinOpen(true)}
        onOpenAppeals={() => setAppealsOpen(true)}
        onOpenSettings={() => setCurrentTab('SETTINGS_REVIEW')}
        onToggleGrayscale={handleToggleGrayscale}
        onToggleClown={handleToggleClown}
      />

      {/* Main Content Pane */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {currentTab === 'HOME' && (
          <HomeTab
            state={state}
            score={score}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onTriggerConsequence={handleTriggerConsequence}
            onLockMorningPlan={handleLockMorningPlan}
            onAddMorningPriority={handleAddMorningPriority}
            onDeleteMorningPriority={handleDeleteMorningPriority}
            onToggleMorningPriority={handleToggleMorningPriority}
            onManualDailyReset={handleManualDailyReset}
            onNavigateTab={setCurrentTab}
            onUpdateHabits={handleUpdateHabits}
            onUpdateReading={handleUpdateReading}
            onUpdateApartment={handleUpdateApartment}
            onStartConsequenceTimer={handleStartConsequenceTimer}
            onStopConsequenceTimer={handleStopConsequenceTimer}
            onCompleteTaskWithTimer={handleCompleteTaskWithTimer}
            onExpireConsequenceTimer={handleExpireConsequenceTimer}
          />
        )}

        {currentTab === 'NURSE' && (
          <NurseTab
            state={state}
            onUpdateNurse={(updatedNurse) => setState(prev => ({ ...prev, nurse: updatedNurse }))}
          />
        )}

        {currentTab === 'DESIGNER' && (
          <DesignerTab
            state={state}
            onUpdateDesigner={(updatedDesigner) => setState(prev => ({ ...prev, designer: updatedDesigner }))}
          />
        )}

        {currentTab === 'BUDGET' && (
          <BudgetTab
            state={state}
            onUpdateBudget={(updatedBudget) => setState(prev => ({ ...prev, budget: updatedBudget }))}
          />
        )}

        {currentTab === 'ME' && (
          <MeTab
            state={state}
            onUpdateMe={(updatedMe) => setState(prev => ({ ...prev, me: updatedMe }))}
          />
        )}

        {currentTab === 'SETTINGS_REVIEW' && (
          <SettingsReviewTab
            state={state}
            onUpdateState={setState}
            onTriggerDailyReset={handleManualDailyReset}
            onClearDemoData={handleClearDemoData}
          />
        )}
      </main>

      {/* Bottom 6-Tab Navigation (Settings & Review as the last page) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        strikeCount={state.user?.strikeCount || 0}
        activePunishment={state.user?.clownMode || (state.user?.strikeCount || 0) >= 3}
      />

      {/* All Modal Dialogs */}
      <AuntyPanicModal
        isOpen={panicOpen}
        onClose={() => setPanicOpen(false)}
      />

      <ConsequenceModal
        isOpen={consequenceModalOpen}
        onClose={() => setConsequenceModalOpen(false)}
        task={consequenceTargetTask}
        level={state.user?.currentLevel || 1}
        user={state.user}
        onDoItNow={handleDoItNow}
        onReschedule={handleRescheduleWithPenalty}
        onDeleteTask={handleDeleteWithPenalty}
        onResolveProof={handleResolvePunishment}
      />

      <DoomScrollModal
        isOpen={doomScrollOpen}
        onClose={() => setDoomScrollOpen(false)}
        onPreventScroll={() => {
          setState(prev => ({
            ...prev,
            doomScrollLog: [
              { date: new Date().toLocaleString(), prevented: true },
              ...(prev.doomScrollLog || [])
            ]
          }));
        }}
      />

      <EveningCheckinModal
        isOpen={eveningCheckinOpen}
        onClose={() => setEveningCheckinOpen(false)}
        onSaveCheckin={(reason, notes) => {
          setState(prev => ({
            ...prev,
            stopReasons: [
              { date: new Date().toISOString().split('T')[0], reason, notes },
              ...(prev.stopReasons || [])
            ]
          }));
        }}
      />

      <AppealsModal
        isOpen={appealsOpen}
        onClose={() => setAppealsOpen(false)}
        appealUsed={state.user?.appealUsedThisWeek}
        onResolveAppeal={handleResolveAppeal}
      />

      <WeeklyReviewModal
        isOpen={weeklyReviewOpen}
        onClose={() => setWeeklyReviewOpen(false)}
        state={state}
      />

      <MonthlyDashboardModal
        isOpen={monthlyDashboardOpen}
        onClose={() => setMonthlyDashboardOpen(false)}
        state={state}
        score={score}
      />

    </div>
  );
}
