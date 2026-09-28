import React from 'react';
import { ShieldCheck, LogOut, ArrowRightLeft, UserCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'overview' | 'send' | 'history' | 'security' | 'audit';
  setActiveTab: (tab: 'overview' | 'send' | 'history' | 'security' | 'audit') => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onQuickSwitch: (target: 'sara' | 'ali') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
  onQuickSwitch,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title, single line */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-50" />
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className="text-left font-semibold text-base sm:text-lg tracking-tight text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Mini Secure Wallet
          </button>
        </div>

        {/* Zone 2: Navigation links, clean text with subtle active state */}
        {currentUser ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'overview'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'send'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Send Money
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'history'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Security Lab
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'audit'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Logs
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Cryptographic Hashing</span>
            <span aria-hidden="true">·</span>
            <span>Atomic Ledger</span>
            <span aria-hidden="true">·</span>
            <span>User Isolation</span>
          </div>
        )}

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Account Switcher */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => onQuickSwitch('sara')}
                  title="Switch to Sara"
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    currentUser.name.toLowerCase().includes('sara')
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sara
                </button>
                <button
                  onClick={() => onQuickSwitch('ali')}
                  title="Switch to Ali"
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    currentUser.name.toLowerCase().includes('ali')
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ali
                </button>
              </div>

              {/* Current User Profile Pill */}
              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 tabular-nums truncate max-w-[110px]">
                    Rs. {currentUser.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Mobile Subnav */}
      {currentUser && (
        <div className="flex md:hidden border-t border-slate-200 bg-slate-50/90 px-4 py-2 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'send' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'security' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Security Lab
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Audit Logs
          </button>
        </div>
      )}
    </header>
  );
};
