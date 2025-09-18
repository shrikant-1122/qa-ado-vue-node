// src/routes/bugs.js
import { Router } from 'express';
import { getBugs } from '../controller/workitemController.js';

const router = Router();

/**
 * @swagger
 * /bugs:
 *   get:
 *     summary: Get bugs by iteration path and QA name
 *     description: Fetches bugs from Azure DevOps filtered by iteration path and Custom.AssignQA field.
 *     parameters:
 *       - in: query
 *         name: iterationPath
 *         required: true
 *         schema:
 *           type: string
 *         description: The iteration path (e.g., Cloud Platform\Sprint 15)
 *       - in: query
 *         name: qaName
 *         required: true
 *         schema:
 *           type: string
 *         description: The QA name to filter by
 *     responses:
 *       200:
 *         description: A list of bugs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   severity:
 *                     type: string
 *                   priority:
 *                     type: integer
 *                   targetedRelease:
 *                     type: string
 *                   assignQA:
 *                     type: string
 */
router.get('/bugs', getBugs);

export default router;
