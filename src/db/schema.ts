/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file defines the PostgreSQL schema structure as the Spine
// In our live AI Studio sandbox, we also support a resilient, file-backed local database adapter 
// that mirrors this exact structure and handles cryptographic validation.

export const forensicLedgerSchema = {
  tableName: 'forensic_ledger',
  columns: {
    id: 'serial PRIMARY KEY',
    blockId: 'integer NOT NULL UNIQUE',
    timestamp: 'timestamp DEFAULT now() NOT NULL',
    actionType: 'varchar(100) NOT NULL',
    targetEndpoint: 'varchar(255) NOT NULL',
    rawTelemetry: 'jsonb NOT NULL',
    previousHash: 'varchar(64) NOT NULL',
    blockHash: 'varchar(64) NOT NULL',
    signatures: 'jsonb'
  }
};
