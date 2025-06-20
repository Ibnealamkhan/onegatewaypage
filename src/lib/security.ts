// Security utilities and CSP implementation

// Content Security Policy
export const setupCSP = () => {
  if (typeof window === 'undefined') return;

  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  document.head.appendChild(cspMeta);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(cleanPhone);
};

// Rate limiting for form submissions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 3, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remainingTime);
  }
}

export const formRateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute

// CSRF protection token
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure headers setup
export const setupSecurityHeaders = () => {
  if (typeof window === 'undefined') return;

  // Add security headers via meta tags
  const securityHeaders = [
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
  ];

  securityHeaders.forEach(header => {
    const meta = document.createElement('meta');
    meta.httpEquiv = header.name;
    meta.content = header.content;
    document.head.appendChild(meta);
  });
};