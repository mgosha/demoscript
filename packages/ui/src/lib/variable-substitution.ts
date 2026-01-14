/**
 * Variable substitution utilities
 * Replaces $variableName with stored values
 */

export function substituteVariables(
  text: string,
  variables: Record<string, unknown>
): string {
  return text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
    if (varName in variables) {
      const value = variables[varName];
      return String(value ?? '');
    }
    return match;
  });
}

export function substituteInObject<T>(
  obj: T,
  variables: Record<string, unknown>
): T {
  if (typeof obj === 'string') {
    return substituteVariables(obj, variables) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => substituteInObject(item, variables)) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteInObject(value, variables);
    }
    return result as T;
  }

  return obj;
}

export function extractValueByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}
