import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import metricsRouter from './routes/metrics.js';
import bugsRouter from './routes/workitemroute.js';
import pbiRouter from './routes/workItemRoutPBI.js';
import testPlanRoutes from './routes/testPlanRoutes.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

// ----------------------
// Swagger setup
// ----------------------
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'QA ADO API',
    version: '1.0.0',
    description: 'API documentation for QA ADO Vue Node project',
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 5050}/api` },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  // IMPORTANT: path must match where your route files are located
   apis: ['./src/routes/*.js'] 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------
// Middleware
// ----------------------
const origin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin, credentials: true }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ----------------------
// Routers
// ----------------------
app.use('/api/metrics', metricsRouter);
app.use('/api', bugsRouter);
app.use('/api', pbiRouter);
app.use('/api', testPlanRoutes); // final route: /api/test-plans/:planId/tree

// ----------------------
// Start server
// ----------------------
const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
});
