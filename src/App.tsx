import React, { useState, useEffect } from 'react';
import { TabType, Habit, Nudge, ChatLogEntry, UserProfile, DailyVitals, LabReportItem, DetailedMealLog } from './types';
import { INITIAL_HABITS, INITIAL_NUDGES, LAB_REPORTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { TodayTab } from './components/TodayTab';
import { FoodTab } from './components/FoodTab';
import { LabTab } from './components/LabTab';
import { RadarTab } from './components/RadarTab';
import { ReportTab } from './components/ReportTab';
import { CoachModal } from './components/CoachModal';
import { SOSModal } from './components/SOSModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [nudges, setNudges] = useState<Nudge[]>(INITIAL_NUDGES);
  const [loggedMeals, setLoggedMeals] = useState<string[]>(['Methi Parathe & Curd', 'Dal Tadka & Steamed Rice']);
  const [detailedMeals, setDetailedMeals] = useState<DetailedMealLog[]>([
    {
      id: 'meal-init-1',
      name: '2 Methi Parathe + Low-fat Curd + Adrak Chai',
      calories: 380,
      macros: '48g carbs, 12g protein, 14g fat',
      timestamp: '08:30 AM',
      impact: 'MODERATE',
    },
    {
      id: 'meal-init-2',
      name: 'Dal Tadka + Brown Rice + Fresh Cucumber Salad',
      calories: 460,
      macros: '64g carbs, 18g protein, 10g fat',
      timestamp: '01:15 PM',
      impact: 'LOW',
    },
  ]);
  const [projected, setProjected] = useState<boolean>(false);

  // User Profile & Vitals State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Suraj Kumar',
    age: 38,
    gender: 'Male',
    bloodGroup: 'B+',
    heightCm: 174,
    weightKg: 72,
    clinic: 'Chirag Dilli Comprehensive Health Centre',
    doctor: 'Dr. A. Sharma, MD',
    primaryGoal: 'Reverse Prediabetes & Normalize Lipid Panel',
    conditions: ['Impaired Fasting Glucose', 'Suboptimal Vitamin D3'],
  });

  const [dailyVitals, setDailyVitals] = useState<DailyVitals>({
    fastingGlucose: 104,
    bloodPressureSys: 124,
    bloodPressureDia: 82,
    restingHeartRate: 72,
    waterLitres: 2.2,
    stepsCount: 8450,
    sleepHours: 7.2,
  });

  // Lab biomarkers state (shared between Lab Decoder & Report Tab)
  const [labReports, setLabReports] = useState<LabReportItem[]>(LAB_REPORTS);

  // Initial natural language chat log items
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([
    {
      id: 1,
      text: '2 methi parathe aur 1 cup chai subah',
      timestamp: '08:30 AM',
      parsed: [
        { type: 'Food', color: '#B5822A', detail: '2 methi paratha, 1 cup chai' },
        { type: 'General', color: '#4B7355', detail: 'Estimated 380 kcal, 48g carbs' },
      ],
    },
    {
      id: 2,
      text: '30 minute walk subah park mein',
      timestamp: '09:15 AM',
      parsed: [
        { type: 'Activity', color: '#2C3E66', detail: '30 min brisk walk (~3,200 steps)' },
        { type: 'Biometric', color: '#0EA5E9', detail: 'Cortisol morning reset logged' },
      ],
    },
    {
      id: 3,
      text: 'aaj 2 litre paani piya office mein',
      timestamp: '02:00 PM',
      parsed: [
        { type: 'Hydration', color: '#0EA5E9', detail: '2.0 Litres daytime hydration' },
      ],
    },
  ]);

  // Modals & Notifications
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Base metrics
  const diabetesRisk = 48;
  const cvRisk = 42;
  const wellnessScore = 78;
  const readinessScore = 84;

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Habit interactions
  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const updated = !h.done;
          showToast(`Habit "${h.title}" marked as ${updated ? 'completed' : 'pending'}`);
          return { ...h, done: updated };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (title: string, sub: string) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      title,
      sub,
      color: '#2C3E66',
      done: false,
    };
    setHabits((prev) => [newHabit, ...prev]);
    showToast(`Added new micro-habit: "${title}"`);
  };

  const handleToggleNudge = (id: string) => {
    setNudges((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = !n.done;
          showToast(`Nudge "${n.title}" ${updated ? 'checked' : 'unchecked'}`);
          return { ...n, done: updated };
        }
        return n;
      })
    );
  };

  const handleLogMeal = (
    mealName: string,
    calories?: number,
    macros?: string,
    impact?: 'LOW' | 'MODERATE' | 'HIGH'
  ) => {
    setLoggedMeals((prev) => [mealName, ...prev]);
    const newDetailed: DetailedMealLog = {
      id: `meal-${Date.now()}`,
      name: mealName,
      calories: calories || 420,
      macros: macros || 'Carbs: 52g, Protein: 16g, Fat: 12g',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      impact: impact || 'MODERATE',
    };
    setDetailedMeals((prev) => [newDetailed, ...prev]);
  };

  const handleAddChatEntry = (entry: ChatLogEntry) => {
    setChatLog((prev) => [entry, ...prev]);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCoachOpen(false);
        setIsSOSOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1EFE6] text-[#22271F] font-sans selection:bg-[#2C3E66] selection:text-[#FBFAF3]">
      {/* Sticky Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCoach={() => setIsCoachOpen(true)}
        readinessScore={readinessScore}
        patientName={userProfile.name}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'today' && (
          <TodayTab
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            nudges={nudges}
            onToggleNudge={handleToggleNudge}
            diabetesRisk={diabetesRisk}
            cvRisk={cvRisk}
            wellnessScore={wellnessScore}
            projected={projected}
            onToggleProjected={() => setProjected(!projected)}
            onOpenCoach={() => setIsCoachOpen(true)}
            onNavigateTab={setCurrentTab}
            patientName={userProfile.name}
            onOpenProfileModal={() => setIsProfileOpen(true)}
          />
        )}

        {currentTab === 'food' && (
          <FoodTab
            loggedMeals={loggedMeals}
            onLogMeal={handleLogMeal}
            chatLog={chatLog}
            onAddChatEntry={handleAddChatEntry}
            onPushToast={showToast}
          />
        )}

        {currentTab === 'lab' && (
          <LabTab
            reports={labReports}
            onUpdateReports={setLabReports}
            onOpenSOS={() => setIsSOSOpen(true)}
            onPushToast={showToast}
          />
        )}

        {currentTab === 'radar' && (
          <RadarTab onPushToast={showToast} />
        )}

        {currentTab === 'report' && (
          <ReportTab
            patient={userProfile}
            vitals={dailyVitals}
            labReports={labReports}
            habits={habits}
            meals={detailedMeals}
            scores={{
              readiness: readinessScore,
              wellness: wellnessScore,
              prediabetes: diabetesRisk,
              cvStress: cvRisk,
            }}
            onOpenProfileModal={() => setIsProfileOpen(true)}
            onPushToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-[#CFC9B4] bg-[#FBFAF3] py-6 text-xs text-[#55584C]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 border border-[#22271F] rounded flex items-center justify-center font-mono font-bold text-[10px]">
              AH
            </span>
            <span className="font-serif font-bold text-[#22271F]">HealthGuard System</span>
            <span className="text-[11px] font-mono text-[#8B8776]">• Preventive Metabolic Health Engine</span>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px] text-[#8B8776]">
            <span>Clinical guidance only • Not a diagnostic medical device</span>
          </div>
        </div>
      </footer>

      {/* Patient Profile & Baseline Vitals Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        vitals={dailyVitals}
        onSaveProfile={(updatedProfile, updatedVitals) => {
          setUserProfile(updatedProfile);
          setDailyVitals(updatedVitals);
        }}
        onPushToast={showToast}
      />

      {/* AI Health Coach Modal */}
      <CoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        wellnessScore={wellnessScore}
      />

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* System Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
