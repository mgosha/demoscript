import { describe, it, expect } from 'vitest';
import { substituteVariables, substituteInObject, extractValueByPath } from './variable-substitution';

describe('substituteVariables', () => {
  it('replaces simple variable', () => {
    const result = substituteVariables('Hello $name', { name: 'World' });
    expect(result).toBe('Hello World');
  });

  it('replaces multiple variables', () => {
    const result = substituteVariables('$greeting $name!', { greeting: 'Hello', name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('leaves unknown variables unchanged', () => {
    const result = substituteVariables('Hello $unknown', { name: 'World' });
    expect(result).toBe('Hello $unknown');
  });

  it('handles numeric values', () => {
    const result = substituteVariables('Count: $count', { count: 42 });
    expect(result).toBe('Count: 42');
  });

  it('handles null values', () => {
    const result = substituteVariables('Value: $val', { val: null });
    expect(result).toBe('Value: ');
  });

  it('handles underscore in variable names', () => {
    const result = substituteVariables('$my_var', { my_var: 'test' });
    expect(result).toBe('test');
  });
});

describe('substituteInObject', () => {
  it('substitutes in nested objects', () => {
    const obj = { url: '/api/$id', data: { name: '$name' } };
    const result = substituteInObject(obj, { id: '123', name: 'Test' });
    expect(result).toEqual({ url: '/api/123', data: { name: 'Test' } });
  });

  it('substitutes in arrays', () => {
    const arr = ['$first', '$second'];
    const result = substituteInObject(arr, { first: 'A', second: 'B' });
    expect(result).toEqual(['A', 'B']);
  });

  it('preserves non-string values', () => {
    const obj = { num: 42, bool: true, str: '$var' };
    const result = substituteInObject(obj, { var: 'replaced' });
    expect(result).toEqual({ num: 42, bool: true, str: 'replaced' });
  });
});

describe('extractValueByPath', () => {
  it('extracts simple property', () => {
    const result = extractValueByPath({ name: 'test' }, 'name');
    expect(result).toBe('test');
  });

  it('extracts nested property', () => {
    const obj = { data: { user: { id: 123 } } };
    const result = extractValueByPath(obj, 'data.user.id');
    expect(result).toBe(123);
  });

  it('returns undefined for missing path', () => {
    const result = extractValueByPath({ name: 'test' }, 'missing.path');
    expect(result).toBeUndefined();
  });

  it('handles null in path', () => {
    const obj = { data: null };
    const result = extractValueByPath(obj, 'data.name');
    expect(result).toBeUndefined();
  });

  it('extracts array element', () => {
    const obj = { items: ['a', 'b', 'c'] };
    const result = extractValueByPath(obj, 'items.1');
    expect(result).toBe('b');
  });
});
