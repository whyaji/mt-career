import type { Context, Next } from 'hono';

import { logger } from '../lib/logger';
import { isBlockedUserAgent, isSuspiciousIP } from '../lib/security';

export const securityMiddleware = async (c: Context, next: Next) => {
  const userAgent = c.req.header('user-agent') || '';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  if (isBlockedUserAgent(userAgent)) {
    logger.warn(`Blocked suspicious user agent: ${userAgent} from IP: ${ip}`);
    return c.json({ error: 'Access denied, suspicious user agent' }, 403);
  }

  // Check for suspicious IPs
  if (isSuspiciousIP(ip)) {
    logger.warn(`Blocked suspicious IP: ${ip}`);
    return c.json({ error: 'Access denied, suspicious IP' }, 403);
  }

  // Check for missing or suspicious headers
  const acceptHeader = c.req.header('accept');
  if (!acceptHeader || !acceptHeader.includes('application/json')) {
    logger.warn(`Suspicious request without proper Accept header from IP: ${ip}`);
    return c.json({ error: 'Access denied, suspicious Accept header' }, 403);
  }

  // why accept header is not text/html?

  await next();
};
