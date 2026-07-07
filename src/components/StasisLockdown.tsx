import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Key, FileWarning, ShieldAlert } from 'lucide-react';

interface StasisLockdownOverlayProps {
  violationDetails: {
    ledgerCompromised?: boolean;
    modifiedFiles?: string[];
    timestamp?: string;
  } | null;
  executeRollback: () => Promise<void>;
  submitOverride: (token: string, justification: string) => Promise<void>;
  loading: boolean;
}

export const StasisLockdownOverlay: React.FC<StasisLockdownOverlayProps> = ({
  violationDetails,
  executeRollback,
  submitOverride,
  loading
}) => {
  const [overrideToken, setOverrideToken] = useState("");
  const [justification, setJustification] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!overrideToken || !justification) return;
    try {
      await submitOverride(overrideToken, justification);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit cryptographic override.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 font-mono text-gray-300">
      <div className="bg-[#100303] border-2 border-red-900/60 rounded-xl max-w-2xl w-full shadow-[0_0_60px_rgba(239,68,68,0.2)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-red-950/20 p-5 border-b border-red-900/40 flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-pulse">
            <ShieldAlert className="text-red-500" size={28} />
          </div>
          <div>
            <h1 className="text-red-500 font-extrabold tracking-[0.25em] text-sm uppercase">Sovereign Stasis Enforced</h1>
            <p className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider mt-0.5">
              Core system integrity violation. State modifications mathematically refused.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Forensics/Violations Panel */}
          <div className="bg-[#050101] border border-red-950 rounded-lg p-4 space-y-3">
            <h3 className="text-[10px] text-red-400 font-black uppercase tracking-widest flex items-center gap-2">
              <FileWarning size={14} />
              Forensic Integrity Breakdown Report
            </h3>
            
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex justify-between border-b border-red-950/30 pb-1.5">
                <span className="text-slate-500">Security Verdict</span>
                <span className="text-red-400 font-bold uppercase">SYSTEM_INTEGRITY_COMPROMISED</span>
              </div>
              <div className="flex justify-between border-b border-red-950/30 pb-1.5">
                <span className="text-slate-500">Lock Timestamp</span>
                <span className="text-slate-300">
                  {violationDetails?.timestamp ? new Date(violationDetails.timestamp).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>
              
              {violationDetails?.ledgerCompromised && (
                <div className="text-red-400 font-semibold bg-red-950/10 p-2 rounded border border-red-950/30">
                  ⚠️ CRYPTOGRAPHIC SPINE MUTATED: Forensic block ledger verification has failed.
                </div>
              )}

              {violationDetails?.modifiedFiles && violationDetails.modifiedFiles.length > 0 ? (
                <div>
                  <span className="text-slate-500 block mb-1">Unauthorized Source Code Mutations:</span>
                  <div className="max-h-[80px] overflow-y-auto bg-black border border-red-950/20 p-2 rounded text-red-300 font-semibold space-y-1">
                    {violationDetails.modifiedFiles.map((file, idx) => (
                      <div key={idx}>[DIRTY] {file}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic">No source file modifications detected directly on disk.</div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-red-400 font-bold">
              {errorMsg}
            </div>
          )}

          {/* Action Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Rollback Block */}
            <div className="bg-black/40 border border-[#222] hover:border-slate-800 rounded-lg p-5 flex flex-col justify-between transition-all">
              <div className="mb-4">
                <h3 className="text-xs text-slate-200 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-emerald-400" />
                  Disinfect & Re-Seal
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Execute immediate disinfection. Reverts the file system to cryptographically signed TEE memory backups and repairs the ledger chain integrity.
                </p>
              </div>
              <button 
                onClick={executeRollback}
                disabled={loading}
                className="w-full bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 hover:text-emerald-300 py-2.5 rounded font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                <span>Execute Rollback</span>
              </button>
            </div>

            {/* Cryptographic Override Form */}
            <form onSubmit={handleOverrideSubmit} className="bg-black/40 border border-[#222] hover:border-red-950/20 rounded-lg p-5 flex flex-col justify-between transition-all">
              <div className="space-y-3 mb-4">
                <h3 className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={13} />
                  Sovereign Override
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Acknowledge and sign an intentional hot-patch. This action requires the Enclave administrator token and permanently records your justification in the blockchain.
                </p>
                <div className="space-y-2">
                  <input 
                    type="password" 
                    placeholder="Enclave Override Token..." 
                    value={overrideToken}
                    onChange={e => setOverrideToken(e.target.value)}
                    disabled={loading}
                    className="w-full bg-black/60 border border-slate-800 hover:border-slate-700 rounded p-2 text-[10px] text-slate-300 outline-none focus:border-red-900/50 transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="Hot-patch justification..." 
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    disabled={loading}
                    className="w-full bg-black/60 border border-slate-800 hover:border-slate-700 rounded p-2 text-[10px] text-slate-300 outline-none focus:border-red-900/50 transition-colors"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading || !overrideToken || !justification}
                className="w-full bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 text-red-400 hover:text-red-300 py-2.5 rounded font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Key size={14} />
                <span>Force Override</span>
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
