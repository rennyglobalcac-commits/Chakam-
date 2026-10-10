import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, Clock, CheckCircle2, Play, Pause, RotateCcw, 
  Plus, ExternalLink, Award, FileText, HeartHandshake, Sparkles,
  BookOpen, Edit3, Trash2, Mic, MicOff, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function NurseTab({ state, onUpdateNurse }) {
  const nurse = state.nurse || {
    goals: [],
    readingTopics: [],
    applications: [],
    volunteering: [],
    studySessionsToday: 0,
    focusMinutesToday: 0
  };

  // 45-min study timer
  const [activeTimerSec, setActiveTimerSec] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [studySubject, setStudySubject] = useState('Clinical Protocols & Questions');

  // Topics to Read & Summaries Modal States
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState('Clinical Practice');
  const [newTopicPages, setNewTopicPages] = useState('');
  const [newTopicDate, setNewTopicDate] = useState(new Date().toISOString().split('T')[0]);

  // Summary Editor Modal State
  const [activeTopicForSummary, setActiveTopicForSummary] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [summaryTakeaways, setSummaryTakeaways] = useState('');
  const [isRecordingSummary, setIsRecordingSummary] = useState(false);
  const recognitionRef = useRef(null);

  // Expanded topic view state
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Other section modals
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('2026-11-30');

  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppDeadline, setNewAppDeadline] = useState('2026-11-15');
  const [newAppNotes, setNewAppNotes] = useState('');

  const [showAddVolModal, setShowAddVolModal] = useState(false);
  const [newVolOrg, setNewVolOrg] = useState('');
  const [newVolHours, setNewVolHours] = useState(3);
  const [newVolNotes, setNewVolNotes] = useState('');

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && activeTimerSec > 0) {
      interval = setInterval(() => {
        setActiveTimerSec(sec => sec - 1);
      }, 1000);
    } else if (activeTimerSec === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sounds.playSuccess();
      speakAunty("Time is up! 45-minute nursing focus session completed! Well done, future Chief Nurse!");
      onUpdateNurse({
        ...nurse,
        studySessionsToday: (nurse.studySessionsToday || 0) + 1,
        focusMinutesToday: (nurse.focusMinutesToday || 0) + 45
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerSec]);

  const toggleTimer = () => {
    if (!isTimerRunning) {
      sounds.playSuccess();
      speakAunty("Study session started! No WhatsApp! No phone! Focus!");
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setActiveTimerSec(45 * 60);
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Add Topic to Read Handler
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic = {
      id: `topic_${Date.now()}`,
      topic: newTopicTitle.trim(),
      subject: newTopicSubject.trim() || 'General Clinical',
      targetPages: newTopicPages.trim() || 'Key chapters',
      targetDate: newTopicDate || new Date().toISOString().split('T')[0],
      status: 'Planned', // 'Planned' | 'Read' | 'Summarized'
      dateRead: null,
      summary: '',
      keyTakeaways: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    onUpdateNurse({
      ...nurse,
      readingTopics: [newTopic, ...(nurse.readingTopics || [])]
    });

    sounds.playSuccess();
    setNewTopicTitle('');
    setNewTopicPages('');
    setShowAddTopicModal(false);
  };

  // Open Summary Editor for a Topic
  const handleOpenSummaryEditor = (topic) => {
    setActiveTopicForSummary(topic);
    setSummaryText(topic.summary || '');
    setSummaryTakeaways((topic.keyTakeaways || []).join('\n'));
  };

  // Save Summary Handler
  const handleSaveSummary = (e) => {
    e.preventDefault();
    if (!activeTopicForSummary) return;

    const takeawaysArray = summaryTakeaways
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updatedTopics = (nurse.readingTopics || []).map(t => {
      if (t.id === activeTopicForSummary.id) {
        return {
          ...t,
          status: 'Summarized',
          dateRead: new Date().toISOString().split('T')[0],
          summary: summaryText.trim(),
          keyTakeaways: takeawaysArray
        };
      }
      return t;
    });

    onUpdateNurse({
      ...nurse,
      readingTopics: updatedTopics
    });

    sounds.playSuccess();
    speakAunty("Summary saved! Excellent retention! That is how leaders study!");
    setActiveTopicForSummary(null);
  };

  // Voice dictation for summary
  const startRecordingSummary = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setSummaryText(prev => `${prev} ${transcript.trim()}`.trim());
      };

      recognition.onerror = () => setIsRecordingSummary(false);
      recognition.onend = () => setIsRecordingSummary(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecordingSummary(true);
      sounds.playSuccess();
    } catch (e) {
      console.warn("Could not start speech recognition", e);
    }
  };

  const stopRecordingSummary = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecordingSummary(false);
    sounds.playSuccess();
  };

  // Delete Topic
  const handleDeleteTopic = (topicId) => {
    onUpdateNurse({
      ...nurse,
      readingTopics: (nurse.readingTopics || []).filter(t => t.id !== topicId)
    });
    sounds.playSuccess();
  };

  // Add Goal Handler
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newG = {
      id: `ng_${Date.now()}`,
      title: newGoalTitle.trim(),
      targetDate: newGoalTargetDate,
      progress: 0,
      steps: ['Read clinical protocol', 'Practice questions', 'Review rationale']
    };
    onUpdateNurse({
      ...nurse,
      goals: [newG, ...(nurse.goals || [])]
    });
    setNewGoalTitle('');
    setShowAddGoalModal(false);
    sounds.playSuccess();
  };

  // Add Application Handler
  const handleAddApplication = (e) => {
    e.preventDefault();
    if (!newAppTitle.trim()) return;
    const newApp = {
      id: `na_${Date.now()}`,
      title: newAppTitle.trim(),
      deadline: newAppDeadline,
      status: 'Planning',
      notes: newAppNotes.trim() || 'Required documents gathered'
    };
    onUpdateNurse({
      ...nurse,
      applications: [newApp, ...(nurse.applications || [])]
    });
    setNewAppTitle('');
    setNewAppNotes('');
    setShowAddAppModal(false);
    sounds.playSuccess();
  };

  // Add Volunteering Handler
  const handleAddVolunteering = (e) => {
    e.preventDefault();
    if (!newVolOrg.trim()) return;
    const newV = {
      id: `nv_${Date.now()}`,
      title: newVolOrg.trim(),
      date: new Date().toISOString().split('T')[0],
      hours: Number(newVolHours),
      location: 'Community Center',
      notes: newVolNotes.trim() || 'Healthcare outreach'
    };
    onUpdateNurse({
      ...nurse,
      volunteering: [newV, ...(nurse.volunteering || [])]
    });
    setNewVolOrg('');
    setNewVolNotes('');
    setShowAddVolModal(false);
    sounds.playSuccess();
  };

  const readingTopics = nurse.readingTopics || [];
  const summarizedCount = readingTopics.filter(t => t.status === 'Summarized').length;

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-cyan-950/60 via-neutral-900 to-neutral-950 border border-cyan-800/40 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Healthcare Career & Study
              </span>
              <h2 className="text-base font-black text-white">Nursing Hub</h2>
            </div>
          </div>
          <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/60">
            {summarizedCount}/{readingTopics.length} Summaries
          </span>
        </div>

        {/* 45-Min Focus Study Timer */}
        <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Clinical Focus Timer (45m)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Today: {nurse.focusMinutesToday || 0} mins
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-black font-mono text-cyan-400">
              {formatTimer(activeTimerSec)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${
                  isTimerRunning 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={resetTimer}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg active:scale-90"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOPICS TO READ & STUDY SUMMARIES SECTION (USER REQUIREMENT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Topics to Read & Summaries ({readingTopics.length})
            </h3>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Plan topics to study, then write your detailed summaries after reading
            </span>
          </div>
          <button
            onClick={() => setShowAddTopicModal(true)}
            className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Topic
          </button>
        </div>

        {readingTopics.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
            <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400 font-bold">No study topics added yet.</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Add topics you plan to read, then capture your clinical summaries and takeaways.
            </p>
            <button
              onClick={() => setShowAddTopicModal(true)}
              className="mt-3 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl hover:bg-cyan-500/20 active:scale-95"
            >
              + Add First Study Topic
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {readingTopics.map((topic) => {
              const isSummarized = topic.status === 'Summarized';
              const isExpanded = expandedTopicId === topic.id;

              return (
                <div 
                  key={topic.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSummarized 
                      ? 'bg-neutral-900/90 border-cyan-900/50 hover:border-cyan-700/50' 
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          {topic.subject}
                        </span>
                        {isSummarized ? (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Summarized
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Planned to Read
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{topic.topic}</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Pages: <span className="text-neutral-300">{topic.targetPages}</span> • Target: <span className="text-neutral-300">{topic.targetDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenSummaryEditor(topic)}
                        className={`text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all ${
                          isSummarized
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-800/40'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        {isSummarized ? 'Edit Summary' : 'Write Summary'}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 active:scale-90"
                        title="Delete topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Card Preview if available */}
                  {isSummarized && topic.summary && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-cyan-400 hover:text-cyan-300 mb-1"
                      >
                        <span>Clinical Summary & Key Takeaways</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300 text-xs space-y-2 mt-1.5">
                          <p className="leading-relaxed whitespace-pre-wrap">{topic.summary}</p>

                          {topic.keyTakeaways && topic.keyTakeaways.length > 0 && (
                            <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide block">
                                Key Clinical Points:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-300">
                                {topic.keyTakeaways.map((point, idx) => (
                                  <li key={idx}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-[10px] text-neutral-500 text-right pt-1">
                            Read on: {topic.dateRead}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Career Goals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            Career Goals ({nurse.goals?.length || 0})
          </h3>
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            Add Goal
          </button>
        </div>

        {(!nurse.goals || nurse.goals.length === 0) ? (
          <div className="p-4 rounded-xl bg-neutral-900 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
            No goals listed. Tap "Add Goal" to create your nursing target.
          </div>
        ) : (
          <div className="space-y-2">
            {nurse.goals.map((g) => (
              <div key={g.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{g.title}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Target: {g.targetDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Clinical Applications & Volunteering */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Applications
            </span>
            <button
              onClick={() => setShowAddAppModal(true)}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10 rounded"
              title="Add Application"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-sm font-black text-cyan-300">
            {nurse.applications?.length || 0} In Progress
          </div>
        </div>

        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
              Outreach
            </span>
            <button
              onClick={() => setShowAddVolModal(true)}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10 rounded"
              title="Add Outreach"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-sm font-black text-cyan-300">
            {nurse.volunteering?.length || 0} Outreaches
          </div>
        </div>
      </div>

      {/* Modal: Add Topic */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Add Nursing Study Topic
            </h3>

            <form onSubmit={handleAddTopic} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Topic Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sepsis Protocol & IV Resuscitation"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Subject / Field:</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Care, Pharmacology, Paediatrics"
                  value={newTopicSubject}
                  onChange={(e) => setNewTopicSubject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Chapters / Pages:</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 (pages 45-62)"
                  value={newTopicPages}
                  onChange={(e) => setNewTopicPages(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Target Reading Date:</label>
                <input
                  type="date"
                  value={newTopicDate}
                  onChange={(e) => setNewTopicDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Write / Edit Summary */}
      {activeTopicForSummary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Post-Reading Reflection & Retention
              </span>
              <h3 className="text-sm font-black text-white mt-0.5">
                Summary: {activeTopicForSummary.topic}
              </h3>
            </div>

            <form onSubmit={handleSaveSummary} className="space-y-3.5">
              {/* Audio Dictation Assist */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-medium">Dictate your summary:</span>
                {!isRecordingSummary ? (
                  <button
                    type="button"
                    onClick={startRecordingSummary}
                    className="py-1 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95"
                  >
                    <Mic className="w-3 h-3" />
                    Speak
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingSummary}
                    className="py-1 px-2.5 bg-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 animate-pulse"
                  >
                    <MicOff className="w-3 h-3" />
                    Stop Mic
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Summary & Clinical Core Concepts:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what you read in your own words, clinical rationale, disease presentation, and nursing interventions..."
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Key Takeaways (One point per line):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Always check BP before administering vasodilators&#10;Assess urine output hourly (>0.5ml/kg/hr)"
                  value={summaryTakeaways}
                  onChange={(e) => setSummaryTakeaways(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTopicForSummary(null)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              Add Nursing Goal
            </h3>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Goal:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pass UK NMC CBT with distinction"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Target Date:</label>
                <input
                  type="date"
                  value={newGoalTargetDate}
                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Application */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Add Clinical Application
            </h3>
            <form onSubmit={handleAddApplication} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Program / Hospital:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teaching Hospital Clinical Fellowship"
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Deadline:</label>
                <input
                  type="date"
                  value={newAppDeadline}
                  onChange={(e) => setNewAppDeadline(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Outreach */}
      {showAddVolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              Add Outreach Service
            </h3>
            <form onSubmit={handleAddVolunteering} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Organization / Event:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Health Screening Outreach"
                  value={newVolOrg}
                  onChange={(e) => setNewVolOrg(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Hours Served:</label>
                <input
                  type="number"
                  min="1"
                  value={newVolHours}
                  onChange={(e) => setNewVolHours(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVolModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Outreach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
