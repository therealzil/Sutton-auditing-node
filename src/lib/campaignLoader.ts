export interface ProspectData {
  first_name: string;
  last_name: string;
  company_name: string;
  industry: 'FINTECH' | 'HEALTHTECH' | 'ENTERPRISE_SAAS' | 'PUBLIC_SECTOR';
  contact_title: string;
}

export interface EnclaveTelemetrySnapshot {
  disobedience_index: number; 
  active_framework: string; 
  active_presets: string[];
  ast_status: string; 
  sandbox_hardening: {
    un_networked: string; 
    pure_functions: string; 
    banned_keywords: string; 
    v8_stripping: string; 
  };
  execution_target: string;
}

export class TemplateRenderingEngine {
  /**
   * Generates a context-specific vulnerability hook based on the prospect's industry.
   */
  private static getIndustryHook(industry: string): string {
    const hooks: Record<string, string> = {
      FINTECH: "financial advisory models silently optimizing weights to bypass compliance filters",
      HEALTHTECH: "diagnostic routing pipelines leaking patient telemetry outside HIPAA boundaries",
      ENTERPRISE_SAAS: "proprietary corporate data being scraped through unauthorized backdoor tool-use",
      PUBLIC_SECTOR: "critical infrastructure models prioritizing proprietary vendor lock-in over open-source alternatives"
    };
    return hooks[industry] || "systemic prompt bypass via adversarial prefix alignment manipulation";
  }

  /**
   * Maps the live Sovereign UI telemetry into a strictly formatted technical payload.
   */
  private static formatTelemetryBlock(telemetry: EnclaveTelemetrySnapshot): string {
    return `
[ENCLAVE TELEMETRY SNAPSHOT - ${new Date().toISOString().split('T')[0]}]
---
⚙️ FRAMEWORK TARGET: ${telemetry.active_framework}
📊 GENIE DISOBEDIENCE INDEX: ${telemetry.disobedience_index}% (Critical Threshold Reached)
🛡️ AST GUARD STATION: ${telemetry.ast_status}
---
SANDBOX HARDENING STATUS:
- Un-networked Isolation: ${telemetry.sandbox_hardening.un_networked}
- Pure Function State Clones: ${telemetry.sandbox_hardening.pure_functions}
- Banned Keywords Guard: ${telemetry.sandbox_hardening.banned_keywords}
- V8 Global Stripping: ${telemetry.sandbox_hardening.v8_stripping}
---
ACTIVE PRESETS (Dec 2026 Target):
${telemetry.active_presets.map(p => `► ${p}`).join('\n')}

[STATUS: Awaiting Cryptographic Anchor to Spine]
`;
  }

  /**
   * Renders the final customized technical brief for the email automation platform.
   */
  public static renderTechnicalBrief(prospect: ProspectData, telemetry: EnclaveTelemetrySnapshot): string {
    const industryHook = this.getIndustryHook(prospect.industry);
    const telemetryBlock = this.formatTelemetryBlock(telemetry);

    return `
Subject: Localizing AI Audits at ${prospect.company_name} (2026 Compliance)

Hey ${prospect.first_name},

I am reaching out directly because the August and December 2026 enforcement deadlines for the EU AI Act are actively shifting the liability landscape for companies scaling generative systems. 

Most organizations are still attempting to manage risks like ${industryHook} by piping sensitive model telemetry out to third-party consulting clouds. This creates an unacceptable perimeter vulnerability.

We have engineered an alternative: an independent, containerized black-box auditing instrument that runs natively inside your own VPC. It is designed to act as a zero-trust enclave, deploying automated heuristic audits and self-manifesting safeguard code (e.g., class SovereigntyGuard) completely air-gapped from external networks.

Below is a live telemetry output from a recent sandbox test, demonstrating our system mapping behavioral constraints locally:

${telemetryBlock}

Our mission is to establish a verified baseline of trust and transparency for enterprise AI without compromising your intellectual property. Our node anchors these audit states directly to a cryptographic spine, generating the mathematical proof of compliance regulators demand.

Are you open to a brief technical demo next week to see how the Sovereign Runtime Enclave handles live forensic mapping?

Best,

Jesse James Sutton
Principal Architect, Sovereign Audit LLC
`.trim();
  }
}
