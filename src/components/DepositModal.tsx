import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleDeposit = async () => {
    if (amount <= 0) {
      setError('Please choose an amount greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.deposit(amount);
      onSuccess(res.updatedBalance);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-sm text-slate-900">
              Demo Voucher Top-up
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            Replenish this demo account’s balance via simulated central banking settlement.
          </p>

          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2 px-3 rounded-lg border text-center font-mono tabular-nums font-semibold transition-colors cursor-pointer ${
                  amount === val
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Rs. {val}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:bg-slate-400 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deposit Rs. {amount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
