import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Testing Patterns and Best Practices
 * 
 * This file demonstrates common testing patterns used in the project
 */

describe('Testing Patterns & Best Practices', () => {
  describe('Setup and Teardown', () => {
    let testValue: number;

    beforeEach(() => {
      // Runs before each test - set up initial state
      testValue = 0;
    });

    it('should start with fresh state', () => {
      expect(testValue).toBe(0);
      testValue = 5;
      expect(testValue).toBe(5);
    });

    it('should reset between tests', () => {
      // testValue is reset to 0 again
      expect(testValue).toBe(0);
    });
  });

  describe('Assertion Patterns', () => {
    it('should test for equality', () => {
      expect(1).toBe(1);
      expect('hello').toBe('hello');
      expect(true).toBe(true);
    });

    it('should test for object equality', () => {
      expect({ name: 'John' }).toEqual({ name: 'John' });
      expect([1, 2, 3]).toEqual([1, 2, 3]);
    });

    it('should test for truthiness', () => {
      expect(true).toBeTruthy();
      expect(false).toBeFalsy();
      expect('').toBeFalsy();
      expect('hello').toBeTruthy();
    });

    it('should test for nullish values', () => {
      expect(null).toBeNull();
      expect(undefined).toBeUndefined();
      expect(1).toBeDefined();
    });

    it('should test arrays', () => {
      const array = [1, 2, 3];
      expect(array).toContain(2);
      expect(array).toHaveLength(3);
    });

    it('should test strings', () => {
      const message = 'Hello World';
      expect(message).toMatch(/world/i);
      expect(message).toContain('Hello');
    });
  });

  describe('Number and String Testing', () => {
    it('should test numeric comparisons', () => {
      expect(5).toBeGreaterThan(3);
      expect(3).toBeLessThan(5);
      expect(5).toBeGreaterThanOrEqual(5);
      expect(5).toBeLessThanOrEqual(5);
    });

    it('should test floating point numbers', () => {
      const result = 0.1 + 0.2;
      expect(result).toBeCloseTo(0.3);
    });
  });

  describe('Exception Testing', () => {
    const throwError = () => {
      throw new Error('Something went wrong');
    };

    it('should test for thrown errors', () => {
      expect(() => throwError()).toThrow();
      expect(() => throwError()).toThrow('Something went wrong');
    });

    it('should test async errors', async () => {
      await expect(
        Promise.reject(new Error('Async error'))
      ).rejects.toThrow('Async error');
    });
  });

  describe('Async Testing', () => {
    it('should handle async operations', async () => {
      const promise = Promise.resolve(42);
      const result = await promise;
      expect(result).toBe(42);
    });

    it('should test async operations with then', () => {
      return Promise.resolve(123).then((result) => {
        expect(result).toBe(123);
      });
    });
  });
});
