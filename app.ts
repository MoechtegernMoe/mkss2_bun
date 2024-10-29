import { router as robotRouter } from './src/api/robotRoutes';
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { swaggerDocs } from './src/config/swaggerConfig';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { logger } from 'hono/logger';

export const app = new Hono({ strict: true });
app.use(trimTrailingSlash());
app.use(logger());

app.route('/robot', robotRouter);

app.get('/api-docs', swaggerUI({ url: '/api.json' }));
app.get('/api.json', (c) => c.json(swaggerDocs));
