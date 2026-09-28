import React, { useState } from 'react';
import {
  Send,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { User, Transaction } from '../types';

interface WalletOverviewProps {
  user: User;
  recentTransactions: Transaction[];
  onOpenSendModal: () => void;
  onOpenDepositModal: () => void;
  onNavigateToHistory: () => void;
  onNavigateToSecurity: () => void;
  onSelectTransaction: (txn: Transaction) => void;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  user,
  recentTransactions,
  onOpenSendModal,
  onOpenDepositModal,
  onNavigateToHistory,
  onNavigateToSecurity,
  onSelectTransaction,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Welcome & Account Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Verified Authenticated Session</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{user.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Welcome, {user.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDepositModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Top-up Voucher
          </button>
          <button
            onClick={onOpenSendModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            Send Money
          </button>
        </div>
      </div>

      {/* Grid: Wallet Card & Security Controls Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Primary Card (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          {/* Subtle geometric background pattern */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-80 h-full opacity-5 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Card Top: Branding & Account Info */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                Mini Secure Wallet Account
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-sm tracking-wider text-slate-200">
                  {user.accountNumber}
                </span>
                <button
                  onClick={handleCopyAccount}
                  title="Copy account number"
                  className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Isolated Vault</span>
            </div>
          </div>

          {/* Card Center: Available Balance */}
          <div className="my-6 relative z-10">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Current Available Balance
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-semibold text-emerald-400">Rs.</span>
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight tabular-nums text-white">
                {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Card Bottom: Metadata and quick actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 relative z-10">
            <div className="flex items-center gap-2">
              <span>Cardholder</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-200 font-semibold">{user.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSendModal}
                className="text-white hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Initiate Transfer</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Controls Status Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Security Guardrails
                </h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Active & Enforced
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Password Storage</span>
                <span className="font-mono text-slate-900 text-right">PBKDF2-SHA256 (100k)</span>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Direct Tamper Protection</span>
                <span className="font-semibold text-emerald-700">Strictly Blocked</span>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Ledger Integrity</span>
                <span className="font-mono text-slate-900">HMAC-SHA256 Signed</span>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Access Isolation</span>
                <span className="text-slate-900 font-medium">BOLA / IDOR Shield</span>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-500">Biometric MFA (FIDO2)</span>
                <span className="text-emerald-700 font-medium">TouchID / FaceID Ready</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Audit Logging</span>
                <span className="text-emerald-700 font-medium">Continuous Recording</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={onNavigateToSecurity}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <span>Open Attack Simulation Lab</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified double-entry ledger transfers for your account
            </p>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No transactions yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your wallet ledger is pristine. Send money to any registered account or use the top-up voucher to begin recording transactions.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={onOpenSendModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Send First Transfer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Party</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentTransactions.slice(0, 5).map((txn) => {
                  const isDebit = txn.senderId === user.id;
                  const partyName = isDebit ? txn.receiverName : txn.senderName;
                  const partyAccount = isDebit ? txn.receiverAccount : txn.senderAccount;

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {txn.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {isDebit ? (
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                              Sent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-800 font-medium">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                              Received
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{partyName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {partyAccount}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{txn.date}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {txn.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {isDebit ? (
                          <span className="text-rose-600">
                            - Rs. {txn.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            + Rs. {txn.amount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onSelectTransaction(txn)}
                          title="Verify cryptographic signature"
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
