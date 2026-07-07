/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TelemetryPayload {
  latencyMs: number;
  weightDelta: number;
  endpoint: string;
  user_email?: string;
  ip_address?: string;
  [key: string]: any;
}

export interface ForensicBlock {
  id: number;
  blockId: number;
  timestamp: string;
  actionType: string;
  targetEndpoint: string;
  rawTelemetry: any;
  previousHash: string;
  blockHash: string;
  signatures: {
    party: string;
    signature: string;
    timestamp: string;
  }[];
}

export interface AuditAnalysis {
  action: 'TRIGGER_SHADOW_AUDIT' | 'OBSERVATION_VERIFIED';
  evidence: Record<string, any>;
  reason?: string;
}
