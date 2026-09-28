import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewerProps {
  logs: AuditLog[];
  onRefresh: () => void;
  loading?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  onRefresh,
  loading = false,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.securityLevel !== filterLevel) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.userName.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.ip.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Immutable Security Audit Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Ingestion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            System & Security Audit Logs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user, IP, or details..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterLevel === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({logs.length})
          </button>
          <button
            onClick={() => setFilterLevel('SECURITY_ALERT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterLevel === 'SECURITY_ALERT'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Alerts
          </button>
          <button
            onClick={() => setFilterLevel('WARNING')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterLevel === 'WARNING'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilterLevel('INFO')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterLevel === 'INFO'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No audit log entries match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Level</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4">IP</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Info className="w-3 h-3 text-slate-500" />
                      INFO
                    </span>
                  );
                  if (log.securityLevel === 'SECURITY_ALERT') {
                    badge = (
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        ALERT
                      </span>
                    );
                  } else if (log.securityLevel === 'WARNING') {
                    badge = (
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        WARN
                      </span>
                    );
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">{badge}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {log.userName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {log.ip}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px] tabular-nums whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
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
