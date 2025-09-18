import { Router } from "express";
import { getPlanTree } from "../controller/testPlanController.js";

const router = Router();

/**
 * @swagger
 * /test-plans/{planId}/tree:
 *   get:
 *     summary: Get the suite tree of a test plan
 *     tags: [TestPlans]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the test plan
 *       - in: query
 *         name: org
 *         required: true
 *         schema:
 *           type: string
 *         description: Azure DevOps organization name
 *       - in: query
 *         name: project
 *         required: true
 *         schema:
 *           type: string
 *         description: Azure DevOps project name
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *         description: If true, enrich test cases with additional fields
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of work item fields to include when includeDetails=true
 *       - in: query
 *         name: roots
 *         schema:
 *           type: string
 *         description: Comma-separated root suite names to filter
 *     responses:
 *       200:
 *         description: Test plan suite tree with optional test case details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 planId:
 *                   type: integer
 *                 suites:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Invalid ADO credentials
 *       404:
 *         description: Test plan not found
 *       500:
 *         description: Server error
 */
router.get("/test-plans/:planId/tree", getPlanTree);

export default router;
