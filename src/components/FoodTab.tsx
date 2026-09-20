import React, { useState } from 'react';
import { MealAnalysis, ChatLogEntry, ParsedHabitItem } from '../types';
import { DEMO_MEALS, SAMPLE_PROMPTS } from '../data/mockData';
import { FoodPhotoAnalyzer } from './FoodPhotoAnalyzer';
import { Mic, MicOff, Send, Sparkles, Check, Flame, AlertCircle, Camera, MessageSquare, Utensils } from 'lucide-react';

interface FoodTabProps {
  loggedMeals: string[];
  onLogMeal: (mealName: string, calories?: number, macros?: string, impact?: 'LOW' | 'MODERATE' | 'HIGH') => void;
  chatLog: ChatLogEntry[];
  onAddChatEntry: (entry: ChatLogEntry) => void;
  onPushToast: (msg: string) => void;
}

export const FoodTab: React.FC<FoodTabProps> = ({
  loggedMeals,
  onLogMeal,
  chatLog,
  onAddChatEntry,
  onPushToast,
}) => {
  const [activeSubView, setActiveSubView] = useState<'photo' | 'logger' | 'explorer'>('photo');
  const [selectedMealKey, setSelectedMealKey] = useState<string>('Dal Bowl');
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis>(DEMO_MEALS['Dal Bowl']);
  const [analyzing, setAnalyzing] = useState(false);
  const [customMealInput, setCustomMealInput] = useState('');

  // Natural language chat logger state
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Handle selecting a demo meal or analyzing custom meal
  const handleSelectMeal = async (key: string) => {
    setSelectedMealKey(key);
    setAnalyzing(true);

    if (DEMO_MEALS[key]) {
      setTimeout(() => {
        setMealAnalysis(DEMO_MEALS[key]);
        setAnalyzing(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealName: key }),
      });
      const data = await res.json();
      if (data.analysis) {
        setMealAnalysis(data.analysis);
      } else {
        setMealAnalysis(DEMO_MEALS['Dal Bowl']);
      }
    } catch {
      setMealAnalysis(DEMO_MEALS['Dal Bowl']);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCustomMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMealInput.trim()) return;
    const name = customMealInput.trim();
    setCustomMealInput('');
    handleSelectMeal(name);
  };

  const handleLogMealToHabits = () => {
    onLogMeal(
      selectedMealKey,
      mealAnalysis.calories,
      `${mealAnalysis.carbs}g carbs, ${mealAnalysis.protein}g protein, ${mealAnalysis.fat}g fat`,
      mealAnalysis.impact
    );
    onPushToast(`"${selectedMealKey}" logged to Daily Habit Engine`);
  };

  // Submit natural language text
  const handleSubmitChat = async (presetText?: string) => {
    const val = (presetText ?? textInput).trim();
    if (!val) return;

    if (!presetText) setTextInput('');

    try {
      const res = await fetch('/api/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: val }),
      });
      const data = await res.json();
      const parsedItems: ParsedHabitItem[] = data.parsed || [];

      const newEntry: ChatLogEntry = {
        id: Date.now(),
        text: val,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed: parsedItems,
      };

      onAddChatEntry(newEntry);
      onPushToast(`Parsed & logged: "${val}"`);
    } catch (err) {
      console.error(err);
      onPushToast('Logged lifestyle note');
    }
  };

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onPushToast('Voice recognition not supported in this browser. Please type directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Supports Hindi/Hinglish
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        onPushToast('Listening for voice input...');
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTextInput(speechResult);
        setIsListening(false);
        onPushToast(`Heard: "${speechResult}"`);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech error:', err);
      setIsListening(false);
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'LOW') return { bg: 'bg-[#ECFDF5]', border: 'border-[#4B7355]', text: 'text-[#4B7355]' };
    if (impact === 'MODERATE') return { bg: 'bg-[#FFFBEB]', border: 'border-[#B5822A]', text: 'text-[#B5822A]' };
    return { bg: 'bg-[#FEF2F2]', border: 'border-[#A8452C]', text: 'text-[#A8452C]' };
  };

  const impactStyle = getImpactColor(mealAnalysis.impact);
  const loggedCount = loggedMeals.filter((m) => m === selectedMealKey).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-view Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-2.5">
        <div className="flex flex-wrap gap-1.5">
          <button
            id="subtab-photo-analyzer"
            type="button"
            onClick={() => setActiveSubView('photo')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubView === 'photo'
                ? 'bg-[#2C3E66] text-[#FBFAF3] shadow-xs'
                : 'bg-transparent text-[#55584C] hover:bg-[#DDE3EF]/50 hover:text-[#22271F]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Food Photo & Portion Analyzer</span>
            <span className="px-1.5 py-0.2 bg-[#A8452C] text-white text-[9px] rounded-full uppercase font-bold">
              AI Vision
            </span>
          </button>

          <button
            id="subtab-text-logger"
            type="button"
            onClick={() => setActiveSubView('logger')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubView === 'logger'
                ? 'bg-[#2C3E66] text-[#FBFAF3] shadow-xs'
                : 'bg-transparent text-[#55584C] hover:bg-[#DDE3EF]/50 hover:text-[#22271F]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Voice & Text Diary</span>
          </button>

          <button
            id="subtab-meal-explorer"
            type="button"
            onClick={() => setActiveSubView('explorer')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubView === 'explorer'
                ? 'bg-[#2C3E66] text-[#FBFAF3] shadow-xs'
                : 'bg-transparent text-[#55584C] hover:bg-[#DDE3EF]/50 hover:text-[#22271F]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Quick Meals Explorer</span>
          </button>
        </div>

        {/* Global Logged Meals Counter */}
        <div className="text-[11px] font-mono text-[#8B8776] px-2 py-0.5 bg-[#F1EFE6] rounded border border-[#CFC9B4]">
          Meals Logged Today: <strong className="text-[#22271F]">{loggedMeals.length}</strong>
        </div>
      </div>

      {/* VIEW 1: AI Food Photo Portion & Quantity Analyzer (Primary requested feature) */}
      {activeSubView === 'photo' && (
        <FoodPhotoAnalyzer
          onMealLogged={(mealName, calories, desc) => {
            onLogMeal(mealName);
            onAddChatEntry({
              id: Date.now(),
              text: `Photo Meal Log: ${mealName}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              parsed: [
                { type: 'Food', color: '#B5822A', detail: `${mealName} (~${calories} kcal)` },
                { type: 'General', color: '#4B7355', detail: desc },
              ],
            });
          }}
          onPushToast={onPushToast}
        />
      )}

      {/* VIEW 2 & 3: Classic Glycemic Analyzer & NL Chat Logger */}
      {activeSubView !== 'photo' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: AI Food Snap & Glycemic Load Analyzer */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#22271F]">AI Food Snap & Glycemic Engine</h2>
                <p className="text-xs text-[#55584C] mt-0.5">Select a logged meal or input a custom dish for glycemic impact profiling.</p>
              </div>
              <span className="text-[11px] font-mono text-[#8B8776]">Metabolic AI</span>
            </div>

            {/* Quick Demo Meal Selector Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(DEMO_MEALS).map((key) => {
                const isSelected = selectedMealKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectMeal(key)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2C3E66] text-[#FBFAF3] border-[#2C3E66] font-semibold'
                        : 'bg-[#FBFAF3] text-[#55584C] border-[#CFC9B4] hover:border-[#22271F]'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Custom Meal Input */}
            <form onSubmit={handleCustomMealSubmit} className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Or analyze any other meal (e.g. 2 Paneer Paratha, Rajma Chawal, Poha)..."
                value={customMealInput}
                onChange={(e) => setCustomMealInput(e.target.value)}
                className="flex-1 text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded px-3 py-2 outline-none focus:border-[#22271F]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#22271F] text-[#FBFAF3] text-xs font-mono font-semibold rounded hover:bg-[#2C3E66] cursor-pointer"
              >
                Analyze
              </button>
            </form>

            {/* Analysis Result Card */}
            {analyzing ? (
              <div className="p-8 text-center border border-[#CFC9B4] rounded bg-[#F1EFE6]/50">
                <div className="w-6 h-6 border-2 border-[#2C3E66] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono text-[#55584C]">Calculating macronutrients and glycemic excursion curve...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meal header & food components */}
                <div className="border border-[#CFC9B4] rounded p-3 bg-[#F1EFE6]/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif font-bold text-sm text-[#22271F]">{selectedMealKey}</span>
                    <span className="text-[11px] font-mono text-[#8B8776]">{mealAnalysis.foods.length} items logged</span>
                  </div>
                  <div className="divide-y divide-[#CFC9B4]">
                    {mealAnalysis.foods.map(([foodName, cals, desc], idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-[#22271F]">{foodName}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-[#8B8776]">{desc}</span>
                          <span className="font-semibold text-[#22271F]">{cals} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4-Stat Macronutrient Cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="border border-[#CFC9B4] rounded p-2.5 bg-[#FBFAF3]">
                    <span className="block font-serif text-base font-bold text-[#22271F]">{mealAnalysis.calories}</span>
                    <span className="text-[10px] font-mono uppercase text-[#8B8776] font-semibold">Calories</span>
                  </div>
                  <div className="border border-[#CFC9B4] rounded p-2.5 bg-[#FBFAF3]">
                    <span className="block font-serif text-base font-bold text-[#22271F]">{mealAnalysis.carbs}g</span>
                    <span className="text-[10px] font-mono uppercase text-[#8B8776] font-semibold">Carbs</span>
                  </div>
                  <div className="border border-[#CFC9B4] rounded p-2.5 bg-[#FBFAF3]">
                    <span className="block font-serif text-base font-bold text-[#22271F]">{mealAnalysis.protein}g</span>
                    <span className="text-[10px] font-mono uppercase text-[#8B8776] font-semibold">Protein</span>
                  </div>
                  <div className="border border-[#CFC9B4] rounded p-2.5 bg-[#FBFAF3]">
                    <span className="block font-serif text-base font-bold text-[#22271F]">{mealAnalysis.fat}g</span>
                    <span className="text-[10px] font-mono uppercase text-[#8B8776] font-semibold">Fat</span>
                  </div>
                </div>

                {/* Fiber & Glycemic Load row */}
                <div className="flex justify-between items-center px-1 text-xs text-[#55584C] font-mono">
                  <span>Dietary Fibre: <b className="text-[#22271F]">{mealAnalysis.fiber}g</b></span>
                  <span>Est. Glycemic Load: <b className="text-[#22271F]">{mealAnalysis.gl}</b></span>
                </div>

                {/* Blood Sugar Impact Banner */}
                <div className={`p-3 rounded border flex items-center justify-between ${impactStyle.bg} ${impactStyle.border}`}>
                  <span className={`text-xs font-semibold ${impactStyle.text}`}>
                    Blood Sugar Impact
                  </span>
                  <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 border rounded ${impactStyle.text} ${impactStyle.border}`}>
                    {mealAnalysis.impact} IMPACT
                  </span>
                </div>

                {/* Insulin Spike Alert */}
                <div className="p-3 bg-[#FFFBEB] border border-[#B5822A]/30 rounded text-xs text-[#92400E] flex items-start gap-2">
                  <Flame className="w-4 h-4 text-[#B5822A] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-semibold">Insulin Spike Alert: </strong>
                    {mealAnalysis.impact === 'HIGH'
                      ? 'Elevated glucose impact. Take a 10-15 minute walk (Shatapadi) within 30 minutes to absorb circulating glucose into muscle cells without an insulin surge.'
                      : 'Low to moderate glucose velocity due to healthy protein & dietary fibre buffers.'}
                  </p>
                </div>

                {/* AI Insight */}
                <div className="p-3 bg-[#DDE3EF] border border-[#2C3E66]/20 rounded text-xs text-[#1D2A46] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#2C3E66] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-semibold">AegisHabit Insight: </strong>
                    {mealAnalysis.insight}
                  </p>
                </div>

                {/* Log button */}
                <button
                  id="log-meal-engine-btn"
                  onClick={handleLogMealToHabits}
                  className="w-full py-2.5 bg-[#2C3E66] text-[#FBFAF3] font-mono text-xs font-semibold rounded hover:bg-[#1D2A46] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Log to Daily Habit Engine
                </button>

                {loggedCount > 0 && (
                  <p className="text-center text-[11px] font-mono text-[#4B7355] font-semibold">
                    ✓ Logged {loggedCount} time{loggedCount > 1 ? 's' : ''} today
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Conversational Voice & Text Habit Logger */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-2">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Talk to AegisHabit</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">NL Health Parser</span>
            </div>
            <p className="text-xs text-[#8B8776] mb-4">
              Works seamlessly in <b>Hindi</b>, <b>Hinglish</b>, or <b>English</b>. Type or speak naturally.
            </p>

            {/* Input Box with Voice & Send */}
            <div className="flex gap-2 mb-3">
              <input
                id="chatInput"
                type="text"
                placeholder="e.g. 2 methi parathe aur 1 cup chai"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitChat()}
                className="flex-1 text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded px-3 py-2 outline-none focus:border-[#22271F]"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-2 border rounded text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening
                    ? 'bg-[#FEF2F2] border-[#A8452C] text-[#A8452C] animate-pulse'
                    : 'border-[#CFC9B4] text-[#55584C] hover:border-[#22271F]'
                }`}
                title="Voice Input (Hindi/English)"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isListening ? 'Stop' : 'Voice'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmitChat()}
                className="px-3 py-2 bg-[#22271F] text-[#FBFAF3] rounded text-xs font-mono font-semibold hover:bg-[#2C3E66] cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmitChat(prompt)}
                  className="px-2.5 py-1 rounded-full border border-[#CFC9B4] text-[11px] text-[#55584C] hover:border-[#2C3E66] hover:text-[#2C3E66] cursor-pointer transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Parsed Logs Stream */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {chatLog.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8B8776] border border-dashed border-[#CFC9B4] rounded">
                  Your parsed entries will appear here. Try tapping one of the prompts above or speaking!
                </div>
              ) : (
                chatLog.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-[#CFC9B4] rounded bg-[#FBFAF3] space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-[#22271F]">"{item.text}"</p>
                      <span className="text-[10px] font-mono text-[#8B8776]">{item.timestamp}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.parsed.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 border rounded text-[10.5px] font-mono font-semibold"
                          style={{ borderColor: p.color, color: p.color }}
                        >
                          {p.type}: {p.detail}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
