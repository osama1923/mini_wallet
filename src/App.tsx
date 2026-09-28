import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';
import { WalletOverview } from './components/WalletOverview';
import { SendMoneyModal } from './components/SendMoneyModal';
import { TransactionHistory } from './components/TransactionHistory';
import { SecurityLab } from './components/SecurityLab';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ReceiptModal } from './components/ReceiptModal';
import { DepositModal } from './components/DepositModal';
import { AuthModal } from './components/AuthModal';
import { api, getAuthToken } from './services/api';
import { User, Transaction, AuditLog } from './types';
import { CheckCircle2, AlertCircle, Info, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'history' | 'security' | 'audit'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  // Modals
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initial load
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
          await loadDashboardData();
          return;
        } catch {
          // Token expired or invalid, auto-login as Sara for instant evaluator demo
        }
      }
      // Auto-login as Sara to provide seamless first-touch evaluation experience
      const demoRes = await api.switchUser('sara');
      setCurrentUser(demoRes.user);
      await loadDashboardData();
    } catch (err: any) {
      console.error('Failed to initialize session:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [txRes, logRes] = await Promise.all([
        api.getTransactions().catch(() => ({ transactions: [] })),
        api.getAuditLogs().catch(() => ({ logs: [] })),
      ]);
      setTransactions(txRes.transactions);
      setAuditLogs(logRes.logs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const refreshWallet = async () => {
    try {
      const [userRes, txRes, logRes] = await Promise.all([
        api.getCurrentUser(),
        api.getTransactions(),
        api.getAuditLogs(),
      ]);
      setCurrentUser(userRes.user);
      setTransactions(txRes.transactions);
      setAuditLogs(logRes.logs);
    } catch (err) {
      console.error('Error refreshing wallet:', err);
    }
  };

  const handleQuickSwitch = async (target: 'sara' | 'ali') => {
    try {
      setLoading(true);
      const res = await api.switchUser(target);
      setCurrentUser(res.user);
      setIsAuthModalOpen(false);
      await loadDashboardData();
      showToast(`Switched active session to ${res.user.name} (Balance: Rs. ${res.user.balance.toLocaleString()})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all balances to initial state: Sara: Rs. 2,000 and Ali: Rs. 0?')) {
      return;
    }
    try {
      setLoading(true);
      await api.resetDemo();
      const res = await api.switchUser('sara');
      setCurrentUser(res.user);
      await loadDashboardData();
      showToast('Account balances reset to initial state: Sara (Rs. 2,000), Ali (Rs. 0)', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setCurrentUser(null);
      setIsAuthModalOpen(true);
      showToast('You have been logged out securely.', 'info');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleTransferSuccess = (txn: Transaction, newBalance: number) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, balance: newBalance });
    }
    setTransactions((prev) => [txn, ...prev]);
    showToast(`Transferred Rs. ${txn.amount.toLocaleString()} to ${txn.receiverName} successfully!`, 'success');
    refreshWallet();
  };

  const handleDepositSuccess = (newBalance: number) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, balance: newBalance });
    }
    showToast(`Deposit completed. New balance: Rs. ${newBalance.toLocaleString()}`, 'success');
    refreshWallet();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Step Guide Bar for Evaluator Presentation */}
      <DemoWalkthroughBar
        currentUser={currentUser}
        onQuickSwitch={handleQuickSwitch}
        onResetDemo={handleResetDemo}
        onOpenSendModal={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsSendModalOpen(true);
        }}
        onNavigateToSecurity={() => setActiveTab('security')}
      />

      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onQuickSwitch={handleQuickSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-medium">Verifying Session & Ledger State...</div>
          </div>
        ) : !currentUser ? (
          <div className="py-8">
            <AuthModal
              onSuccess={(user) => {
                setCurrentUser(user);
                setIsAuthModalOpen(false);
                loadDashboardData();
                showToast(`Welcome, ${user.name}!`, 'success');
              }}
              onQuickSwitch={handleQuickSwitch}
            />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <WalletOverview
                user={currentUser}
                recentTransactions={transactions}
                onOpenSendModal={() => setIsSendModalOpen(true)}
                onOpenDepositModal={() => setIsDepositModalOpen(true)}
                onNavigateToHistory={() => setActiveTab('history')}
                onNavigateToSecurity={() => setActiveTab('security')}
                onSelectTransaction={(txn) => setSelectedReceiptTxn(txn)}
              />
            )}

            {activeTab === 'send' && (
              <div className="max-w-xl mx-auto py-4">
                <div className="mb-6">
                  <div className="text-xs text-slate-500 font-medium">
                    Financial Ledger Dispatch
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    Send Money to Registered Account
                  </h1>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <button
                    onClick={() => setIsSendModalOpen(true)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Open Transfer Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Click to launch the transfer dialog with dynamic balance validation and atomic confirmation.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <TransactionHistory
                currentUser={currentUser}
                transactions={transactions}
                onSelectTransaction={(txn) => setSelectedReceiptTxn(txn)}
                onOpenSendModal={() => setIsSendModalOpen(true)}
              />
            )}

            {activeTab === 'security' && (
              <SecurityLab
                currentUser={currentUser}
                onRefreshWallet={refreshWallet}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogViewer
                logs={auditLogs}
                onRefresh={async () => {
                  setLoadingAudit(true);
                  try {
                    const res = await api.getAuditLogs();
                    setAuditLogs(res.logs);
                    showToast('Audit trail refreshed', 'info');
                  } finally {
                    setLoadingAudit(false);
                  }
                }}
                loading={loadingAudit}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      {isSendModalOpen && currentUser && (
        <SendMoneyModal
          currentUser={currentUser}
          onClose={() => setIsSendModalOpen(false)}
          onSuccess={handleTransferSuccess}
          onQuickSwitchToReceiver={(receiverName) => {
            const target = receiverName.toLowerCase().includes('ali') ? 'ali' : 'sara';
            handleQuickSwitch(target);
          }}
        />
      )}

      {isDepositModalOpen && (
        <DepositModal
          onClose={() => setIsDepositModalOpen(false)}
          onSuccess={handleDepositSuccess}
        />
      )}

      {selectedReceiptTxn && (
        <ReceiptModal
          transaction={selectedReceiptTxn}
          onClose={() => setSelectedReceiptTxn(null)}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-3.5 rounded-xl shadow-lg border text-xs flex items-center gap-2.5 max-w-md ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-900'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mini Secure Fintech Wallet</span>
            <span aria-hidden="true">·</span>
            <span>Security Engineering & Controls Demonstration</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>PBKDF2-SHA256</span>
            <span aria-hidden="true">·</span>
            <span>Atomic Ledger</span>
            <span aria-hidden="true">·</span>
            <span>HMAC-SHA256 Checksums</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
