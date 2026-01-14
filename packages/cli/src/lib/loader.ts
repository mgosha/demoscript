import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import yaml from 'js-yaml';
import type { DemoConfig, DemoRecordings, StepOrGroup, Step, RestStep, ExplicitRestStep } from '../types.js';
import { isRestStep, isStepGroup } from '../types.js';
import { validateDemoConfig, formatValidationErrors } from './validator.js';
import { fetchOpenApiSpec, generateFormFields, mergeFormFields, type OpenApiSpec } from './openapi.js';

interface LoadedDemo {
  config: DemoConfig;
  recordings: DemoRecordings | null;
  openapiSpec: OpenApiSpec | null;
}

export async function loadDemo(demoFile: string, skipValidation = false): Promise<LoadedDemo> {
  if (!existsSync(demoFile)) {
    throw new Error(`Demo file not found: ${demoFile}`);
  }

  const content = readFileSync(demoFile, 'utf-8');
  const config = yaml.load(content) as DemoConfig;

  // Validate against JSON Schema
  if (!skipValidation) {
    const result = validateDemoConfig(config);
    if (!result.valid) {
      throw new Error(formatValidationErrors(result.errors));
    }
  }

  // Basic required fields check (fallback)
  if (!config.title) {
    throw new Error('Demo config missing required field: title');
  }
  if (!config.steps || !Array.isArray(config.steps)) {
    throw new Error('Demo config missing required field: steps');
  }

  // Try to load recordings
  const demoDir = dirname(demoFile);
  const recordingsPath = join(demoDir, 'recordings.json');
  let recordings: DemoRecordings | null = null;

  if (existsSync(recordingsPath)) {
    const recordingsContent = readFileSync(recordingsPath, 'utf-8');
    recordings = JSON.parse(recordingsContent) as DemoRecordings;
  }

  // Fetch OpenAPI spec if configured
  const openapiUrl = config.settings?.openapi;
  let openapiSpec: OpenApiSpec | null = null;

  if (openapiUrl) {
    openapiSpec = await fetchOpenApiSpec(openapiUrl);
    if (openapiSpec) {
      // Process steps to generate forms from OpenAPI
      config.steps = processStepsWithOpenApi(config.steps, openapiSpec, config.settings?.base_url);
    }
  }

  return { config, recordings, openapiSpec };
}

/**
 * Process steps to generate form fields from OpenAPI spec
 */
function processStepsWithOpenApi(
  steps: StepOrGroup[],
  spec: OpenApiSpec,
  baseUrl?: string
): StepOrGroup[] {
  return steps.map(item => {
    if (isStepGroup(item)) {
      return {
        ...item,
        steps: processStepsArray(item.steps, spec, baseUrl)
      };
    }

    if (isRestStep(item)) {
      return processRestStepWithOpenApi(item, spec, baseUrl);
    }

    return item;
  });
}

/**
 * Process a flat array of steps (inside a group)
 */
function processStepsArray(
  steps: Step[],
  spec: OpenApiSpec,
  baseUrl?: string
): Step[] {
  return steps.map(step => {
    if (isRestStep(step)) {
      return processRestStepWithOpenApi(step, spec, baseUrl);
    }
    return step;
  });
}

/**
 * Process a single REST step to generate form fields from OpenAPI
 */
function processRestStepWithOpenApi(
  step: RestStep | ExplicitRestStep,
  spec: OpenApiSpec,
  baseUrl?: string
): RestStep | ExplicitRestStep {
  // Get method and path from step
  let method: string;
  let path: string;

  if ('rest' in step) {
    const parts = step.rest.trim().split(/\s+/);
    if (parts.length === 1) {
      method = 'GET';
      path = parts[0];
    } else {
      method = parts[0].toUpperCase();
      path = parts.slice(1).join(' ');
    }
  } else {
    method = step.method;
    path = step.path;
  }

  // Generate form fields from OpenAPI
  const openapiFields = generateFormFields(spec, method, path);

  if (openapiFields.length === 0) {
    return step;
  }

  // Merge with defaults and manual form fields
  const mergedFields = mergeFormFields(
    openapiFields,
    step.defaults,
    step.form
  );

  return {
    ...step,
    form: mergedFields
  };
}
