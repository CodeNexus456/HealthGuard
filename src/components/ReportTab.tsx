import React from 'react';
import { UserProfile, DailyVitals, LabReportItem, Habit, DetailedMealLog } from '../types';
import { exportReportToPDF, exportReportToCSV, exportReportToJSON } from '../utils/reportExporter';
import { Printer, Download, FileText, CheckCircle, UserCheck, Edit3, Database, FileSpreadsheet } from 'lucide-react';

interface ReportTabProps {
  patient: UserProfile;
  vitals: DailyVitals;
  labReports: LabReportItem[];
  habits: Habit[];
  meals: DetailedMealLog[];
  scores: {
    readiness: number;
    wellness: number;
    prediabetes: number;
    cvStress: number;
  };
  onOpenProfileModal: () => void;
  onPushToast: (msg: string) => void;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  patient,
  vitals,
  labReports,
  habits,
  meals,
  scores,
  onOpenProfileModal,
  onPushToast,
}) => {
  const bmi = (patient.weightKg / Math.pow(patient.heightCm / 100, 2)).toFixed(1);
  const doneHabits = habits.filter((h) => h.done).length;

  const handleDownloadPDF = () => {
    try {
      exportReportToPDF({
        patient,
        vitals,
        labReports,
        habits,
        meals,
        scores,
      });
      onPushToast(`Downloaded clinical dossier PDF for ${patient.name}`);
    } catch (err) {
      console.error('PDF export error:', err);
      onPushToast('Failed to generate PDF. Retrying print view...');
      window.print();
    }
  };

  const handleDownloadCSV = () => {
    exportReportToCSV({
      patient,
      vitals,
      labReports,
      habits,
      meals,
      scores,
    });
    onPushToast(`Exported clinical data sheet (CSV) for ${patient.name}`);
  };

  const handleDownloadJSON = () => {
    exportReportToJSON({
      patient,
      vitals,
      labReports,
      habits,
      meals,
      scores,
    });
    onPushToast(`Exported digital health record (JSON) for ${patient.name}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg shadow-xs">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#22271F] flex items-center gap-2">
            <span>Clinical Consultation Dossier</span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#DDE3EF] text-[#2C3E66] rounded font-semibold">
              Live Medical Data
            </span>
          </h2>
          <p className="text-xs text-[#55584C]">
            Ready for download, clinic visits, laboratory records, and ASHA worker consultation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenProfileModal}
            className="px-3 py-1.5 border border-[#CFC9B4] hover:border-[#22271F] rounded text-xs font-mono font-semibold text-[#22271F] hover:bg-[#F1EFE6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#2C3E66]" />
            Edit Demographics
          </button>

          <button
            onClick={handleDownloadCSV}
            title="Download full CSV dataset"
            className="px-3 py-1.5 border border-[#CFC9B4] hover:border-[#22271F] rounded text-xs font-mono font-semibold text-[#55584C] hover:text-[#22271F] hover:bg-[#F1EFE6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#4B7355]" />
            CSV
          </button>

          <button
            onClick={handleDownloadJSON}
            title="Download structured JSON electronic health record"
            className="px-3 py-1.5 border border-[#CFC9B4] hover:border-[#22271F] rounded text-xs font-mono font-semibold text-[#55584C] hover:text-[#22271F] hover:bg-[#F1EFE6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#B5822A]" />
            JSON
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 bg-[#2C3E66] text-[#FBFAF3] rounded text-xs font-mono font-semibold hover:bg-[#1D2A46] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#22271F] text-[#FBFAF3] rounded text-xs font-mono font-semibold hover:bg-[#2C3E66] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Official Printable Medical Dossier Paper Sheet */}
      <div
        id="clinical-report-sheet"
        className="card p-6 sm:p-8 bg-[#FBFAF3] border-2 border-[#22271F] rounded-lg shadow-sm space-y-6 text-[#22271F]"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#22271F] pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 border border-[#22271F] rounded flex items-center justify-center font-mono font-bold text-xs bg-[#22271F] text-[#FBFAF3]">
                HG
              </span>
              <span className="font-serif text-xl font-bold tracking-tight">HealthGuard Clinical Summary</span>
            </div>
            <p className="text-xs font-mono text-[#8B8776]">
              Aegis Preventive Health & Metabolic Register • Ward 12 Surveillance Registry
            </p>
          </div>
          <div className="text-left sm:text-right font-mono text-[11px] text-[#55584C]">
            <p><strong>Dossier ID:</strong> HG-2026-9042</p>
            <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F1EFE6] border border-[#CFC9B4] rounded text-xs font-mono">
          <div>
            <span className="text-[#8B8776] block text-[10px]">PATIENT NAME</span>
            <strong className="text-[#22271F] text-sm">{patient.name}</strong>
          </div>
          <div>
            <span className="text-[#8B8776] block text-[10px]">AGE / GENDER / BLOOD</span>
            <span className="text-[#22271F] font-semibold">{patient.age} Y / {patient.gender} • {patient.bloodGroup}</span>
          </div>
          <div>
            <span className="text-[#8B8776] block text-[10px]">BIOMETRICS (BMI)</span>
            <span className="text-[#22271F] font-semibold">{patient.heightCm}cm | {patient.weightKg}kg • BMI {bmi}</span>
          </div>
          <div>
            <span className="text-[#8B8776] block text-[10px]">PRIMARY CLINIC</span>
            <span className="text-[#22271F] font-semibold">{patient.clinic}</span>
          </div>
        </div>

        {/* Section 1: Metabolic & Biometric Risk Summary */}
        <div>
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#22271F] border-b border-[#CFC9B4] pb-1.5 mb-3">
            1. Metabolic & Biological Risk Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
              <span className="text-[10px] font-mono uppercase text-[#8B8776]">Readiness</span>
              <strong className="block text-2xl font-serif text-[#4B7355] mt-0.5">{scores.readiness}%</strong>
              <span className="text-[10.5px] font-mono text-[#4B7355] font-semibold">Optimal Baseline</span>
            </div>
            <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
              <span className="text-[10px] font-mono uppercase text-[#8B8776]">Composite Wellness</span>
              <strong className="block text-2xl font-serif text-[#2C3E66] mt-0.5">{scores.wellness} / 100</strong>
              <span className="text-[10.5px] font-mono text-[#2C3E66] font-semibold">Stable Baseline</span>
            </div>
            <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
              <span className="text-[10px] font-mono uppercase text-[#8B8776]">Prediabetes Risk</span>
              <strong className="block text-2xl font-serif text-[#B5822A] mt-0.5">{scores.prediabetes}%</strong>
              <span className="text-[10.5px] font-mono text-[#B5822A] font-semibold">
                {scores.prediabetes > 50 ? 'Impaired Glucose' : 'Borderline Managed'}
              </span>
            </div>
            <div className="border border-[#CFC9B4] rounded p-3 bg-[#FBFAF3]">
              <span className="text-[10px] font-mono uppercase text-[#8B8776]">Cardiovascular Stress</span>
              <strong className="block text-2xl font-serif text-[#22271F] mt-0.5">{scores.cvStress}%</strong>
              <span className="text-[10.5px] font-mono text-[#55584C] font-semibold">Moderate Index</span>
            </div>
          </div>
        </div>

        {/* Section 2: Ambulatory Vitals */}
        <div>
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#22271F] border-b border-[#CFC9B4] pb-1.5 mb-2">
            2. Ambulatory Vitals & Routine Physiological Indicators
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono bg-[#F1EFE6]/70 p-3 rounded border border-[#CFC9B4]">
            <div>
              <span className="text-[#8B8776] text-[10px] block">FASTING SUGAR</span>
              <strong className="text-[#22271F]">{vitals.fastingGlucose} mg/dL</strong>
            </div>
            <div>
              <span className="text-[#8B8776] text-[10px] block">BLOOD PRESSURE</span>
              <strong className="text-[#22271F]">{vitals.bloodPressureSys}/{vitals.bloodPressureDia} mmHg</strong>
            </div>
            <div>
              <span className="text-[#8B8776] text-[10px] block">RESTING HR</span>
              <strong className="text-[#22271F]">{vitals.restingHeartRate} bpm</strong>
            </div>
            <div>
              <span className="text-[#8B8776] text-[10px] block">HYDRATION</span>
              <strong className="text-[#22271F]">{vitals.waterLitres} Litres</strong>
            </div>
            <div>
              <span className="text-[#8B8776] text-[10px] block">DAILY STEPS</span>
              <strong className="text-[#22271F]">{vitals.stepsCount.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[#8B8776] text-[10px] block">SLEEP DURATION</span>
              <strong className="text-[#22271F]">{vitals.sleepHours} Hours</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Laboratory Panel Profile */}
        <div>
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#22271F] border-b border-[#CFC9B4] pb-1.5 mb-3 flex items-center justify-between">
            <span>3. Laboratory Biomarker Profile ({labReports.length} Registered Markers)</span>
            <span className="text-[11px] font-mono text-[#8B8776] lowercase">verified OCR & clinical logs</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-[#CFC9B4]">
              <thead className="bg-[#F1EFE6] font-mono text-[11px] text-[#55584C] border-b border-[#CFC9B4]">
                <tr>
                  <th className="p-2.5">Biomarker</th>
                  <th className="p-2.5">Result</th>
                  <th className="p-2.5">Standard Reference</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Clinical Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CFC9B4] font-mono">
                {labReports.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F1EFE6]/30">
                    <td className="p-2.5 font-sans font-semibold text-[#22271F]">{item.name}</td>
                    <td className="p-2.5 font-bold text-[#22271F]">{item.value}</td>
                    <td className="p-2.5 text-[#8B8776]">{item.normalRange}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 border rounded text-[10px] font-semibold ${
                          item.tone === 'success'
                            ? 'text-[#4B7355] border-[#4B7355] bg-[#ECFDF5]'
                            : item.tone === 'amber'
                            ? 'text-[#B5822A] border-[#B5822A] bg-[#FFFBEB]'
                            : 'text-[#A8452C] border-[#A8452C] bg-[#FEF2F2]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-[11px] text-[#55584C] max-w-xs truncate">
                      {item.action || 'Continue routine tracking'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Nutrition & Micro-Habits Adherence */}
        <div>
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#22271F] border-b border-[#CFC9B4] pb-1.5 mb-3">
            4. Nutrition & Behavioral Adherence Trajectory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-[#CFC9B4] rounded p-3 space-y-2 bg-[#FBFAF3]">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-[#22271F]">Today's Logged Meals & Calories</span>
                <span className="font-mono text-[10.5px] text-[#2C3E66] font-bold">
                  {meals.reduce((acc, m) => acc + m.calories, 0)} Total kcal
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-[#55584C]">
                {meals.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex justify-between items-center py-0.5 border-b border-[#CFC9B4]/40">
                    <span className="font-sans font-medium text-[#22271F]">{m.name}</span>
                    <span>{m.calories} kcal • {m.macros}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#CFC9B4] rounded p-3 space-y-2 bg-[#FBFAF3]">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-[#22271F]">Micro-Habits Compliance</span>
                <span className="font-mono text-[10.5px] text-[#4B7355] font-bold">
                  {doneHabits} / {habits.length} Completed
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-[#55584C]">
                {habits.slice(0, 4).map((h) => (
                  <div key={h.id} className="flex justify-between items-center py-0.5 border-b border-[#CFC9B4]/40">
                    <span className="font-sans font-medium text-[#22271F]">{h.title}</span>
                    <span className={h.done ? 'text-[#4B7355] font-bold' : 'text-[#8B8776]'}>
                      {h.done ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Clinical Recommendations & Next Steps */}
        <div>
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#22271F] border-b border-[#CFC9B4] pb-1.5 mb-2">
            5. Physician & ASHA Caregiver Clinical Action Plan
          </h3>
          <div className="space-y-2 text-xs text-[#55584C]">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4B7355] shrink-0 mt-0.5" />
              <p>
                <strong>Glycemic Control: </strong> Maintain 15-minute postprandial walking (Shatapadi); repeat fasting blood glucose in 45 days and HbA1c in 90 days.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4B7355] shrink-0 mt-0.5" />
              <p>
                <strong>Dietary Fiber Protocol: </strong> Consume fresh cucumber or vegetable salad and protein sources (dal/paneer/eggs) before eating roti/rice to flatten glycemic peaks.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4B7355] shrink-0 mt-0.5" />
              <p>
                <strong>Micronutrient Optimization: </strong> Review weekly cholecalciferol (Vitamin D3) regimen with attending doctor ({patient.doctor}) to reach target serum &gt;30 ng/mL.
              </p>
            </div>
          </div>
        </div>

        {/* Clinician Signature Line */}
        <div className="pt-6 border-t-2 border-[#22271F] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs font-mono">
          <div>
            <p className="text-[#8B8776]">HEALTH SYSTEM VERIFICATION</p>
            <p className="text-[#22271F] font-bold">HealthGuard Preventive Care & {patient.clinic}</p>
            <p className="text-[#55584C] text-[11px]">Authorized Clinician: {patient.doctor}</p>
          </div>
          <div className="w-56 text-center border-t border-[#22271F] pt-2">
            <span className="text-[11px] text-[#55584C]">Attending Clinician / ASHA Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};
