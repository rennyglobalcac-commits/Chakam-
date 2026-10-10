import React, { useState } from 'react';
import { 
  Settings, Award, ShieldAlert, RotateCcw, Trash2, Calendar, 
  CheckCircle2, AlertTriangle, Flame, Sparkles, Volume2, 
  TrendingUp, BarChart3, User, Phone, Save, Download, 
  Upload, Clock, FileText, ChevronRight, X, HeartHandshake, Eye
} from 'lucide-react';
import { sounds, speakAunty, getRandomAuntyLine } from '../utils/audio';
import { 
  calculatePerformanceMetrics, 
  manualDailyReset, 
  clearAllDemoData,
  getTodayDateString 
} from '../utils/storage';
import PerformanceChart from '../components/PerformanceChart';

export default function SettingsReviewTab({
  state,
  onUpdateState,
  onTriggerDailyReset,
  onClearDemoData
}) {
  const [activeSubTab, setActiveSubTab] = useState('SETTINGS'); // 'SETTINGS' | 'REVIEW' | 'ARCHIVE'
  const [selectedArchiveDay, setSelectedArchiveDay] = useState(null);

  // Form states for profile and partner
  const [userName, setUserName] = useState(state.user?.name || 'Adaeze');
  const [userRole, setUserRole] = useState(state.user?.role || 'Nurse & Fashion Designer');
  const [partnerName, setPartnerName] = useState(state.user?.accountabilityPartner || 'Ada');
  const [partnerPhone, setPartnerPhone] = useState(state.user?.partnerPhone || '+2348031234567');
  const [partnerBank, setPartnerBank] = useState(state.user?.partnerBank || 'GTBank - 0123456789');
  const [strictness, setStrictness] = useState(state.user?.strictnessMode || 'SAVAGE');

  // Performance metrics calculation
  const metrics = calculatePerformanceMetrics(state);

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name: userName.trim(),
        role: userRole.trim(),
        accountabilityPartner: partnerName.trim(),
        partnerPhone: partnerPhone.trim(),
        partnerBank: partnerBank.trim(),
        strictnessMode: strictness
      }
    }));
    sounds.playSuccess();
    speakAunty("Accountability settings updated! No slacking under my watch!");
  };

  // Toggle modes
  const handleToggleClown = () => {
    onUpdateState(prev => ({
      ...prev,
      user: { ...prev.user, clownMode: !prev.user.clownMode }
    }));
  };

  const handleToggleGrayscale = () => {
    onUpdateState(prev => ({
      ...prev,
      user: { ...prev.user, grayscaleMode: !prev.user.grayscaleMode }
    }));
  };

  // Trigger manual daily reset
  const handleManualReset = () => {
    if (window.confirm("Perform daily reset now? This archives today's current to-do tasks to your Review history and gives you a fresh blank to-do list for planning.")) {
      onTriggerDailyReset();
      sounds.playSuccess();
      speakAunty("Daily to-do list reset! Your past tasks are safely archived in Review history!");
    }
  };

  // Clear demo data
  const handleClearDemo = () => {
    if (window.confirm("Clear all demo information? This clears sample tasks, projects, measurements, topics, and expenses so you can enter your own real life data.")) {
      onClearDemoData();
      sounds.playSuccess();
      speakAunty("All demo data cleared! You now have a fresh, pristine canvas for your goals!");
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chakam_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                Accountability Command Center
              </span>
              <h2 className="text-base font-black text-white">Settings & Review</h2>
            </div>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-700/60">
            Score: {metrics.today.score}%
          </span>
        </div>

        {/* 3-Way Sub-Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mt-2">
          <button
            onClick={() => setActiveSubTab('SETTINGS')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'SETTINGS'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSubTab('REVIEW')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'REVIEW'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveSubTab('ARCHIVE')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'ARCHIVE'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            To-Do Archive
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SETTINGS (ACCOUNTABILITY APP STYLE) */}
      {activeSubTab === 'SETTINGS' && (
        <div className="space-y-4">
          
          {/* Quick Actions Card: Reset & Clear */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              Daily Auto-Reset & Data Reset
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                <div>
                  <div className="text-xs font-bold text-white">Daily To-Do Auto-Reset</div>
                  <div className="text-[10px] text-neutral-400">
                    Old tasks are archived for review; daily schedule resets every midnight
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleManualReset}
                  className="flex-1 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset To-Do List Now
                </button>

                <button
                  onClick={handleClearDemo}
                  className="flex-1 py-2.5 px-3 bg-neutral-800 hover:bg-red-950/60 text-red-400 font-bold text-xs rounded-xl border border-red-800/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Demo Data
                </button>
              </div>
            </div>
          </div>

          {/* Profile & Accountability Partner Form */}
          <form onSubmit={handleSaveProfile} className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3.5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Accountability Partner & Stakes (Beeminder / Forfeit Style)
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Your Name:</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Your Role / Calling:</label>
              <input
                type="text"
                required
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <label className="block text-[11px] font-bold text-red-400 mb-1">
                Designated Accountability Partner Name:
              </label>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Ada"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Partner WhatsApp Number (Receives Slacking Confessions):
              </label>
              <input
                type="tel"
                required
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Partner Bank Details (For ₦500 Shame Tax Penalties):
              </label>
              <input
                type="text"
                value={partnerBank}
                onChange={(e) => setPartnerBank(e.target.value)}
                placeholder="Bank Name & Account Number"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                Aunty Strictness Tone:
              </label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="SAVAGE">Nigerian Aunty Savage (Zero Excuses, Fierce Roasts)</option>
                <option value="STANDARD">Standard Accountability (Firm Reminders)</option>
                <option value="GENTLE">Gentle Encouraging (Soft Nudges)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              Save Accountability Settings
            </button>
          </form>

          {/* Visual Stakes & Sound Engine */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Visual Penalty Modes & Aunty Voice
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleToggleClown}
                className={`p-3 rounded-xl border text-left transition-all ${
                  state.user?.clownMode
                    ? 'bg-red-950/60 border-red-500 text-red-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}
              >
                <div className="text-lg mb-1">🤡</div>
                <div className="text-xs font-bold">Clown Mode</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {state.user?.clownMode ? 'Active (Shame)' : 'Disabled'}
                </div>
              </button>

              <button
                type="button"
                onClick={handleToggleGrayscale}
                className={`p-3 rounded-xl border text-left transition-all ${
                  state.user?.grayscaleMode
                    ? 'bg-neutral-800 border-neutral-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}
              >
                <div className="text-lg mb-1">🔘</div>
                <div className="text-xs font-bold">Grayscale Mode</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {state.user?.grayscaleMode ? 'Active (Phone detox)' : 'Disabled'}
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                sounds.playStrike();
                speakAunty(getRandomAuntyLine());
              }}
              className="w-full py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              Test Aunty Audio Voice Roast
            </button>
          </div>

          {/* Backup & Export Data */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              Data Backup & Portability
            </h3>
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Full State JSON Backup
            </button>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: HOW WELL I AM DOING (DAILY & WEEKLY PERFORMANCE) */}
      {activeSubTab === 'REVIEW' && (
        <div className="space-y-4">
          
          {/* Today's Score Card */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                Daily Performance Today
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {getTodayDateString()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${metrics.today.score >= 80 ? 'text-emerald-400' : metrics.today.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {metrics.today.score}%
                </span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase">Score</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white leading-snug">
                  "{metrics.today.feedback}"
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  • Tasks: <span className="text-white font-semibold">{metrics.today.tasksCompleted}/{metrics.today.tasksTotal}</span> completed
                </div>
                <div className="text-[11px] text-neutral-400">
                  • Nursing Topics: <span className="text-white font-semibold">{metrics.today.nursingTopicsCount}</span> summarized
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Component: Daily & Weekly Habits and Tasks Completion Rates */}
          <PerformanceChart metrics={metrics} />

          {/* Weekly Summary Totals */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Weekly Summary Totals
              </span>
              <span className="text-xs font-bold text-cyan-400">
                Avg Score: {metrics.weekly.averageScore}%
              </span>
            </div>

            <p className="text-xs text-neutral-300">
              {metrics.weekly.feedback}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center">
              <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-sm font-black text-rose-400">{metrics.weekly.totalTasksCompleted}</div>
                <div className="text-[9px] text-neutral-400 font-bold uppercase">Tasks Done</div>
              </div>
              <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-sm font-black text-cyan-400">{metrics.weekly.topicsSummarized}</div>
                <div className="text-[9px] text-neutral-400 font-bold uppercase">Topics Studied</div>
              </div>
              <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-sm font-black text-emerald-400">₦{metrics.weekly.totalSpentThisWeek.toLocaleString()}</div>
                <div className="text-[9px] text-neutral-400 font-bold uppercase">Total Spent</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: TO-DO ARCHIVE & PAST DAYS REVIEW */}
      {activeSubTab === 'ARCHIVE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Past Days To-Do Archives ({state.taskHistory?.length || 0})
            </h3>
            <button
              onClick={handleManualReset}
              className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              Archive Today
            </button>
          </div>

          <p className="text-[11px] text-neutral-400">
            Daily to-do tasks are archived each day so you can review what you accomplished and what slipped.
          </p>

          {(!state.taskHistory || state.taskHistory.length === 0) ? (
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
              <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-bold">No past days archived yet.</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Each midnight, today's to-do list automatically archives here for your permanent review.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {state.taskHistory.map((day, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{day.date}</span>
                        <span className="text-[10px] font-black bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                          {day.completedCount}/{day.totalCount} Done
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Accountability Score: <span className="text-emerald-400 font-bold">{day.score}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedArchiveDay(selectedArchiveDay === day ? null : day)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 p-1.5 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {selectedArchiveDay === day ? 'Hide' : 'Review'}
                    </button>
                  </div>

                  {/* Expanded Task Details */}
                  {selectedArchiveDay === day && (
                    <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">
                        Tasks for this day:
                      </span>
                      {day.tasks.length === 0 ? (
                        <span className="text-xs text-neutral-500">No tasks were scheduled.</span>
                      ) : (
                        day.tasks.map((t, tIdx) => (
                          <div 
                            key={tIdx}
                            className="p-2 bg-neutral-950 rounded-lg flex items-center justify-between text-xs"
                          >
                            <span className={t.done ? 'line-through text-neutral-400' : 'text-white'}>
                              {t.done ? '✓' : '✗'} {t.title}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {t.startTime || ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
