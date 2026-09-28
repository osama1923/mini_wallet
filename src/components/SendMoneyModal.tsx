import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Lock,
} from 'lucide-react';
import { User, RecipientUser, Transaction } from '../types';
import { api } from '../services/api';

interface SendMoneyModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (txn: Transaction, newBalance: number) => void;
  onQuickSwitchToReceiver?: (receiverName: string) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
  onQuickSwitchToReceiver,
}) => {
  const [recipients, setRecipients] = useState<RecipientUser[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [amount, setAmount] = useState<string>('1000');
  const [note, setNote] = useState<string>('Project settlement');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingRecipients, setFetchingRecipients] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [createdTxn, setCreatedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    async function loadRecipients() {
      try {
        setFetchingRecipients(true);
        const res = await api.getRecipients();
        setRecipients(res.users);
        if (res.users.length > 0) {
          setSelectedRecipientId(res.users[0].id);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to fetch registered recipients.');
      } finally {
        setFetchingRecipients(false);
      }
    }
    loadRecipients();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const isExceedingBalance = numAmount > currentUser.balance;
  const isInvalidAmount = isNaN(numAmount) || numAmount <= 0;
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedRecipient) {
      setErrorMessage('Please select a valid recipient.');
      return;
    }
    if (isInvalidAmount) {
      setErrorMessage('Please enter a valid amount greater than Rs. 0.');
      return;
    }
    if (isExceedingBalance) {
      setErrorMessage(`Insufficient balance: You only have Rs. ${currentUser.balance.toLocaleString()} available.`);
      return;
    }

    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.transfer(selectedRecipientId, numAmount, note);
      setCreatedTxn(res.transaction);
      setStep('success');
      onSuccess(res.transaction, res.updatedBalance);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed. Transaction aborted.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                {step === 'form' && 'Send Money via Secure Ledger'}
                {step === 'confirm' && 'Verify & Confirm Transfer'}
                {step === 'success' && 'Transfer Executed Successfully'}
              </h3>
              <p className="text-xs text-slate-500">
                Double-entry atomic ledger with balance lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Security Gatekeeper Rejection:</span> {errorMessage}
              </div>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleReview} className="space-y-4">
              {/* Sender Info Banner */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Sender (Your Account)</div>
                  <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="font-mono text-slate-400 text-[11px]">{currentUser.accountNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Available Balance</div>
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    Rs. {currentUser.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Registered Receiver
                </label>
                {fetchingRecipients ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                    Loading registered recipients...
                  </div>
                ) : recipients.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No other registered users found. Switch accounts or register another user.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedRecipientId}
                      onChange={(e) => setSelectedRecipientId(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {recipients.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.accountNumber}) — {r.email}
                        </option>
                      ))}
                    </select>

                    {selectedRecipient && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <div>
                            <span className="font-medium text-emerald-900">{selectedRecipient.name}</span>
                            <span className="text-emerald-700 text-[11px] block font-mono">
                              Verified Account: {selectedRecipient.accountNumber}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                          Registered
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Transfer Amount (Rs.)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Limit: Rs. {currentUser.balance.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
                    Rs.
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={currentUser.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    className={`w-full pl-12 pr-4 py-2.5 text-base font-mono tabular-nums font-semibold border rounded-lg focus:outline-none transition-colors ${
                      isExceedingBalance
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-900'
                    }`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[100, 500, 1000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className="px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                    >
                      Rs. {preset}
                    </button>
                  ))}
                  {currentUser.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(currentUser.balance.toString())}
                      className="px-2.5 py-1 text-xs font-mono tabular-nums bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded transition-colors cursor-pointer font-medium"
                    >
                      Max (Rs. {currentUser.balance.toLocaleString()})
                    </button>
                  )}
                </div>

                {isExceedingBalance && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Amount exceeds available balance of Rs. {currentUser.balance.toLocaleString()}.
                  </p>
                )}
              </div>

              {/* Note / Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transfer Note / Reference
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Rent, Freelance payment, Demo transfer"
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isExceedingBalance || isInvalidAmount || !selectedRecipient}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Review Transfer Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Transaction Type</span>
                  <span className="font-semibold text-slate-900">Direct Ledger Transfer</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">From (Sender)</span>
                  <span className="font-medium text-slate-900">
                    {currentUser.name} ({currentUser.accountNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">To (Recipient)</span>
                  <span className="font-medium text-slate-900">
                    {selectedRecipient?.name} ({selectedRecipient?.accountNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Transfer Amount</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    Rs. {numAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Remaining Balance</span>
                  <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                    Rs. {(currentUser.balance - numAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Memo</span>
                  <span className="text-slate-700 italic">{note || 'Funds Transfer'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  This operation executes atomically. Sender debit and receiver credit are committed simultaneously with an HMAC-SHA256 checksum.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteTransfer}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:bg-slate-400"
                >
                  {loading ? (
                    <span>Executing Ledger...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Send Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && createdTxn && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">Transfer Completed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Rs. {createdTxn.amount.toLocaleString()} was successfully transferred to {createdTxn.receiverName}.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-900">{createdTxn.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Timestamp</span>
                  <span className="font-mono text-slate-700">
                    {createdTxn.date} — {createdTxn.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    Verified & Recorded
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Your New Balance</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    Rs. {(currentUser.balance - createdTxn.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {onQuickSwitchToReceiver && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onQuickSwitchToReceiver(createdTxn.receiverName);
                    }}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Switch to {createdTxn.receiverName}&apos;s Account to Verify Balance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
