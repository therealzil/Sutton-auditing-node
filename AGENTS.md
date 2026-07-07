# Sutton Sovereign Audit Node - Agent Directives

This document contains persistent project rules, legal compliance instructions, and security guardrails for any AI Coding Agent or Developer working on the **Sutton Sovereign Audit Node**. The AI Studio platform automatically injects these rules into system instructions.

---

## 🇪🇺 EU AI Act Compliance Profiles

1. **Law Tracking & Compliance updates:**
   - Always verify and update the EU AI Act compliance profiles defined in `src/lib/compliancePresets.ts` and related modules.
   - When the EU AI Act is amended, updated, or when new regulatory guidelines are published (especially regarding high-risk systems under Article 6, transparency obligations under Article 50, or prohibited AI practices under Article 5), audit the presets and ensure they reflect the most up-to-date legal standards.
   - Maintain accurate definitions for:
     - **Unacceptable Risk / Article 5 Prohibited Systems**
     - **High-Risk AI Systems / Article 6 Obligations**
     - **General Purpose AI (GPAI) / Article 50 Transparency Obligations**
     - **Low/Minimal Risk Systems**

2. **Policy Enforcement Verification:**
   - Any modifications to the evaluation, scanning, or reporting pipelines must run the existing telemetry compliance tests (`npm run test`) to ensure legal communication guidelines and formatting requirements remain fully unbroken.

---

## 🛡️ AST Sandbox & Vulnerability Hardening

1. **Adversarial Input Sanitization:**
   - The AST Sandbox and compliance engine must prevent arbitrary code execution, prototype pollution, context escapes, and sandbox bypass techniques.
   - Whenever a new AI injection, prompt leak, prototype pollution vector, or sandboxing vulnerability is identified, patch both `src/lib/sanitizer.ts` and `src/lib/astAnalyzer.ts`.
   - Pay special attention to:
     - Unsafe property accessors (`__proto__`, `constructor`, `prototype`).
     - Malicious string representations of forbidden built-in globals (`window`, `global`, `process`, `eval`, `Function`, `require`).
     - Complex AST trees with deeply nested recursion or escape patterns.

2. **Security Verification:**
   - After updating sandbox behaviors, always execute the full fuzzing harness (`npm run test:fuzz`) to guarantee zero regression and confirm that the cryptographic sanitizer boundaries are completely bulletproof.
