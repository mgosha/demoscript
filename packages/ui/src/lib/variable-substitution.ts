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

/**
 * Find all variable names used in a string (e.g., "$accessToken" -> "accessToken")
 */
export function findVariablesInString(text: string): string[] {
  const matches = text.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(1)))];
}

/**
 * Find all variable names used in an object (recursively)
 */
export function findVariablesInObject(obj: unknown): string[] {
  if (typeof obj === 'string') {
    return findVariablesInString(obj);
  }

  if (Array.isArray(obj)) {
    return [...new Set(obj.flatMap(item => findVariablesInObject(item)))];
  }

  if (obj !== null && typeof obj === 'object') {
    return [...new Set(
      Object.values(obj).flatMap(value => findVariablesInObject(value))
    )];
  }

  return [];
}

/**
 * Find variables that are used but not defined
 */
export function findMissingVariables(
  usedVars: string[],
  definedVars: Record<string, unknown>
): string[] {
  return usedVars.filter(varName => !(varName in definedVars));
}

export function extractValueByPath(obj: unknown, path: string): unknown {
  // Return entire object for empty path
  if (!path) {
    return obj;
  }

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
