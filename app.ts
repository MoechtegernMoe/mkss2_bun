import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { swaggerDocs } from './src/config/swaggerConfig';

import { router as robotRouter } from './src/api/robotRoutes';

export const app = express();

app.use(express.json());

app.use('/robot', robotRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
