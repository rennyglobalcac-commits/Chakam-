import React from 'react';
import { X, Award, BarChart3, Home, BookOpen, Scissors, Stethoscope, Users, CheckCircle, ShieldAlert } from 'lucide-react';

export default function MonthlyDashboardModal({ isOpen, onClose, state, score }) {
  if (!isOpen) return null;

  const budget = state?.budget || state?.me?.budget || { categories: [] };
  const categories = budget.categories || [];
  const totalSpent = categories.reduce((acc, c) => acc + (c.spent || 0), 0);
  const monthlyLimit = budget.monthlyLimit || 50000;
  const budgetRemaining = Math.max(0, monthlyLimit - totalSpent);
  const nightsHome = state?.me?.apartment?.nightsAtHomeCurrent || 0;
  const targetHome = state?.me?.apartment?.targetNightsAtHome || 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-5 shadow-2xl shadow-neutral-950/80 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 mb-2">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white">Monthly Progress Report</h2>
          <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
            October 2026 Comprehensive Dashboard
          </p>
        </div>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {/* Main Score Banner */}
          <div className="p-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Overall Score</p>
              <h3 className="text-3xl font-black text-white mt-0.5">{score?.total ?? 100}%</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">Strict Standard: Passing Grade</p>
            </div>
            <div className="text-4xl">👑</div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Budget */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                ₦50k Monthly Budget
              </span>
              <p className="text-sm font-black text-emerald-400">₦{totalSpent.toLocaleString()} spent</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">₦{budgetRemaining.toLocaleString()} remaining</p>
            </div>

            {/* Stay Home */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Apartment Nights
              </span>
              <p className="text-sm font-black text-amber-400">{nightsHome} / {targetHome} Nights</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Resting at home</p>
            </div>

            {/* Books */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Nonfiction Books
              </span>
              <p className="text-sm font-black text-white">1 Finished • 1 Active</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">184 / 320 pages read</p>
            </div>

            {/* Sewing */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Fashion Studio
              </span>
              <p className="text-sm font-black text-white">3 Projects Live</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Corset Gown at 60%</p>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <span className="text-xs font-bold text-white block mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Badges & Milestones:
            </span>
            <div className="space-y-1.5">
              {(state?.badges || []).map((b) => (
                <div key={b.id} className="p-2 bg-neutral-900 rounded-lg flex items-center gap-2.5 text-xs">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <p className="font-bold text-neutral-200">{b.title}</p>
                    <p className="text-[10px] text-neutral-400">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Patterns & Next Month Focus */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
            <span className="font-bold text-red-400 block uppercase tracking-wider text-[11px]">
              Top 3 Patterns Identified:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px]">
              <li>Evening tiredness after 16:00 shifts delays sewing cutting.</li>
              <li>Phone scrolling between 8:00 PM and 10:30 PM steals reading hours.</li>
              <li>Cleaning supply spending exceeded 80% mark early in the month.</li>
            </ol>
            <div className="pt-2 border-t border-neutral-800">
              <span className="font-bold text-emerald-400 block text-[11px]">Suggested Focus for Next Month:</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Block out sewing pattern cutting for morning hours before work shifts. Leave phone outside the bedroom.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
        >
          Close Dashboard
        </button>
      </div>
    </div>
  );
}
