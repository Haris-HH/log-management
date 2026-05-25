import { describe, it, expect, vi } from 'vitest';
import { useStatusOptions } from '../hooks/useStatusOptions';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useStatusOptions Hook', () => {
  it('should return an array of status options', () => {
    const options = useStatusOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options).toHaveLength(4);
  });

  it('should have correct status structure', () => {
    const options = useStatusOptions();
    options.forEach((option) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('key');
      expect(option).toHaveProperty('name');
      expect(option).toHaveProperty('color');
      expect(typeof option.id).toBe('number');
      expect(typeof option.key).toBe('string');
      expect(typeof option.name).toBe('string');
      expect(typeof option.color).toBe('string');
    });
  });

  it('should have correct status keys', () => {
    const options = useStatusOptions();
    const keys = options.map((option) => option.key);
    expect(keys).toEqual(['disable', 'network', 'device', 'normal']);
  });

  it('should have unique IDs', () => {
    const options = useStatusOptions();
    const ids = options.map((option) => option.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have color CSS variables', () => {
    const options = useStatusOptions();
    options.forEach((option) => {
      expect(option.color).toMatch(/^var\(--/);
    });
  });
});
