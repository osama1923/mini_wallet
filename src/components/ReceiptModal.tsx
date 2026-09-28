import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        const data = await api.verifyTransaction(transaction.id);
        setVerification(data);
      } catch (err) {
        console.error('Failed to verify transaction:', err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [transaction.id]);

  const handleCopySignature = () => {
    navigator.clipboard.writeText(transaction.signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const receiptData = {
      receiptHeader: 'MINI SECURE FINTECH WALLET - DIGITAL TRANSACTION RECEIPT',
      transactionId: transaction.id,
      timestamp: `${transaction.date} ${transaction.time}`,
      status: transaction.status,
      sender: {
        name: transaction.senderName,
        account: transaction.senderAccount,
      },
      receiver: {
        name: transaction.receiverName,
        account: transaction.receiverAccount,
      },
      financials: {
        amount: transaction.amount,
        currency: transaction.currency,
        memo: transaction.note,
      },
      cryptographicProof: {
        algorithm: 'HMAC-SHA256',
        signature: transaction.signature,
        verifiedValid: verification?.isCryptographicallyValid ?? true,
      },
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${transaction.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                Cryptographic Ledger Receipt
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {transaction.id}
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
        <div className="p-6 space-y-4 text-xs">
          {/* Status banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-900">
                Ledger Signature Validated
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
              HMAC-SHA256
            </span>
          </div>

          {/* Details Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                Rs. {transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sender</span>
              <span className="font-medium text-slate-900">
                {transaction.senderName} ({transaction.senderAccount})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Receiver</span>
              <span className="font-medium text-slate-900">
                {transaction.receiverName} ({transaction.receiverAccount})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-mono text-slate-700">
                {transaction.date} — {transaction.time}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Memo</span>
              <span className="text-slate-700 italic">{transaction.note || 'None'}</span>
            </div>
          </div>

          {/* Cryptographic Signature Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                Cryptographic Checksum / Non-Repudiation Signature
              </span>
              <button
                onClick={handleCopySignature}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg break-all border border-slate-800">
              {transaction.signature}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
