import { describe, it, expect } from 'vitest';
import { evaluateCondition, getNestedValue } from './executor.js';

describe('evaluateCondition', () => {
  it('evaluates string equality', () => {
    const response = { status: 'complete' };
    expect(evaluateCondition("response.status == 'complete'", response)).toBe(true);
    expect(evaluateCondition("response.status == 'pending'", response)).toBe(false);
  });

  it('evaluates string inequality', () => {
    const response = { status: 'pending' };
    expect(evaluateCondition("response.status != 'complete'", response)).toBe(true);
    expect(evaluateCondition("response.status != 'pending'", response)).toBe(false);
  });

  it('evaluates boolean values', () => {
    const response = { ready: true, done: false };
    expect(evaluateCondition('response.ready == true', response)).toBe(true);
    expect(evaluateCondition('response.done == false', response)).toBe(true);
    expect(evaluateCondition('response.ready == false', response)).toBe(false);
  });

  it('evaluates numeric values', () => {
    const response = { count: 42, value: 0 };
    expect(evaluateCondition('response.count == 42', response)).toBe(true);
    expect(evaluateCondition('response.value == 0', response)).toBe(true);
    expect(evaluateCondition('response.count == 43', response)).toBe(false);
  });

  it('evaluates nested paths', () => {
    const response = { data: { job: { status: 'done' } } };
    expect(evaluateCondition("response.data.job.status == 'done'", response)).toBe(true);
  });

  it('evaluates null values', () => {
    const response = { error: null };
    expect(evaluateCondition('response.error == null', response)).toBe(true);
  });

  it('returns false for invalid conditions', () => {
    expect(evaluateCondition('invalid condition', {})).toBe(false);
  });
});

describe('getNestedValue', () => {
  it('extracts simple property', () => {
    expect(getNestedValue({ name: 'test' }, 'name')).toBe('test');
  });

  it('extracts deeply nested property', () => {
    const obj = { a: { b: { c: { d: 'value' } } } };
    expect(getNestedValue(obj, 'a.b.c.d')).toBe('value');
  });

  it('returns undefined for missing path', () => {
    expect(getNestedValue({ name: 'test' }, 'missing')).toBeUndefined();
  });

  it('handles null in path', () => {
    const obj = { data: null };
    expect(getNestedValue(obj, 'data.name')).toBeUndefined();
  });

  it('handles undefined in path', () => {
    const obj = { data: undefined };
    expect(getNestedValue(obj, 'data.name')).toBeUndefined();
  });

  it('extracts array element by index', () => {
    const obj = { items: ['a', 'b', 'c'] };
    expect(getNestedValue(obj, 'items.1')).toBe('b');
  });
});
