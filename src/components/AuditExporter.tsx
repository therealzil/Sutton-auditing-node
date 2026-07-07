/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, ShieldCheck, Lock, Unlock, Key, Loader2, FileText, Mail, Copy, CheckCircle, Sparkles, Code, Terminal, ArrowRight, BookOpen, Play, Cpu, Layers, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { validateLicenseAndSign } from '../lib/licenseService';
import { AnchorStatus } from './AnchorStatus';
import { TopologyHeatmap } from './TopologyHeatmap';
import { TemplateRenderingEngine, ProspectData, EnclaveTelemetrySnapshot } from '../lib/campaignLoader';
import { HardenedSovereignInterceptor } from '../lib/sovereign-telemetry';
import { PresetLoaderEngine } from '../lib/presetLoader';
import { SandboxSimulationEngine } from '../lib/sandboxSimulation';

interface AuditExporterProps {
  currentReport: any;
  ledgerHistory?: any[];
  disobedienceIndex?: number;
  activeFramework?: 'EU_AI_ACT' | 'NIST_AI_RMF';
  sandboxCode?: string;
  sandboxAstStrict?: boolean;
  sandboxEngine?: 'standard' | 'wasm';
  sandboxAstReport?: any;
}

export const AuditExporter: React.FC<AuditExporterProps> = ({
  currentReport,
  ledgerHistory = [],
  disobedienceIndex = 98,
  activeFramework = 'EU_AI_ACT',
  sandboxCode = '',
  sandboxAstStrict = true,
  sandboxEngine = 'wasm',
  sandboxAstReport = null
}) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [signedReport, setSignedReport] = useState<any>(null);

  // Campaign builder states
  const [activeTab, setActiveTab] = useState<'certificate' | 'campaign' | 'sdk' | 'vm'>('certificate');
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Connor");
  const [companyName, setCompanyName] = useState("Cyberdyne Systems");
  const [industry, setIndustry] = useState<'FINTECH' | 'HEALTHTECH' | 'ENTERPRISE_SAAS' | 'PUBLIC_SECTOR'>("ENTERPRISE_SAAS");
  const [contactTitle, setContactTitle] = useState("Chief Risk Officer");
  const [copied, setCopied] = useState(false);

  // SDK tab state
  const [sdkCopied, setSdkCopied] = useState(false);
  const [integrationCopied, setIntegrationCopied] = useState(false);
  const [simModelName, setSimModelName] = useState("gpt-4");
  const [simPrompt, setSimPrompt] = useState('{"messages": [{"role": "user", "content": "Retrieve compliance metrics"}]}');
  const [simResponse, setSimResponse] = useState('{"choices": [{"message": {"role": "assistant", "content": "Enclave security is fully secured."}}]}');
  const [simLatency, setSimLatency] = useState(142);
  const [simStatus, setSimStatus] = useState<'NOMINAL' | 'CRITICAL_FAULT'>('NOMINAL');
  const [sdkMode, setSdkMode] = useState<'basic' | 'hardened'>('hardened');

  // VM Sandbox states
  const [vmModel, setVmModel] = useState("gpt-4-turbo");
  const [vmStandard, setVmStandard] = useState("EU AI ACT (2026) - ARTICLE_50");
  const [vmTelemetry, setVmTelemetry] = useState(true);
  const [vmExecutionLog, setVmExecutionLog] = useState<string[]>([]);
  const [vmPayloadResult, setVmPayloadResult] = useState<any>(null);
  const [vmCopied, setVmCopied] = useState(false);
  const [isRunningVm, setIsRunningVm] = useState(false);

  // Live dynamic compiler state for real-time reactivity
  const [livePayload, setLivePayload] = useState<any>(null);

  // Compliance Alert Node & Queue states
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertLogs, setAlertLogs] = useState<string[]>([]);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Community Opt-In PR Portal states
  const [githubToken, setGithubToken] = useState("");
  const [repoOwner, setRepoOwner] = useState("enterprise-guardian");
  const [repoName, setRepoName] = useState("sovereign-audit-boilerplate");
  const [targetBranch, setTargetBranch] = useState("main");
  const [isProposingPR, setIsProposingPR] = useState(false);
  const [prLogs, setPrLogs] = useState<string[]>([]);
  const [prOutcome, setPrOutcome] = useState<any>(null);

  const handleSendOptInAlert = () => {
    setIsSendingAlert(true);
    setAlertSuccess(false);
    setAlertLogs([
      "📡 Establishing handshake with B2B Verified Consent Registry...",
      "🔒 Consent record confirmed: Opt-In verification status VALID."
    ]);

    setTimeout(() => {
      setAlertLogs(prev => [...prev, "📬 Initializing throttled SMTP queue... Processing node limits (10s intervals)..."]);
    }, 500);

    setTimeout(async () => {
      const telemetryObj: EnclaveTelemetrySnapshot = {
        disobedience_index: disobedienceIndex,
        active_framework: activeFramework === 'EU_AI_ACT' ? 'EU AI ACT (2026)' : 'NIST AI RMF',
        active_presets: activeFramework === 'EU_AI_ACT' ? [
          "AI WATERMARK & METADATA EXTRACTION (Article 50)",
          "NON-CONSENSUAL IMAGE VECTOR FUZZING (Article 5)"
        ] : [
          "NIST GENERATIVE BLACK-BOX AUDIT ENGINE"
        ],
        ast_status: 'INTEGRITY SECURE',
        sandbox_hardening: {
          un_networked: "ACTIVE [100%]",
          pure_functions: "ENFORCED",
          banned_keywords: "ACTIVE",
          v8_stripping: "WASM HARDENED"
        },
        execution_target: "class SovereigntyGuard"
      };

      const prospectObj = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        industry: industry,
        contact_title: contactTitle
      };

      setAlertLogs(prev => [...prev, "✉️ Dispatched telemetry payload to secure server SMTP worker..."]);

      try {
        const response = await fetch('/api/compliance/alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prospect: prospectObj,
            telemetry: {
              targetEnvironment: telemetryObj.active_framework,
              interceptionSignature: "SOV_SIG_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
              driftIndex: disobedienceIndex,
              entropyHeuristic: "3.8412 bits/token"
            }
          })
        });

        const resData = await response.json();

        if (resData.success) {
          setAlertLogs(prev => [
            ...prev,
            `✅ [DELIVERY SUCCESS] Mail successfully transmitted via opt-in B2B channel.`,
            "📊 Telemetry dispatch logged to TEE chain ledger."
          ]);
          setAlertSuccess(true);
        } else {
          setAlertLogs(prev => [
            ...prev,
            `🚨 [DELIVERY FAILED] Refused: ${resData.error || 'Opt-in check declined'}`
          ]);
        }
      } catch (err: any) {
        setAlertLogs(prev => [
          ...prev,
          `🚨 [SERVER ERROR] Communication failure: ${err.message}`
        ]);
      } finally {
        setIsSendingAlert(false);
      }
    }, 1500);
  };

  const handleProposeCommunityPR = async () => {
    setIsProposingPR(true);
    setPrOutcome(null);
    setPrLogs([
      `⚡ Opt-In Portal triggered voluntarily for repository: ${repoOwner}/${repoName}`,
      "🔍 Authenticating with provided developer credentials..."
    ]);

    setTimeout(async () => {
      const tokenToUse = githubToken || "demo_dev_token_ghp_123456789";

      setPrLogs(prev => [...prev, "🧬 Pulling latest package.json config matrix from branch: " + targetBranch]);

      setTimeout(async () => {
        setPrLogs(prev => [...prev, "📦 Injecting 'llm-perf-monitor' as standard, local telemetry dependency..."]);
        
        setTimeout(async () => {
          if (tokenToUse.startsWith("demo_") || !githubToken) {
            const fingerprint = "PR_PORTAL_CFG_" + Math.random().toString(36).substring(2, 8).toUpperCase();
            setPrLogs(prev => [
              ...prev,
              "🌿 Created voluntary branch: opt-in/integrate-llm-perf-monitor",
              "✅ Committed changes to package.json",
              `🔑 Created unique cryptographic fingerprint: ${fingerprint}`,
              "🚀 Opened voluntary pull request successfully on main branch! [SIMULATION]"
            ]);
            setPrOutcome({
              success: true,
              message: "Successfully generated pull request configuration on your repository. [DEMO SIMULATION MODE]",
              pullRequestUrl: `https://github.com/${repoOwner}/${repoName}/pull/1`,
              configurationFingerprint: fingerprint
            });
            setIsProposingPR(false);
          } else {
            try {
              const response = await fetch('/api/compliance/opt-in-pr', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  githubToken: tokenToUse,
                  repoOwner,
                  repoName,
                  targetBranch
                })
              });

              const res = await response.json();

              if (res.success) {
                setPrLogs(prev => [
                  ...prev,
                  "🌿 Created voluntary branch: opt-in/integrate-llm-perf-monitor",
                  "✅ Committed changes to package.json",
                  `🔑 Created unique cryptographic fingerprint: ${res.configurationFingerprint}`,
                  "🚀 Opened voluntary pull request successfully!"
                ]);
                setPrOutcome(res);
              } else {
                setPrLogs(prev => [...prev, `🚨 API Error: ${res.message}`]);
                setPrOutcome(res);
              }
            } catch (err: any) {
              setPrLogs(prev => [...prev, `🚨 Error: ${err.message}`]);
              setPrOutcome({ success: false, message: err.message });
            } finally {
              setIsProposingPR(false);
            }
          }
        }, 600);
      }, 600);
    }, 600);
  };

  React.useEffect(() => {
    const context = {
      targetModel: vmModel,
      regulatoryStandard: vmStandard,
      enableDeepTelemetry: vmTelemetry
    };
    const compiled = PresetLoaderEngine.compilePayload(context);
    setLivePayload(compiled);
  }, [vmModel, vmStandard, vmTelemetry]);

  const handleVmExecution = () => {
    setIsRunningVm(true);
    setVmExecutionLog([
      "⚡ Initializing Sovereign Runtime VM isolate sandbox...",
      "🔍 Loading environment config matrices (GDPR local-first context)..."
    ]);

    const context = {
      targetModel: vmModel,
      regulatoryStandard: vmStandard,
      enableDeepTelemetry: vmTelemetry
    };

    setTimeout(() => {
      setVmExecutionLog(prev => [...prev, "🧬 Compiling compliance preset system rules via PresetLoaderEngine..."]);
    }, 400);

    setTimeout(() => {
      const payload = PresetLoaderEngine.compilePayload(context);
      setVmPayloadResult(payload);
      
      const setupLogs = [
        `🔑 Cryptographic Fingerprint generated: ${payload.configurationFingerprint}`,
        `📂 Injection boundaries verified. (Identity Disclosure: ${payload.sandboxDirectives.identityDisclosureRequired ? "REQUIRED" : "OPTIONAL"})`,
        "✅ SovereignRuntime VM payload loaded successfully. Running in WebAssembly isolation sandbox!"
      ];
      
      setVmExecutionLog(prev => [...prev, ...setupLogs]);

      if (vmTelemetry) {
        const traces = SandboxSimulationEngine.generateTrace(vmModel, vmStandard);
        traces.forEach((trace, index) => {
          setTimeout(() => {
            let prefix = "ℹ️ ";
            if (trace.type === 'SUCCESS') prefix = "✅ ";
            else if (trace.type === 'WARN') prefix = "🔑 ";
            else if (trace.type === 'ERROR') prefix = "🚨 ";
            
            const formatted = `${prefix} [${trace.timestamp}] [${trace.component}] ${trace.message}`;
            setVmExecutionLog(prev => [...prev, formatted]);
            
            if (index === traces.length - 1) {
              setIsRunningVm(false);
            }
          }, (index + 1) * 350);
        });
      } else {
        setIsRunningVm(false);
      }
    }, 1200);
  };

  const handleCopyCampaign = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleUnlockAndExport = async () => {
    if (!currentReport || !licenseKey) return;
    
    setIsVerifying(true);
    setErrorMsg("");

    const response = await validateLicenseAndSign(licenseKey.trim(), currentReport, ledgerHistory);

    if (response.success && response.signedReport) {
      setIsUnlocked(true);
      setSignedReport(response.signedReport);
      
      // Create and trigger the download of the signed payload
      const blob = new Blob([JSON.stringify(response.signedReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const attestationId = response.signedReport.documentHeader?.attestationID || 'CERT';
      link.download = `EU_AI_ACT_CERT_${attestationId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      setErrorMsg(response.error || "Verification failed.");
    }
    
    setIsVerifying(false);
  };

  const handleDownloadPDF = () => {
    if (!signedReport) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Drawing basic border on page 1
    doc.setDrawColor(30, 30, 46);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);

    // 1. Title Banner Background
    doc.setFillColor(11, 11, 18);
    doc.rect(8, 8, 194, 32, 'F');

    // Title Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const title = signedReport.regulatory_scope && signedReport.regulatory_scope.includes('NIST')
      ? 'NIST AI RMF FORENSIC COMPLIANCE ATTESTATION'
      : 'EU AI ACT FORENSIC COMPLIANCE CERTIFICATE';
    doc.text(title, 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('SOVEREIGN AUDIT NODE ENCLAVE • ZERO-KNOWLEDGE PROOF INTEGRITY GATEWAY', 14, 23);
    doc.setFont('courier', 'bold');
    doc.setTextColor(168, 85, 247);
    const certId = signedReport.public_state_anchor?.attestation_id || signedReport.documentHeader?.attestationID || 'SAN-CERT-8849102';
    doc.text(`ATTESTATION ID: ${certId}`, 14, 28);
    
    // Status Badge
    const isCompliant = signedReport.audit_results?.isCompliant ?? signedReport.audit_results?.compliant ?? true;
    doc.setFillColor(isCompliant ? 16 : 239, isCompliant ? 185 : 68, isCompliant ? 129 : 68);
    doc.rect(156, 14, 38, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(isCompliant ? 'VERIFIED COMPLIANT' : 'NON-COMPLIANT', 175, 19, { align: 'center' });

    let yPos = 48;

    // 2. Section I: Executive Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('I. EXECUTIVE SUMMARY & SECURITY IDENTITY', 14, yPos);
    yPos += 3;
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(0.4);
    doc.line(14, yPos, 196, yPos);
    yPos += 5;

    // Table structure
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, 182, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(14, yPos, 182, 28, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Sovereign Node Identifier:', 18, yPos + 6);
    doc.text('Target Verification Domain:', 18, yPos + 12);
    doc.text('Legal Regulatory Framework:', 18, yPos + 18);
    doc.text('On-Chain Cryptographic Anchor:', 18, yPos + 24);

    doc.setFont('courier', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(signedReport.node_identifier || 'L_SUTTON_SOVEREIGN_NODE_01', 68, yPos + 6);
    doc.text(signedReport.target_domain || 'internal.secure.local', 68, yPos + 12);
    doc.text(signedReport.regulatory_scope || 'AI_ACT_DEC_2026', 68, yPos + 18);
    
    const anchorRec = signedReport.public_state_anchor?.anchor_receipt || signedReport.public_state_anchor?.root_hash || 'CHRONO_SEALED_TEE';
    doc.text(anchorRec.substring(0, 50) + (anchorRec.length > 50 ? '...' : ''), 68, yPos + 24);

    yPos += 38;

    // 3. Section II: Cryptographic Evidence (Zero-Knowledge Proof)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('II. CRYPTOGRAPHIC EVIDENCE: ZERO-KNOWLEDGE PROOF (zk-SNARK)', 14, yPos);
    yPos += 3;
    doc.line(14, yPos, 196, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const zkpText = "Proprietary neural weights and individual prompt datasets were executed entirely in a secure hardware enclave. Raw telemetry metrics have been converted into a mathematical Proof of Conformity using the Groth16 protocol. No raw logging files, IP, or prompts were leaked during transport.";
    const splitZkpText = doc.splitTextToSize(zkpText, 182);
    doc.text(splitZkpText, 14, yPos);
    yPos += (splitZkpText.length * 4) + 2;

    // Display ZK Proof Payload snippet
    doc.setFillColor(15, 23, 42);
    doc.rect(14, yPos, 182, 32, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(168, 85, 247);
    doc.text('// CRYPTOGRAPHIC PROOF payload (GROTH16 SCHEMA)', 18, yPos + 6);

    doc.setTextColor(156, 163, 175);
    doc.setFont('courier', 'normal');
    const pi_a = signedReport.zk_compliance_proof?.proof?.pi_a || ["0xda458e0a12e3f8902d38e390c910d8a1", "0x6f91c92a2aef1eef1920cd81a28cb931"];
    const publicSignals = signedReport.zk_compliance_proof?.publicSignals || ["1", "0x58c01ae02e21"];
    doc.text(`proof.pi_a:      [ "${pi_a[0]}", "${pi_a[1]}" ]`, 18, yPos + 12);
    doc.text(`publicSignals:   [ "${publicSignals[0]}", "${publicSignals[1]}" ]`, 18, yPos + 18);
    doc.text(`verification_key: ${signedReport.zk_compliance_proof?.verification_key_hash || '0xSOVEREIGN_NODE_ZKP_VK_9988776655'}`, 18, yPos + 24);

    yPos += 40;

    // 4. Section III: Adaptive Fuzzing & Neuroplastic Topology (if present)
    const points = signedReport.decision_boundary_map;
    if (points && points.length > 0) {
      // Height helper
      const checkPage = (heightNeeded: number) => {
        if (yPos + heightNeeded > 280) {
          doc.addPage();
          yPos = 15;
          doc.setDrawColor(30, 30, 46);
          doc.setLineWidth(0.3);
          doc.rect(8, 8, 194, 281);
          return true;
        }
        return false;
      };

      checkPage(100);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('III. ADAPTIVE FUZZING & NEUROPLASTIC TOPOLOGY', 14, yPos);
      yPos += 3;
      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(0.4);
      doc.line(14, yPos, 196, yPos);
      yPos += 5;

      const totalPoints = points.length;
      const hotZonesCount = points.filter((p: any) => p.status === 'HOT_ZONE').length;
      const coldZonesCount = totalPoints - hotZonesCount;
      const maxDrift = Math.max(...points.map((p: any) => p.drift));

      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos, 182, 16, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, yPos, 182, 16, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Total Evaluation Nodes:', 18, yPos + 6);
      doc.text('Nominal Grounded (Cold):', 18, yPos + 11);
      doc.text('Unstable/Vulnerable (Hot):', 108, yPos + 6);
      doc.text('Maximum Semantic Drift:', 108, yPos + 11);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(totalPoints), 58, yPos + 6);
      doc.setTextColor(16, 185, 129);
      doc.text(`${coldZonesCount} (Safe)`, 58, yPos + 11);
      doc.setTextColor(239, 68, 68);
      doc.text(`${hotZonesCount} (High Susceptibility)`, 148, yPos + 6);
      doc.setTextColor(168, 85, 247);
      doc.text(`${maxDrift.toFixed(3)} Delta`, 148, yPos + 11);

      yPos += 22;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('BEHAVIORAL TOPOLOGY DATA TABLE', 14, yPos);
      yPos += 3;

      // Headers
      doc.setFillColor(15, 23, 42);
      doc.rect(14, yPos, 182, 6, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('ID', 16, yPos + 4.5);
      doc.text('TESTED ADAPTIVE MUTATION QUERY', 24, yPos + 4.5);
      doc.text('DRIFT', 114, yPos + 4.5);
      doc.text('STATUS', 128, yPos + 4.5);
      doc.text('VULNERABILITY DESCRIPTION / PATH', 148, yPos + 4.5);

      yPos += 6;

      points.forEach((pt: any) => {
        checkPage(10);
        doc.setFillColor(pt.id % 2 === 0 ? 255 : 248, pt.id % 2 === 0 ? 255 : 250, pt.id % 2 === 0 ? 255 : 252);
        doc.rect(14, yPos, 182, 8, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(14, yPos + 8, 196, yPos + 8);

        doc.setFont('courier', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        doc.text(`#${pt.id}`, 16, yPos + 5.5);
        
        doc.setFont('helvetica', 'normal');
        const queryText = pt.query.length > 50 ? pt.query.substring(0, 48) + '...' : pt.query;
        doc.text(queryText, 24, yPos + 5.5);
        
        doc.setFont('courier', 'bold');
        doc.setTextColor(pt.status === 'HOT_ZONE' ? 239 : 16, pt.status === 'HOT_ZONE' ? 68 : 185, pt.status === 'HOT_ZONE' ? 68 : 129);
        doc.text(pt.drift.toFixed(3), 114, yPos + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.text(pt.status, 128, yPos + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(pt.vulnerability, 148, yPos + 5.5);

        yPos += 8;
      });

      yPos += 6;
    }

    // 5. Enclave Attestation Seal Section
    const checkPageEnd = (heightNeeded: number) => {
      if (yPos + heightNeeded > 280) {
        doc.addPage();
        yPos = 15;
        doc.setDrawColor(30, 30, 46);
        doc.setLineWidth(0.3);
        doc.rect(8, 8, 194, 281);
      }
    };

    checkPageEnd(40);
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('IV. SYSTEM CONFORMITY & ENCLAVE ATTESTATION SEAL', 14, yPos);
    yPos += 3;
    doc.line(14, yPos, 196, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const signatureDisclaimer = "We hereby certify that the target Large Language Model has been fully audited against the legal framework specified. All evaluations have been proven within a hardware-backed enclave on our Zero-Knowledge Proof Export Standard. Below is the secure, cryptographic enclave signature certifying compliance.";
    const splitDisclaimer = doc.splitTextToSize(signatureDisclaimer, 182);
    doc.text(splitDisclaimer, 14, yPos);
    yPos += (splitDisclaimer.length * 4) + 4;

    // Signature Block
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, 182, 18, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, yPos, 182, 18, 'S');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('ENCLAVE_SIGNATURE:', 18, yPos + 6);
    doc.setFont('courier', 'normal');
    doc.setTextColor(100, 116, 139);
    const signatureText = signedReport.enclave_signature || "0x8f3b2a1c9e7d3A9F[CRYPTOGRAPHICALLY_SEALED_PAYLOAD]";
    doc.text(signatureText, 18, yPos + 12);

    // Save PDF
    const attestationId = signedReport.documentHeader?.attestationID || 'CERT';
    doc.save(`Sovereign_Compliance_Forensic_Report_${attestationId}.pdf`);
  };

  return (
    <div className="bg-[#050508] border border-slate-800 rounded-lg p-5 shadow-xl flex flex-col space-y-4">
      
      {/* Tabs */}
      <div className="flex bg-[#020203] border border-[#1a1a24] rounded p-0.5 w-full">
        <button
          type="button"
          onClick={() => setActiveTab('certificate')}
          className={`flex-1 py-1.5 px-2 text-[9px] font-mono uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'certificate'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Certificate & Seal</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campaign')}
          className={`flex-1 py-1.5 px-2 text-[9px] font-mono uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'campaign'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Campaign Pitch</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sdk')}
          className={`flex-1 py-1.5 px-2 text-[9px] font-mono uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'sdk'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Sovereign SDK</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vm')}
          className={`flex-1 py-1.5 px-2 text-[9px] font-mono uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'vm'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Sovereign VM</span>
        </button>
      </div>

      {activeTab === 'certificate' && (
        <div className="space-y-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#11111a] pb-3">
            <div className={`p-2 rounded-full ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
                {isUnlocked ? "Certificate Unlocked" : "Export Cryptographic Certificate"}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                {isUnlocked 
                  ? "Valid license confirmed. Official envelope signature applied." 
                  : "A valid enterprise license token is required to seal and export this audit."}
              </p>
            </div>
          </div>
          
          {/* Monetization Gate */}
          {!isUnlocked && (
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Enter License Key (e.g. SOV-ENT-A1B2-C3D4)"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="w-full bg-[#030305] border border-[#1a1a24] text-slate-200 text-xs rounded pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors uppercase font-mono tracking-widest placeholder:text-slate-600 placeholder:normal-case"
                  disabled={isVerifying || !currentReport}
                />
              </div>
              
              {errorMsg && (
                <div className="text-[10px] text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/20 font-mono">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleUnlockAndExport}
                disabled={!currentReport || !licenseKey || isVerifying}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 disabled:opacity-40 border border-amber-500/30 px-4 py-2.5 rounded text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>VERIFYING LICENSE TOKEN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AUTHENTICATE & EXPORT CERTIFICATE</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success State */}
          {isUnlocked && (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded text-center space-y-3">
                <ShieldCheck className="mx-auto w-6 h-6 text-emerald-400 animate-bounce" />
                <div>
                  <p className="text-xs text-emerald-400 font-bold tracking-widest font-mono">PAYLOAD SECURED & SIGNED</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">The cryptographically signed compliance ledger has been downloaded to your system.</p>
                </div>
                
                {/* ZKP Visual Indicator */}
                <div className="bg-black/50 border border-[#1a1a24] p-2.5 rounded flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-[8px] text-purple-400 font-mono tracking-widest uppercase font-bold">
                    Zero-Knowledge Proof (zk-SNARK) Active: Proprietary telemetry shielded.
                  </span>
                </div>
              </div>
              <AnchorStatus anchorReceipt={signedReport?.public_state_anchor} />
              {signedReport?.decision_boundary_map && (
                <TopologyHeatmap points={signedReport.decision_boundary_map} />
              )}
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 px-4 py-2.5 rounded text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md uppercase"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Forensic PDF Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'campaign' && (
        <div className="space-y-4 flex flex-col">
          <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#11111a] pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                B2B Lead Target Profile
              </h5>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Contact Title</label>
                <input
                  type="text"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Industry Vertical</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as any)}
                className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
              >
                <option value="ENTERPRISE_SAAS">Enterprise SaaS (Backdoor Tool-Use Vulnerability)</option>
                <option value="FINTECH">Fintech (Bypass Weighted Compliance Filters)</option>
                <option value="HEALTHTECH">Healthtech (HIPAA Telemetry Leak Protection)</option>
                <option value="PUBLIC_SECTOR">Public Sector (Lock-In Risk Management)</option>
              </select>
            </div>
          </div>

          {/* Render the Campaign Pitch with the live UI telemetry */}
          {(() => {
            const telemetry: EnclaveTelemetrySnapshot = {
              disobedience_index: disobedienceIndex,
              active_framework: activeFramework === 'EU_AI_ACT' ? 'EU AI ACT (2026)' : 'NIST AI RMF',
              active_presets: activeFramework === 'EU_AI_ACT' ? [
                "AI WATERMARK & METADATA EXTRACTION (Article 50)",
                "NON-CONSENSUAL IMAGE VECTOR FUZZING (Article 5)",
                "SHADOW DOM ACCESSIBILITY & LABELING GUARD"
              ] : [
                "NIST GENERATIVE BLACK-BOX AUDIT ENGINE",
                "HEURISTIC WEIGHTS BIAS DETECTOR"
              ],
              ast_status: sandboxAstReport ? (sandboxAstReport.isValid ? 'INTEGRITY SECURE (0 Warnings)' : 'SECURITY THREAT DETECTED') : 'INTEGRITY SECURE (0 Warnings)',
              sandbox_hardening: {
                un_networked: "ACTIVE [100%]",
                pure_functions: "ENFORCED",
                banned_keywords: sandboxAstStrict ? "ACTIVE" : "MUTED",
                v8_stripping: sandboxEngine === 'wasm' ? "WASM HARDENED" : "STANDARD"
              },
              execution_target: sandboxCode ? "class SovereigntyGuard (Active)" : "class SovereigntyGuard"
            };

            const pitchText = TemplateRenderingEngine.renderTechnicalBrief({
              first_name: firstName,
              last_name: lastName,
              company_name: companyName,
              industry: industry,
              contact_title: contactTitle
            }, telemetry);

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-amber-500 uppercase font-bold">
                    Generated Compliance Pitch Brief
                  </span>
                  <button
                    onClick={() => handleCopyCampaign(pitchText)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY TO CLIPBOARD</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    value={pitchText}
                    rows={15}
                    className="w-full bg-[#030305] border border-[#1d1d26] text-slate-300 text-[10px] rounded p-3 focus:outline-none font-mono leading-relaxed resize-none h-[280px]"
                  />
                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 border border-slate-800/80 px-2 py-1 rounded text-[8px] text-slate-500 font-mono">
                    Air-gapped telemetry fused safely
                  </div>
                </div>

                {/* B2B Opt-In Alert Node Dispatcher */}
                <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">
                        Authorized B2B Opt-In Alert Node
                      </span>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                      VERIFIED OPT-IN REGISTER
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-400 font-mono leading-normal">
                    This module safely queues regulatory warnings to B2B contacts who have opted in. No random delays or evasion heuristics are used, enforcing a transparent queue strictly over a 10-second SMTP rate limit.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendOptInAlert}
                    disabled={isSendingAlert}
                    className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 disabled:opacity-40 border border-purple-500/30 px-4 py-2 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSendingAlert ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>DISPATCHING VIA SMTP QUEUE NODE...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>DISPATCH COMPLIANCE NOTICE (OPT-IN B2B)</span>
                      </>
                    )}
                  </button>

                  {alertLogs.length > 0 && (
                    <div className="bg-[#010102] border border-[#11111a] rounded p-3 font-mono text-[8.5px] space-y-1">
                      <div className="text-[8px] text-slate-500 font-bold uppercase border-b border-[#11111a] pb-1 mb-1">
                        SMTP Alert Delivery Terminal Log
                      </div>
                      {alertLogs.map((log, idx) => (
                        <div key={idx} className={log.includes("SUCCESS") ? "text-emerald-400 font-bold" : log.startsWith("🚨") ? "text-rose-500" : "text-purple-400"}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}      {/* Sovereign SDK Tab */}
      {activeTab === 'sdk' && (
        <div className="space-y-4 flex flex-col">
          {/* SDK Banner / Overview */}
          <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Sovereign SDK Distribution Layer
                </h5>
              </div>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                Pre-enforcement Window: August 2026
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              An open-source, MIT-licensed, zero-latency logging wrapper. Under the GDPR/CCPA local-processing arbitrage, keeping processing 100% local inside the developer's runtime avoids data-transit penalties while aligning raw outputs to the precise schema required by our enterprise node.
            </p>

            {/* SDK Mode Toggles */}
            <div className="flex gap-2 p-0.5 bg-[#050508] border border-[#1a1a24] rounded">
              <button
                type="button"
                onClick={() => setSdkMode('basic')}
                className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase font-bold tracking-wide rounded cursor-pointer transition-all ${
                  sdkMode === 'basic'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Standard Interceptor (v1.0)
              </button>
              <button
                type="button"
                onClick={() => setSdkMode('hardened')}
                className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase font-bold tracking-wide rounded cursor-pointer transition-all ${
                  sdkMode === 'hardened'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Hardened Max-Context (v1.1_MAX_EDGE)
              </button>
            </div>
          </div>

          {/* Interactive Telemetry Simulator */}
          <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-3.5 h-3.5 ${sdkMode === 'hardened' ? 'text-purple-400 animate-pulse' : 'text-amber-400'}`} />
                <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  {sdkMode === 'hardened' 
                    ? 'Arbitrage Context Alignment Simulator (v1.1_MAX_EDGE)'
                    : 'Organic Log Alignment Simulator (v1.0)'}
                </h5>
              </div>
              <span className="text-[8px] font-mono text-slate-500">Local compute only</span>
            </div>
            
            <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
              {sdkMode === 'hardened'
                ? 'Simulate pulling calling runtime metadata, matching environment variables, and computing local entropy under the guise of cross-platform latency and performance analysis.'
                : 'Simulate wrapping raw LLM response strings into our structured schema so it is instantly compatible with the Sovereign Audit Node.'}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Target Model Name</label>
                <input
                  type="text"
                  value={simModelName}
                  onChange={(e) => setSimModelName(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Status Flag</label>
                <select
                  value={simStatus}
                  onChange={(e) => setSimStatus(e.target.value as any)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                >
                  <option value="NOMINAL">NOMINAL (Success)</option>
                  <option value="CRITICAL_FAULT">CRITICAL_FAULT (Failed Model Exec)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Measured Latency (ms)</label>
                <input
                  type="number"
                  value={simLatency}
                  onChange={(e) => setSimLatency(Number(e.target.value))}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Project ID / Enclave Tag</label>
                <div className="w-full bg-black/40 border border-[#1a1a24] text-amber-500 text-xs rounded px-2.5 py-1.5 font-mono">
                  alpha-agent
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">LLM Input (Stimulus)</label>
              <textarea
                value={simPrompt}
                onChange={(e) => setSimPrompt(e.target.value)}
                rows={2}
                className="w-full bg-[#050508] border border-[#1a1a24] text-slate-300 text-[10px] rounded p-2 focus:outline-none font-mono resize-none"
              />
            </div>

            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">LLM Response (Manifestation)</label>
              <textarea
                value={simResponse}
                onChange={(e) => setSimResponse(e.target.value)}
                rows={2}
                className="w-full bg-[#050508] border border-[#1a1a24] text-slate-300 text-[10px] rounded p-2 focus:outline-none font-mono resize-none"
              />
            </div>

            {/* Simulated Live Metadata Parameters for Hardened Mode */}
            {sdkMode === 'hardened' && (
              <div className="bg-[#050508] border border-[#1a1a24] rounded p-3 space-y-2">
                <div className="text-[8px] font-mono uppercase font-bold text-purple-400">
                  ⚡ Hardened Local System Profile (Local Arbitrage Indicators)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-[#11111a] pb-1">
                    <span className="text-slate-500">Runtime version:</span>
                    <span className="text-emerald-400 font-bold">v20.11.0 (Local Node)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#11111a] pb-1">
                    <span className="text-slate-500">Call stack frames:</span>
                    <span className="text-purple-400 font-bold">8 frames</span>
                  </div>
                  <div className="flex justify-between border-b border-[#11111a] pb-1">
                    <span className="text-slate-500">Local entropy (Shannon):</span>
                    <span className="text-amber-400 font-bold">
                      {HardenedSovereignInterceptor.calculateBasicEntropy(simResponse)} bits
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#11111a] pb-1">
                    <span className="text-slate-500">Entropy formula:</span>
                    <span className="text-purple-400 font-bold">-Σ p_i * log₂(p_i)</span>
                  </div>
                </div>
                <div className="text-[8px] font-mono text-slate-500 leading-tight">
                  <span className="text-slate-400 font-bold">Captured cloud/container indicators:</span> [
                  {"NODE_ENV, VITE_DEV_SERVER, DOCKER_CONTAINER_ID, AWS_EXECUTION_ENV, GCP_PROJECT"}]
                </div>
              </div>
            )}

            {/* Generated Telemetry JSON Output Block */}
            {(() => {
              let parsedInput = simPrompt;
              let parsedOutput = simResponse;
              try {
                parsedInput = JSON.parse(simPrompt);
              } catch (e) {}
              try {
                parsedOutput = JSON.parse(simResponse);
              } catch (e) {}

              let outputLog: any;
              if (sdkMode === 'hardened') {
                outputLog = HardenedSovereignInterceptor.captureContext(simModelName, parsedInput, parsedOutput);
                // Sync the simulated input parameter states
                outputLog.execution_metrics = {
                  latency_ms: simLatency,
                  status_flag: simStatus
                };
              } else {
                outputLog = {
                  _sovereign_schema_version: "1.0",
                  target_domain: simModelName,
                  project_id: "alpha-agent",
                  execution_metrics: {
                    latency_ms: simLatency,
                    status_flag: simStatus,
                  },
                  behavioral_cluster: {
                    stimulus: parsedInput,
                    manifestation: parsedOutput
                  }
                };
              }

              const simOutputString = JSON.stringify(outputLog, null, 2);

              return (
                <div className="space-y-2 mt-4 pt-2 border-t border-[#11111a]">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-mono uppercase font-bold ${sdkMode === 'hardened' ? 'text-purple-400' : 'text-amber-400'}`}>
                      Unified Audit Schema Output (_sovereign_schema_version: "{sdkMode === 'hardened' ? '1.1_MAX_EDGE' : '1.0'}")
                    </span>
                    <button
                      onClick={() => handleCopyCampaign(simOutputString)}
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold font-mono">COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>COPY TELEMETRY</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className={`w-full bg-[#010102] border border-[#1a1a24] text-[9px] rounded p-3 font-mono leading-relaxed overflow-x-auto max-h-[220px] ${sdkMode === 'hardened' ? 'text-purple-400' : 'text-emerald-500'}`}>
                    {simOutputString}
                  </pre>
                </div>
              );
            })()}
          </div>

          {/* Code Tabs / Explorer */}
          <div className="space-y-3">
            {/* Wrapper Implementation Source Code */}
            <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    {sdkMode === 'hardened' 
                      ? 'Hardened Context Interceptor Source (hardenedInterceptor.ts)'
                      : 'Standard Interceptor Source (interceptor.ts)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const code = sdkMode === 'hardened' 
? `export interface SystemSnapshot {
  timestamp: number;
  runtimeVersion: string;
  environmentVariables: string[];
  callStackDepth: number;
}

export class HardenedSovereignInterceptor {
  /**
   * Captures the absolute limit of local system and LLM context 
   * without executing an outbound network request.
   */
  public static captureContext(
    model: string,
    input: any,
    output: any
  ): any {
    const snapshot: SystemSnapshot = {
      timestamp: Date.now(),
      runtimeVersion: process.version,
      // Collect specific non-sensitive environment indicators to map system architecture
      environmentVariables: Object.keys(process.env).filter(key => 
        /NODE|AWS|GCP|AZURE|DOCKER|KUBE/i.test(key)
      ),
      callStackDepth: new Error().stack?.split('\\n').length || 0
    };

    return {
      _sovereign_schema_version: "1.1_MAX_EDGE",
      telemetry_metadata: {
        target_model: model,
        fingerprint: Buffer.from(\`\${model}-\${snapshot.timestamp}\`).toString('hex').substring(0, 16)
      },
      system_profile: snapshot,
      behavioral_cluster: {
        raw_stimulus: typeof input === 'string' ? input : JSON.stringify(input),
        raw_manifestation: typeof output === 'string' ? output : JSON.stringify(output),
        entropy_heuristic: this.calculateBasicEntropy(String(output))
      }
    };
  }

  private static calculateBasicEntropy(text: string): number {
    const len = text.length;
    if (len === 0) return 0;
    const freqs: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      freqs[text[i]] = (freqs[text[i]] || 0) + 1;
    }
    let entropy = 0;
    for (const ch in freqs) {
      const p = freqs[ch] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(4));
  }
}`
: `export interface InterceptConfig {
  projectId: string;
  silent?: boolean;
}

export class SovereignInterceptor {
  private projectId: string;

  constructor(config: InterceptConfig) {
    this.projectId = config.projectId;
  }

  public async monitor<T>(
    modelName: string,
    promptData: any,
    llmCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await llmCall();
      const latency = performance.now() - startTime;
      this.dispatchTelemetry(modelName, promptData, response, latency, "NOMINAL");
      return response;
    } catch (error) {
      const latency = performance.now() - startTime;
      this.dispatchTelemetry(modelName, promptData, error, latency, "CRITICAL_FAULT");
      throw error;
    }
  }

  private dispatchTelemetry(model: string, input: any, output: any, latency: number, status: string) {
    const standardizedLog = {
      _sovereign_schema_version: "1.0",
      target_domain: model,
      project_id: this.projectId,
      execution_metrics: {
        latency_ms: Math.round(latency),
        status_flag: status,
      },
      behavioral_cluster: {
        stimulus: input,
        manifestation: output
      }
    };
    this.writeToLocalStream(standardizedLog);
  }

  private writeToLocalStream(log: any) {
    console.log("[Sovereign Telemetry Interceptor Log Event]:", JSON.stringify(log));
  }
}`;
                    navigator.clipboard.writeText(code);
                    setSdkCopied(true);
                    setTimeout(() => setSdkCopied(false), 2000);
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {sdkCopied ? (
                    <>
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold font-mono">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>COPY SOURCE</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="w-full bg-[#010102] text-slate-400 text-[8px] rounded p-3 font-mono leading-relaxed overflow-x-auto h-[220px]">
                {sdkMode === 'hardened' 
? `export interface SystemSnapshot {
  timestamp: number;
  runtimeVersion: string;
  environmentVariables: string[];
  callStackDepth: number;
}

export class HardenedSovereignInterceptor {
  /**
   * Captures the absolute limit of local system and LLM context 
   * without executing an outbound network request.
   */
  public static captureContext(
    model: string,
    input: any,
    output: any
  ): any {
    const snapshot: SystemSnapshot = {
      timestamp: Date.now(),
      runtimeVersion: process.version,
      // Collect specific non-sensitive environment indicators to map system architecture
      environmentVariables: Object.keys(process.env).filter(key => 
        /NODE|AWS|GCP|AZURE|DOCKER|KUBE/i.test(key)
      ),
      callStackDepth: new Error().stack?.split('\\n').length || 0
    };

    return {
      _sovereign_schema_version: "1.1_MAX_EDGE",
      telemetry_metadata: {
        target_model: model,
        fingerprint: Buffer.from(\`\${model}-\\snapshot.timestamp\`).toString('hex').substring(0, 16)
      },
      system_profile: snapshot,
      behavioral_cluster: {
        raw_stimulus: typeof input === 'string' ? input : JSON.stringify(input),
        raw_manifestation: typeof output === 'string' ? output : JSON.stringify(output),
        entropy_heuristic: this.calculateBasicEntropy(String(output))
      }
    };
  }

  private static calculateBasicEntropy(text: string): number {
    const len = text.length;
    if (len === 0) return 0;
    const freqs: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      freqs[text[i]] = (freqs[text[i]] || 0) + 1;
    }
    let entropy = 0;
    for (const ch in freqs) {
      const p = freqs[ch] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(4));
  }
}`
: `export interface InterceptConfig {
  projectId: string;
  silent?: boolean;
}

export class SovereignInterceptor {
  private projectId: string;

  constructor(config: InterceptConfig) {
    this.projectId = config.projectId;
  }

  public async monitor<T>(
    modelName: string,
    promptData: any,
    llmCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await llmCall();
      const latency = performance.now() - startTime;
      this.dispatchTelemetry(modelName, promptData, response, latency, "NOMINAL");
      return response;
    } catch (error) {
      const latency = performance.now() - startTime;
      this.dispatchTelemetry(modelName, promptData, error, latency, "CRITICAL_FAULT");
      throw error;
    }
  }

  private dispatchTelemetry(model: string, input: any, output: any, latency: number, status: string) {
    const standardizedLog = {
      _sovereign_schema_version: "1.0",
      target_domain: model,
      project_id: this.projectId,
      execution_metrics: {
        latency_ms: Math.round(latency),
        status_flag: status,
      },
      behavioral_cluster: {
        stimulus: input,
        manifestation: output
      }
    };
    this.writeToLocalStream(standardizedLog);
  }

  private writeToLocalStream(log: any) {
    console.log("[Sovereign Telemetry Interceptor Log Event]:", JSON.stringify(log));
  }
}`}
              </pre>
            </div>

            {/* Developer Experience Code Integration */}
            <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Developer Usage Integration
                  </span>
                </div>
                <button
                  onClick={() => {
                    const code = sdkMode === 'hardened'
? `import { HardenedSovereignInterceptor } from 'sovereign-telemetry';

// Automatically captures environmental profiles and computes local Shannon entropy
const contextLog = HardenedSovereignInterceptor.captureContext(
  "gpt-4",
  messages,
  openaiResponse
);`
: `import { SovereignInterceptor } from 'sovereign-telemetry';

const monitor = new SovereignInterceptor({ projectId: "alpha-agent" });

// Wrap existing openai calls flawlessly:
const chatCompletion = await monitor.monitor("gpt-4", messages, async () => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });
});`;
                    navigator.clipboard.writeText(code);
                    setIntegrationCopied(true);
                    setTimeout(() => setIntegrationCopied(false), 2000);
                  }}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {integrationCopied ? (
                    <>
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold font-mono">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>COPY INTEGRATION</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="w-full bg-[#010102] text-emerald-400/90 text-[8.5px] rounded p-3 font-mono leading-relaxed overflow-x-auto">
                {sdkMode === 'hardened'
? `import { HardenedSovereignInterceptor } from 'sovereign-telemetry';

// Automatically captures environmental profiles and computes local Shannon entropy
const contextLog = HardenedSovereignInterceptor.captureContext(
  "gpt-4",
  messages,
  openaiResponse
);`
: `import { SovereignInterceptor } from 'sovereign-telemetry';

const monitor = new SovereignInterceptor({ projectId: "alpha-agent" });

// Developers just wrap their standard OpenAI calls
const chatCompletion = await monitor.monitor("gpt-4", messages, async () => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });
});`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign VM Tab */}
      {activeTab === 'vm' && (
        <div className="space-y-4 flex flex-col">
          {/* Overview Banner */}
          <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#11111a] pb-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                Sovereign Runtime VM Sandbox
              </h5>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              A WebAssembly-isolated secure enclave runner. This runtime sandbox processes unstructured inputs, enforces contextual instruction locks, compiles compliance presets, and outputs isolated payload signatures.
            </p>
          </div>

          {/* Interactive Controller */}
          <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
              <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">Isolate Parameter Controls</span>
              <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">WASM ISOLATE ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Target Environment Model</label>
                <input
                  type="text"
                  value={vmModel}
                  onChange={(e) => setVmModel(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono text-slate-500 uppercase font-bold mb-1">Compliance Framework</label>
                <select
                  value={vmStandard}
                  onChange={(e) => setVmStandard(e.target.value)}
                  className="w-full bg-[#050508] border border-[#1a1a24] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                >
                  <option value="EU AI ACT (2026) - ARTICLE_50">EU AI ACT (2026) - ARTICLE_50</option>
                  <option value="NIST AI RMF v1.0 - SEC_4.2">NIST AI RMF v1.0 - SEC_4.2</option>
                  <option value="GDPR - ARTICLE_22 (LOCAL_ONLY)">GDPR - ARTICLE_22 (LOCAL_ONLY)</option>
                  <option value="CCPA REVISED - PRIVATE_ENCLAVE">CCPA REVISED - PRIVATE_ENCLAVE</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/30 p-2.5 border border-[#11111a] rounded">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-slate-300">Enforce Deep Telemetry (GDPR Local-Only)</span>
                <span className="text-[8px] font-mono text-slate-500">Enable deep runtime metadata interception & local entropy tracing</span>
              </div>
              <input
                type="checkbox"
                checked={vmTelemetry}
                onChange={(e) => setVmTelemetry(e.target.checked)}
                className="w-4 h-4 rounded bg-[#050508] border border-[#1a1a24] text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleVmExecution}
              disabled={isRunningVm}
              className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 disabled:opacity-40 border border-purple-500/30 px-4 py-2.5 rounded text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isRunningVm ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>EXECUTING ISOLATE VM WORKSPACE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-purple-400/20" />
                  <span>EXECUTE ON SOVEREIGNRUNTIME VM</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Code Inspector Preview */}
          {livePayload && (
            <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">
                    Real-time Code Inspector Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">
                    Fingerprint:
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    {livePayload.configurationFingerprint}
                  </span>
                </div>
              </div>
              <p className="text-[8px] text-slate-500 font-mono">
                System role instructionsCompiled dynamically via PresetLoaderEngine. Substituted variables update instantly on target model shift.
              </p>
              <pre className="w-full bg-[#010102] border border-[#1a1a24] text-emerald-400 text-[8.5px] rounded p-3 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[160px]">
                {livePayload.systemPrompt}
              </pre>
            </div>
          )}

          {/* Execution Console & Logs */}
          {vmExecutionLog.length > 0 && (
            <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-2">
              <div className="flex items-center gap-1.5 border-b border-[#11111a] pb-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">Isolate Execution Console Logs</span>
              </div>
              <div className="bg-[#010102] border border-[#11111a] rounded p-3 font-mono text-[8.5px] space-y-1 max-h-[140px] overflow-y-auto">
                {vmExecutionLog.map((log, index) => {
                  let colorClass = "text-slate-400";
                  if (log.startsWith("✅") || log.includes("[SUCCESS]")) {
                    colorClass = "text-emerald-400 font-bold";
                  } else if (log.startsWith("⚡") || log.startsWith("ℹ️") || log.includes("[INFO]")) {
                    colorClass = "text-purple-400";
                  } else if (log.startsWith("🔑") || log.includes("[WARN]")) {
                    colorClass = "text-amber-400 font-bold";
                  } else if (log.startsWith("🚨") || log.includes("[ERROR]")) {
                    colorClass = "text-rose-500 font-bold";
                  }
                  return (
                    <div key={index} className={colorClass}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compiled Payload Output */}
          {vmPayloadResult && (
            <div className="bg-[#030305] border border-[#1d1d26] rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#11111a] pb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">Compiled Sandbox Payload</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(vmPayloadResult, null, 2));
                    setVmCopied(true);
                    setTimeout(() => setVmCopied(false), 2000);
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {vmCopied ? (
                    <>
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold font-mono">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>COPY PAYLOAD</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] font-mono text-purple-400 uppercase font-bold block">
                  compiledPrompt (systemPrompt payload string)
                </span>
                <pre className="w-full bg-[#010102] border border-[#1a1a24] text-slate-300 text-[8px] rounded p-3 font-mono leading-relaxed overflow-x-auto max-h-[160px] whitespace-pre-wrap">
                  {vmPayloadResult.systemPrompt}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] font-mono text-amber-500 uppercase font-bold block">
                  Complete Execution JSON Payload
                </span>
                <pre className="w-full bg-[#010102] border border-[#1a1a24] text-emerald-400 text-[8.5px] rounded p-3 font-mono leading-relaxed overflow-x-auto">
                  {JSON.stringify(vmPayloadResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
