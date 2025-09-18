// controllers/bugController.js
import { getBugsByIterationAndQA } from '../lib/workitem.js';

export async function getBugs(req, res) {
  try {
    const { iterationPath, qaName } = req.query;

    // Org / project / token can come from env
    const orgName = process.env.ADO_ORG_NAME;
    const project = process.env.ADO_DEFAULT_PROJECT;
    const patToken = process.env.ADO_PAT;

    const bugs = await getBugsByIterationAndQA(orgName, project, patToken, iterationPath, qaName);
    res.json(bugs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
}
