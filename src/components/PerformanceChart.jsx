import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  Zap, 
  SlidersHorizontal 
} from 'lucide-react';

// Custom dark mode tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-950/95 border border-neutral-800 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[170px] space-y-1.5">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 font-bold text-white">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-cyan-400" />
            {data.dayLabel} ({data.date})
          </span>
          {data.isToday && (
            <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-800 font-mono">
              TODAY
            </span>
          )}
        </div>

        {/* Tasks Row */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Tasks Done:
          </span>
          <span className="font-mono font-bold text-white">
            {data.tasksRate}% ({data.tasksCompleted}/{data.tasksTotal})
          </span>
        </div>

        {/* Habits Row */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Habits Kept:
          </span>
          <span className="font-mono font-bold text-white">
            {data.habitsRate}% ({data.habitsCompleted}/{data.habitsTotal})
          </span>
        </div>

        {/* Overall Score */}
        <div className="pt-1 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Daily Accountability:</span>
          <span className="font-bold text-amber-400">{data.score}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ metrics }) {
  const [chartType, setChartType] = useState('BAR'); // 'BAR' | 'LINE'
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'TASKS' | 'HABITS'

  const chartData = metrics?.weekly?.days || [];
  const weeklyTasksRate = metrics?.weekly?.weeklyTasksRate || 0;
  const weeklyHabitsRate = metrics?.weekly?.weeklyHabitsRate || 0;
  const todayTasksRate = metrics?.today?.tasksRate || 0;
  const todayHabitsRate = metrics?.today?.habitsRate || 0;

  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4 shadow-xl">
      
      {/* Chart Header & Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                Completion Rate Analytics
              </span>
              <h3 className="text-xs font-black text-white">Daily & Weekly Progress</h3>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px] font-bold">
            <button
              onClick={() => setChartType('BAR')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'BAR' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setChartType('LINE')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'LINE' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Trend
            </button>
          </div>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-neutral-500" />
            Metrics View:
          </span>
          <div className="flex gap-1 text-[10px] font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2 py-0.5 rounded-md border transition-all ${
                filterMode === 'ALL'
                  ? 'bg-neutral-800 border-neutral-600 text-white'
                  : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setFilterMode('TASKS')}
              className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                filterMode === 'TASKS'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                  : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Tasks
            </button>
            <button
              onClick={() => setFilterMode('HABITS')}
              className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                filterMode === 'HABITS'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Habits
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="h-56 w-full pt-1 min-h-[224px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
          {chartType === 'BAR' ? (
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                dataKey="dayLabel" 
                stroke="#737373" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]} 
                stroke="#737373" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
                unit="%"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              
              {(filterMode === 'ALL' || filterMode === 'TASKS') && (
                <Bar 
                  dataKey="tasksRate" 
                  name="Tasks Rate %" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={16}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`task-cell-${index}`} 
                      fill={entry.isToday ? '#e11d48' : '#f43f5e'} 
                      opacity={entry.isToday ? 1 : 0.85}
                    />
                  ))}
                </Bar>
              )}

              {(filterMode === 'ALL' || filterMode === 'HABITS') && (
                <Bar 
                  dataKey="habitsRate" 
                  name="Habits Rate %" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={16}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`habit-cell-${index}`} 
                      fill={entry.isToday ? '#059669' : '#10b981'} 
                      opacity={entry.isToday ? 1 : 0.85}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          ) : (
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                dataKey="dayLabel" 
                stroke="#737373" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]} 
                stroke="#737373" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
                unit="%"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />

              {(filterMode === 'ALL' || filterMode === 'TASKS') && (
                <Line 
                  type="monotone" 
                  dataKey="tasksRate" 
                  name="Tasks Rate %" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
              )}

              {(filterMode === 'ALL' || filterMode === 'HABITS') && (
                <Line 
                  type="monotone" 
                  dataKey="habitsRate" 
                  name="Habits Rate %" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Completion Rates Comparison Cards */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800/80">
        
        {/* Tasks Rate Card */}
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Tasks
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Today: {todayTasksRate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-white">{weeklyTasksRate}%</span>
            <span className="text-[10px] text-neutral-400 font-semibold">Weekly Avg</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${weeklyTasksRate}%` }} 
            />
          </div>
        </div>

        {/* Habits Rate Card */}
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Habits
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Today: {todayHabitsRate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-white">{weeklyHabitsRate}%</span>
            <span className="text-[10px] text-neutral-400 font-semibold">Weekly Avg</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${weeklyHabitsRate}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Aunty's Habits vs Tasks Discipline Verdict */}
      <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2">
        <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          {weeklyTasksRate >= 80 && weeklyHabitsRate >= 80 ? (
            <span className="font-medium text-emerald-400">
              Balanced Discipline: You are hitting both daily tasks and wellness habits with precision! Aunty approves!
            </span>
          ) : weeklyTasksRate < 60 ? (
            <span className="font-medium text-rose-400">
              Chakam Notice: Your task execution rate is lagging behind your habits. Stop postponing your studio/clinical shifts!
            </span>
          ) : (
            <span className="font-medium text-neutral-300">
              Solid consistency. Keep your daily water, reading, and planned tasks above 80% to earn the Weekly Warrior badge.
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
