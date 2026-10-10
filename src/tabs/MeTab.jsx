import React, { useState } from 'react';
import { 
  User, DollarSign, Home, BookOpen, CheckSquare, Plus, 
  AlertTriangle, CheckCircle2, ChevronRight, Sparkles, TrendingUp, RotateCcw,
  Edit3, BookPlus, Library, Bookmark, Check, Trash2
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function MeTab({ state, onUpdateMe }) {
  const { me } = state;
  const [activeSection, setActiveSection] = useState('BUDGET'); // 'BUDGET' | 'APARTMENT' | 'READING' | 'HABITS'

  // Expense modal state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expCategory, setExpCategory] = useState('Food and cooking');
  const [expAmount, setExpAmount] = useState(1500);
  const [expDesc, setExpDesc] = useState('');

  // Reading modal states
  const [showLogPages, setShowLogPages] = useState(false);
  const [pagesToAdd, setPagesToAdd] = useState(15);
  const [newNote, setNewNote] = useState('');

  // Edit Book Modal State
  const [showEditBook, setShowEditBook] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editTotalPages, setEditTotalPages] = useState(300);
  const [editCurrentPage, setEditCurrentPage] = useState(0);
  const [editDailyTarget, setEditDailyTarget] = useState(15);
  const [editTargetDate, setEditTargetDate] = useState('2026-11-01');

  // Add Book Modal State
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookTotalPages, setNewBookTotalPages] = useState(250);
  const [newBookDailyTarget, setNewBookDailyTarget] = useState(15);
  const [newBookTargetDate, setNewBookTargetDate] = useState('2026-11-15');
  const [setAsActive, setSetAsActive] = useState(true);

  // Habit modal state
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitStreak, setEditHabitStreak] = useState(0);

  // 1. BUDGET CALCULATIONS
  const totalSpent = me.budget.categories.reduce((acc, c) => acc + c.spent, 0);
  const totalLimit = me.budget.categories.reduce((acc, c) => acc + c.limit, 0);
  const remainingBudget = me.budget.monthlyLimit - totalSpent;
  const isBudgetWarning = totalSpent > me.budget.monthlyLimit * 0.8;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;

    const amount = Number(expAmount);
    const updatedCategories = me.budget.categories.map(cat => {
      if (cat.name === expCategory) {
        const nextSpent = cat.spent + amount;
        if (nextSpent > cat.limit) {
          sounds.playBuzzer();
          speakAunty(`Chakam! You have exceeded your budget for ${cat.name}! Watch your spending!`);
        }
        return { ...cat, spent: nextSpent };
      }
      return cat;
    });

    const newTx = {
      id: `tr_${Date.now()}`,
      category: expCategory,
      amount: amount,
      description: expDesc.trim() || 'Expense item',
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateMe({
      ...me,
      budget: {
        ...me.budget,
        categories: updatedCategories,
        transactions: [newTx, ...me.budget.transactions]
      }
    });

    sounds.playSuccess();
    setExpAmount(1500);
    setExpDesc('');
    setShowAddExpense(false);
  };

  // 2. APARTMENT ACTIONS
  const handleLogNight = (sleptHome) => {
    sounds.playSuccess();
    if (sleptHome) {
      speakAunty("Good girl! Sleeping in your own sanctuary. Rest well!");
      onUpdateMe({
        ...me,
        apartment: {
          ...me.apartment,
          nightsAtHomeCurrent: me.apartment.nightsAtHomeCurrent + 1
        }
      });
    } else {
      sounds.playStrike();
      speakAunty("Sleeping elsewhere again? Are you choosing to stay away, or are you avoiding your own space?");
      onUpdateMe({
        ...me,
        apartment: {
          ...me.apartment,
          nightsAwayCurrent: me.apartment.nightsAwayCurrent + 1
        }
      });
    }
  };

  const handleToggleApartmentChecklist = (id) => {
    const updatedChecklist = me.apartment.checklist.map(item => {
      if (item.id === id) return { ...item, done: !item.done };
      return item;
    });
    onUpdateMe({
      ...me,
      apartment: { ...me.apartment, checklist: updatedChecklist }
    });
    sounds.playSuccess();
  };

  // 3. READING ACTIONS
  const handleLogPages = (e) => {
    e.preventDefault();
    const curBook = me.reading.currentBook;
    const nextCurrent = Math.min(curBook.totalPages, curBook.currentPage + Number(pagesToAdd));
    const nextToday = curBook.pagesReadToday + Number(pagesToAdd);
    const updatedNotes = newNote.trim() ? [newNote.trim(), ...curBook.notes] : curBook.notes;

    sounds.playSuccess();
    if (nextCurrent >= curBook.totalPages) {
      speakAunty("Chakam! Book finished! Nonfiction scholar! Aunty is proud!");
    } else {
      speakAunty(`Logged ${pagesToAdd} pages read! Knowledge is wealth!`);
    }

    onUpdateMe({
      ...me,
      reading: {
        ...me.reading,
        currentBook: {
          ...curBook,
          currentPage: nextCurrent,
          pagesReadToday: nextToday,
          notes: updatedNotes
        }
      }
    });
    setNewNote('');
    setShowLogPages(false);
  };

  // Open Edit Book Modal
  const handleOpenEditBook = () => {
    const curBook = me.reading.currentBook;
    setEditTitle(curBook.title);
    setEditAuthor(curBook.author);
    setEditTotalPages(curBook.totalPages);
    setEditCurrentPage(curBook.currentPage);
    setEditDailyTarget(curBook.dailyTarget);
    setEditTargetDate(curBook.targetFinishDate || '2026-10-25');
    setShowEditBook(true);
  };

  // Save Edited Book
  const handleSaveEditBook = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const curBook = me.reading.currentBook;
    const updatedBook = {
      ...curBook,
      title: editTitle.trim(),
      author: editAuthor.trim() || 'Author',
      totalPages: Math.max(1, Number(editTotalPages)),
      currentPage: Math.min(Number(editTotalPages), Math.max(0, Number(editCurrentPage))),
      dailyTarget: Math.max(1, Number(editDailyTarget)),
      targetFinishDate: editTargetDate
    };

    onUpdateMe({
      ...me,
      reading: {
        ...me.reading,
        currentBook: updatedBook
      }
    });

    sounds.playSuccess();
    speakAunty(`Book details for "${editTitle}" updated! Keep reading!`);
    setShowEditBook(false);
  };

  // Add New Book
  const handleAddNewBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook = {
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'Author',
      totalPages: Math.max(1, Number(newBookTotalPages)),
      currentPage: 0,
      dailyTarget: Math.max(1, Number(newBookDailyTarget)),
      pagesReadToday: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetFinishDate: newBookTargetDate,
      notes: []
    };

    let updatedCurrent = me.reading.currentBook;
    let updatedCompleted = me.reading.completedBooks || [];

    if (setAsActive) {
      if (me.reading.currentBook) {
        updatedCompleted = [
          {
            title: me.reading.currentBook.title,
            author: me.reading.currentBook.author,
            finishedDate: new Date().toISOString().split('T')[0],
            totalPages: me.reading.currentBook.totalPages,
            notes: me.reading.currentBook.notes || []
          },
          ...updatedCompleted
        ];
      }
      updatedCurrent = newBook;
      speakAunty(`New active book set: "${newBook.title}"! Stand up and read!`);
    } else {
      updatedCompleted = [
        {
          title: newBook.title,
          author: newBook.author,
          finishedDate: 'Queued',
          totalPages: newBook.totalPages,
          notes: []
        },
        ...updatedCompleted
      ];
      speakAunty(`Added "${newBook.title}" to reading queue!`);
    }

    onUpdateMe({
      ...me,
      reading: {
        ...me.reading,
        currentBook: updatedCurrent,
        completedBooks: updatedCompleted
      }
    });

    sounds.playSuccess();
    setNewBookTitle('');
    setNewBookAuthor('');
    setShowAddBook(false);
  };

  // Switch Active Book
  const handleSwitchToBook = (book) => {
    const current = me.reading.currentBook;
    const newActive = {
      title: book.title,
      author: book.author,
      totalPages: book.totalPages || 300,
      currentPage: 0,
      dailyTarget: 15,
      pagesReadToday: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetFinishDate: '2026-11-30',
      notes: book.notes || []
    };

    const remainingCompleted = (me.reading.completedBooks || []).filter(b => b.title !== book.title);
    if (current) {
      remainingCompleted.unshift({
        title: current.title,
        author: current.author,
        finishedDate: new Date().toISOString().split('T')[0],
        totalPages: current.totalPages,
        notes: current.notes || []
      });
    }

    onUpdateMe({
      ...me,
      reading: {
        ...me.reading,
        currentBook: newActive,
        completedBooks: remainingCompleted
      }
    });

    sounds.playSuccess();
    speakAunty(`Switched active book to "${book.title}"!`);
  };

  // 4. HABIT ACTIONS
  const handleToggleHabit = (id) => {
    sounds.playSuccess();
    const updated = me.habits.map(h => {
      if (h.id === id) {
        const nextDone = !h.completedToday;
        return {
          ...h,
          completedToday: nextDone,
          streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    });
    onUpdateMe({ ...me, habits: updated });
  };

  const handleRecoverHabit = (id) => {
    sounds.playSuccess();
    speakAunty("Missed-day recovery approved! Streak protected! Do not slack again!");
    const updated = me.habits.map(h => {
      if (h.id === id) {
        return { ...h, completedToday: true, streak: h.streak + 1 };
      }
      return h;
    });
    onUpdateMe({ ...me, habits: updated });
  };

  const handleAddNewHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newH = {
      id: `h_${Date.now()}`,
      name: newHabitName.trim(),
      streak: 1,
      completedToday: true,
      history: [true, false, false, false, false, false, false]
    };
    onUpdateMe({
      ...me,
      habits: [...me.habits, newH]
    });
    sounds.playSuccess();
    speakAunty(`New daily habit added: "${newHabitName.trim()}"! Be consistent!`);
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const handleOpenEditHabit = (habit) => {
    setSelectedHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditHabitStreak(habit.streak);
    setShowEditHabit(true);
  };

  const handleSaveEditHabit = (e) => {
    e.preventDefault();
    if (!editHabitName.trim()) return;
    const updated = me.habits.map(h => {
      if (h.id === selectedHabitId) {
        return {
          ...h,
          name: editHabitName.trim(),
          streak: Math.max(0, Number(editHabitStreak))
        };
      }
      return h;
    });
    onUpdateMe({ ...me, habits: updated });
    sounds.playSuccess();
    speakAunty("Habit updated! Stay committed!");
    setShowEditHabit(false);
  };

  const handleDeleteHabit = (id) => {
    if (me.habits.length <= 1) {
      alert("You need at least one active habit!");
      return;
    }
    const updated = me.habits.filter(h => h.id !== id);
    onUpdateMe({ ...me, habits: updated });
    sounds.playStrike();
    setShowEditHabit(false);
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* ME Tab Top Navigation */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-2 grid grid-cols-4 gap-1">
        {[
          { id: 'BUDGET', label: '₦50k Budget', icon: DollarSign },
          { id: 'APARTMENT', label: 'Stay Home', icon: Home },
          { id: 'READING', label: 'Reading', icon: BookOpen },
          { id: 'HABITS', label: 'Habits', icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all ${
                isActive 
                  ? 'bg-red-600 text-white shadow-md shadow-red-950' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ₦50,000 BUDGET TRACKER */}
      {activeSection === 'BUDGET' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Monthly Allocation</span>
                <h3 className="text-2xl font-black text-white">₦50,000</h3>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-950 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Expense
              </button>
            </div>

            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-neutral-800">
              <div>
                <span className="text-neutral-500 block text-[10px]">Total Spent:</span>
                <span className="font-bold text-red-400">₦{totalSpent.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[10px]">Remaining:</span>
                <span className="font-bold text-emerald-400">₦{remainingBudget.toLocaleString()}</span>
              </div>
            </div>

            {isBudgetWarning && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Warning: You have spent over 80% of your ₦50,000 limit!
              </div>
            )}
          </div>

          {/* Category Breakdown Table */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Category Spending & Weekly Caps
            </h4>

            <div className="space-y-2.5">
              {me.budget.categories.map((cat) => {
                const pct = Math.min(100, Math.round((cat.spent / cat.limit) * 100));
                const isOver80 = pct >= 80;
                return (
                  <div key={cat.id} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{cat.name}</span>
                      <span className="font-mono text-neutral-400">
                        ₦{cat.spent.toLocaleString()} / <span className="text-neutral-500">₦{cat.limit.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isOver80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {isOver80 && (
                      <p className="text-[10px] font-bold text-red-400">
                        ⚠️ {pct}% used! Limit nearly reached!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: APARTMENT TRACKER ("STAY HOME" GOAL) */}
      {activeSection === 'APARTMENT' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Monthly "Stay Home" Goal</span>
                <h3 className="text-xl font-black text-white">
                  {me.apartment.nightsAtHomeCurrent} / {me.apartment.targetNightsAtHome} Nights at Home
                </h3>
              </div>
              <span className="text-3xl">🏡</span>
            </div>

            <p className="text-xs text-neutral-400">
              Nights away this month: <strong className="text-red-400">{me.apartment.nightsAwayCurrent} nights</strong>
            </p>

            {/* Stay Home / Away Logging Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleLogNight(true)}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                ✓ Slept at Home Tonight
              </button>
              <button
                onClick={() => handleLogNight(false)}
                className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Slept Elsewhere
              </button>
            </div>

            {me.apartment.nightsAwayCurrent >= 4 && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200">
                <span className="font-black text-red-400 block mb-0.5">Aunty Chakam's Question:</span>
                "Are you choosing to stay away, or are you avoiding your own space? Clean your sanctuary and stay home!"
              </div>
            )}
          </div>

          {/* Apartment Reset Checklist */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Apartment Reset & Sanitation Routine
            </h4>
            <div className="space-y-2">
              {me.apartment.checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggleApartmentChecklist(item.id)}
                  className="w-full p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-left flex items-center justify-between text-xs"
                >
                  <span className={`font-semibold ${item.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.done ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                    {item.done ? 'Done ✓' : 'Pending'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: READING TRACKER (NONFICTION) */}
      {activeSection === 'READING' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            {!me.reading?.currentBook?.title ? (
              <div className="text-center py-6 space-y-2">
                <BookOpen className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="text-xs font-bold text-neutral-300">No Active Book Selected</h4>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  Set the nonfiction or nursing book you are currently reading to track your daily pages and finish target.
                </p>
                <button
                  onClick={() => setShowAddBook(true)}
                  className="mt-2 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <BookPlus className="w-3.5 h-3.5" />
                  + Set Current Book
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Current Book</span>
                    <h3 className="text-base font-black text-white">{me.reading.currentBook.title}</h3>
                    <p className="text-xs text-neutral-400">By {me.reading.currentBook.author || 'Author'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={handleOpenEditBook}
                      className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold rounded-xl border border-neutral-700 flex items-center gap-1 active:scale-95 transition-all"
                      title="Edit book details, pages, or goal"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowAddBook(true)}
                      className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold rounded-xl border border-neutral-700 flex items-center gap-1 active:scale-95 transition-all"
                      title="Add a new book"
                    >
                      <BookPlus className="w-3.5 h-3.5 text-cyan-400" />
                      Add Book
                    </button>
                    <button
                      onClick={() => setShowLogPages(true)}
                      className="py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-950 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Log Pages
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">
                      {me.reading.currentBook.currentPage || 0} of {me.reading.currentBook.totalPages || 0} pages
                    </span>
                    <span className="font-bold text-cyan-400">
                      {me.reading.currentBook.totalPages > 0 
                        ? Math.round(((me.reading.currentBook.currentPage || 0) / me.reading.currentBook.totalPages) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                    <div 
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ 
                        width: `${me.reading.currentBook.totalPages > 0 
                          ? Math.min(100, Math.round(((me.reading.currentBook.currentPage || 0) / me.reading.currentBook.totalPages) * 100)) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-300 block mb-0.5">Daily Pace Target:</span>
                    <p className="text-neutral-400">
                      Target: {me.reading.currentBook.dailyTarget || 15} pages • Read today: <strong className="text-cyan-400">{me.reading.currentBook.pagesReadToday || 0} pages</strong>
                    </p>
                  </div>
                  {me.reading.currentBook.targetFinishDate && (
                    <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                      Target: {me.reading.currentBook.targetFinishDate}
                    </span>
                  )}
                </div>

                {/* Notes & Key Lessons */}
                <div>
                  <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Key Lessons & Notes:
                  </h5>
                  <div className="space-y-1.5">
                    {(me.reading.currentBook.notes || []).map((note, idx) => (
                      <div key={idx} className="p-2 bg-neutral-950 rounded-lg text-xs text-neutral-300 italic border border-neutral-800">
                        "{note}"
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reading Library & History */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Library className="w-4 h-4 text-cyan-400" />
                Reading Library & Queued Books
              </h4>
              <button
                onClick={() => setShowAddBook(true)}
                className="text-[11px] font-bold text-cyan-400 hover:underline"
              >
                + Add Another
              </button>
            </div>

            {me.reading.completedBooks && me.reading.completedBooks.length > 0 ? (
              <div className="space-y-2">
                {me.reading.completedBooks.map((book, idx) => (
                  <div key={idx} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{book.title}</p>
                      <p className="text-[10px] text-neutral-400">By {book.author || 'Author'} • {book.totalPages || 300} pages</p>
                      {book.finishedDate && (
                        <span className="text-[9px] text-emerald-400 font-mono">
                          Status: {book.finishedDate}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSwitchToBook(book)}
                      className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 hover:text-white rounded-lg text-[11px] font-bold border border-neutral-700 active:scale-95 transition-all"
                    >
                      Make Active
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic text-center py-2">
                No archived books yet. Tap "+ Add Book" to build your reading list!
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: HABIT TRACKER */}
      {activeSection === 'HABITS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Active Daily Habits
              </h4>
              <span className="text-[10px] text-neutral-400">{me.habits.length} habits tracked • Tap circle to complete</span>
            </div>
            <button
              onClick={() => setShowAddHabit(true)}
              className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Habit
            </button>
          </div>

          <div className="space-y-2.5">
            {me.habits.map((habit) => (
              <div key={habit.id} className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-600 hover:border-emerald-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-bold text-white ${habit.completedToday ? 'line-through text-neutral-400' : ''}`}>
                        {habit.name}
                      </p>
                      <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        🔥 {habit.streak} Day Streak
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditHabit(habit)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                      title="Edit Habit Details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    {!habit.completedToday && (
                      <button
                        onClick={() => handleRecoverHabit(habit.id)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800 flex items-center gap-1"
                        title="Missed day recovery"
                      >
                        <RotateCcw className="w-3 h-3" /> Recover
                      </button>
                    )}
                  </div>
                </div>

                {/* 7-day history dots */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800/60">
                  <span className="text-[9px] text-neutral-500 font-bold mr-1">7-Day:</span>
                  {habit.history?.map((done, idx) => (
                    <span 
                      key={idx}
                      className={`w-2 h-2 rounded-full ${done ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Log Expense (₦50k Cap)</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  {me.budget.categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Amount (₦):</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Description:</label>
                <input
                  type="text"
                  placeholder="E.g. Foodstuff, sewing thread, transport..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG PAGES MODAL */}
      {showLogPages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Log Nonfiction Reading</h3>
            <form onSubmit={handleLogPages} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Pages Read Just Now:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={pagesToAdd}
                  onChange={(e) => setPagesToAdd(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Key Insight / Lesson:</label>
                <textarea
                  placeholder="What key lesson did you learn?..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogPages(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CURRENT BOOK MODAL */}
      {showEditBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Edit Book Details
            </h3>
            <form onSubmit={handleSaveEditBook} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Book Title:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Author:</label>
                <input
                  type="text"
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Current Page:</label>
                  <input
                    type="number"
                    min="0"
                    value={editCurrentPage}
                    onChange={(e) => setEditCurrentPage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Total Pages:</label>
                  <input
                    type="number"
                    min="1"
                    value={editTotalPages}
                    onChange={(e) => setEditTotalPages(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Daily Target (Pages):</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={editDailyTarget}
                    onChange={(e) => setEditDailyTarget(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Finish Target Date:</label>
                  <input
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditBook(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-md shadow-amber-950"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW BOOK MODAL */}
      {showAddBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3 flex items-center gap-1.5">
              <BookPlus className="w-4 h-4 text-cyan-400" />
              Add Book to Reading List
            </h3>
            <form onSubmit={handleAddNewBook} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Book Title:</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. The Psychology of Money, Deep Work..."
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Author:</label>
                <input
                  type="text"
                  required
                  placeholder="Author name..."
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Total Pages:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBookTotalPages}
                    onChange={(e) => setNewBookTotalPages(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Daily Target (Pages):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newBookDailyTarget}
                    onChange={(e) => setNewBookDailyTarget(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Target Completion Date:</label>
                <input
                  type="date"
                  value={newBookTargetDate}
                  onChange={(e) => setNewBookTargetDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Set as Active Reading Book</span>
                  <span className="text-[10px] text-neutral-500">Replaces current book and archives it</span>
                </div>
                <input
                  type="checkbox"
                  checked={setAsActive}
                  onChange={(e) => setSetAsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-neutral-900 border-neutral-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBook(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl shadow-md shadow-cyan-950"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW HABIT MODAL */}
      {showAddHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Daily Habit
            </h3>
            <form onSubmit={handleAddNewHabit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Habit Name:</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Drink 2.5L Water, Morning Skincare, 10m Scripture..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-950"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HABIT MODAL */}
      {showEditHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Habit
              </h3>
              <button
                type="button"
                onClick={() => handleDeleteHabit(selectedHabitId)}
                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                title="Delete Habit"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>

            <form onSubmit={handleSaveEditHabit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Habit Name:</label>
                <input
                  type="text"
                  required
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Current Streak (Days):</label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={editHabitStreak}
                  onChange={(e) => setEditHabitStreak(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditHabit(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-md shadow-amber-950"
                >
                  Update Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
