import type { Context, Next } from 'hono';

import { logger } from '../lib/logger';

// Simple in-memory rate limiter
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export const rateLimiter = (config: RateLimitConfig) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${c.req.path}`;

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      await next();
      return;
    }

    if (current.count >= config.max) {
      logger.warn(`Rate limit exceeded for IP: ${ip} on path: ${c.req.path}`);
      return c.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        },
        429
      );
    }

    // Increment counter
    current.count++;
    rateLimitStore.set(key, current);

    await next();
  };
};

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
