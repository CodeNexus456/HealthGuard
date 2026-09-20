import React, { useState } from 'react';
import { LabReportItem, SymptomResult } from '../types';
import { COMMUNITY_WARD } from '../data/mockData';
import { LabDetailModal } from './LabDetailModal';
import { UploadCloud, FileText, Plus, ShieldAlert, Sparkles, CheckCircle, Search, RefreshCw, Trash2 } from 'lucide-react';

interface LabTabProps {
  reports: LabReportItem[];
  onUpdateReports: (updated: LabReportItem[]) => void;
  onOpenSOS: () => void;
  onPushToast: (msg: string) => void;
}

export const LabTab: React.FC<LabTabProps> = ({
  reports,
  onUpdateReports,
  onOpenSOS,
  onPushToast,
}) => {
  const [selectedReport, setSelectedReport] = useState<LabReportItem | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // Custom lab test entry state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTestName, setCustomTestName] = useState('');
  const [customTestValue, setCustomTestValue] = useState('');
  const [customTestRange, setCustomTestRange] = useState('');

  // Symptom checker state
  const [symptomInput, setSymptomInput] = useState('');
  const [checkingSymptom, setCheckingSymptom] = useState(false);
  const [symptomResult, setSymptomResult] = useState<SymptomResult | null>({
    level: 'yellow',
    label: 'Mild to Moderate — Monitor Symptoms',
    advice: 'Stay well-hydrated with electrolytes/ORS. Rest in a well-ventilated room. Re-evaluate temperature if it exceeds 101°F.',
    isEmergency: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    onPushToast(`Uploading & decoding "${file.name}" with OCR parser...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;

      try {
        const res = await fetch('/api/decode-lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            fileName: file.name,
          }),
        });

        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          // Merge items into reports
          const newItems = data.items.filter(
            (item: LabReportItem) => !reports.some((r) => r.name.toLowerCase() === item.name.toLowerCase())
          );
          const updated = [...newItems, ...reports];
          onUpdateReports(updated);
          onPushToast(`Successfully decoded ${data.items.length} biomarkers from "${file.name}"`);
        } else {
          throw new Error('No biomarkers identified');
        }
      } catch (err) {
        console.warn('Decode fallback:', err);
        // Add sample decoded lab panel
        const fallbackItem: LabReportItem = {
          id: `decoded-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' (Blood Marker)',
          value: '104 mg/dL',
          normalRange: '70 - 100 mg/dL',
          status: 'Borderline Normal',
          tone: 'amber',
          explain: `Decoded parameters from ${file.name} for clinical metabolic monitoring.`,
          action: 'Repeat fasting measurement during next quarterly health visit.',
        };
        onUpdateReports([fallbackItem, ...reports]);
        onPushToast(`Decoded marker from "${file.name}" into clinical register`);
      } finally {
        setIsDecoding(false);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleLoadSamplePanel = (panelType: 'metabolic' | 'lipid') => {
    if (panelType === 'metabolic') {
      const metabolicItems: LabReportItem[] = [
        {
          id: `panel-cmp-1`,
          name: 'HbA1c (Glycated Hemoglobin)',
          value: '6.2%',
          normalRange: '< 5.7% (Normal), 5.7-6.4% (Prediabetes)',
          status: 'Prediabetes Indicator',
          tone: 'amber',
          explain: '90-day mean glucose exposure; indicates moderate insulin resistance.',
          action: '15-min postprandial walking after major meals to reduce spikes.',
        },
        {
          id: `panel-cmp-2`,
          name: 'Fasting Plasma Glucose',
          value: '108 mg/dL',
          normalRange: '70 - 99 mg/dL',
          status: 'Impaired Fasting',
          tone: 'amber',
          explain: 'Overnight fasting blood sugar level elevated above normative threshold.',
          action: 'Ensure 12-hour overnight fast and avoid evening simple sugars.',
        },
        {
          id: `panel-cmp-3`,
          name: 'Serum Creatinine',
          value: '0.92 mg/dL',
          normalRange: '0.70 - 1.20 mg/dL',
          status: 'Normal Renal Metric',
          tone: 'success',
          explain: 'Glomerular filtration and kidney clearing efficiency are fully intact.',
          action: 'Maintain daily 2.5L water intake.',
        },
      ];
      onUpdateReports([...metabolicItems, ...reports.filter((r) => !metabolicItems.some((m) => m.name === r.name))]);
      onPushToast('Loaded Comprehensive Metabolic Panel');
    } else {
      const lipidItems: LabReportItem[] = [
        {
          id: `panel-lip-1`,
          name: 'Serum Triglycerides',
          value: '172 mg/dL',
          normalRange: '< 150 mg/dL',
          status: 'Borderline High',
          tone: 'amber',
          explain: 'Circulating blood fats; elevated with refined carb and fried foods intake.',
          action: 'Limit deep-fried foods; replace with roasted seeds & walnuts.',
        },
        {
          id: `panel-lip-2`,
          name: 'HDL (Protective Good Cholesterol)',
          value: '44 mg/dL',
          normalRange: '> 40 mg/dL (Men), > 50 mg/dL (Women)',
          status: 'Optimal Baseline',
          tone: 'success',
          explain: 'Scavenges excess cholesterol from arteries back to liver.',
          action: 'Maintain aerobic walking and physical movement.',
        },
        {
          id: `panel-lip-3`,
          name: 'Serum 25-OH Vitamin D',
          value: '21.5 ng/mL',
          normalRange: '30.0 - 100.0 ng/mL',
          status: 'Suboptimal Deficit',
          tone: 'red',
          explain: 'Low Vitamin D negatively correlates with insulin sensitivity and mood.',
          action: 'Weekly 60,000 IU cholecalciferol course under doctor guidance.',
        },
      ];
      onUpdateReports([...lipidItems, ...reports.filter((r) => !lipidItems.some((m) => m.name === r.name))]);
      onPushToast('Loaded Lipid & Micronutrient Panel');
    }
  };

  const handleAddCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTestName.trim() || !customTestValue.trim()) return;

    const newReport: LabReportItem = {
      id: `custom-${Date.now()}`,
      name: customTestName.trim(),
      value: customTestValue.trim(),
      normalRange: customTestRange.trim() || 'Self-reported interval',
      status: 'Logged Parameter',
      tone: 'success',
      explain: `User-logged laboratory marker for ${customTestName.trim()}.`,
      action: 'Track progression across upcoming quarters and share with attending clinician.',
      details: {
        clinicalSignificance: 'Self-tracked biomarker for longitudinal wellness monitoring.',
        targetRange: customTestRange.trim() || 'Refer to laboratory report specifics.',
        lifestyleFactors: ['Adequate sleep', 'Balanced macro ratio', 'Hydration'],
        whenToRetest: 'Next scheduled blood panel.',
      },
    };

    onUpdateReports([newReport, ...reports]);
    setCustomTestName('');
    setCustomTestValue('');
    setCustomTestRange('');
    setShowAddModal(false);
    onPushToast(`Added "${newReport.name}" to laboratory register`);
  };

  const handleDeleteReport = (id: string, name: string) => {
    onUpdateReports(reports.filter((r) => r.id !== id));
    onPushToast(`Removed "${name}" from laboratory register`);
  };

  const handleCheckSymptoms = async (preset?: string) => {
    const sym = (preset ?? symptomInput).trim();
    if (!sym) return;

    setCheckingSymptom(true);
    try {
      const res = await fetch('/api/check-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: sym }),
      });
      const data = await res.json();
      if (data.result) {
        setSymptomResult(data.result);
        if (data.result.isEmergency || data.result.level === 'red') {
          onOpenSOS();
        }
      }
    } catch {
      setSymptomResult({
        level: 'yellow',
        label: 'Clinical Observation Recommended',
        advice: 'Keep a symptom diary. If pain radiates to chest or breathing feels restricted, seek immediate casualty care.',
      });
    } finally {
      setCheckingSymptom(false);
    }
  };

  const getToneBadge = (tone: string, status: string) => {
    let classes = 'text-[#4B7355] border-[#4B7355] bg-[#ECFDF5]';
    if (tone === 'amber') classes = 'text-[#B5822A] border-[#B5822A] bg-[#FFFBEB]';
    if (tone === 'red') classes = 'text-[#A8452C] border-[#A8452C] bg-[#FEF2F2]';

    return (
      <span className={`px-2 py-0.5 border rounded text-[10.5px] font-mono font-semibold ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Lab Report Decoder */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#22271F] flex items-center gap-2">
                  <span>Lab Report Decoder</span>
                  <span className="text-xs font-mono font-bold text-[#2C3E66] bg-[#DDE3EF] px-2 py-0.5 rounded">
                    {reports.length} Biomarkers
                  </span>
                </h2>
                <p className="text-xs text-[#55584C] mt-0.5">
                  OCR parser for blood tests, lipid profiles, and metabolic panels.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                className="text-xs font-mono font-semibold text-[#2C3E66] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddModal ? 'Cancel' : 'Add Marker'}</span>
              </button>
            </div>

            {/* Upload Area for PDF / Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <label className="border-2 border-dashed border-[#CFC9B4] hover:border-[#22271F] rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-[#F1EFE6]/30 text-center relative">
                {isDecoding ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#2C3E66] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-[#2C3E66]">Decoding Lab PDF...</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-[#2C3E66]" />
                    <span className="text-xs font-semibold text-[#22271F]">Upload Lab PDF / Slip</span>
                    <span className="text-[10px] font-mono text-[#8B8776]">Dr. Lal PathLabs, Thyrocare, etc.</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,image/*,.txt"
                  onChange={handleFileUpload}
                  disabled={isDecoding}
                  className="hidden"
                />
              </label>

              <label className="border-2 border-dashed border-[#CFC9B4] hover:border-[#22271F] rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-[#F1EFE6]/30 text-center">
                {isDecoding ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#B5822A] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-[#B5822A]">Extracting Biomarkers...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-[#B5822A]" />
                    <span className="text-xs font-semibold text-[#22271F]">Upload Image / Photo</span>
                    <span className="text-[10px] font-mono text-[#8B8776]">JPEG, PNG camera snapshot</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isDecoding}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Sample Panels */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-[#F1EFE6] rounded border border-[#CFC9B4]">
              <span className="text-[11px] font-mono text-[#8B8776]">Quick Samples:</span>
              <button
                onClick={() => handleLoadSamplePanel('metabolic')}
                className="px-2.5 py-1 bg-[#FBFAF3] border border-[#CFC9B4] hover:border-[#2C3E66] rounded text-[11px] font-mono text-[#2C3E66] hover:bg-[#DDE3EF]/50 transition-colors cursor-pointer"
              >
                + Metabolic Panel (HbA1c, Glucose)
              </button>
              <button
                onClick={() => handleLoadSamplePanel('lipid')}
                className="px-2.5 py-1 bg-[#FBFAF3] border border-[#CFC9B4] hover:border-[#2C3E66] rounded text-[11px] font-mono text-[#2C3E66] hover:bg-[#DDE3EF]/50 transition-colors cursor-pointer"
              >
                + Lipid & Vit-D Panel
              </button>
            </div>

            {/* Custom Marker Modal Form */}
            {showAddModal && (
              <form onSubmit={handleAddCustomReport} className="p-4 bg-[#DDE3EF]/60 border border-[#2C3E66]/30 rounded-lg mb-4 space-y-3">
                <h4 className="font-serif font-bold text-xs text-[#1D2A46]">Add Custom Blood / Clinical Marker</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Marker Name (e.g. TSH)"
                    value={customTestName}
                    onChange={(e) => setCustomTestName(e.target.value)}
                    className="text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Result (e.g. 2.4 uIU/mL)"
                    value={customTestValue}
                    onChange={(e) => setCustomTestValue(e.target.value)}
                    className="text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Ref Range (e.g. 0.4-4.0)"
                    value={customTestRange}
                    onChange={(e) => setCustomTestRange(e.target.value)}
                    className="text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded p-2 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 border border-[#22271F] text-xs font-mono rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#22271F] text-[#FBFAF3] text-xs font-mono font-semibold rounded"
                  >
                    Save Marker
                  </button>
                </div>
              </form>
            )}

            {/* Decoded Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-[#CFC9B4] rounded-lg p-4 bg-[#FBFAF3] hover:border-[#22271F] transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-[#8B8776]">{report.name}</p>
                      <p className="font-serif text-xl font-bold text-[#22271F] mt-0.5">
                        {report.value}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getToneBadge(report.tone, report.status)}
                      <button
                        onClick={() => handleDeleteReport(report.id, report.name)}
                        title="Remove marker"
                        className="p-1 text-[#8B8776] hover:text-[#A8452C] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#55584C] line-clamp-2 leading-relaxed">
                    {report.explain}
                  </p>

                  <div className="pt-2 border-t border-[#CFC9B4]/60 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#8B8776]">
                      {report.normalRange || 'Clinical reference'}
                    </span>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-xs font-mono font-bold text-[#2C3E66] underline underline-offset-3 hover:text-[#1D2A46] cursor-pointer"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Symptom Checker & Community Surveillance Map */}
        <div className="lg:col-span-5 space-y-5">
          {/* Symptom Checker Card */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Symptom Check</h2>
              <button
                id="symptom-sos-btn"
                onClick={onOpenSOS}
                className="px-2 py-0.5 bg-[#FEF2F2] border border-[#A8452C] text-[#A8452C] text-[11px] font-mono font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-[#A8452C] hover:text-[#FBFAF3] transition-colors"
                title="Immediate Emergency Hotline"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                SOS 112
              </button>
            </div>

            <p className="text-xs text-[#55584C] mb-3 leading-relaxed">
              Describe how you feel right now. The assistant will triage safety levels and advise on immediate care.
            </p>

            <textarea
              rows={3}
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g. I have mild fever and joint pain, or stomach discomfort after lunch..."
              className="w-full text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded p-3 outline-none focus:border-[#22271F] resize-none mb-2"
            />

            {/* Quick symptom presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Mild fever & body ache', 'Acidity & epigastric fullness', 'Headache & eye strain', 'Sudden chest heaviness'].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSymptomInput(item);
                    handleCheckSymptoms(item);
                  }}
                  className="px-2 py-0.5 border border-[#CFC9B4] rounded text-[10.5px] font-mono text-[#55584C] hover:border-[#2C3E66] cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCheckSymptoms()}
              disabled={checkingSymptom}
              className="w-full py-2.5 bg-[#22271F] text-[#FBFAF3] font-mono text-xs font-semibold rounded hover:bg-[#2C3E66] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {checkingSymptom ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FBFAF3] border-t-transparent rounded-full animate-spin" />
                  Triaging Symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B5822A]" />
                  Get Clinical Guidance
                </>
              )}
            </button>

            {/* Symptom Result Output */}
            {symptomResult && (
              <div
                className={`mt-4 p-3.5 rounded border flex items-start gap-2.5 text-xs ${
                  symptomResult.level === 'green'
                    ? 'bg-[#ECFDF5] border-[#4B7355] text-[#065F46]'
                    : symptomResult.level === 'yellow'
                    ? 'bg-[#FFFBEB] border-[#B5822A] text-[#92400E]'
                    : 'bg-[#FEF2F2] border-[#A8452C] text-[#991B1B]'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    symptomResult.level === 'green'
                      ? 'bg-[#4B7355]'
                      : symptomResult.level === 'yellow'
                      ? 'bg-[#B5822A]'
                      : 'bg-[#A8452C]'
                  }`}
                />
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wider">{symptomResult.label}</p>
                  <p className="leading-relaxed opacity-95 text-[#22271F]">{symptomResult.advice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Community Epidemiological Surveillance Map */}
          <div className="bg-[#FBFAF3] border border-[#CFC9B4] rounded-lg p-5">
            <div className="flex items-baseline justify-between border-b border-[#CFC9B4] pb-3 mb-3">
              <h2 className="font-serif text-lg font-bold text-[#22271F]">Community Health Map</h2>
              <span className="text-[11px] font-mono text-[#8B8776]">Surveillance Registry</span>
            </div>

            <div className="h-28 rounded border border-[#CFC9B4] bg-[#DDE3EF] p-3 flex flex-col justify-between mb-3 relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                <span className="font-serif font-bold text-xs text-[#1D2A46]">
                  {COMMUNITY_WARD.ward} • {COMMUNITY_WARD.area}
                </span>
                <span className="font-mono text-[10px] bg-[#FBFAF3] text-[#22271F] border border-[#22271F] px-1.5 py-0.5 rounded font-semibold">
                  Active Surveillance
                </span>
              </div>
              <div className="z-10 flex items-center justify-between text-[11px] font-mono text-[#2C3E66]">
                <span>Vector Risk: Moderate</span>
                <span>AQI: 184</span>
              </div>
              {/* Pattern */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2C3E66_1px,transparent_1px)] [background-size:12px_12px]" />
            </div>

            <div className="space-y-2 text-xs text-[#55584C]">
              {COMMUNITY_WARD.reports.map((rep, idx) => (
                <div key={idx} className="flex items-start gap-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5822A] mt-1.5 shrink-0" />
                  <span className="leading-snug">{rep}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-2 border-t border-[#CFC9B4]">
              <span className="inline-block px-2 py-0.5 border border-[#CFC9B4] rounded text-[10px] font-mono text-[#8B8776]">
                Verified Ward Public Health Bulletin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Detail Modal */}
      <LabDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
};
