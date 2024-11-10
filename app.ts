import { router as robotRouter } from './src/api/robotRoutes';
import { swaggerUI } from '@hono/swagger-ui';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { logger } from 'hono/logger';
import { OpenAPIHono } from '@hono/zod-openapi';

export const app = new OpenAPIHono({ strict: true });
app.use(trimTrailingSlash());
app.use(logger());

app.route('/robot', robotRouter);

app.get('/api-docs', swaggerUI({ url: '/api.json' }));

app.doc('/api.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API'
  }
});
