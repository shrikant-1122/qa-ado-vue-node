// controllers/pbiController.js
import { getPbisByIterationAndQA , getTasksByIterationAndQA } from '../lib/woritemPBI.js';

export async function getPbis(req, res) {
  try {
    const { iterationPath, qaName } = req.query;

    const orgName = process.env.ADO_ORG_NAME;
    const project = process.env.ADO_DEFAULT_PROJECT;
    const patToken = process.env.ADO_PAT;

    const pbis = await getPbisByIterationAndQA(orgName, project, patToken, iterationPath, qaName);
    res.json(pbis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch PBIs' });
  }
}

export async function getTasks(req, res) {
  try {
    const { iterationPath, qaName } = req.query;
    const orgName = process.env.ADO_ORG_NAME;
    const project = process.env.ADO_DEFAULT_PROJECT;
    const patToken = process.env.ADO_PAT;
    const tasks = await getTasksByIterationAndQA(orgName, project, patToken, iterationPath, qaName);
    res.json(tasks);
  }
    catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Tasks' });
  }
}
