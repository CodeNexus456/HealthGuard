import React from 'react';
import { LabReportItem } from '../types';
import { X, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface LabDetailModalProps {
  report: LabReportItem | null;
  onClose: () => void;
}

export const LabDetailModal: React.FC<LabDetailModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const getToneIcon = (tone: string) => {
    if (tone === 'success') return <CheckCircle className="w-5 h-5 text-[#4B7355]" />;
    if (tone === 'amber') return <AlertTriangle className="w-5 h-5 text-[#B5822A]" />;
    return <ShieldAlert className="w-5 h-5 text-[#A8452C]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22271F]/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-[#FBFAF3] border-2 border-[#22271F] rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#CFC9B4] flex items-center justify-between bg-[#F1EFE6]">
          <div className="flex items-center gap-2.5">
            {getToneIcon(report.tone)}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#22271F] leading-tight">
                {report.name}
              </h3>
              <p className="text-[11px] font-mono text-[#8B8776]">Clinical Parameter Decoder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded border border-[#22271F] flex items-center justify-center hover:bg-[#22271F] hover:text-[#FBFAF3] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-[#55584C] leading-relaxed">
          {/* Main Reading & Status */}
          <div className="p-3.5 border border-[#CFC9B4] rounded bg-[#FBFAF3] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#8B8776] font-semibold">Your Result</span>
              <span className="block font-serif text-2xl font-bold text-[#22271F] mt-0.5">
                {report.value}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-[#8B8776] font-semibold">Status</span>
              <span
                className={`block font-mono font-bold text-xs uppercase px-2.5 py-1 border rounded mt-0.5 ${
                  report.tone === 'success'
                    ? 'bg-[#ECFDF5] text-[#4B7355] border-[#4B7355]'
                    : report.tone === 'amber'
                    ? 'bg-[#FFFBEB] text-[#B5822A] border-[#B5822A]'
                    : 'bg-[#FEF2F2] text-[#A8452C] border-[#A8452C]'
                }`}
              >
                {report.status}
              </span>
            </div>
          </div>

          {/* Reference Interval */}
          {report.normalRange && (
            <div className="p-3 border border-[#CFC9B4] rounded bg-[#F1EFE6]/50">
              <strong className="block text-[#22271F] font-mono mb-1">Standard Clinical Reference Interval:</strong>
              <p className="font-mono text-[11.5px] text-[#2C3E66]">{report.normalRange}</p>
            </div>
          )}

          {/* Physiological Explanation */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#22271F] mb-1">What this marker measures</h4>
            <p className="text-[#55584C]">{report.explain}</p>
          </div>

          {/* Clinical Significance */}
          {report.details && (
            <div>
              <h4 className="font-serif font-bold text-sm text-[#22271F] mb-1">Long-term Health Impact</h4>
              <p className="text-[#55584C]">{report.details.clinicalSignificance}</p>
            </div>
          )}

          {/* Lifestyle Levers */}
          {report.details?.lifestyleFactors && (
            <div className="p-3.5 bg-[#DDE3EF] border border-[#2C3E66]/20 rounded">
              <h4 className="font-serif font-bold text-xs text-[#1D2A46] mb-1.5">Actionable Lifestyle Levers</h4>
              <ul className="list-disc list-inside space-y-1 text-[#2C3E66]">
                {report.details.lifestyleFactors.map((factor, idx) => (
                  <li key={idx} className="leading-snug">{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Retest Interval */}
          {report.details?.whenToRetest && (
            <div className="text-[11px] font-mono text-[#8B8776] border-t border-[#CFC9B4] pt-3">
              <strong>Retest Window: </strong> {report.details.whenToRetest}
            </div>
          )}

          {/* Doctor Advisory */}
          <p className="text-[10.5px] text-[#8B8776] italic border-t border-[#CFC9B4] pt-2">
            HealthGuard values are compiled from your lab panels to help you understand your preventive health trends. Always discuss abnormal lab results with a registered medical practitioner.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#F1EFE6] border-t border-[#CFC9B4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#22271F] text-[#FBFAF3] font-mono text-xs font-semibold rounded hover:bg-[#2C3E66] cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
