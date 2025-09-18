import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /metrics/bugs_by_severity:
 */
router.get('/bugs_by_severity', async (req, res, next) => {
  try {
    const project = req.query.project || process.env.ADO_DEFAULT_PROJECT;
    if (!project) return res.status(400).json({ error: 'Missing project' });

    const { default: axios } = await import('axios');

    const API = '7.1'; // drop -preview.1
    const org = process.env.ADO_ORG_NAME;
    const pat = process.env.ADO_PAT;
    const auth = Buffer.from(':' + pat).toString('base64');

    const severityField = process.env.ADO_FIELD_SEVERITY || 'Microsoft.VSTS.Common.Severity';
    const BATCH_SIZE = 200;

    // Build WIQL: open bugs in this project
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
    next(e);
  }
});


export default router;
