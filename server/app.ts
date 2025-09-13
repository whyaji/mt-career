import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import env from './lib/env';
import { SECURITY_CONFIG } from './lib/security';
import { rateLimiter } from './middleware/rateLimiter';
import { securityMiddleware } from './middleware/security';
import { batchRoute } from './routes/batchRoute';
import { formRoute } from './routes/formRoute';
import { verficationRoute } from './routes/verificationRoute';

const app = new Hono();

// Security headers
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: SECURITY_CONFIG.CSP,
    crossOriginEmbedderPolicy: false,
  })
);

app.use('*', logger());

// CORS configuration
app.use(
  '*',
  cors({
    origin: env.FE_URL,
    credentials: true,
  })
);

// Rate limiting for form submissions
app.use('/api/v1/form/*', rateLimiter(SECURITY_CONFIG.FORM_RATE_LIMIT));

// General rate limiting for all API routes
app.use('/api/*', rateLimiter(SECURITY_CONFIG.API_RATE_LIMIT));

// Security middleware
app.use('/api/*', securityMiddleware);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiRoutes = app
  .basePath('/api/v1')
  .route('/verification', verficationRoute)
  .route('/batch', batchRoute)
  .route('/form', formRoute);

// Serve files from public directory
app.get('/uploads/*', serveStatic({ root: './server/public' }));

// Serve static files from the built frontend
app.get('*', serveStatic({ root: './frontend/dist' }));

// Fallback to index.html for client-side routing
app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

export default app;
export type ApiRoutes = typeof apiRoutes;
