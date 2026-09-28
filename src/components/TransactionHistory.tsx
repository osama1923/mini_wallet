import React, { useState } from 'react';
import {
  Search,
  Download,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, User } from '../types';

interface TransactionHistoryProps {
  currentUser: User;
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  onOpenSendModal: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  currentUser,
  transactions,
  onSelectTransaction,
  onOpenSendModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');

  const filteredTransactions = transactions.filter((txn) => {
    const isDebit = txn.senderId === currentUser.id;
    if (filterType === 'sent' && !isDebit) return false;
    if (filterType === 'received' && isDebit) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      txn.id.toLowerCase().includes(query) ||
      txn.senderName.toLowerCase().includes(query) ||
      txn.receiverName.toLowerCase().includes(query) ||
      txn.senderAccount.toLowerCase().includes(query) ||
      txn.receiverAccount.toLowerCase().includes(query) ||
      (txn.note && txn.note.toLowerCase().includes(query))
    );
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Type',
      'Sender',
      'Sender Account',
      'Receiver',
      'Receiver Account',
      'Amount (PKR)',
      'Date',
      'Time',
      'Status',
      'Memo',
      'HMAC Signature',
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      t.senderId === currentUser.id ? 'SENT' : 'RECEIVED',
      t.senderName,
      t.senderAccount,
      t.receiverName,
      t.receiverAccount,
      t.amount,
      t.date,
      t.time,
      t.status,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      t.signature,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `wallet_statement_${currentUser.accountNumber}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Audit-Verified Double-Entry Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Account {currentUser.accountNumber}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Transaction History
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Statement (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, party name, or account..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Ledger ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('sent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'sent'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Debits / Sent
          </button>
          <button
            onClick={() => setFilterType('received')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'received'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Credits / Received
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              No matching transactions found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Receiver</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Memo</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Cryptographic Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.map((txn) => {
                  const isDebit = txn.senderId === currentUser.id;

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {txn.id}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDebit ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            Received
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{txn.senderName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {txn.senderAccount}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{txn.receiverName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {txn.receiverAccount}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{txn.date}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {txn.time}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {txn.note || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums">
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
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Successful
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onSelectTransaction(txn)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-slate-200"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verify</span>
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
