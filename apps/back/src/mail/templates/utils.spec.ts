import { escapeHtml, sanitizeUrl } from './utils';

describe('Email Template Utils', () => {
  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape less than sign', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape greater than sign', () => {
      expect(escapeHtml('5 > 3')).toBe('5 &gt; 3');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's working")).toBe('It&#039;s working');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
      );
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should return empty string for null input', () => {
      expect(escapeHtml(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should return empty string for number input', () => {
      expect(escapeHtml(123)).toBe('');
    });

    it('should return empty string for object input', () => {
      expect(escapeHtml({ key: 'value' })).toBe('');
    });

    it('should return empty string for array input', () => {
      expect(escapeHtml(['a', 'b'])).toBe('');
    });

    it('should handle unicode characters', () => {
      expect(escapeHtml('Café résumé 日本語')).toBe('Café résumé 日本語');
    });

    it('should handle newlines and tabs', () => {
      expect(escapeHtml('Line1\nLine2\tTabbed')).toBe('Line1\nLine2\tTabbed');
    });

    it('should escape complex HTML injection attempt', () => {
      const maliciousInput = '"><img src=x onerror=alert(1)>';
      expect(escapeHtml(maliciousInput)).toBe('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow URLs with paths', () => {
      expect(sanitizeUrl('https://example.com/path/to/page')).toBe(
        'https://example.com/path/to/page',
      );
    });

    it('should allow URLs with query parameters', () => {
      expect(sanitizeUrl('https://example.com?token=abc123')).toBe(
        'https://example.com?token=abc123',
      );
    });

    it('should allow URLs with fragments', () => {
      expect(sanitizeUrl('https://example.com#section')).toBe('https://example.com#section');
    });

    it('should allow URLs with ports', () => {
      expect(sanitizeUrl('http://localhost:3000/verify')).toBe('http://localhost:3000/verify');
    });

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    });

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('#');
    });

    it('should block file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    it('should block ftp: protocol', () => {
      expect(sanitizeUrl('ftp://files.example.com')).toBe('#');
    });

    it('should return # for invalid URL', () => {
      expect(sanitizeUrl('not-a-valid-url')).toBe('#');
    });

    it('should return # for empty string', () => {
      expect(sanitizeUrl('')).toBe('#');
    });

    it('should return # for malformed URL', () => {
      expect(sanitizeUrl('://missing-protocol.com')).toBe('#');
    });

    it('should handle URL with special characters in path', () => {
      expect(sanitizeUrl('https://example.com/path%20with%20spaces')).toBe(
        'https://example.com/path%20with%20spaces',
      );
    });

    it('should handle URL with authentication', () => {
      expect(sanitizeUrl('https://user:pass@example.com')).toBe('https://user:pass@example.com');
    });

    it('should handle localhost URLs', () => {
      expect(sanitizeUrl('http://localhost')).toBe('http://localhost');
      expect(sanitizeUrl('http://127.0.0.1')).toBe('http://127.0.0.1');
    });

    it('should handle complex verification URL', () => {
      const url = 'https://app.shipit.com/verify-email?token=abc123def456&redirect=/dashboard';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should block javascript with case variations', () => {
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('#');
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#');
    });
  });
});
