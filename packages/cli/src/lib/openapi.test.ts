import { describe, it, expect } from 'vitest';
import { generateFormFields, generateResultFields, mergeFormFields, getEndpointInfo, type OpenApiSpec } from './openapi.js';

const mockSpec: OpenApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  paths: {
    '/tokens': {
      post: {
        summary: 'Create a token',
        description: 'Deploy a new ERC-20 token',
        operationId: 'createToken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'symbol'],
                properties: {
                  name: { type: 'string', description: 'Token name' },
                  symbol: { type: 'string', description: 'Token symbol' },
                  decimals: { type: 'integer', default: 18 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tokenId: { type: 'string', description: 'Token ID' },
                    name: { type: 'string' },
                    contractAddress: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    totalSupply: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        summary: 'List users',
        responses: {
          '200': {
            description: 'Users list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['admin', 'user', 'guest'],
                    description: 'User role',
                  },
                  active: { type: 'boolean' },
                  age: { type: 'number' },
                  tags: { type: 'array', items: { type: 'string' } },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User created' },
        },
      },
    },
  },
  components: {
    schemas: {
      TokenInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          amount: { type: 'integer' },
        },
      },
    },
  },
};

describe('generateFormFields', () => {
  it('generates fields from request body schema', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/tokens');

    expect(fields).toHaveLength(3);
    expect(fields[0].name).toBe('name');
    expect(fields[0].type).toBe('text');
    expect(fields[0].required).toBe(true);
    expect(fields[0].label).toBe('Token name');

    expect(fields[1].name).toBe('symbol');
    expect(fields[1].required).toBe(true);

    expect(fields[2].name).toBe('decimals');
    expect(fields[2].type).toBe('number');
    expect(fields[2].default).toBe(18);
  });

  it('returns empty array for GET requests (no body)', () => {
    const fields = generateFormFields(mockSpec, 'GET', '/users');
    expect(fields).toHaveLength(0);
  });

  it('returns empty array for non-existent path', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/nonexistent');
    expect(fields).toHaveLength(0);
  });

  it('returns empty array for non-existent method', () => {
    const fields = generateFormFields(mockSpec, 'DELETE', '/tokens');
    expect(fields).toHaveLength(0);
  });

  it('handles enum types as select fields', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/users');

    const roleField = fields.find(f => f.name === 'role');
    expect(roleField?.type).toBe('select');
    expect(roleField?.options).toEqual([
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
      { value: 'guest', label: 'guest' },
    ]);
  });

  it('handles boolean types as select fields', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/users');

    const activeField = fields.find(f => f.name === 'active');
    expect(activeField?.type).toBe('select');
    expect(activeField?.options).toEqual([
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ]);
  });

  it('handles number types', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/users');

    const ageField = fields.find(f => f.name === 'age');
    expect(ageField?.type).toBe('number');
  });

  it('handles array types as textarea', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/users');

    const tagsField = fields.find(f => f.name === 'tags');
    expect(tagsField?.type).toBe('textarea');
  });

  it('handles object types as textarea', () => {
    const fields = generateFormFields(mockSpec, 'POST', '/users');

    const metadataField = fields.find(f => f.name === 'metadata');
    expect(metadataField?.type).toBe('textarea');
  });

  it('is case-insensitive for method', () => {
    const fieldsLower = generateFormFields(mockSpec, 'post', '/tokens');
    const fieldsUpper = generateFormFields(mockSpec, 'POST', '/tokens');

    expect(fieldsLower).toEqual(fieldsUpper);
  });
});

describe('mergeFormFields', () => {
  const openapiFields = [
    { name: 'name', type: 'text' as const, required: true },
    { name: 'symbol', type: 'text' as const },
    { name: 'decimals', type: 'number' as const, default: 18 },
  ];

  it('returns OpenAPI fields when no overrides', () => {
    const merged = mergeFormFields(openapiFields);
    expect(merged).toEqual(openapiFields);
  });

  it('applies defaults to existing fields', () => {
    const merged = mergeFormFields(openapiFields, {
      name: 'Demo Token',
      symbol: 'DEMO',
    });

    const nameField = merged.find(f => f.name === 'name');
    expect(nameField?.default).toBe('Demo Token');
    expect(nameField?.required).toBe(true); // Preserves OpenAPI field

    const symbolField = merged.find(f => f.name === 'symbol');
    expect(symbolField?.default).toBe('DEMO');
  });

  it('creates new fields from defaults not in OpenAPI', () => {
    const merged = mergeFormFields(openapiFields, {
      customField: 'custom value',
      customNumber: 42,
    });

    const customField = merged.find(f => f.name === 'customField');
    expect(customField?.default).toBe('custom value');
    expect(customField?.type).toBe('text');

    const customNumber = merged.find(f => f.name === 'customNumber');
    expect(customNumber?.default).toBe(42);
    expect(customNumber?.type).toBe('number');
  });

  it('manual form fields fully override OpenAPI fields', () => {
    const manualFields = [
      { name: 'name', label: 'Token Name', type: 'text' as const, required: false, readonly: true },
    ];

    const merged = mergeFormFields(openapiFields, undefined, manualFields);

    const nameField = merged.find(f => f.name === 'name');
    expect(nameField?.label).toBe('Token Name');
    expect(nameField?.required).toBe(false); // Overridden
    expect(nameField?.readonly).toBe(true);
  });

  it('applies merge priority: OpenAPI -> defaults -> form', () => {
    const defaults = { name: 'Default Name' };
    const manualFields = [{ name: 'name', default: 'Manual Name' as string }];

    const merged = mergeFormFields(openapiFields, defaults, manualFields);

    const nameField = merged.find(f => f.name === 'name');
    expect(nameField?.default).toBe('Manual Name'); // Form wins
  });

  it('preserves order with OpenAPI fields first', () => {
    const merged = mergeFormFields(openapiFields, { newField: 'value' });

    const names = merged.map(f => f.name);
    expect(names).toEqual(['name', 'symbol', 'decimals', 'newField']);
  });
});

describe('getEndpointInfo', () => {
  it('returns summary and description for existing endpoint', () => {
    const info = getEndpointInfo(mockSpec, 'POST', '/tokens');

    expect(info?.summary).toBe('Create a token');
    expect(info?.description).toBe('Deploy a new ERC-20 token');
  });

  it('returns null for non-existent path', () => {
    const info = getEndpointInfo(mockSpec, 'POST', '/nonexistent');
    expect(info).toBeNull();
  });

  it('returns null for non-existent method', () => {
    const info = getEndpointInfo(mockSpec, 'DELETE', '/tokens');
    expect(info).toBeNull();
  });

  it('handles endpoints without description', () => {
    const info = getEndpointInfo(mockSpec, 'GET', '/users');

    expect(info?.summary).toBe('List users');
    expect(info?.description).toBeUndefined();
  });
});

describe('generateResultFields', () => {
  it('generates single JSON field for object response', () => {
    const fields = generateResultFields(mockSpec, 'POST', '/tokens');

    // All responses now return a single JSON viewer
    expect(fields).toHaveLength(1);
    expect(fields[0].key).toBe('');
    expect(fields[0].type).toBe('json');
    expect(fields[0].label).toBe('Response');
    expect(fields[0].expandedDepth).toBe(2);
  });

  it('generates single JSON field for array response', () => {
    const fields = generateResultFields(mockSpec, 'GET', '/users');

    expect(fields).toHaveLength(1);
    expect(fields[0].key).toBe('');
    expect(fields[0].type).toBe('json');
    expect(fields[0].label).toBe('Response');
    expect(fields[0].expandedDepth).toBe(2);
  });

  it('returns empty array for non-existent path', () => {
    const fields = generateResultFields(mockSpec, 'GET', '/nonexistent');
    expect(fields).toEqual([]);
  });

  it('returns empty array when no response schema', () => {
    const fields = generateResultFields(mockSpec, 'POST', '/users');
    expect(fields).toEqual([]);
  });

  it('handles path parameters', () => {
    const specWithParams: OpenApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/users/{userId}/profile': {
          get: {
            responses: {
              '200': {
                description: 'User profile',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Test with $userId variable syntax - should find the path and return JSON field
    const fields = generateResultFields(specWithParams, 'GET', '/users/$userId/profile');

    expect(fields).toHaveLength(1);
    expect(fields[0].type).toBe('json');
    expect(fields[0].label).toBe('Response');
  });
});
