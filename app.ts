import { router as robotRouter } from './src/api/robotRoutes';
import { Hono } from 'hono';

export const app = new Hono();

app.route('/robot', robotRouter);

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
