import React from 'react';
import { TabType } from '../types';
import { Sparkles, User, FileDown } from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCoach: () => void;
  readinessScore: number;
  patientName?: string;
  onOpenProfile?: () => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'food', label: 'Food & Photo AI' },
  { id: 'lab', label: 'Lab Decoder' },
  { id: 'radar', label: 'Risk Radar' },
  { id: 'report', label: 'Health Report' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenCoach,
  readinessScore,
  patientName = 'Suraj Kumar',
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFAF3] border-b-2 border-[#22271F] transition-all">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onTabChange('today')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-[34px] h-[34px] border-[1.5px] border-[#22271F] rounded flex items-center justify-center font-mono font-semibold text-xs text-[#22271F] group-hover:bg-[#22271F] group-hover:text-[#FBFAF3] transition-colors">
            AH
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="font-serif text-[18px] sm:text-[19px] font-bold tracking-tight text-[#22271F] leading-tight">
              HealthGuard
            </span>
            <span className="text-[11px] font-mono text-[#8B8776] font-medium leading-none">
              daily health register
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-0.5">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 text-[13px] font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#2C3E66] text-[#22271F] font-semibold'
                    : 'border-transparent text-[#55584C] hover:text-[#22271F]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User Profile Trigger Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              title="Edit Patient Demographics & Baseline Vitals"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-[#22271F] bg-[#F1EFE6] hover:bg-[#E5E1D1] rounded border border-[#CFC9B4] transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#2C3E66] text-[#FBFAF3] flex items-center justify-center text-[10px] font-bold">
                {patientName.charAt(0)}
              </div>
              <span className="hidden sm:inline font-sans font-semibold text-xs truncate max-w-[90px]">
                {patientName}
              </span>
            </button>
          )}

          {/* Readiness Indicator */}
          <div className="hidden xs:flex items-baseline gap-1.5 text-xs font-mono text-[#55584C] bg-[#F1EFE6] px-2.5 py-1 rounded border border-[#CFC9B4]">
            <span className="hidden sm:inline text-[#8B8776]">Readiness</span>
            <span className="font-bold text-[#22271F]">{readinessScore}%</span>
          </div>

          {/* Ask Coach Button */}
          <button
            id="nav-ask-coach-btn"
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 px-3 py-1 border-[1.5px] border-[#22271F] rounded text-xs font-mono font-semibold text-[#22271F] hover:bg-[#22271F] hover:text-[#FBFAF3] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B5822A]" />
            <span>Ask coach</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-[#F1EFE6] border-t border-[#CFC9B4]">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#22271F] text-[#FBFAF3] font-semibold'
                  : 'text-[#55584C] hover:bg-[#E5E1D1]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
