import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatNumber,
  buildOptions,
  loadFont,
  loadImageAsBase64,
} from '../utils/commonFunctions';

describe('Common Functions', () => {
  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(10000)).toBe('10,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1000000)).toBe('-1,000,000');
    });
  });

  describe('buildOptions', () => {
    const mockList = [
      { name: 'Option 1', code: 'OPT1' },
      { name: 'Option 2', code: 'OPT2' },
      { name: 'Option 3', code: 'OPT3' },
    ];

    it('should build options with default label when isAll is true', () => {
      const result = buildOptions(mockList, 'All Options', true);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        label: 'All Options',
        value: '0',
      });

      expect(result[1]).toEqual({
        label: 'Option 1',
        value: 'OPT1',
      });
    });

    it('should build options without default label when isAll is false', () => {
      const result = buildOptions(mockList, 'All Options', false);

      expect(result).toHaveLength(3);

      expect(result[0]).toEqual({
        label: 'Option 1',
        value: 'OPT1',
      });
    });

    it('should handle empty list', () => {
      const result = buildOptions([], 'All', true);

      expect(result).toHaveLength(1);

      expect(result[0]).toEqual({
        label: 'All',
        value: '0',
      });
    });

    it('should use isAll=true as default', () => {
      const result = buildOptions(mockList, 'All');

      expect(result[0]).toEqual({
        label: 'All',
        value: '0',
      });
    });
  });

  describe('loadFont', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should load font and return base64 string', async () => {
      const mockBuffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;

      vi.mocked(fetch).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer),
      } as any);

      const result = await loadFont('/fonts/test.ttf');

      expect(fetch).toHaveBeenCalledWith('/fonts/test.ttf');
      expect(result).toBe(btoa('Hello'));
    });
  });

  describe('loadImageAsBase64', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return base64 image when fetch succeeds', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      } as any);

      class MockFileReader {
        result: string | ArrayBuffer | null =
          'data:image/png;base64,MOCK_BASE64';

        onloadend: (() => void) | null = null;
        onerror: (() => void) | null = null;

        readAsDataURL() {
          if (this.onloadend) {
            this.onloadend();
          }
        }
      }

      vi.stubGlobal('FileReader', MockFileReader);

      const result = await loadImageAsBase64('/test.png');

      expect(result).toBe('data:image/png;base64,MOCK_BASE64');
    });

    it('should return fallback image when fetch fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network Error'));

      const result = await loadImageAsBase64('/invalid.png');

      expect(result).toContain('data:image/png;base64');
    });

    it('should return fallback image when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as any);

      const result = await loadImageAsBase64('/404.png');

      expect(result).toContain('data:image/png;base64');
    });

    it('should return fallback image when FileReader fails', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      } as any);

      const mockReadAsDataURL = vi.fn(function (this: any) {
        setTimeout(() => {
          this.onerror?.(new ProgressEvent('error'));
        }, 0);
      });

      class MockFileReader {
        result: string | ArrayBuffer | null = null;
        onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsDataURL = mockReadAsDataURL;
      }

      vi.stubGlobal('FileReader', MockFileReader);

      const result = await loadImageAsBase64('/broken.png');

      expect(mockReadAsDataURL).toHaveBeenCalled();
      expect(result).toContain('data:image/png;base64');
    });

    it('should return fallback image when FileReader result is null', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      } as any);

      class MockFileReader {
        result: string | ArrayBuffer | null = null;

        onloadend: (() => void) | null = null;
        onerror: (() => void) | null = null;

        readAsDataURL() {
          setTimeout(() => {
            this.onloadend?.();
          }, 0);
        }
      }

      vi.stubGlobal('FileReader', MockFileReader);

      const result = await loadImageAsBase64('/null-result.png');

      expect(result).toContain('data:image/png;base64');
    });
  });
});