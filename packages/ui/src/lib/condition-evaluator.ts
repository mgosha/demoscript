/**
 * Evaluates condition expressions against variables
 *
 * Supported syntax:
 * - $varName == 'value'
 * - $varName != 'value'
 * - $varName > 5
 * - $varName >= 5
 * - $varName < 5
 * - $varName <= 5
 * - $varName.property == 'value'
 * - $varName.nested.property == 'value'
 */

import { extractValueByPath } from './variable-substitution';

export interface EvaluationResult {
  passed: boolean;
  leftValue: unknown;
  rightValue: unknown;
  operator: string;
  error?: string;
}

export function evaluateCondition(
  condition: string,
  variables: Record<string, unknown>
): EvaluationResult {
  // Parse the condition
  const operatorMatch = condition.match(/\s*(==|!=|>=|<=|>|<)\s*/);

  if (!operatorMatch) {
    return {
      passed: false,
      leftValue: undefined,
      rightValue: undefined,
      operator: '?',
      error: 'Invalid condition syntax. Expected operator (==, !=, >, <, >=, <=)',
    };
  }

  const operator = operatorMatch[1];
  const operatorIndex = operatorMatch.index!;
  const leftPart = condition.substring(0, operatorIndex).trim();
  const rightPart = condition.substring(operatorIndex + operatorMatch[0].length).trim();

  // Resolve left side (variable reference)
  const leftValue = resolveValue(leftPart, variables);

  // Resolve right side (could be variable or literal)
  const rightValue = resolveValue(rightPart, variables);

  // Compare values
  const passed = compare(leftValue, rightValue, operator);

  return {
    passed,
    leftValue,
    rightValue,
    operator,
  };
}

function resolveValue(expr: string, variables: Record<string, unknown>): unknown {
  expr = expr.trim();

  // String literal (single or double quotes)
  if ((expr.startsWith("'") && expr.endsWith("'")) || (expr.startsWith('"') && expr.endsWith('"'))) {
    return expr.slice(1, -1);
  }

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr);
  }

  // Boolean literal
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;

  // Variable reference ($varName or $varName.path.to.value)
  if (expr.startsWith('$')) {
    const varPath = expr.slice(1); // Remove $
    const parts = varPath.split('.');
    const varName = parts[0];

    if (!(varName in variables)) {
      return undefined;
    }

    if (parts.length === 1) {
      return variables[varName];
    }

    // Nested path
    const remainingPath = parts.slice(1).join('.');
    return extractValueByPath(variables[varName], remainingPath);
  }

  // Return as-is (might be an unquoted string)
  return expr;
}

function compare(left: unknown, right: unknown, operator: string): boolean {
  switch (operator) {
    case '==':
      // eslint-disable-next-line eqeqeq
      return left == right;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return left != right;
    case '>':
      return Number(left) > Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<':
      return Number(left) < Number(right);
    case '<=':
      return Number(left) <= Number(right);
    default:
      return false;
  }
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
