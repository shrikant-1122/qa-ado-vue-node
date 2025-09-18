// src/services/bugService.js
import axios from 'axios';

/**
 * Fetch all bugs by iteration path, filter by QA name.
 * @param {string} orgName  - Azure DevOps org name (no https://dev.azure.com)
 * @param {string} project  - Project name
 * @param {string} patToken - Personal Access Token (Work Items Read)
 * @param {string} iterationPath - e.g. "Cloud Platform\\Sprint 15"
 * @param {string} qaName - e.g. "Shrikant Damahe"
 */
export async function getBugsByIterationAndQA(
  orgName,
  project,
  patToken,
  iterationPath,
  qaName
) {
  if (!orgName || !project || !patToken) {
    throw new Error(
      `Missing env vars: orgName=${orgName} project=${project} patToken=${patToken ? 'set' : 'undefined'}`
    );
  }

  // build basic auth header
  const authHeader = {
    Authorization: `Basic ${Buffer.from(':' + patToken).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  // prepare WIQL query
  const wiqlQuery = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE
        [System.TeamProject] = @project
        AND [System.WorkItemType] = 'Bug'
        AND [System.IterationPath] = '${iterationPath}'
    `,
  };

  // 1. Get all bug IDs for that iteration
  const wiqlUrl = `https://dev.azure.com/${orgName}/${project}/_apis/wit/wiql?api-version=7.0`;
  console.log('[DEBUG] WIQL URL:', wiqlUrl);

  let wiqlRes;
  try {
    wiqlRes = await axios.post(wiqlUrl, wiqlQuery, { headers: authHeader });
  } catch (err) {
    console.error('[ERROR] WIQL request failed:', err.response?.status, err.response?.data);
    throw new Error(`WIQL request failed: ${err.response?.status} ${err.response?.statusText}`);
  }

  const ids = wiqlRes.data.workItems.map((wi) => wi.id);
  if (ids.length === 0) {
    console.log('[DEBUG] No bugs found for iteration path', iterationPath);
    return [];
  }

  // 2. Get details of all bugs
  const fields = [
    'System.Id',
    'System.Title',
    'Microsoft.VSTS.Common.Severity',
    'Microsoft.VSTS.Common.Priority',
    'Custom.TargetedRelease',
    'Custom.AssignQA',
  ];

  // workitemsbatch endpoint is at org root, not project
  const workItemsUrl = `https://dev.azure.com/${orgName}/_apis/wit/workitemsbatch?api-version=7.0`;
  console.log('[DEBUG] WorkItems URL:', workItemsUrl);

  const workItemsBody = { ids, fields };

  let workItemsRes;
  try {
    workItemsRes = await axios.post(workItemsUrl, workItemsBody, {
      headers: authHeader,
    });
  } catch (err) {
    console.error('[ERROR] WorkItems request failed:', err.response?.status, err.response?.data);
    throw new Error(`WorkItems request failed: ${err.response?.status} ${err.response?.statusText}`);
  }

  // 3. Filter by QA and return simplified data
  const bugs = workItemsRes.data.value
    .filter((wi) => {
      const assignedQA = wi.fields['Custom.AssignQA'];
      return (
        assignedQA &&
        assignedQA.toString().toLowerCase() === qaName.toString().toLowerCase()
      );
    })
    .map((wi) => ({
      id: wi.id,
      title: wi.fields['System.Title'],
      severity: wi.fields['Microsoft.VSTS.Common.Severity'],
      priority: wi.fields['Microsoft.VSTS.Common.Priority'],
      targetedRelease: wi.fields['Custom.TargetedRelease'],
      assignQA: wi.fields['Custom.AssignQA'],
    }));

  return bugs;
}
