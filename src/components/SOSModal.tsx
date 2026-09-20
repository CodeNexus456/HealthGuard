import React from 'react';
import { X, PhoneCall, AlertTriangle, ShieldAlert, Heart, Clock } from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22271F]/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-[#FBFAF3] border-2 border-[#A8452C] rounded-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="px-5 py-4 bg-[#FEF2F2] border-b-2 border-[#A8452C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#A8452C] text-[#FBFAF3] rounded">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#A8452C] leading-tight">
                Emergency Medical Response (SOS)
              </h3>
              <p className="text-[11px] font-mono text-[#991B1B]">Immediate clinical protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded border border-[#A8452C] flex items-center justify-center hover:bg-[#A8452C] hover:text-[#FBFAF3] transition-colors cursor-pointer text-[#A8452C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-[#55584C]">
          {/* Direct Dial Emergency Helpline Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <a
              href="tel:112"
              className="p-3 bg-[#A8452C] text-[#FBFAF3] rounded border border-[#A8452C] hover:bg-[#8C3620] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer font-mono"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-xl font-bold">112</span>
              <span className="text-[10px] uppercase tracking-wider">All-India Emergency</span>
            </a>

            <a
              href="tel:102"
              className="p-3 bg-[#22271F] text-[#FBFAF3] rounded border border-[#22271F] hover:bg-[#2C3E66] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer font-mono"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-xl font-bold">102</span>
              <span className="text-[10px] uppercase tracking-wider">Ambulance</span>
            </a>

            <a
              href="tel:108"
              className="p-3 bg-[#B5822A] text-[#FBFAF3] rounded border border-[#B5822A] hover:bg-[#92400E] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer font-mono col-span-2 sm:col-span-1"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-xl font-bold">108</span>
              <span className="text-[10px] uppercase tracking-wider">Disaster & Casualty</span>
            </a>
          </div>

          {/* Cardiovascular Triage (Heart Attack Signs) */}
          <div className="p-3.5 border border-[#CFC9B4] rounded bg-[#FEF2F2]/60">
            <div className="flex items-center gap-1.5 text-[#991B1B] font-bold text-xs mb-1">
              <Heart className="w-4 h-4" />
              <h4>Heart Attack Warning Signs</h4>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[#7F1D1D] leading-relaxed">
              <li>Heavy central chest tightness, squeezing, or crushing pain</li>
              <li>Pain radiating into left arm, neck, jaw, back, or epigastrium</li>
              <li>Cold sweating, shortness of breath, unexplained nausea</li>
            </ul>
            <p className="mt-2 text-[11px] font-semibold text-[#A8452C]">
              Action: Call 112 immediately. Sit upright, keep airway clear.
            </p>
          </div>

          {/* Stroke FAST Protocol */}
          <div className="p-3.5 border border-[#CFC9B4] rounded bg-[#FFFBEB]">
            <div className="flex items-center gap-1.5 text-[#92400E] font-bold text-xs mb-1">
              <Clock className="w-4 h-4" />
              <h4>Stroke F.A.S.T. Assessment</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#78350F]">
              <div><b>F — Face:</b> Is one side of the face drooping when smiling?</div>
              <div><b>A — Arms:</b> Can the person raise both arms steadily?</div>
              <div><b>S — Speech:</b> Is speech slurred, confused, or strange?</div>
              <div><b>T — Time:</b> Call 112 immediately if ANY sign is positive!</div>
            </div>
          </div>

          {/* Local Emergency Casualty Wards */}
          <div className="p-3 border border-[#CFC9B4] rounded bg-[#F1EFE6]/60">
            <h4 className="font-serif font-bold text-xs text-[#22271F] mb-1.5">
              Nearest Level-1 Trauma & Emergency Wards (South Delhi)
            </h4>
            <div className="space-y-1.5 text-[11px] text-[#55584C]">
              <div className="flex justify-between items-center">
                <span><b>AIIMS Trauma Centre</b>, Ring Road</span>
                <span className="font-mono text-[#2C3E66] font-semibold">24×7 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span><b>Safdarjung Hospital Casualty</b>, Ansari Nagar</span>
                <span className="font-mono text-[#2C3E66] font-semibold">24×7 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span><b>Max Super Speciality Hospital</b>, Saket</span>
                <span className="font-mono text-[#2C3E66] font-semibold">24×7 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#F1EFE6] border-t border-[#CFC9B4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#22271F] text-[#FBFAF3] font-mono text-xs font-semibold rounded hover:bg-[#2C3E66] cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
