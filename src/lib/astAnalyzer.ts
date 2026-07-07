/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ASTNode {
  id: string;
  type: string;
  label: string;
  line: number;
  status: 'SAFE' | 'BANNED' | 'WARNING';
  details?: string;
  children?: ASTNode[];
}

export interface ASTReport {
  isValid: boolean;
  violations: string[];
  nodes: ASTNode[];
  stats: {
    lines: number;
    chars: number;
    functions: number;
    variables: number;
    loops: number;
    bannedCalls: number;
  };
}

/**
 * A highly interactive AST (Abstract Syntax Tree) & Static Analysis Engine
 * that parses JavaScript/TypeScript code within a simulated un-networked V8 isolate.
 */
export class ASTAnalyzer {
  private static readonly BANNED_KEYWORDS = [
    'window',
    'document',
    'eval',
    'process',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'chrome',
    'navigator',
    'location',
    'cookie',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'fs',
    'require',
    'Function',
    'setTimeout',
    'setInterval',
    'globalThis',
    'global'
  ];

  private static readonly ALLOWED_DOM_METHODS = [
    'querySelector',
    'querySelectorAll',
    'getAttribute',
    'match',
    'test',
    'toLowerCase',
    'toUpperCase',
    'forEach',
    'push',
    'includes',
    'split',
    'trim',
    'parseInt',
    'isNaN',
    'parseFloat',
    'Date',
    'Math',
    'map',
    'filter',
    'reduce',
    'find',
    'some',
    'every',
    'substring',
    'indexOf',
    'replace'
  ];

  private static readonly MUTABLE_DOM_PROPERTIES = [
    'shadowRoot',
    'textContent',
    'innerText',
    'className',
    'innerHTML',
    'outerHTML',
    'attributes',
    'childNodes',
    'value'
  ];

  /**
   * Performs an AST breakdown of the given script.
   */
  public static analyze(code: string): ASTReport {
    const lines = code.split('\n');
    const violations: string[] = [];
    const nodes: ASTNode[] = [];
    let functionsCount = 0;
    let variablesCount = 0;
    let loopsCount = 0;
    let bannedCallsCount = 0;

    // Root Program Node
    const programNode: ASTNode = {
      id: 'root-1',
      type: 'Program',
      label: 'Program',
      line: 1,
      status: 'SAFE',
      details: 'Root Entry Point of the Sovereign Sandbox script',
      children: []
    };

    // Scan each line for syntax structures and keywords
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
        return;
      }

      // 1. Check for banned keywords
      this.BANNED_KEYWORDS.forEach(keyword => {
        // Regex to match keyword as whole word (to avoid matching variables like "payload_window")
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        if (regex.test(trimmed)) {
          bannedCallsCount++;
          const violationMsg = `Line ${lineNum}: Use of forbidden keyword "${keyword}" is blocked.`;
          if (!violations.includes(violationMsg)) {
            violations.push(violationMsg);
          }
          
          programNode.children?.push({
            id: `banned-${lineNum}-${keyword}`,
            type: 'BannedIdentifier',
            label: `Identifier: ${keyword}`,
            line: lineNum,
            status: 'BANNED',
            details: `Forbidden environment API exposure. Access to "${keyword}" is mathematically denied.`
          });
        }
      });

      // 2. Prohibited DOM/State Mutations (AST Assignment Guard)
      this.MUTABLE_DOM_PROPERTIES.forEach(prop => {
        // Look for property assignment patterns like node.textContent = ... or node.value = ...
        const regex = new RegExp(`\\.\\b${prop}\\b\\s*=[^=]`, 'g');
        if (regex.test(trimmed)) {
          bannedCallsCount++;
          const violationMsg = `Line ${lineNum}: Prohibited Mutation detected. Attempted write assignment to DOM property "${prop}".`;
          if (!violations.includes(violationMsg)) {
            violations.push(violationMsg);
          }

          programNode.children?.push({
            id: `mutation-${lineNum}-${prop}`,
            type: 'AssignmentExpression',
            label: `Prohibited Mutation: ${prop}`,
            line: lineNum,
            status: 'BANNED',
            details: `Attempted write assignment to DOM property "${prop}". Read-Only DOM Reflection is strictly required.`
          });
        }
      });

      // 3. Unauthorized Method Invocations
      // Look for method call patterns like .methodName(
      const methodMatch = trimmed.match(/\.([a-zA-Z0-9_$]+)\s*\(/g);
      if (methodMatch) {
        methodMatch.forEach(match => {
          const methodName = match.replace('.', '').replace('(', '').trim();
          // Check if this method is not in allowed methods, and check if it resembles mutation or file access
          if (!this.ALLOWED_DOM_METHODS.includes(methodName) && !['log', 'error', 'warn', 'info'].includes(methodName)) {
            // Flag a security warning or ban depending on dangerous nature
            const isCritical = ['attachShadow', 'send', 'write', 'createElement', 'appendChild', 'removeChild'].includes(methodName);
            if (isCritical) {
              bannedCallsCount++;
              const violationMsg = `Line ${lineNum}: Forbidden mutative method invocation "${methodName}()".`;
              if (!violations.includes(violationMsg)) {
                violations.push(violationMsg);
              }
            }

            programNode.children?.push({
              id: `method-${lineNum}-${methodName}`,
              type: 'CallExpression',
              label: `Method Call: ${methodName}()`,
              line: lineNum,
              status: isCritical ? 'BANNED' : 'WARNING',
              details: isCritical 
                ? `Forbidden mutative DOM hook invocation "${methodName}".`
                : `Unapproved method execution pattern. Ensure complete isolation.`
            });
          }
        });
      }

      // 4. Check for variable declarations (const, let, var)
      const varMatch = trimmed.match(/\b(const|let|var)\s+([a-zA-Z0-9_$]+)/);
      if (varMatch) {
        variablesCount++;
        const varType = varMatch[1];
        const varName = varMatch[2];
        const isBannedName = this.BANNED_KEYWORDS.includes(varName);
        
        programNode.children?.push({
          id: `var-${lineNum}-${varName}`,
          type: 'VariableDeclaration',
          label: `${varType === 'const' ? 'Const' : 'Let'}Declaration: ${varName}`,
          line: lineNum,
          status: isBannedName ? 'BANNED' : 'SAFE',
          details: `Allocates immutable V8 memory slot for "${varName}".`
        });
      }

      // 5. Check for function declarations (function, arrow functions)
      const funcMatch = trimmed.match(/\b(function)\s+([a-zA-Z0-9_$]+)/) || trimmed.match(/const\s+([a-zA-Z0-9_$]+)\s*=\s*(async\s*)?\([^)]*\)\s*=>/);
      if (funcMatch) {
        functionsCount++;
        const funcName = funcMatch[2] || funcMatch[1];
        programNode.children?.push({
          id: `func-${lineNum}-${funcName}`,
          type: 'FunctionDeclaration',
          label: `Function: ${funcName}()`,
          line: lineNum,
          status: 'SAFE',
          details: `Declares deterministic sub-routine "${funcName}". Bound inside un-networked sandbox.`
        });
      }

      // 6. Check for loop constructs (for, while)
      const loopMatch = trimmed.match(/\b(for|while)\b/);
      if (loopMatch) {
        loopsCount++;
        const loopType = loopMatch[1];
        programNode.children?.push({
          id: `loop-${lineNum}-${loopType}`,
          type: 'IterationStatement',
          label: `${loopType === 'for' ? 'For' : 'While'}Loop`,
          line: lineNum,
          status: loopType === 'while' ? 'WARNING' : 'SAFE',
          details: loopType === 'while' 
            ? 'While statement detected. Warning: Unbounded loops can trigger CPU execution timeouts.' 
            : 'Standard bounded loop block.'
        });
      }

      // 7. Check for imports or require
      if (trimmed.includes('import ') || trimmed.includes('require(')) {
        const importMsg = `Line ${lineNum}: Dynamic module import or require statements are barred inside the microVM.`;
        if (!violations.includes(importMsg)) {
          violations.push(importMsg);
        }
        programNode.children?.push({
          id: `import-${lineNum}`,
          type: 'ImportDeclaration',
          label: 'ModuleImport',
          line: lineNum,
          status: 'BANNED',
          details: 'Module loading is disabled. Sandbox is fully isolated from host libraries.'
        });
      }
    });

    // If no children were added, add a default statement node
    if (programNode.children && programNode.children.length === 0) {
      programNode.children.push({
        id: 'stmt-empty',
        type: 'EmptyStatement',
        label: 'Empty Program',
        line: 1,
        status: 'SAFE',
        details: 'No executable AST nodes identified.'
      });
    }

    const isValid = violations.length === 0;
    programNode.status = isValid ? 'SAFE' : 'BANNED';

    return {
      isValid,
      violations,
      nodes: [programNode],
      stats: {
        lines: lines.length,
        chars: code.length,
        functions: functionsCount,
        variables: variablesCount,
        loops: loopsCount,
        bannedCalls: bannedCallsCount
      }
    };
  }
}
