// services/pbiService.js
import axios from 'axios';

/**
 * Fetch Product Backlog Items by iteration path, filter by QA name.
 * @param {string} orgName  - Azure DevOps org name
 * @param {string} project  - Project name
 * @param {string} patToken - Personal Access Token
 * @param {string} iterationPath - e.g. "2025\\Aug Sprint 1"
 * @param {string} qaName - e.g. "Shrikant Damahe"
 */
export async function getPbisByIterationAndQA(orgName, project, patToken, iterationPath, qaName) {
  // 1. WIQL to get IDs of PBIs
  const wiqlQuery = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE
        [System.TeamProject] = @project
        AND [System.WorkItemType] = 'Product Backlog Item'
        AND [System.IterationPath] = '${iterationPath}'
    `,
  };

  const authHeader = {
    Authorization: `Basic ${Buffer.from(`:${patToken}`).toString('base64')}`,
  };

  const wiqlUrl = `https://dev.azure.com/${orgName}/${project}/_apis/wit/wiql?api-version=7.0`;
  const wiqlRes = await axios.post(wiqlUrl, wiqlQuery, { headers: authHeader });

  const ids = wiqlRes.data.workItems.map((wi) => wi.id);
  if (ids.length === 0) return [];

  // 2. Batch get work items details (max 200 per batch)
  const fields =
    'System.Id,System.Title,Microsoft.VSTS.Common.Priority,Custom.TargetedRelease,Custom.AssignQA';
  const workItemsUrl = `https://dev.azure.com/${orgName}/_apis/wit/workitemsbatch?api-version=7.0`;

  const chunkSize = 200;
  const batches = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const batchIds = ids.slice(i, i + chunkSize);

    const workItemsBody = {
      ids: batchIds,
      fields: fields.split(','),
    };

    batches.push(
      axios.post(workItemsUrl, workItemsBody, { headers: authHeader }).then((res) => res.data.value)
    );
  }

  const allWorkItems = (await Promise.all(batches)).flat();

  // 3. Filter by QA and map fields
  const pbis = allWorkItems
    .filter((wi) => wi.fields['Custom.AssignQA']?.toLowerCase() === qaName.toLowerCase())
    .map((wi) => ({
      id: wi.id,
      title: wi.fields['System.Title'],
      priority: wi.fields['Microsoft.VSTS.Common.Priority'],
      targetedRelease: wi.fields['Custom.TargetedRelease'],
      assignQA: wi.fields['Custom.AssignQA'],
    }));

  return pbis;
}

export async function getTasksByIterationAndQA(
  orgName,
  project,
  patToken,
  iterationPath,
  qaName
) {
    console.log(iterationPath)
  const apiVersion = "7.0";
  const authHeader = {
    Authorization: `Basic ${Buffer.from(`:${patToken}`).toString("base64")}`,
  };

  // 1. WIQL to get Task IDs
  const wiqlQuery = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE
        [System.TeamProject] = @project
        AND [System.WorkItemType] = 'Task'
        AND [System.IterationPath] = '${iterationPath}'
    `,
  };

  const wiqlUrl = `https://dev.azure.com/${orgName}/${encodeURIComponent(
    project
  )}/_apis/wit/wiql?api-version=${apiVersion}`;
  const wiqlRes = await axios.post(wiqlUrl, wiqlQuery, { headers: authHeader });

  const ids = wiqlRes.data.workItems.map((wi) => wi.id);
  if (!ids.length) return [];

  // 2. Batch get work items details
  const fields = [
    "System.Id",
    "System.Title",
    "System.AssignedTo",
    "Microsoft.VSTS.Scheduling.CompletedWork",
    "Microsoft.VSTS.Scheduling.RemainingWork",
    // add any other fields you want
  ];
  const workItemsUrl = `https://dev.azure.com/${orgName}/${encodeURIComponent(
    project
  )}/_apis/wit/workitemsbatch?api-version=${apiVersion}`;

  const chunkSize = 200;
  const batches = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const batchIds = ids.slice(i, i + chunkSize);
    const workItemsBody = { ids: batchIds, fields };
    batches.push(
      axios
        .post(workItemsUrl, workItemsBody, { headers: authHeader })
        .then((res) => res.data.value)
    );
  }

  const allWorkItems = (await Promise.all(batches)).flat();

  // 3. Filter by QA name and map fields
  const tasks = allWorkItems
    .filter((wi) => {
      const assignedTo = wi.fields["System.AssignedTo"];
      if (!assignedTo) return false;
      const name = (assignedTo.displayName || assignedTo.uniqueName || "").toLowerCase();
      return name === qaName.toLowerCase();
    })
    .map((wi) => {
      const assignedTo = wi.fields["System.AssignedTo"];
      return {
        id: wi.id,
        title: wi.fields["System.Title"],
        assignQA: assignedTo?.displayName || assignedTo?.uniqueName || null,
        completedWork: wi.fields["Microsoft.VSTS.Scheduling.CompletedWork"] ?? 0,
        remainingWork: wi.fields["Microsoft.VSTS.Scheduling.RemainingWork"] ?? 0,
      };
    });

  return tasks;
}
