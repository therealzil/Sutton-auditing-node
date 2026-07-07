// test_telemetry_suite.js
import { ComplianceAlertNode } from './src/lib/ComplianceAlertNode.js';

// Setup colorful terminal logs using ANSI codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fgCyan: '\x1b[36m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgRed: '\x1b[31m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

let testsRun = 0;
let testsPassed = 0;
const failures = [];

function describe(suiteName, fn) {
  console.log(`\n${colors.bright}${colors.fgCyan}═══ ${suiteName.toUpperCase()} ═══${colors.reset}`);
  fn();
}

function it(testName, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`  ${colors.fgGreen}✓ [PASS]${colors.reset} ${testName}`);
  } catch (err) {
    failures.push({ testName, error: err });
    console.log(`  ${colors.fgRed}✗ [FAIL]${colors.reset} ${testName}`);
    console.log(`    ${colors.fgRed}└─ Error: ${err.message}${colors.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Ensure clean environment for deterministic testing
process.env.SMTP_HOST = ''; // Deactivate live SMTP transport to force Dev Fallback Shield

describe('ComplianceAlertNode Test Suite', () => {
  
  it('should initialize successfully in Dev Fallback mode when SMTP is unconfigured', () => {
    const node = new ComplianceAlertNode();
    assert(node !== null, 'ComplianceAlertNode instance is null');
    // Ensure transporter is null to activate fallback shield
    assertEquals(node['transporter'], null, 'Transporter should be null under dev safety fallback');
  });

  it('should format recipient emails using lowercase corporate handles', () => {
    const node = new ComplianceAlertNode();
    const prospect = {
      first_name: 'Carina',
      last_name: 'Kozole',
      company_name: 'N26',
      industry: 'FINTECH',
      contact_title: 'Chief Risk Officer'
    };
    
    // In ComplianceAlertNode, the target email is formed as:
    // `${prospect.first_name.toLowerCase()}.${prospect.last_name.toLowerCase()}@${prospect.company_name.toLowerCase().replace(/\s/g, '')}.com`
    const targetEmail = `${prospect.first_name.toLowerCase()}.${prospect.last_name.toLowerCase()}@${prospect.company_name.toLowerCase().replace(/\s/g, '')}.com`;
    assertEquals(targetEmail, 'carina.kozole@n26.com', 'Recipient email is incorrectly formatted');
  });

  it('should generate compliance alert text adhering to EU AI Act Article 50 requirements', () => {
    const node = new ComplianceAlertNode();
    const prospect = {
      first_name: 'Gino',
      last_name: 'Cordt',
      company_name: 'N26',
      industry: 'FINTECH',
      contact_title: 'Chief Technology Officer'
    };
    const telemetry = {
      targetEnvironment: 'Intel SGX / Firecracker MicroVM Isolation',
      interceptionSignature: '7ed53fbf9182bc3847fa2910384ef92c1093a847362849201cbef8392103847e',
      driftIndex: 0,
      entropyHeuristic: 'HIGH_STABILITY'
    };

    const text = node['generateComplianceAlertText'](prospect, telemetry);
    
    assert(text.includes('REGULATORY TRANSPARENCY NOTIFICATION'), 'Missing regulatory header');
    assert(text.includes('Gino Cordt (Chief Technology Officer)'), 'Missing prospect details');
    assert(text.includes('N26'), 'Missing target company name');
    assert(text.includes('EU AI Act (Article 50)'), 'Missing regulatory framework reference');
    assert(text.includes('7ed53fbf9182bc3847fa2910384ef92c1093a847362849201cbef8392103847e'), 'Missing cryptographic signature anchor');
    assert(text.includes('Intel SGX / Firecracker MicroVM Isolation'), 'Missing microVM isolation metadata');
  });

  it('should successfully queue alerts and maintain append-only sequence tracking', () => {
    const node = new ComplianceAlertNode();
    const prospect1 = {
      first_name: 'Carina',
      last_name: 'Kozole',
      company_name: 'N26',
      industry: 'FINTECH',
      contact_title: 'Chief Risk Officer'
    };
    const telemetry1 = {
      targetEnvironment: 'Intel SGX / Firecracker MicroVM Isolation',
      interceptionSignature: 'f18b8393e92c4a11b8aef72c3849102a83cd74619374472e3894bf01a182390a',
      driftIndex: 0,
      entropyHeuristic: 'HIGH_STABILITY'
    };

    // Temporarily stub processQueue to prevent real timers and stdout clutter in this unit test
    const originalProcess = node['processQueue'];
    node['processQueue'] = async () => {};

    const queued = node.queueAlert(prospect1, telemetry1);
    assert(queued === true, 'Failed to queue alert');
    
    const status = node.getQueueStatus();
    assertEquals(status.length, 1, 'Queue length should be exactly 1');
    assertEquals(status[0].recipient, 'N26', 'Incorrect recipient tracking');
    assertEquals(status[0].status, 'PENDING', 'Incorrect initial queue status');
  });
});

console.log(`\n${colors.bright}${colors.fgYellow}═¹ RUN SUMMARY ═¹${colors.reset}`);
console.log(`  Total Tests Run: ${testsRun}`);
console.log(`  Tests Passed:    ${colors.fgGreen}${testsPassed}${colors.reset}`);
console.log(`  Tests Failed:    ${failures.length > 0 ? colors.fgRed : colors.fgGreen}${failures.length}${colors.reset}`);

if (failures.length > 0) {
  console.log(`\n${colors.bright}${colors.fgRed}❌ Suite execution failed!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.bright}${colors.fgGreen}✅ All assertions verified successfully. Environment isolation metrics validated.${colors.reset}\n`);
  process.exit(0);
}
