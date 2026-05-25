import { describe, it, expect } from 'vitest';
import {
  isValidLatitude,
  isValidLongitude,
  parseCoordinates,
  parseCoordinatesWith2Param,
} from '../utils/coordinates';

describe('Coordinates Utilities', () => {
  describe('isValidLatitude', () => {
    it('should return true for valid latitude values', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(45)).toBe(true);
      expect(isValidLatitude(-45)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
    });

    it('should return false for invalid latitude values', () => {
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude(NaN)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should return true for valid longitude values', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(90)).toBe(true);
      expect(isValidLongitude(-90)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
    });

    it('should return false for invalid longitude values', () => {
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
      expect(isValidLongitude(NaN)).toBe(false);
    });
  });

  describe('parseCoordinates', () => {
    it('should parse valid coordinate strings', () => {
      const result = parseCoordinates('45.5, 120.5');
      expect(result).toEqual({ lat: 45.5, lng: 120.5 });
    });

    it('should handle different spacing formats', () => {
      const result = parseCoordinates('45.5,120.5');
      expect(result).toEqual({ lat: 45.5, lng: 120.5 });
    });

    it('should return null for invalid coordinate strings', () => {
      expect(parseCoordinates('invalid')).toBeNull();
      expect(parseCoordinates('45.5, 200')).toBeNull(); // Invalid longitude
      expect(parseCoordinates('100, 120.5')).toBeNull(); // Invalid latitude
    });

    it('should handle boundary values', () => {
      const result = parseCoordinates('90, 180');
      expect(result).toEqual({ lat: 90, lng: 180 });
    });
  });

  describe('parseCoordinatesWith2Param', () => {
    it('should parse valid latitude and longitude parameters', () => {
      const result = parseCoordinatesWith2Param('45.5', '120.5');
      expect(result).toEqual({ lat: 45.5, lng: 120.5 });
    });

    it('should return null for invalid parameters', () => {
      expect(parseCoordinatesWith2Param('invalid', '120.5')).toBeNull();
      expect(parseCoordinatesWith2Param('45.5', 'invalid')).toBeNull();
      expect(parseCoordinatesWith2Param('100', '120.5')).toBeNull();
    });

    it('should handle boundary values', () => {
      const result = parseCoordinatesWith2Param('90', '180');
      expect(result).toEqual({ lat: 90, lng: 180 });
    });
  });
});
