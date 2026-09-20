import React, { useState } from 'react';
import { UserProfile, DailyVitals } from '../types';
import { X, User, Activity, Heart, Shield, Save, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  vitals: DailyVitals;
  onSaveProfile: (updatedProfile: UserProfile, updatedVitals: DailyVitals) => void;
  onPushToast: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  vitals,
  onSaveProfile,
  onPushToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [vitalData, setVitalData] = useState<DailyVitals>(vitals);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData, vitalData);
    onPushToast(`Patient profile updated for ${formData.name}`);
    onClose();
  };

  const bmi = (formData.weightKg / Math.pow(formData.heightCm / 100, 2)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22271F]/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FBFAF3] border-2 border-[#22271F] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-[#22271F]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#CFC9B4] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-[#22271F] bg-[#DDE3EF] flex items-center justify-center">
              <User className="w-4 h-4 text-[#2C3E66]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">User Profile & Clinical Vitals</h2>
              <p className="text-xs text-[#55584C]">Configure your real clinical demographics and baseline biomarkers.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F1EFE6] text-[#55584C] hover:text-[#22271F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Personal Demographics */}
          <div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2C3E66] mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Personal Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Full Name / Patient Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Suraj Kumar"
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="12"
                  max="110"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  required
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Blood Group</label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  placeholder="e.g. B+, O+, A-"
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">
                  Weight (kg) • <span className="text-[#2C3E66] font-bold">BMI {bmi}</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Clinical Caregiver Details */}
          <div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2C3E66] mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 2. Healthcare Facility & Physician
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Primary Clinic / Hospital</label>
                <input
                  type="text"
                  value={formData.clinic}
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  placeholder="e.g. Chirag Dilli Health Centre"
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Attending Clinician / ASHA Worker</label>
                <input
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="e.g. Dr. A. Sharma, MD"
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Primary Health Target Goal</label>
                <input
                  type="text"
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  placeholder="e.g. Reverse Prediabetes, Lower LDL, Maintain Healthy Weight"
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Daily Ambulatory Vitals */}
          <div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2C3E66] mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 3. Current Daily Vitals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Fasting Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={vitalData.fastingGlucose}
                  onChange={(e) => setVitalData({ ...vitalData, fastingGlucose: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  value={vitalData.bloodPressureSys}
                  onChange={(e) => setVitalData({ ...vitalData, bloodPressureSys: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  value={vitalData.bloodPressureDia}
                  onChange={(e) => setVitalData({ ...vitalData, bloodPressureDia: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Resting HR (bpm)</label>
                <input
                  type="number"
                  value={vitalData.restingHeartRate}
                  onChange={(e) => setVitalData({ ...vitalData, restingHeartRate: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Water Intake (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalData.waterLitres}
                  onChange={(e) => setVitalData({ ...vitalData, waterLitres: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8B8776] mb-1">Daily Steps</label>
                <input
                  type="number"
                  step="100"
                  value={vitalData.stepsCount}
                  onChange={(e) => setVitalData({ ...vitalData, stepsCount: Number(e.target.value) })}
                  className="w-full bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 text-xs font-semibold focus:border-[#22271F] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#CFC9B4] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#22271F] text-xs font-mono rounded hover:bg-[#F1EFE6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#22271F] text-[#FBFAF3] text-xs font-mono font-semibold rounded hover:bg-[#2C3E66] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Profile & Vitals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
