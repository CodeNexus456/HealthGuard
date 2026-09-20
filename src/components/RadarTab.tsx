import React, { useState } from 'react';
import { PlanDay, Recommendation } from '../types';
import { PLAN_7_DAY, RECOMMENDATIONS, TRENDS_DATA } from '../data/mockData';
import { RingGauge } from './RingGauge';
import { Sparkline, AreaChart, BarsChart } from './Charts';
import { Check, Sliders, TrendingUp, Calendar, Heart, Shield } from 'lucide-react';

interface RadarTabProps {
  onPushToast: (msg: string) => void;
}

export const RadarTab: React.FC<RadarTabProps> = ({ onPushToast }) => {
  // Interactive Risk Parameters
  const [age, setAge] = useState<number>(48);
  const [waist, setWaist] = useState<number>(34);
  const [activity, setActivity] = useState<number>(45);
  const [familyHistory, setFamilyHistory] = useState<boolean>(true);

  // 7-day plan completion state
  const [planState, setPlanState] = useState<PlanDay[]>(PLAN_7_DAY);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
  });

  // Calculate live biological risks based on scientific formulas:
  // Prediabetes risk rises with age, waist circumference, family history, and drops with physical activity
  const baseAgeFactor = (age - 20) * 0.45;
  const baseWaistFactor = Math.max(0, waist - 30) * 2.2;
  const activityDampener = (activity / 100) * 26;
  const famBonus = familyHistory ? 14 : 0;

  const prediabetesRisk = Math.min(
    95,
    Math.max(10, Math.round(18 + baseAgeFactor + baseWaistFactor + famBonus - activityDampener))
  );

  const cvStress = Math.min(
    95,
    Math.max(10, Math.round(16 + baseAgeFactor * 0.8 + baseWaistFactor * 1.8 + famBonus * 0.9 - activityDampener * 0.8))
  );

  const wellnessScore = Math.min(
    98,
    Math.max(25, Math.round(100 - (prediabetesRisk * 0.45 + cvStress * 0.45) + (activity * 0.2)))
  );

  const toggleDayComplete = (day: string) => {
    setCompletedDays((prev) => {
      const updated = { ...prev, [day]: !prev[day] };
      onPushToast(`${day} task marked as ${updated[day] ? 'completed' : 'pending'}`);
      return updated;
    });
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') {
      return <span className="px-2 py-0.5 border border-[#A8452C] bg-[#FEF2F2] text-[#A8452C] rounded text-[10.5px] font-mono font-semibold">High Priority</span>;
    }
    if (priority === 'Medium') {
      return <span className="px-2 py-0.5 border border-[#B5822A] bg-[#FFFBEB] text-[#B5822A] rounded text-[10.5px] font-mono font-semibold">Moderate</span>;
    }
    return <span className="px-2 py-0.5 border border-[#4B7355] bg-[#ECFDF5] text-[#4B7355] rounded text-[10.5px] font-mono font-semibold">On Track</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Biological Risk Engine & Trend Visualizers */}
        <div className="lg:col-span-6 space-y-5">
          {/* Interactive Biological Risk Radar Card */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#22271F]">Interactive Biological Risk Radar</h2>
                <p className="text-xs text-[#55584C] mt-0.5">Adjust physical and lifestyle parameters to see real-time metabolic recalculation.</p>
              </div>
              <span className="text-[11px] font-mono text-[#8B8776] flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Live Engine
              </span>
            </div>

            {/* 3 Circular SVG Gauges */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 border border-[#CFC9B4] rounded bg-[#F1EFE6]/40 mb-5">
              <div className="flex flex-col items-center">
                <RingGauge
                  value={prediabetesRisk}
                  size={76}
                  stroke={7}
                  color={prediabetesRisk > 55 ? '#A8452C' : prediabetesRisk > 35 ? '#B5822A' : '#4B7355'}
                />
                <span className="text-xs font-serif font-bold text-[#22271F] mt-1.5">Prediabetes</span>
                <span className="text-[10px] font-mono text-[#8B8776] font-semibold">{prediabetesRisk}% Risk</span>
              </div>

              <div className="flex flex-col items-center">
                <RingGauge
                  value={cvStress}
                  size={76}
                  stroke={7}
                  color={cvStress > 55 ? '#A8452C' : cvStress > 35 ? '#B5822A' : '#4B7355'}
                />
                <span className="text-xs font-serif font-bold text-[#22271F] mt-1.5">CV Stress</span>
                <span className="text-[10px] font-mono text-[#8B8776] font-semibold">{cvStress}% Index</span>
              </div>

              <div className="flex flex-col items-center">
                <RingGauge value={wellnessScore} size={76} stroke={7} color="#2C3E66" />
                <span className="text-xs font-serif font-bold text-[#22271F] mt-1.5">Wellness</span>
                <span className="text-[10px] font-mono text-[#2C3E66] font-semibold">{wellnessScore} Score</span>
              </div>
            </div>

            {/* Interactive Sliders Form */}
            <div className="space-y-4 text-xs">
              {/* Age Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-[#55584C]">Chronological Age:</span>
                  <span className="font-bold text-[#22271F]">{age} years</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-[#2C3E66] cursor-pointer"
                />
              </div>

              {/* Waist Circumference Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-[#55584C]">Waist Circumference:</span>
                  <span className="font-bold text-[#22271F]">{waist} inches</span>
                </div>
                <input
                  type="range"
                  min="26"
                  max="48"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full accent-[#2C3E66] cursor-pointer"
                />
              </div>

              {/* Physical Activity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-[#55584C]">Weekly Physical Activity Consistency:</span>
                  <span className="font-bold text-[#22271F]">{activity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full accent-[#2C3E66] cursor-pointer"
                />
              </div>

              {/* Family History Toggle */}
              <div className="flex items-center justify-between p-3 border border-[#CFC9B4] rounded bg-[#FBFAF3]">
                <div>
                  <p className="font-semibold text-[#22271F]">Family History of Diabetes / CVD</p>
                  <p className="text-[11px] text-[#8B8776]">First-degree relative (parent or sibling)</p>
                </div>
                <input
                  type="checkbox"
                  checked={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.checked)}
                  className="w-4 h-4 accent-[#2C3E66] cursor-pointer"
                />
              </div>
            </div>

            {/* Dynamic Clinical Insight Summary */}
            <div className="mt-4 p-3 bg-[#DDE3EF] border border-[#2C3E66]/20 rounded text-xs text-[#1D2A46]">
              <strong className="block font-semibold mb-0.5">Metabolic Projection:</strong>
              {activity >= 60 ? (
                <span>
                  High consistent physical movement is offsetting visceral abdominal adiposity, effectively curbing your lifetime prediabetes trajectory.
                </span>
              ) : (
                <span>
                  Elevating daily brisk movement by just 15 minutes would lower estimated insulin resistance by an estimated 14% within 3 weeks.
                </span>
              )}
            </div>
          </div>

          {/* 7-Day Lifestyle Trends (Charts & Sparklines) */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">7-Day Lifestyle Trends</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Biometric registry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chart 1: Sleep */}
              <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-[#22271F]">Sleep Duration</span>
                  <span className="text-xs font-mono font-bold text-[#2C3E66]">7.2h avg</span>
                </div>
                <AreaChart data={TRENDS_DATA.sleepWeek} color="#2C3E66" height={56} />
                <span className="text-[10px] font-mono text-[#8B8776] block mt-1">Target: 7.5 hrs/night</span>
              </div>

              {/* Chart 2: Steps */}
              <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-[#22271F]">Daily Steps</span>
                  <span className="text-xs font-mono font-bold text-[#4B7355]">6,800 today</span>
                </div>
                <BarsChart data={TRENDS_DATA.stepsWeek} color="#4B7355" height={56} />
                <span className="text-[10px] font-mono text-[#8B8776] block mt-1">+22% vs previous week</span>
              </div>

              {/* Chart 3: Hydration */}
              <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-[#22271F]">Daytime Hydration</span>
                  <span className="text-xs font-mono font-bold text-[#0EA5E9]">2.5 L</span>
                </div>
                <AreaChart data={TRENDS_DATA.hydrationWeek} color="#0EA5E9" height={56} />
                <span className="text-[10px] font-mono text-[#8B8776] block mt-1">Goal: 2.2 L/day</span>
              </div>

              {/* Chart 4: Glycemic Excursion Stability */}
              <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-[#22271F]">Glycemic Stability</span>
                  <span className="text-xs font-mono font-bold text-[#B5822A]">112 mg/dL</span>
                </div>
                <Sparkline data={TRENDS_DATA.glycemicWeek} color="#B5822A" height={56} />
                <span className="text-[10px] font-mono text-[#8B8776] block mt-1">Flattening postprandial curve</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 7-Day Wellness Action Plan & Personalized Recommendations */}
        <div className="lg:col-span-6 space-y-5">
          {/* 7-Day Wellness Action Plan */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">7-Day Wellness Action Plan</h2>
              <span className="text-xs font-mono font-bold text-[#2C3E66] bg-[#DDE3EF] px-2 py-0.5 rounded">
                {Object.values(completedDays).filter(Boolean).length} / 7 Days Complete
              </span>
            </div>

            <div className="divide-y divide-[#CFC9B4]">
              {planState.map((day) => {
                const isDone = Boolean(completedDays[day.day]);
                return (
                  <div
                    key={day.day}
                    className="py-3 flex items-start justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleDayComplete(day.day)}
                        className={`w-4 h-4 rounded border-[1.5px] border-[#22271F] flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          isDone ? 'bg-[#22271F] text-[#FBFAF3]' : 'bg-transparent'
                        }`}
                      >
                        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isDone ? 'line-through text-[#8B8776]' : 'text-[#22271F]'}`}>
                            {day.day}
                          </span>
                          <span className="text-[10px] font-mono text-[#8B8776] uppercase px-1.5 py-0.2 border border-[#CFC9B4] rounded">
                            {day.cat}
                          </span>
                        </div>
                        <p className={`mt-0.5 font-medium leading-relaxed ${isDone ? 'line-through text-[#8B8776]' : 'text-[#55584C]'}`}>
                          {day.task}
                        </p>
                        <p className="text-[11px] text-[#8B8776] italic mt-0.5">
                          Rationale: {day.reason}
                        </p>
                      </div>
                    </div>
                    {getPriorityBadge(day.priority)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personalized Clinical Recommendations */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Clinical Recommendations</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Evidence-Based Levers</span>
            </div>

            <div className="space-y-3.5">
              {RECOMMENDATIONS.map((rec, idx) => (
                <div key={idx} className="border border-[#CFC9B4] rounded-lg p-3.5 bg-[#FBFAF3] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#22271F]">{rec.cat}</span>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-[#55584C] leading-relaxed">
                    <strong className="text-[#22271F]">Observation: </strong>{rec.obs}
                  </p>
                  <p className="text-[#55584C] leading-relaxed">
                    <strong className="text-[#22271F]">Recommendation: </strong>{rec.rec}
                  </p>
                  <div className="p-2.5 bg-[#F1EFE6] border border-[#CFC9B4] rounded text-[#2C3E66] font-mono text-[11.5px]">
                    <strong>Concrete Action: </strong>{rec.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
