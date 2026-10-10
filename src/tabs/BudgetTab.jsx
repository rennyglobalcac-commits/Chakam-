import React, { useState } from 'react';
import { 
  DollarSign, Plus, AlertTriangle, TrendingUp, TrendingDown, 
  Trash2, Edit3, CheckCircle2, Sparkles, PieChart, Calendar, 
  ArrowUpRight, ShieldCheck, Tag, Receipt
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function BudgetTab({ state, onUpdateBudget }) {
  const budget = state.budget || {
    monthlyLimit: 50000,
    categories: [],
    transactions: []
  };

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState(budget.categories[0]?.name || 'Food and cooking');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');

  const [showEditCap, setShowEditCap] = useState(false);
  const [editCapAmount, setEditCapAmount] = useState(budget.monthlyLimit);

  // Financial calculations
  const totalSpent = (budget.categories || []).reduce((acc, c) => acc + (c.spent || 0), 0);
  const monthlyLimit = budget.monthlyLimit || 50000;
  const remainingBudget = monthlyLimit - totalSpent;
  const spentPercentage = Math.round((totalSpent / monthlyLimit) * 100);

  // Days left in current month for daily allowance
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const dailyAllowance = Math.max(0, Math.round(remainingBudget / daysRemaining));

  // Handle Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = Number(expAmount);
    if (!amount || amount <= 0) return;

    const updatedCategories = budget.categories.map(cat => {
      if (cat.name === expCategory) {
        const nextSpent = (cat.spent || 0) + amount;
        if (nextSpent > cat.limit) {
          sounds.playBuzzer();
          speakAunty(`Chakam! You exceeded your ${cat.name} budget limit of ₦${cat.limit.toLocaleString()}! Watch your spending!`);
        }
        return { ...cat, spent: nextSpent };
      }
      return cat;
    });

    const newTx = {
      id: `tx_${Date.now()}`,
      category: expCategory,
      amount: amount,
      description: expDesc.trim() || 'Expense',
      date: expDate || new Date().toISOString().split('T')[0]
    };

    onUpdateBudget({
      ...budget,
      categories: updatedCategories,
      transactions: [newTx, ...(budget.transactions || [])]
    });

    sounds.playSuccess();
    setExpAmount('');
    setExpDesc('');
    setShowAddExpense(false);
  };

  // Handle Add Custom Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const limit = Number(newCatLimit) || 3000;

    const newCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      limit: limit,
      spent: 0
    };

    onUpdateBudget({
      ...budget,
      categories: [...budget.categories, newCategory]
    });

    sounds.playSuccess();
    setNewCatName('');
    setNewCatLimit('');
    setShowAddCategory(false);
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (txId) => {
    const tx = budget.transactions.find(t => t.id === txId);
    if (!tx) return;

    // Refund the spent amount from category
    const updatedCategories = budget.categories.map(c => {
      if (c.name === tx.category) {
        return { ...c, spent: Math.max(0, (c.spent || 0) - tx.amount) };
      }
      return c;
    });

    onUpdateBudget({
      ...budget,
      categories: updatedCategories,
      transactions: budget.transactions.filter(t => t.id !== txId)
    });
    sounds.playSuccess();
  };

  // Handle update monthly cap
  const handleSaveMonthlyCap = (e) => {
    e.preventDefault();
    const newCap = Number(editCapAmount);
    if (!newCap || newCap < 1000) return;
    onUpdateBudget({
      ...budget,
      monthlyLimit: newCap
    });
    setShowEditCap(false);
    sounds.playSuccess();
    speakAunty(`Monthly budget set to ₦${newCap.toLocaleString()}. Stick to it!`);
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* 1. Header Banner & Monthly Cap */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-950 border border-emerald-800/40 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Personal Finance & Discipline
              </span>
              <h2 className="text-base font-black text-white">Dedicated Budgeting</h2>
            </div>
          </div>
          <button
            onClick={() => setShowEditCap(true)}
            className="text-[11px] font-bold text-neutral-400 hover:text-emerald-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95"
          >
            <Edit3 className="w-3 h-3" />
            Edit Cap
          </button>
        </div>

        {/* Budget Numbers Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80">
            <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">Remaining Balance</span>
            <div className={`text-xl font-black ${remainingBudget < 5000 ? 'text-red-400' : 'text-emerald-400'}`}>
              ₦{remainingBudget.toLocaleString()}
            </div>
            <span className="text-[10px] text-neutral-500">
              Of ₦{monthlyLimit.toLocaleString()} monthly limit
            </span>
          </div>

          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80">
            <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">Daily Safe Pace</span>
            <div className="text-xl font-black text-white">
              ₦{dailyAllowance.toLocaleString()}
              <span className="text-xs text-neutral-400 font-normal">/day</span>
            </div>
            <span className="text-[10px] text-neutral-500">
              {daysRemaining} days left in month
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-neutral-400">Total Spent: ₦{totalSpent.toLocaleString()}</span>
            <span className={spentPercentage > 85 ? 'text-red-400' : 'text-emerald-400'}>
              {spentPercentage}% Spent
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, spentPercentage)}%` }}
            />
          </div>
        </div>

        {/* Aunty Budget Alert */}
        {spentPercentage > 80 && (
          <div className="mt-3.5 p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Chakam Alert! You have used over 80% of your budget. Cut unnecessary spending now!</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Tag className="w-3.5 h-3.5" />
            Add Category
          </button>
        </div>
      </div>

      {/* 2. Spending Categories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-neutral-200 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-400" />
            Spending Categories ({budget.categories.length})
          </h3>
          <button
            onClick={() => setShowAddCategory(true)}
            className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            New Category
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {budget.categories.map((cat) => {
            const catPct = cat.limit > 0 ? Math.round(((cat.spent || 0) / cat.limit) * 100) : 0;
            const isOver = (cat.spent || 0) > cat.limit;
            return (
              <div 
                key={cat.id || cat.name}
                className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                    {isOver && (
                      <span className="text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded">
                        OVER LIMIT
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-neutral-300">
                    <span className={isOver ? 'text-red-400' : 'text-neutral-200'}>
                      ₦{(cat.spent || 0).toLocaleString()}
                    </span>
                    <span className="text-neutral-500 text-[11px]"> / ₦{cat.limit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      isOver ? 'bg-red-500' : catPct > 75 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, catPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-neutral-200 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Recent Expenses ({budget.transactions?.length || 0})
          </h3>
          <button
            onClick={() => setShowAddExpense(true)}
            className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            Add Expense
          </button>
        </div>

        {(!budget.transactions || budget.transactions.length === 0) ? (
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
            <DollarSign className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400 font-bold">No expenses recorded yet.</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Track every Naira you spend to build real financial discipline.</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="mt-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 active:scale-95"
            >
              + Log First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {budget.transactions.map((tx) => (
              <div 
                key={tx.id}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{tx.description || tx.category}</div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-medium">
                      {tx.category}
                    </span>
                    <span>{tx.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-rose-400">
                    -₦{tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Expense */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Record New Expense
            </h3>
            
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Amount (₦):</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 2500"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {budget.categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Description / Purpose:</label>
                <input
                  type="text"
                  placeholder="e.g. Market food stuff, Bolt ride"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Date:</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              Add Spending Category
            </h3>
            
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency medical, Books"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Monthly Limit (₦):</label>
                <input
                  type="number"
                  min="500"
                  placeholder="e.g. 5000"
                  value={newCatLimit}
                  onChange={(e) => setNewCatLimit(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Monthly Cap */}
      {showEditCap && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Set Monthly Budget Cap
            </h3>
            
            <form onSubmit={handleSaveMonthlyCap} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Total Monthly Limit (₦):</label>
                <input
                  type="number"
                  required
                  min="5000"
                  value={editCapAmount}
                  onChange={(e) => setEditCapAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Original default is ₦50,000 for strict disciplined living.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCap(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
