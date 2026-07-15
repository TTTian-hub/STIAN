interface RateLimitEntry {
  count: number;
  resetTime: number;
  pendingRequests: Set<string>; // Track pending request IDs
}

// Simple in-memory rate limiting store
// In production, use Redis or similar for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Track active/pending requests to prevent concurrent abuse
const activeRequests = new Map<string, number>(); // IP -> count of active requests

// Track follow-up counts per session (max 10 follow-ups per module)
const followUpStore = new Map<string, { count: number; resetTime: number }>();
const MAX_FOLLOW_UPS = 10;
const FOLLOW_UP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check and increment follow-up count for a session
 * Returns { allowed: boolean, remaining: number }
 */
export function checkFollowUpLimit(sessionId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = followUpStore.get(sessionId);

  if (!entry || now > entry.resetTime) {
    // New window or expired
    followUpStore.set(sessionId, { count: 1, resetTime: now + FOLLOW_UP_WINDOW_MS });
    return { allowed: true, remaining: MAX_FOLLOW_UPS - 1 };
  }

  if (entry.count >= MAX_FOLLOW_UPS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_FOLLOW_UPS - entry.count };
}

/**
 * Get follow-up count for a session
 */
export function getFollowUpCount(sessionId: string): number {
  const entry = followUpStore.get(sessionId);
  const now = Date.now();
  if (!entry || now > entry.resetTime) {
    return 0;
  }
  return entry.count;
}

interface RateLimitOptions {
  maxRequests?: number;      // Maximum requests allowed in window
  windowMs?: number;         // Time window in milliseconds
  maxConcurrent?: number;    // Maximum concurrent requests per IP
  minIntervalMs?: number;    // Minimum interval between requests from same IP
}

// Rate limit configuration
const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  maxRequests: 20,          // 20 requests per minute
  windowMs: 60 * 1000,      // per minute
  maxConcurrent: 2,         // 2 concurrent requests per IP
  minIntervalMs: 5000,      // Minimum 5 seconds between requests from same IP
};

// Global request tracking for min interval enforcement
const lastRequestTime = new Map<string, number>();

/**
 * Check if IP has too many concurrent requests
 */
function checkConcurrentLimit(identifier: string, maxConcurrent: number): boolean {
  const current = activeRequests.get(identifier) || 0;
  return current < maxConcurrent;
}

/**
 * Increment/decrement active request count
 */
export function trackActiveRequest(identifier: string, increment: boolean): void {
  const current = activeRequests.get(identifier) || 0;
  if (increment) {
    activeRequests.set(identifier, current + 1);
  } else {
    const newCount = Math.max(0, current - 1);
    if (newCount === 0) {
      activeRequests.delete(identifier);
    } else {
      activeRequests.set(identifier, newCount);
    }
  }
}

/**
 * Check minimum interval between requests
 */
function checkMinInterval(identifier: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const lastRequest = lastRequestTime.get(identifier);

  if (!lastRequest) {
    lastRequestTime.set(identifier, now);
    return true;
  }

  const elapsed = now - lastRequest;
  if (elapsed < minIntervalMs) {
    return false;
  }

  lastRequestTime.set(identifier, now);
  return true;
}

/**
 * Strict rate limiter with concurrent request protection
 * Prevents API abuse from single IP
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  reason?: 'concurrent' | 'interval' | 'rate';
  retryAfter?: number;
} {
  const { maxRequests, windowMs, maxConcurrent, minIntervalMs } = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();

  // Check 1: Concurrent request limit (prevent parallel API abuse)
  if (!checkConcurrentLimit(identifier, maxConcurrent)) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + 5000, // Retry after 5 seconds
      reason: 'concurrent',
      retryAfter: 5,
    };
  }

  // Check 2: Minimum interval between requests (prevent rapid-fire)
  if (!checkMinInterval(identifier, minIntervalMs)) {
    const lastRequest = lastRequestTime.get(identifier) || now;
    const elapsed = now - lastRequest;
    const retryAfter = Math.ceil((minIntervalMs - elapsed) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + retryAfter * 1000,
      reason: 'interval',
      retryAfter: Math.max(1, retryAfter),
    };
  }

  // Check 3: Rate limit per window
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
      pendingRequests: new Set(),
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      reason: 'rate',
      retryAfter: Math.max(1, retryAfter),
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier for server-side rendering
  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  maxRequests: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
}

/**
 * Create error response for rate limit
 */
export function createRateLimitErrorResponse(
  result: ReturnType<typeof checkRateLimit>
): Response {
  const messages: Record<string, string> = {
    concurrent: '同时只能进行一个AI解读，请等待当前请求完成',
    interval: '请求过于频繁，请稍后再试',
    rate: '已达到请求上限，请稍后再试',
  };

  const message = messages[result.reason || 'rate'];

  return Response.json(
    {
      error: message,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter || 60),
        ...createRateLimitHeaders(0, result.resetTime, 5),
      },
    }
  );
}
