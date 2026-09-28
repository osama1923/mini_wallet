import React, { useState } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface BiometricMfaSimulationProps {
  currentUser: User;
  onRefreshWallet?: () => void;
}

export const BiometricMfaSimulation: React.FC<BiometricMfaSimulationProps> = ({
  currentUser,
  onRefreshWallet,
}) => {
  // MFA Settings Toggle
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);
  const [biometricMethod, setBiometricMethod] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(500);

  // Simulation test state
  const [testAmount, setTestAmount] = useState<number>(1000);
  const [simState, setSimState] = useState<'idle' | 'scanning' | 'passed' | 'failed' | 'rejected_no_mfa'>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [simulationLog, setSimulationLog] = useState<{
    status: 'AUTHORIZED' | 'BLOCKED' | 'FAILED';
    step: string;
    details: string;
    timestamp: string;
    factorType?: string;
  } | null>(null);

  const isSensitive = testAmount >= highRiskThreshold;

  // Run the interactive Biometric simulation
  const handleTriggerVerification = (forcePass: boolean = true) => {
    setSimState('scanning');
    setScanProgress(0);
    setSimulationLog(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);

      const timestamp = new Date().toLocaleTimeString();

      if (!mfaEnabled) {
        // Before Control: MFA disabled, single-factor vulnerability
        setSimState('rejected_no_mfa');
        setSimulationLog({
          status: 'BLOCKED',
          step: 'Policy Compliance Check Failed',
          details: `Transfer of Rs. ${testAmount.toLocaleString()} requires Step-Up Multi-Factor Authentication. Biometric MFA is currently disabled. In a secure fintech environment, sensitive fund transfers must enforce step-up challenge.`,
          timestamp,
        });
      } else if (forcePass) {
        // Biometric Challenge Verified (e.g., FIDO2 / WebAuthn signature match)
        setSimState('passed');
        setSimulationLog({
          status: 'AUTHORIZED',
          step: `FIDO2/WebAuthn Hardware Credential Authenticated (${biometricMethod === 'fingerprint' ? 'Touch ID / Fingerprint' : 'Face ID / Facial Match'})`,
          details: `Biometric signature matched securely within hardware enclave (TPM / Secure Enclave). Ephemeral transaction authorization token (TTL: 60s) generated and ledger commit authorized.`,
          timestamp,
          factorType: biometricMethod === 'fingerprint' ? 'Biometric (Fingerprint Hardware Sensor)' : 'Biometric (TrueDepth FaceID Enclave)',
        });
      } else {
        // Biometric Match Failed (e.g. unverified biometric, spoofing attempt)
        setSimState('failed');
        setSimulationLog({
          status: 'FAILED',
          step: 'Biometric Cryptographic Verification Failed',
          details: 'Sensor payload did not match registered device credential. Challenge expired and financial dispatch aborted.',
          timestamp,
          factorType: biometricMethod === 'fingerprint' ? 'Fingerprint Mismatch' : 'FaceID False Match',
        });
      }
    }, 900);
  };

  const handleResetSimulation = () => {
    setSimState('idle');
    setScanProgress(0);
    setSimulationLog(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Fingerprint className="w-5 h-5 text-emerald-50" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Multi-Factor Authentication (MFA)
              </span>
              <span className="text-xs text-slate-400 font-medium">FIDO2 / WebAuthn Simulation</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Biometric Step-Up Authorization for High-Value Transactions
            </h2>
          </div>
        </div>

        {/* Global MFA Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-700">MFA Policy Guard</span>
          <button
            type="button"
            role="switch"
            aria-checked={mfaEnabled}
            onClick={() => {
              setMfaEnabled(!mfaEnabled);
              handleResetSimulation();
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              mfaEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                mfaEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-xs font-bold ${
              mfaEnabled ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {mfaEnabled ? 'ENFORCED' : 'OFF (Vulnerable)'}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Architectural Context: Why Biometric MFA in Fintech? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Factor 1: Knowledge (Existing)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Standard login uses <strong>PBKDF2-SHA256 hashed passwords</strong> and session tokens. If a token or session is compromised (e.g. shoulder surfing or an open browser), a simple 1-factor policy allows unauthorized money drainage.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Factor 2: Inherence (Biometric Step-Up)</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              High-value operations (&gt;= Rs. {highRiskThreshold.toLocaleString()}) trigger a <strong>cryptographic biometric challenge</strong>. Funds cannot be dispatched without physical proof of presence via FaceID or TouchID.
            </p>
          </div>
        </div>

        {/* Configuration Controls Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Biometric Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Simulated Biometric Sensor
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setBiometricMethod('fingerprint');
                  handleResetSimulation();
                }}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  biometricMethod === 'fingerprint'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Touch ID</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBiometricMethod('faceid');
                  handleResetSimulation();
                }}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  biometricMethod === 'faceid'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Face ID</span>
              </button>
            </div>
          </div>

          {/* Transfer Amount to Test */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Transaction Amount to Test
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold font-mono">
                  Rs.
                </span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={testAmount}
                  onChange={(e) => {
                    setTestAmount(Math.max(1, Number(e.target.value) || 0));
                    handleResetSimulation();
                  }}
                  className="w-full pl-10 pr-3 py-1.5 font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="text-[11px] mt-1 text-slate-500">
              {isSensitive ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-emerald-600" />
                  Sensitive Tier (&gt;= Rs. {highRiskThreshold}): Step-Up Active
                </span>
              ) : (
                <span className="text-slate-500">
                  Standard Tier (&lt; Rs. {highRiskThreshold}): 1-Factor Sufficient
                </span>
              )}
            </div>
          </div>

          {/* High-Risk Threshold Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">MFA Policy Threshold</label>
              <span className="font-mono font-bold text-slate-900">
                Rs. {highRiskThreshold.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={highRiskThreshold}
              onChange={(e) => {
                setHighRiskThreshold(Number(e.target.value));
                handleResetSimulation();
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Rs. 100</span>
              <span>Rs. 1,000</span>
              <span>Rs. 2,000</span>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Stage */}
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Visual Sensor Mockup */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-950/70 rounded-2xl border border-slate-800 w-full sm:w-64 min-h-[190px]">
              <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  simState === 'scanning'
                    ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30 animate-pulse'
                    : simState === 'passed'
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 shadow-lg'
                    : simState === 'failed' || simState === 'rejected_no_mfa'
                    ? 'bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {biometricMethod === 'fingerprint' ? (
                  <Fingerprint className="w-10 h-10" />
                ) : (
                  <ScanFace className="w-10 h-10" />
                )}

                {/* Circular Scanning Wave Animation */}
                {simState === 'scanning' && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
                )}
              </div>

              <div className="text-center mt-3">
                <div className="text-xs font-semibold text-slate-200">
                  {biometricMethod === 'fingerprint' ? 'Touch ID Sensor' : 'Face ID Sensor'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {simState === 'idle' && 'Sensor Standby · Ready'}
                  {simState === 'scanning' && `Verifying Enclave... ${scanProgress}%`}
                  {simState === 'passed' && 'Biometric Match Confirmed ✓'}
                  {simState === 'failed' && 'Sensor Mismatch ✗'}
                  {simState === 'rejected_no_mfa' && 'MFA Policy Disallowed ✗'}
                </div>
              </div>
            </div>

            {/* Simulation Dispatch Console */}
            <div className="flex-1 space-y-4 w-full text-xs">
              <div>
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                  Target Sensitive Transaction
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mt-1">
                  Rs. {testAmount.toLocaleString()} → Recipient Account
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {isSensitive
                    ? `This transfer meets the high-value rule (>= Rs. ${highRiskThreshold.toLocaleString()}) and demands second-factor biometric authorization.`
                    : `This transfer is below the threshold (< Rs. ${highRiskThreshold.toLocaleString()}) and does not require biometric step-up.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={simState === 'scanning'}
                  onClick={() => handleTriggerVerification(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Valid Biometric Scan</span>
                </button>

                <button
                  type="button"
                  disabled={simState === 'scanning'}
                  onClick={() => handleTriggerVerification(false)}
                  className="px-3.5 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Simulate Spoofed / Failed Scan</span>
                </button>

                {simState !== 'idle' && (
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Reset Simulation State"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Security Engine Trace Log */}
          {simulationLog && (
            <div className="mt-5 pt-4 border-t border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  FIDO2 / WebAuthn Step-Up Authorization Result
                </span>
                <span
                  className={`font-bold ${
                    simulationLog.status === 'AUTHORIZED'
                      ? 'text-emerald-400'
                      : simulationLog.status === 'BLOCKED'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  STATUS: {simulationLog.status}
                </span>
              </div>

              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-500">Security Gate: </span>
                  <span className="text-slate-200">{simulationLog.step}</span>
                </div>
                {simulationLog.factorType && (
                  <div>
                    <span className="text-slate-500">Authenticated Factor: </span>
                    <span className="text-emerald-400">{simulationLog.factorType}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Ledger Verdict: </span>
                  <span className="text-slate-300 leading-relaxed">
                    {simulationLog.details}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Verified At: {simulationLog.timestamp} · Device Enclave Cryptographic Signature Confirmed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
