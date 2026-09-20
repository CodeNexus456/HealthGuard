import React, { useState } from 'react';
import { Habit, Nudge } from '../types';
import { RingGauge } from './RingGauge';
import { COMMUNITY_WARD } from '../data/mockData';
import { Check, Plus, ArrowUpRight, ArrowDownRight, Sparkles, ShieldAlert, HeartPulse } from 'lucide-react';

interface TodayTabProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string, sub: string) => void;
  nudges: Nudge[];
  onToggleNudge: (id: string) => void;
  diabetesRisk: number;
  cvRisk: number;
  wellnessScore: number;
  projected: boolean;
  onToggleProjected: () => void;
  onOpenCoach: () => void;
  onNavigateTab: (tab: any) => void;
  patientName?: string;
  onOpenProfileModal?: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  nudges,
  onToggleNudge,
  diabetesRisk,
  cvRisk,
  wellnessScore,
  projected,
  onToggleProjected,
  onOpenCoach,
  onNavigateTab,
  patientName = 'Suraj Kumar',
  onOpenProfileModal,
}) => {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Computed projections
  const effectiveDiabetes = projected ? Math.max(12, Math.round(diabetesRisk * 0.82)) : diabetesRisk;
  const effectiveCV = projected ? Math.max(12, Math.round(cvRisk * 0.82)) : cvRisk;
  const effectiveWellness = projected ? Math.min(96, Math.round(wellnessScore * 1.08)) : wellnessScore;

  const pendingCount = habits.filter((h) => !h.done).length;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    onAddHabit(newHabitTitle.trim(), "Custom daily micro-habit • Self-tracked");
    setNewHabitTitle('');
    setShowAddForm(false);
  };

  const getRiskTone = (val: number) => {
    if (val < 34) return { label: 'Low', color: '#4B7355', bg: 'bg-[#ECFDF5]', text: 'text-[#4B7355]' };
    if (val < 67) return { label: 'Moderate', color: '#B5822A', bg: 'bg-[#FFFBEB]', text: 'text-[#B5822A]' };
    return { label: 'High', color: '#A8452C', bg: 'bg-[#FEF2F2]', text: 'text-[#A8452C]' };
  };

  const dRisk = getRiskTone(effectiveDiabetes);
  const cRisk = getRiskTone(effectiveCV);

  const changes = [
    { label: "Sleep Duration", from: "6h 10m", to: "7h 05m", diff: "+55m", better: true },
    { label: "Daily Steps", from: "4,200", to: "6,100", diff: "+45%", better: true },
    { label: "Daytime Hydration", from: "1.6 L", to: "2.1 L", diff: "+31%", better: true },
    { label: "Evening Screen Time", from: "7h 40m", to: "6h 20m", diff: "-1h 20m", better: true },
    { label: "Fasting Blood Sugar", from: "114 mg/dL", to: "104 mg/dL", diff: "-10 mg/dL", better: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Editorial Hero Header */}
      <div className="border-[1.5px] border-[#22271F] rounded-lg p-5 sm:p-6 bg-[#FBFAF3] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4B7355] animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B8776] font-semibold">
              Live Register • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#22271F] tracking-tight">
              Good to see you, {patientName}
            </h1>
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="text-xs font-mono text-[#2C3E66] border border-[#2C3E66]/40 hover:border-[#2C3E66] px-2 py-0.5 rounded bg-[#DDE3EF]/50 hover:bg-[#DDE3EF] transition-colors cursor-pointer"
              >
                Edit Vitals & Profile →
              </button>
            )}
          </div>
          <p className="text-[13px] text-[#55584C] leading-relaxed">
            Your lifestyle patterns from the last 7 days are driving today's metabolic recommendations. Readiness is optimal at 84%.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('report')}
              className="text-[11px] font-mono font-semibold text-[#2C3E66] underline hover:text-[#1D2A46] cursor-pointer"
            >
              View & Download Official Health Report (PDF/CSV) →
            </button>
          </div>
        </div>

        {/* Hero Stat Group */}
        <div className="flex items-center divide-x divide-[#CFC9B4] border-t md:border-t-0 md:border-l border-[#CFC9B4] pt-4 md:pt-0 pl-0 md:pl-6">
          <div className="px-4 first:pl-0 text-left md:text-right">
            <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#22271F] leading-none">
              84%
            </span>
            <span className="text-[10px] font-mono text-[#8B8776] uppercase tracking-wider font-semibold">
              Readiness
            </span>
          </div>
          <div className="px-4 text-left md:text-right">
            <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#2C3E66] leading-none">
              {wellnessScore}
            </span>
            <span className="text-[10px] font-mono text-[#8B8776] uppercase tracking-wider font-semibold">
              Wellness
            </span>
          </div>
          <div className="px-4 last:pr-0 text-left md:text-right">
            <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#B5822A] leading-none">
              {pendingCount}
            </span>
            <span className="text-[10px] font-mono text-[#8B8776] uppercase tracking-wider font-semibold">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Primary Cards) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Biological Risk Radar Card */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Biological Risk Radar</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Clinical estimate</span>
            </div>

            {/* Three Circular Gauges */}
            <div className="grid grid-cols-3 gap-3 text-center mb-5">
              <div className="flex flex-col items-center">
                <RingGauge value={effectiveDiabetes} size={82} stroke={8} color={dRisk.color} />
                <span className={`inline-block mt-2 px-2 py-0.5 border border-current rounded text-[10px] font-mono font-semibold ${dRisk.text}`}>
                  {dRisk.label} Risk
                </span>
                <span className="text-[11px] font-semibold text-[#8B8776] mt-1">Prediabetes</span>
              </div>

              <div className="flex flex-col items-center">
                <RingGauge value={effectiveCV} size={82} stroke={8} color={cRisk.color} />
                <span className={`inline-block mt-2 px-2 py-0.5 border border-current rounded text-[10px] font-mono font-semibold ${cRisk.text}`}>
                  {cRisk.label} Risk
                </span>
                <span className="text-[11px] font-semibold text-[#8B8776] mt-1">Cardiovascular</span>
              </div>

              <div className="flex flex-col items-center">
                <RingGauge value={effectiveWellness} size={82} stroke={8} color="#2C3E66" />
                <span className="inline-block mt-2 px-2 py-0.5 border border-[#2C3E66] rounded text-[10px] font-mono font-semibold text-[#2C3E66]">
                  Optimal
                </span>
                <span className="text-[11px] font-semibold text-[#8B8776] mt-1">Wellness Score</span>
              </div>
            </div>

            {/* Reference callout */}
            <div className="border border-[#CFC9B4] bg-[#F1EFE6]/50 rounded p-3 text-xs text-[#55584C] mb-3">
              <span className="font-bold text-[#22271F]">Prediabetes Marker:</span> HbA1c reference: 6.2%. Postprandial walk dampens morning fasting excursions.
            </div>

            {/* 30-Day Projection Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#DDE3EF] border border-[#2C3E66]/20 rounded-md">
              <div>
                <p className="text-xs font-semibold text-[#1D2A46]">Projected 30-Day Improvement</p>
                <p className="text-[11px] text-[#2C3E66]/80 font-mono mt-0.5">
                  {projected ? '✓ -18% risk blunting with current lifestyle habits' : 'Toggle to simulate 30-day consistent habit impact'}
                </p>
              </div>
              <button
                id="toggle-projected-btn"
                onClick={onToggleProjected}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer border border-[#22271F] ${
                  projected ? 'bg-[#2C3E66]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#FBFAF3] transition-transform duration-200 ${
                    projected ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[10.5px] text-[#8B8776] mt-3 italic leading-normal">
              Estimates are derived from self-reported vitals and routine lab markers for preventive wellness guidance, not clinical diagnosis.
            </p>
          </div>

          {/* Micro-Habits Daily Checklist */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-2">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#22271F]">Daily Micro-Habits</h2>
                <span className="text-xs font-mono font-bold text-[#2C3E66] bg-[#DDE3EF] px-2 py-0.5 rounded">
                  {habits.filter((h) => h.done).length} / {habits.length}
                </span>
              </div>
              <button
                id="add-habit-toggle-btn"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-mono font-semibold text-[#2C3E66] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel' : 'New Habit'}</span>
              </button>
            </div>

            {/* Quick Add Habit Form */}
            {showAddForm && (
              <form onSubmit={handleCreateHabit} className="py-3 border-b border-[#CFC9B4] flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 15-min Evening Walk or 500ml Water"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="flex-1 text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded px-3 py-2 outline-none focus:border-[#22271F]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#22271F] text-[#FBFAF3] text-xs font-mono font-semibold rounded hover:bg-[#2C3E66] cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            {/* Habit Items */}
            <div className="divide-y divide-[#CFC9B4]">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  id={`habit-row-${habit.id}`}
                  className="py-3 flex items-center gap-3 group transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13.5px] font-semibold transition-all ${
                        habit.done
                          ? 'line-through text-[#8B8776]'
                          : 'text-[#22271F]'
                      }`}
                    >
                      {habit.title}
                    </p>
                    <p className="text-[11px] text-[#8B8776] font-mono truncate">{habit.sub}</p>
                  </div>
                  <button
                    id={`habit-check-${habit.id}`}
                    onClick={() => onToggleHabit(habit.id)}
                    className={`w-5 h-5 rounded border-[1.5px] border-[#22271F] flex items-center justify-center transition-all cursor-pointer ${
                      habit.done ? 'bg-[#22271F] text-[#FBFAF3]' : 'bg-transparent hover:border-[#2C3E66]'
                    }`}
                  >
                    {habit.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* What Changed? This Week vs Last */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">What Changed? This Week vs Last</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Delta trends</span>
            </div>

            <div className="divide-y divide-[#CFC9B4]">
              {changes.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#55584C] w-36 sm:w-44">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B8776] line-through font-mono">{item.from}</span>
                    <span className="text-[#22271F] font-mono font-bold">{item.to}</span>
                    <span
                      className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[10.5px] flex items-center gap-0.5 ${
                        item.better
                          ? 'bg-[#ECFDF5] text-[#4B7355] border border-[#4B7355]'
                          : 'bg-[#FEF2F2] text-[#A8452C] border border-[#A8452C]'
                      }`}
                    >
                      {item.better ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.diff}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Nudges, Community Watch, Quick Actions) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Daily Lifestyle Nudges Card */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Lifestyle Nudges</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Ayurvedic & Evidence-Based</span>
            </div>

            <div className="space-y-3">
              {nudges.map((nudge) => (
                <div
                  key={nudge.id}
                  id={`nudge-box-${nudge.id}`}
                  className="border border-[#CFC9B4] rounded p-3 flex items-start gap-3 bg-[#F1EFE6]/40"
                >
                  <button
                    onClick={() => onToggleNudge(nudge.id)}
                    className={`mt-0.5 w-4 h-4 rounded border-[1.5px] border-[#22271F] flex items-center justify-center shrink-0 cursor-pointer ${
                      nudge.done ? 'bg-[#22271F] text-[#FBFAF3]' : 'bg-transparent'
                    }`}
                  >
                    {nudge.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${nudge.done ? 'line-through text-[#8B8776]' : 'text-[#22271F]'}`}>
                      {nudge.title}
                    </p>
                    <p className="text-[11px] text-[#55584C] mt-0.5 leading-relaxed">
                      {nudge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Health Map & Surveillance Card */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Epidemiological Watch</h2>
              <span className="text-[11px] font-mono text-[#A8452C] font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Live Alert
              </span>
            </div>

            {/* Stylized Ward Map Banner */}
            <div className="h-24 rounded border border-[#CFC9B4] bg-[#DDE3EF] p-3 flex flex-col justify-between mb-3 relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                <span className="font-serif font-bold text-xs text-[#1D2A46]">
                  {COMMUNITY_WARD.ward}, {COMMUNITY_WARD.area}
                </span>
                <span className="font-mono text-[10px] bg-[#FBFAF3] text-[#22271F] border border-[#22271F] px-1.5 py-0.5 rounded font-semibold">
                  Surveillance Zone
                </span>
              </div>
              <p className="text-[11px] text-[#2C3E66] font-mono z-10">
                Primary Health Centre: Chirag Dilli Sub-District
              </p>
              {/* Map grid lines overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2C3E66_1px,transparent_1px)] [background-size:12px_12px]" />
            </div>

            <div className="space-y-2 text-xs text-[#55584C]">
              {COMMUNITY_WARD.reports.map((rep, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5822A] mt-1.5 shrink-0" />
                  <span className="leading-snug">{rep}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Food & Coach Callout */}
          <div className="bg-[#F1EFE6] border-[1.5px] border-[#22271F] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B5822A]" />
              <h3 className="font-serif font-bold text-sm text-[#22271F]">AegisHabit Quick Prompt</h3>
            </div>
            <p className="text-xs text-[#55584C] leading-relaxed">
              Log your meals or habits naturally in Hindi, Hinglish, or English. E.g., <em>"2 methi parathe aur 1 cup chai"</em>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('food')}
                className="flex-1 py-2 px-3 bg-[#2C3E66] text-[#FBFAF3] rounded text-xs font-mono font-semibold hover:bg-[#1D2A46] cursor-pointer text-center"
              >
                Log Food / Habit
              </button>
              <button
                onClick={onOpenCoach}
                className="py-2 px-3 border border-[#22271F] rounded text-xs font-mono font-semibold hover:bg-[#22271F] hover:text-[#FBFAF3] cursor-pointer"
              >
                Ask Coach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
