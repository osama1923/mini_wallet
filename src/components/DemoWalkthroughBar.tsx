import React from 'react';
import { RotateCcw, ArrowRight, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import { User as UserType } from '../types';

interface DemoWalkthroughBarProps {
  currentUser: UserType | null;
  onQuickSwitch: (target: 'sara' | 'ali') => void;
  onResetDemo: () => void;
  onOpenSendModal: () => void;
  onNavigateToSecurity: () => void;
}

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({
  currentUser,
  onQuickSwitch,
  onResetDemo,
  onOpenSendModal,
  onNavigateToSecurity,
}) => {
  const isSara = currentUser?.name.toLowerCase().includes('sara');
  const isAli = currentUser?.name.toLowerCase().includes('ali');

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Step Guidance for Assignment Presentation */}
        <div className="flex items-center flex-wrap gap-2 text-slate-300">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Presentation Demo Flow:
          </span>

          {/* Quick step buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onQuickSwitch('sara')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                isSara
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <User className="w-3 h-3" />
              1. As Sara (Rs. 2,000)
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={onOpenSendModal}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              2. Transfer Rs. 1,000 to Ali
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={() => onQuickSwitch('ali')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                isAli
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <User className="w-3 h-3" />
              3. As Ali (Verify Rs. 1,000)
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={onNavigateToSecurity}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              4. Before & After Security Lab
            </button>
          </div>
        </div>

        {/* Right: Reset Demo DB Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemo}
            title="Reset balances to Sara: Rs. 2,000, Ali: Rs. 0"
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            Reset Initial Balances
          </button>
        </div>
      </div>
    </div>
  );
};
