import { describe, it, expect } from 'vitest';
import { errorMessage } from '../../src/utils/errors';

describe('errorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('stringifies non-Error values', () => {
    expect(errorMessage('plain string')).toBe('plain string');
    expect(errorMessage(404)).toBe('404');
    expect(errorMessage(null)).toBe('null');
  });
});
