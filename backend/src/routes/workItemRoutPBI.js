// workItemRoutPBI.js - Product Backlog Item routes
import { Router } from 'express';
import { getPbis , getTasks } from '../controller/workitemcontrollerPBI.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Product Backlog Items
 *     description: API endpoints for managing Product Backlog Items
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PBI:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The work item ID
 *         title:
 *           type: string
 *           description: Title of the PBI
 *         state:
 *           type: string
 *           description: Current state of the PBI
 *         assignedTo:
 *           type: string
 *           description: Person assigned to the PBI
 *         iterationPath:
 *           type: string
 *           description: Sprint/iteration the PBI belongs to
 *         storyPoints:
 *           type: number
 *           description: Story points assigned to the PBI
 *         priority:
 *           type: integer
 *           description: Priority of the PBI
 */

/**
 * @swagger
 * /api/pbi:
 *   get:
 *     summary: Get Product Backlog Items filtered by iteration path and QA
 *     tags: [Product Backlog Items]
 *     description: Retrieves a list of Product Backlog Items (PBIs) filtered by iteration path and QA name
 *     parameters:
 *       - in: query
 *         name: iterationPath
 *         schema:
 *           type: string
 *         required: true
 *         description: Full iteration path (e.g. "Project\Release\Sprint 1")
 *         example: "2025\\Aug Sprint 1"
 *       - in: query
 *         name: qaName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the QA to filter the PBIs
 *         example: "John Doe"
 *     responses:
 *       200:
 *         description: List of Product Backlog Items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 iterationPath:
 *                   type: string
 *                 qaName:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PBI'
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid ADO credentials
 *       404:
 *         description: No PBIs found for the given criteria
 *       500:
 *         description: Internal server error
 */
router.get('/api/pbi', getPbis);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get Tasks filtered by iteration path and QA
 *     tags: [Product Backlog Items]
 *     description: Retrieves a list of Tasks filtered by iteration path and QA name
 *     parameters:
 *       - in: query
 *         name: iterationPath
 *         schema:
 *           type: string
 *         required: true
 *         description: Full iteration path (e.g. "Project\Release\Sprint 1")
 *         example: "2025\\Aug Sprint 1"
 *       - in: query
 *         name: qaName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the QA to filter the Tasks
 *         example: "John Doe"
 *     responses:
 *       200:
 *         description: List of Tasks
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
 *                   state:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                   iterationPath:
 *                     type: string
 *                   storyPoints:
 *                     type: number
 *                   priority:
 *                     type: integer
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid ADO credentials
 *       404:
 *         description: No Tasks found for the given criteria
 *       500:
 *         description: Internal server error
 */
router.get('/api/tasks', getTasks);

export default router;
