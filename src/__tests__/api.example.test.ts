import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API Client Testing Examples', () => {
  describe('Fetch Client', () => {
    beforeEach(() => {
      // Reset mocks before each test
      vi.clearAllMocks();
    });

    it('should make a GET request', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch as any;

      const response = await fetch('http://api.example.com/data');
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('http://api.example.com/data');
      expect(data).toEqual({ data: 'test' });
    });

    it('should make a POST request with body', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'test' }),
      });
      global.fetch = mockFetch as any;

      const response = await fetch('http://api.example.com/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/data',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(data).toEqual({ id: 1, name: 'test' });
    });

    it('should handle API errors', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      global.fetch = mockFetch as any;

      const response = await fetch('http://api.example.com/notfound');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle network errors', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(
        new Error('Network error')
      );
      global.fetch = mockFetch as any;

      await expect(fetch('http://api.example.com/data')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Request with Query Parameters', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle query parameters', () => {
      const params = { page: '1', limit: '10' };
      const queryString = new URLSearchParams(params).toString();
      const url = `http://api.example.com/data?${queryString}`;

      expect(url).toBe('http://api.example.com/data?page=1&limit=10');
    });

    it('should handle optional query parameters', () => {
      const params: Record<string, string> = { page: '1' };
      const queryString = new URLSearchParams(params).toString();
      const url = `http://api.example.com/data?${queryString}`;

      expect(url).toContain('page=1');
    });
  });
});
