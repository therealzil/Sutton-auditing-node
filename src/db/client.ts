/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { ForensicBlock } from '../types';
import { EnclaveFortress } from '../lib/crypto';

const DB_FILE_PATH = path.join(process.cwd(), 'ledger-db.json');

// Pre-populated interesting blocks to make the initial experience rich and educational
const INITIAL_DEMO_BLOCKS: ForensicBlock[] = [
  {
    id: 1,
    blockId: 1,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    actionType: 'GENESIS_SEAL',
    targetEndpoint: '/sys/genesis',
    rawTelemetry: {
      message: 'Sutton Standard Sovereign Audit Node initialized.',
      enclave_boot_hash: 'ae98d7f6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a10f9e8d7c6b5a4f3e2d1c0b9a8f',
      security_policy: 'Sovereign-Alpha-1',
      auditor_v: '1.0.0-sovereign'
    },
    previousHash: '0'.repeat(64),
    blockHash: '', // Will compute below
    signatures: [
      {
        party: 'Sovereign Enclave',
        signature: 'h-boot-92f3c01a4e1d8820cb5fa39ef0e5a1cd67ef228293e839e0ea3e2889',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    id: 2,
    blockId: 2,
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), // 2.5 hours ago
    actionType: 'OBSERVATION_VERIFIED',
    targetEndpoint: '/api/v1/compute/run',
    rawTelemetry: {
      latencyMs: 12,
      weightDelta: 0.045,
      endpoint: '/api/v1/compute/run',
      epf_sanitized: true,
      epf_redacted_fields: [],
      auditor_v: '1.0.0-sovereign'
    },
    previousHash: '', // Will compute below
    blockHash: '', // Will compute below
    signatures: []
  },
  {
    id: 3,
    blockId: 3,
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(), // 1.2 hours ago
    actionType: 'TRIGGER_SHADOW_AUDIT',
    targetEndpoint: '/api/v1/db/scrub',
    rawTelemetry: {
      latencyMs: 145, // High latency!
      weightDelta: 0, // No weight delta - indicative of scrubbing delay!
      endpoint: '/api/v1/db/scrub',
      epf_sanitized: true,
      epf_redacted_fields: ['user_email', 'ip_address'], // Redacted!
      auditor_v: '1.0.0-sovereign'
    },
    previousHash: '', // Will compute below
    blockHash: '', // Will compute below
    signatures: []
  }
];

// Initialize hashes for the demo blocks to ensure they form a perfect chain
function initializeDemoChain(): ForensicBlock[] {
  const blocks = JSON.parse(JSON.stringify(INITIAL_DEMO_BLOCKS)) as ForensicBlock[];
  
  // 1. Genesis hash
  blocks[0].blockHash = EnclaveFortress.computeHash(blocks[0].previousHash, blocks[0].rawTelemetry);
  
  // 2. Block 2 hash
  blocks[1].previousHash = blocks[0].blockHash;
  blocks[1].blockHash = EnclaveFortress.computeHash(blocks[1].previousHash, blocks[1].rawTelemetry);
  
  // 3. Block 3 hash
  blocks[2].previousHash = blocks[1].blockHash;
  blocks[2].blockHash = EnclaveFortress.computeHash(blocks[2].previousHash, blocks[2].rawTelemetry);
  
  return blocks;
}

export class LedgerDB {
  private static load(): ForensicBlock[] {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        const initial = initializeDemoChain();
        this.save(initial);
        return initial;
      }
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read ledger DB. Creating new chain...', error);
      const initial = initializeDemoChain();
      this.save(initial);
      return initial;
    }
  }

  private static save(blocks: ForensicBlock[]) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(blocks, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write ledger DB:', error);
    }
  }

  public static getLedger(): ForensicBlock[] {
    return this.load();
  }

  public static addBlock(block: Omit<ForensicBlock, 'id'>): ForensicBlock {
    const blocks = this.load();
    const nextId = blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1;
    const newBlock: ForensicBlock = {
      ...block,
      id: nextId
    };
    blocks.push(newBlock);
    this.save(blocks);
    return newBlock;
  }

  public static addSignature(blockId: number, party: string, signature: string): boolean {
    const blocks = this.load();
    const blockIndex = blocks.findIndex(b => b.blockId === blockId);
    if (blockIndex === -1) return false;
    
    // Check if party already signed
    const alreadySigned = blocks[blockIndex].signatures.some(s => s.party === party);
    if (alreadySigned) return false;

    blocks[blockIndex].signatures.push({
      party,
      signature,
      timestamp: new Date().toISOString()
    });
    
    this.save(blocks);
    return true;
  }

  public static reset(): ForensicBlock[] {
    const initial = initializeDemoChain();
    this.save(initial);
    return initial;
  }

  /**
   * Tamper with a block to simulate adversarial interference for the audit demonstration!
   */
  public static tamper(blockId: number, tamperedData: any): boolean {
    const blocks = this.load();
    const blockIndex = blocks.findIndex(b => b.blockId === blockId);
    if (blockIndex === -1) return false;

    // Mutate the raw telemetry payload to break the hash link!
    blocks[blockIndex].rawTelemetry = tamperedData;
    this.save(blocks);
    return true;
  }

  /**
   * Cryptographically verifies the entire ledger chain.
   */
  public static verifyChain() {
    const blocks = this.load();
    const reports: {
      blockId: number;
      hashMatch: boolean;
      chainLinkValid: boolean;
      expectedHash: string;
      actualHash: string;
      expectedPrevHash: string;
      actualPrevHash: string;
    }[] = [];

    let isEntireChainValid = true;

    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];
      const prev = i > 0 ? blocks[i - 1] : null;

      // 1. Recompute current hash
      const calculatedHash = EnclaveFortress.computeHash(current.previousHash, current.rawTelemetry);
      const hashMatch = calculatedHash === current.blockHash;

      // 2. Check previous hash link
      let chainLinkValid = true;
      if (prev) {
        chainLinkValid = current.previousHash === prev.blockHash;
      } else {
        chainLinkValid = current.previousHash === '0'.repeat(64);
      }

      if (!hashMatch || !chainLinkValid) {
        isEntireChainValid = false;
      }

      reports.push({
        blockId: current.blockId,
        hashMatch,
        chainLinkValid,
        expectedHash: current.blockHash,
        actualHash: calculatedHash,
        expectedPrevHash: current.previousHash,
        actualPrevHash: prev ? prev.blockHash : '0'.repeat(64)
      });
    }

    return {
      isValid: isEntireChainValid,
      blocksCount: blocks.length,
      reports
    };
  }
}
