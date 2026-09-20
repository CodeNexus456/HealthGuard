export type TabType = 'today' | 'food' | 'lab' | 'radar' | 'report';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  clinic: string;
  doctor: string;
  primaryGoal: string;
  conditions: string[];
}

export interface DailyVitals {
  fastingGlucose: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  restingHeartRate: number;
  waterLitres: number;
  stepsCount: number;
  sleepHours: number;
}

export interface DetailedMealLog {
  id: string;
  name: string;
  calories: number;
  macros: string;
  timestamp: string;
  impact?: 'LOW' | 'MODERATE' | 'HIGH';
  portion?: string;
}

export interface Habit {
  id: string;
  title: string;
  sub: string;
  color: string;
  done: boolean;
}

export interface Nudge {
  id: string;
  title: string;
  desc: string;
  done: boolean;
}

export interface MealFoodItem {
  name: string;
  calories: number;
  macros: string;
}

export interface FoodItemBreakdown {
  name: string;
  hindiName?: string;
  quantity: string; // e.g. "2 मध्यम रोटी (~80g)"
  weightGrams?: number;
  calories: number;
  macros?: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodPhotoAnalysis {
  dishTitle: string;
  totalEstimatedWeightGrams: number;
  totalQuantitySummary: string;
  items: FoodItemBreakdown[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  gl: number;
  impact: 'LOW' | 'MODERATE' | 'HIGH';
  matraDetail: string;
  portionAssessment: 'Under-portioned' | 'Balanced / Balanced Portion' | 'Over-portioned / High Calorie';
  healthTips: string;
  insulinAdvice: string;
}

export interface MealAnalysis {
  foods: [string, number, string][];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  gl: number;
  impact: 'LOW' | 'MODERATE' | 'HIGH';
  insight: string;
}

export interface ParsedHabitItem {
  type: 'Hydration' | 'Sleep' | 'Activity' | 'Food' | 'Stress' | 'Biometric' | 'General';
  color: string;
  detail: string;
}

export interface ChatLogEntry {
  id: number;
  text: string;
  timestamp: string;
  parsed: ParsedHabitItem[];
}

export interface LabReportItem {
  id: string;
  name: string;
  value: string;
  numericVal?: number;
  unit?: string;
  normalRange?: string;
  status: string;
  tone: 'success' | 'amber' | 'red';
  explain: string;
  action: string;
  details?: {
    clinicalSignificance: string;
    targetRange: string;
    lifestyleFactors: string[];
    whenToRetest: string;
  };
}

export interface PlanDay {
  day: string;
  task: string;
  cat: 'Activity' | 'Nutrition' | 'Sleep' | 'Reflection';
  priority: 'High' | 'Medium' | 'On Track';
  reason: string;
}

export interface Recommendation {
  cat: string;
  priority: 'High' | 'Medium' | 'On Track';
  obs: string;
  rec: string;
  action: string;
}

export interface CoachMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp?: string;
}

export interface SymptomResult {
  level: 'green' | 'yellow' | 'red';
  label: string;
  advice: string;
  isEmergency?: boolean;
}
