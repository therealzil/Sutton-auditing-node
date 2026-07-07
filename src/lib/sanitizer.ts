/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnclaveFortress } from './crypto';

export interface SealedEnvelope {
  payload: Record<string, any>;
  timestamp: string;
  nonce: string;
  signature: string;
}

/**
 * SovereignSanitizer
 * Robust, zero-trust cryptographic sanitizer defending against analytical profiling.
 */
export class SovereignSanitizer {
  private static readonly DEFAULT_ALLOWED_KEYS = [
    'latencyMs',
    'weightDelta',
    'endpoint',
    'epf_sanitized',
    'epf_redacted_fields',
    'auditor_v'
  ];

  /**
   * Action Plan [1] - The Recursive Allowlist
   * Deeply cleanses an input object, keeping ONLY explicitly permitted keys.
   */
  public static recursiveAllowlist(
    payload: any,
    allowedKeys: string[] = SovereignSanitizer.DEFAULT_ALLOWED_KEYS
  ): any {
    if (payload === null || payload === undefined) return payload;

    if (Array.isArray(payload)) {
      return payload.map(item => this.recursiveAllowlist(item, allowedKeys));
    }

    if (typeof payload === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key of Object.keys(payload)) {
        if (allowedKeys.includes(key)) {
          const val = payload[key];
          if (typeof val === 'object' && val !== null) {
            sanitized[key] = this.recursiveAllowlist(val, allowedKeys);
          } else {
            sanitized[key] = val;
          }
        }
      }
      return sanitized;
    }

    return payload;
  }

  /**
   * Action Plan [2] - Robust Cryptographic Hashing & Salting (Web Crypto API)
   * Genuinely non-invertible, cryptographically secure hash to prevent cross-device correlation.
   * Fallback to Node crypto if run server-side or if Subtle Crypto is unavailable.
   */
  public static async hashIdentifier(identifier: string, salt: string): Promise<string> {
    const inputStr = `${identifier}:${salt}`;
    
    // Check if we are in a browser context with subtle crypto
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputStr);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        console.warn('Web Crypto failed, falling back to local SHA-256', err);
      }
    }

    // Server-side / Node or Fallback
    try {
      // Lazy load to avoid module issues in pure client bundles
      const { createHash } = await import('crypto');
      return createHash('sha256').update(inputStr).digest('hex');
    } catch {
      // In-browser backup if crypto module isn't shimmed and WebCrypto failed
      return this.fallbackSha256(inputStr);
    }
  }

  /**
   * Action Plan [3] - Indistinguishable Chaffing (Decoy Generator)
   * Generates a synthetic telemetry packet that is mathematically and structurally
   * indistinguishable from legitimate data. Omit fake flags.
   */
  public static generateDecoyTelemetry(template: Record<string, any> = {}): Record<string, any> {
    const defaultTemplate = {
      latencyMs: 15,
      weightDelta: 0.002,
      endpoint: '/api/v1/compute/run'
    };

    const merged = { ...defaultTemplate, ...template };
    const decoy: Record<string, any> = {};

    // Spoof realistic variations of parameters
    if (typeof merged.latencyMs === 'number') {
      // Create a normal-like distribution around latency (10-35 ms)
      decoy.latencyMs = Math.max(5, Math.round(merged.latencyMs + (Math.random() - 0.5) * 8));
    }

    if (typeof merged.weightDelta === 'number') {
      // Small floating perturbations
      const noise = (Math.random() - 0.5) * 0.0005;
      decoy.weightDelta = Number((merged.weightDelta + noise).toFixed(6));
    }

    if (typeof merged.endpoint === 'string') {
      decoy.endpoint = merged.endpoint;
    }

    // Copy other structure keys with simulated randomized values
    for (const [key, val] of Object.entries(merged)) {
      if (key in decoy) continue;

      if (typeof val === 'number') {
        const noise = (Math.random() - 0.5) * 0.1 * val;
        decoy[key] = Number((val + noise).toFixed(4));
      } else if (typeof val === 'boolean') {
        decoy[key] = Math.random() > 0.5;
      } else if (typeof val === 'string') {
        if (val.includes('@')) {
          decoy[key] = `user_${Math.random().toString(36).substring(2, 10)}@sovereign.local`;
        } else if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(val)) {
          // Spoof UUID
          decoy[key] = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        } else {
          decoy[key] = `anon_${Math.random().toString(36).substring(2, 8)}`;
        }
      } else {
        decoy[key] = val; // default fallback
      }
    }

    // Critically, do NOT attach a "chaff: true" flag so analytical filters can't drop it!
    return decoy;
  }

  /**
   * Action Plan [4] - Local Cryptographic Sealing / Encapsulation
   * Wraps the sanitized payload into an HMAC-SHA256 signed tamper-evident envelope.
   */
  public static async sealPayload(
    payload: Record<string, any>,
    secretKey: string
  ): Promise<SealedEnvelope> {
    const timestamp = new Date().toISOString();
    // Cryptographically strong random values in browser or pseudo-random fallback
    let nonce = '';
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      nonce = Array.from(array).map(n => n.toString(16)).join('-');
    } else {
      nonce = Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x100000000).toString(16)).join('-');
    }

    const payloadToSign = {
      payload,
      timestamp,
      nonce
    };

    const dataToSign = JSON.stringify(payloadToSign);
    let signature = '';

    // Generate HMAC signature
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signatureBuffer = await window.crypto.subtle.sign(
          'HMAC',
          cryptoKey,
          encoder.encode(dataToSign)
        );
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        console.warn('Web HMAC failed, falling back to local EnclaveFortress signature', err);
      }
    }

    if (!signature) {
      signature = EnclaveFortress.signAttestation(dataToSign, secretKey);
    }

    return {
      payload,
      timestamp,
      nonce,
      signature
    };
  }

  /**
   * Helper backup implementation of SHA-256 for non-crypto environments
   */
  private static fallbackSha256(str: string): string {
    // Elegant standard JS SHA-256 fallback if native APIs are entirely restricted
    const rotateRight = (n: number, x: number) => (x >>> n) | (x << (32 - n));
    const h = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const words: number[] = [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const byteLength = bytes.length;
    
    for (let i = 0; i < byteLength; i++) {
      words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    }
    
    words[byteLength >> 2] |= 0x80 << (24 - (byteLength % 4) * 8);
    const totalWords = ((byteLength + 8) >> 6) * 16 + 14;
    words[totalWords] = byteLength * 8;

    for (let i = 0; i < words.length; i += 16) {
      const w = words.slice(i, i + 16);
      while (w.length < 64) {
        const j = w.length;
        const s0 = rotateRight(7, w[j - 15]) ^ rotateRight(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotateRight(17, w[j - 2]) ^ rotateRight(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      let [a, b, c, d, e, f, g, h0] = h;
      for (let j = 0; j < 64; j++) {
        const S1 = rotateRight(6, e) ^ rotateRight(11, e) ^ rotateRight(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h0 + S1 + ch + k[j] + (w[j] || 0)) | 0;
        const S0 = rotateRight(2, a) ^ rotateRight(13, a) ^ rotateRight(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        h0 = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      h[0] = (h[0] + a) | 0;
      h[1] = (h[1] + b) | 0;
      h[2] = (h[2] + c) | 0;
      h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0;
      h[5] = (h[5] + f) | 0;
      h[6] = (h[6] + g) | 0;
      h[7] = (h[7] + h0) | 0;
    }

    return h.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
}
