/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'lucide-react';

export interface AnchorReceipt {
  merkle_root: string;
  chain: string;
  tx_hash: string;
  timestamp: string;
}

interface AnchorStatusProps {
  anchorReceipt: AnchorReceipt | null | undefined;
}

export const AnchorStatus: React.FC<AnchorStatusProps> = ({ anchorReceipt }) => {
  if (!anchorReceipt) return null;

  return (
    <div className="bg-[#051505] border border-emerald-900/50 rounded-lg p-4 mt-4 shadow-[0_0_15px_rgba(16,185,129,0.05)] animate-fade-in">
      <div className="flex items-center space-x-2 mb-3">
        <Link size={14} className="text-emerald-500 animate-pulse" />
        <h4 className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
          Public Ledger Anchor Verified
        </h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-[9px] font-mono text-slate-400">
        <div className="bg-black/30 p-2 rounded border border-emerald-900/20">
          <span className="block text-slate-600 text-[8px] mb-0.5">ANCHORING NETWORK</span>
          <span className="text-emerald-400 font-bold">{anchorReceipt.chain}</span>
        </div>
        <div className="bg-black/30 p-2 rounded border border-emerald-900/20">
          <span className="block text-slate-600 text-[8px] mb-0.5">TIMESTAMP (UTC)</span>
          <span className="text-slate-300 font-bold">{anchorReceipt.timestamp}</span>
        </div>
        <div className="col-span-2 bg-black/30 p-2 rounded border border-emerald-900/20">
          <span className="block text-slate-600 text-[8px] mb-0.5">MERKLE ROOT HASH</span>
          <span className="text-slate-300 break-all select-all font-bold">{anchorReceipt.merkle_root}</span>
        </div>
        <div className="col-span-2 bg-black/30 p-2 rounded border border-emerald-900/20">
          <span className="block text-slate-600 text-[8px] mb-0.5">TRANSACTION SIGNATURE</span>
          <span className="text-slate-300 break-all select-all font-bold">{anchorReceipt.tx_hash}</span>
        </div>
      </div>
    </div>
  );
};
