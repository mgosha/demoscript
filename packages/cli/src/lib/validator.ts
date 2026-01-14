import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

let validate: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (validate) {
    return validate;
  }

  // Load schema - try multiple locations for dev vs installed mode
  const schemaPaths = [
    join(__dirname, '../../../demo.schema.json'),     // Development (from dist/lib/ or bundled dist/)
    join(__dirname, '../../../../demo.schema.json'),  // Development (from dist/commands/lib/)
    join(__dirname, 'demo.schema.json'),              // Installed package (schema next to bundle.cjs)
  ];

  let schemaPath = schemaPaths.find(p => existsSync(p));
  if (!schemaPath) {
    throw new Error(`Schema file not found. Tried: ${schemaPaths.join(', ')}`);
  }

  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

  const ajv = new Ajv.default({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });

  // Register uri format to suppress "unknown format" warnings
  // Using a permissive validator since we just want structural validation
  ajv.addFormat('uri', true);

  validate = ajv.compile(schema);
  return validate;
}

export function validateDemoConfig(config: unknown): ValidationResult {
  const validator = getValidator();
  const valid = validator(config);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = (validator.errors || []).map((e: ErrorObject) => ({
    path: e.instancePath || '/',
    message: e.message || 'Unknown validation error',
    keyword: e.keyword,
  }));

  return { valid: false, errors };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }

  const lines = ['Demo configuration validation failed:', ''];

  for (const error of errors) {
    const path = error.path || '(root)';
    lines.push(`  ${path}: ${error.message}`);
  }

  return lines.join('\n');
}
