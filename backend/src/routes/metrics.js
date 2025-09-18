import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/metrics/bugs_by_severity:
 *   get:
 *     summary: Get count of open bugs by severity
 *     tags: [Metrics]
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Azure DevOps project name (defaults to ADO_DEFAULT_PROJECT)
 *     responses:
 *       200:
 *         description: Bug counts grouped by severity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: string
 *                 counts:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       400:
 *         description: Missing project name
 *       401:
 *         description: Unauthorized - Invalid ADO credentials
 *       500:
 *         description: Server error
 */
router.get('/bugs_by_severity', async (req, res, next) => {
  try {
    const project = req.query.project || process.env.ADO_DEFAULT_PROJECT;
    if (!project) return res.status(400).json({ error: 'Missing project' });

    const { default: axios } = await import('axios');

    const API = '7.1'; // drop -preview.1
    const orgUrl = process.env.ADO_ORG_URL;
    if (!orgUrl) throw new Error('Missing ADO_ORG_URL environment variable');
    
    const pat = process.env.ADO_PAT;
    if (!pat) throw new Error('Missing ADO_PAT environment variable');
    
    const auth = Buffer.from(':' + pat).toString('base64');
    
    // Extract org name from URL
    const org = orgUrl.split('/').pop();

    const severityField = process.env.ADO_FIELD_SEVERITY || 'Microsoft.VSTS.Common.Severity';
    const BATCH_SIZE = 200;

    // Build WIQL: open bugs in this projectv
    const wiql = `
      SELECT [System.Id]
      FROM workitems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] = 'Bug'
        AND [System.State] NOT IN ('Closed','Done','Resolved','Removed')
    `;

    // 1) Run WIQL to get all IDs
    const wiqlUrl = `https://dev.azure.com/${org}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=${API}`;
    const { data: wiqlData } = await axios.post(
      wiqlUrl,
      { query: wiql },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const ids = wiqlData.workItems?.map(w => w.id) || [];
    if (ids.length === 0) return res.json({ project, counts: {} });

    // 2) Fetch fields in batches of 200 (and include {project} to avoid 404)
    const batchUrl = `https://dev.azure.com/${org}/${encodeURIComponent(project)}/_apis/wit/workitemsbatch?api-version=${API}`;

    let items = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const slice = ids.slice(i, i + BATCH_SIZE);
      const { data: batch } = await axios.post(
        batchUrl,
        {
          ids: slice,
          fields: [severityField],
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );
      items = items.concat(batch.value || []);
    }

    // 3) Count by severity
    const counts = {};
    for (const it of items) {
      const s = it.fields?.[severityField] || 'Unspecified';
      counts[s] = (counts[s] || 0) + 1;
    }

    res.json({ project, counts });
  } catch (e) {
    console.error('Error in bugs_by_severity:', e.message);
    if (e.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized - Check your ADO credentials' });
    }
    if (e.response?.status === 404) {
      return res.status(404).json({ error: 'Project not found or no access' });
    }
    next(e);
  }
});


export default router;
