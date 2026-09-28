import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  CheckCircle2,
  XCircle,
  Lock,
  Database,
  Terminal,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityTestReport, StorageInspectionResponse, User } from '../types';
import { BiometricMfaSimulation } from './BiometricMfaSimulation';

interface SecurityLabProps {
  currentUser: User;
  onRefreshWallet: () => void;
}

export const SecurityLab: React.FC<SecurityLabProps> = ({ currentUser, onRefreshWallet }) => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, SecurityTestReport>>({});
  const [loadingTest, setLoadingTest] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<StorageInspectionResponse | null>(null);
  const [loadingStorage, setLoadingStorage] = useState<boolean>(false);
  const [expandedControl, setExpandedControl] = useState<string>('TAMPER');

  useEffect(() => {
    loadStorageInspection();
  }, []);

  const loadStorageInspection = async () => {
    try {
      setLoadingStorage(true);
      const data = await api.inspectStorage();
      setStorageData(data);
    } catch (err) {
      console.error('Failed to load storage inspection:', err);
    } finally {
      setLoadingStorage(false);
    }
  };

  const runTest = async (testType: string, payload: any = {}) => {
    try {
      setLoadingTest(testType);
      setActiveTest(testType);
      const report = await api.runSecurityTest(testType, payload);
      setTestResults((prev) => ({ ...prev, [testType]: report }));
      onRefreshWallet();
    } catch (err: any) {
      console.error('Test execution error:', err);
    } finally {
      setLoadingTest(null);
    }
  };

  const securityTestScenarios = [
    {
      id: 'UNAUTHORIZED_BALANCE_TAMPER',
      shortId: 'TAMPER',
      title: 'Unauthorized Balance Modification (Client-Side Tampering)',
      category: 'Financial Ledger Integrity',
      vulnerability: 'Missing State Machine Guards & Direct Balance Mutation',
      before: {
        flow: [
          'Unauthorized User or Script',
          'Attempts to send direct balance modification: { balance: 999999 }',
          'Server blindly updates database balance column',
          'Security Weakness: Unearned currency created out of thin air!',
        ],
        weakness: 'Vulnerable to client-side inspect-element tampering, parameter spoofing, and forged balance mutation.',
      },
      after: {
        flow: [
          'Unauthorized User or Script',
          'Attempts direct balance modification endpoint',
          'Immutability Guard intercepts request',
          'Access Denied (HTTP 403 Forbidden)',
          'Balance remains unchanged & incident logged to audit trail',
        ],
        protection: 'Balance values are completely read-only. Updates are permitted exclusively via signed, double-entry atomic transactions.',
      },
      actionLabel: 'Simulate Direct Balance Tamper (Rs. 999,999)',
      payload: { targetUserId: currentUser.id, simulatedAmount: 999999 },
    },
    {
      id: 'IDOR_ACCESS_OTHER_WALLET',
      shortId: 'IDOR',
      title: 'Broken Object Level Authorization (IDOR / BOLA)',
      category: 'Access Control & User Isolation',
      vulnerability: 'OWASP API1:2023 - Insecure Direct Object Reference',
      before: {
        flow: [
          'User Sara is logged in',
          'Tampered request changes query param: GET /api/wallet?userId=usr_ali',
          'Naive backend returns Ali’s private balance & account records',
          'Security Weakness: Privacy breach and confidential financial data exposure!',
        ],
        weakness: 'Relying on client-supplied ID without verifying subject claims against authenticated session context.',
      },
      after: {
        flow: [
          'User Sara is logged in',
          'Tampered request attempts to read Ali’s account data',
          'Authorization Middleware extracts caller ID strictly from cryptographic token',
          'Request rejected with HTTP 403 Forbidden',
          'Sara can only access her own isolated wallet data',
        ],
        protection: 'Strict user-isolation context ensures cross-tenant data boundaries are hermetically enforced.',
      },
      actionLabel: 'Simulate IDOR Siphon on Another User',
      payload: { targetUserId: 'usr_ali_02' },
    },
    {
      id: 'NEGATIVE_AMOUNT_TRANSFER',
      shortId: 'NEGATIVE',
      title: 'Negative Amount Transfer (Reverse Drain Attack)',
      category: 'Input Validation & Arithmetic Boundary',
      vulnerability: 'Signed Integer / Inverted Debit Flaw',
      before: {
        flow: [
          'Attacker sends transfer request: amount = -1,000',
          'Naive ledger performs: sender -= (-1000), receiver += (-1000)',
          'Mathematical invert: Sender balance increases by 1,000, receiver drained!',
          'Security Weakness: Reverse fund siphoning without consent!',
        ],
        weakness: 'Failing to assert that financial quantities must be strictly positive and bounded.',
      },
      after: {
        flow: [
          'Attacker sends transfer request: amount = -1,000',
          'Pre-flight Validator runs numeric constraint assertion: amount > 0',
          'Rejected immediately at API boundary with HTTP 400 Bad Request',
          'No database locks acquired; no funds altered',
        ],
        protection: 'Rigid input validation enforcing positive numbers, finite bounds, and at most 2 decimal places.',
      },
      actionLabel: 'Submit Negative Transfer (-Rs. 1,000)',
      payload: { simulatedAmount: -1000 },
    },
    {
      id: 'INSUFFICIENT_BALANCE_OVERDRAFT',
      shortId: 'OVERDRAFT',
      title: 'Unrestricted Overdraft / Race Condition Transfer',
      category: 'Transactional Integrity',
      vulnerability: 'Missing Pre-Flight Balance Validation & Underflow',
      before: {
        flow: [
          'User has Rs. 2,000 balance',
          'Attempts to transfer Rs. 50,000 to an external recipient',
          'Server executes transfer without checking available funds',
          'Balance plunges into -Rs. 48,000; bank incurs unbacked deficit',
        ],
        weakness: 'Missing pre-debit balance check leading to fraudulent overdraft and double-spending.',
      },
      after: {
        flow: [
          'User has Rs. 2,000 balance',
          'Attempts to transfer Rs. 50,000',
          'Atomic Transaction Guard asserts: balance >= transfer_amount',
          'Check fails -> Transaction aborted immediately with HTTP 400',
          'Sender balance preserved at current amount',
        ],
        protection: 'Guaranteed atomic ledger verification prevents balance underflow under all concurrency conditions.',
      },
      actionLabel: 'Attempt Rs. 50,000 Overdraft Transfer',
      payload: { simulatedAmount: 50000 },
    },
    {
      id: 'UNAUTHENTICATED_FORGED_SESSION',
      shortId: 'FORGED_SESSION',
      title: 'Forged / Spoofed Bearer Token Injection',
      category: 'Authentication & Session Integrity',
      vulnerability: 'Broken Authentication & Trusting Unsigned Tokens',
      before: {
        flow: [
          'Attacker invents a random bearer token header',
          'Weak server accepts token without verifying cryptographic signature',
          'Attacker gains arbitrary access to financial endpoints',
          'Security Weakness: Account takeover and unauthorized transfers!',
        ],
        weakness: 'Lack of central session state store or token verification.',
      },
      after: {
        flow: [
          'Attacker presents forged bearer token',
          'Gatekeeper middleware checks cryptographic session memory store',
          'Token lookup returns nil / expired -> Execution terminated',
          'HTTP 401 Unauthorized returned & IP address logged',
        ],
        protection: 'Cryptographically generated random 256-bit entropy tokens, TTL expiration, and immediate invalidation on logout.',
      },
      actionLabel: 'Test Forged Bearer Token Header',
      payload: { forgedToken: 'forged_unauthorized_token_hex_9999' },
    },
    {
      id: 'XSS_INJECTION_NOTE',
      shortId: 'XSS',
      title: 'Stored Cross-Site Scripting (XSS) in Transfer Memo',
      category: 'Output Sanitization',
      vulnerability: 'Unsanitized User Input in Financial Memos',
      before: {
        flow: [
          'Attacker sends memo: <script>stealCookies()</script>',
          'Application renders memo using raw innerHTML',
          'Malicious script executes in recipient’s web browser',
          'Security Weakness: Session token hijacked by attacker!',
        ],
        weakness: 'Unescaped user-generated text inserted directly into HTML DOM.',
      },
      after: {
        flow: [
          'Attacker sends script tag inside memo',
          'Backend sanitizes input (HTML entity encoding)',
          'Frontend UI applies contextual DOM escaping (safe text node)',
          'Script renders harmlessly as literal text string; execution impossible',
        ],
        protection: 'Multi-layer defense: Server-side input cleansing combined with React JSX contextual escaping.',
      },
      actionLabel: 'Inject Malicious `<script>` Tag Payload',
      payload: { maliciousPayload: '<script>alert("XSS Exploit Failed!")</script>' },
    },
    {
      id: 'BIOMETRIC_MFA_BYPASS',
      shortId: 'BIOMETRIC_MFA',
      title: 'Biometric MFA Step-Up Bypass on High-Value Transfers',
      category: 'Multi-Factor Authorization & Physical Inherence',
      vulnerability: 'Single-Factor Token Replay / Stolen Session Authorization',
      before: {
        flow: [
          'Attacker hijacks active session token via network or physical device',
          'Dispatches high-value ledger transfer (Rs. 10,000)',
          'Server processes transaction solely with bearer session token',
          'Security Weakness: Single-factor authorization allows silent balance drainage!',
        ],
        weakness: 'Lack of step-up verification for sensitive operations allows token replay attacks to succeed without user presence.',
      },
      after: {
        flow: [
          'Attacker dispatches high-value transfer without biometric attestation',
          'MFA Step-Up Engine detects transfer value >= highRiskThreshold',
          'Asserts requirement for valid FIDO2 / WebAuthn biometric assertion signature',
          'Missing biometric challenge response -> Transaction rejected with HTTP 403',
          'Account balance remains untouched; security alert recorded in audit trail',
        ],
        protection: 'Requires hardware-backed cryptographic biometric signature (FaceID / TouchID) before executing high-risk transfers.',
      },
      actionLabel: 'Simulate Step-Up MFA Bypass Attempt',
      payload: { simulatedAmount: 5000 },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span>Assignment Demonstration Lab</span>
          <span aria-hidden="true">·</span>
          <span>Security Architecture & Verification</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Before vs. After Security Demonstration
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Execute live attacks against the Mini Secure Wallet backend to verify that each security control actively intercepts, halts, and audits malicious attempts in real time.
        </p>
      </div>

      {/* Biometric Multi-Factor Authentication (MFA) Simulator Section */}
      <BiometricMfaSimulation
        currentUser={currentUser}
        onRefreshWallet={onRefreshWallet}
      />

      {/* Test Scenarios Accordion / Cards */}
      <div className="space-y-4">
        {securityTestScenarios.map((scenario) => {
          const isExpanded = expandedControl === scenario.shortId;
          const result = testResults[scenario.id];
          const isRunning = loadingTest === scenario.id;

          return (
            <div
              key={scenario.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedControl(isExpanded ? '' : scenario.shortId)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/75 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      result
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {result ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {scenario.category} · {scenario.vulnerability}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                      {scenario.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {result && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Control Enforced (HTTP {result.statusCode})
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Card Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-5 bg-slate-50/30">
                  {/* Before vs After Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Security Control */}
                    <div className="bg-rose-50/40 rounded-xl p-4 border border-rose-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Before Security Control (Vulnerable)
                      </div>
                      <p className="text-xs text-rose-900 mb-3">
                        {scenario.before.weakness}
                      </p>

                      <div className="space-y-1.5 text-xs font-mono">
                        {scenario.before.flow.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-rose-950">
                            <span className="text-rose-400 shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* After Security Control */}
                    <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        After Security Control (Active Defense)
                      </div>
                      <p className="text-xs text-emerald-900 mb-3">
                        {scenario.after.protection}
                      </p>

                      <div className="space-y-1.5 text-xs font-mono">
                        {scenario.after.flow.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-emerald-950">
                            <span className="text-emerald-500 shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Attack Simulation Trigger */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Click to dispatch this real attack request to the Express server to verify the gatekeeper response.
                    </div>

                    <button
                      onClick={() => runTest(scenario.id, scenario.payload)}
                      disabled={isRunning}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap disabled:bg-slate-500"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Attack Probe...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{scenario.actionLabel}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Test Execution Result Console */}
                  {result && (
                    <div className="p-4 bg-slate-950 rounded-xl text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          Live Server Interception Response
                        </span>
                        <span className="text-emerald-400 font-bold">
                          HTTP {result.statusCode} {result.statusText}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <div>
                          <span className="text-slate-500">Attack Target: </span>
                          <span className="text-slate-200">{result.attackName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Defense Verdict: </span>
                          <span className="text-emerald-400 font-semibold">{result.outcome}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Technical Trace: </span>
                          <span className="text-slate-300">{result.technicalDetails}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span className="text-emerald-400">✓ Security Audit Confirmed:</span> Event written to server security audit log with client IP and defense trace.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Database Cryptographic Storage Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-base text-slate-900">
                Database Cryptographic Storage Inspector
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inspection demonstrating that user passwords are never stored in plain text.
            </p>
          </div>

          <button
            onClick={loadStorageInspection}
            disabled={loadingStorage}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStorage ? 'animate-spin' : ''}`} />
            Refresh Schema
          </button>
        </div>

        {storageData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Plaintext Stored</th>
                  <th className="py-2.5 px-3">Cryptographic Algorithm</th>
                  <th className="py-2.5 px-3">Salt Preview (Hex)</th>
                  <th className="py-2.5 px-3">Derived Hash (PBKDF2)</th>
                  <th className="py-2.5 px-3 text-right">Rounds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {storageData.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{u.id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-sans">
                        FALSE (Zero Plaintext)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{u.algorithm}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{u.salt}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{u.passwordHashPreview}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                      {u.rounds.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500">
            Loading storage schema inspection...
          </div>
        )}
      </div>
    </div>
  );
};
