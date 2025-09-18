// services/testPlanService.js
import axios from "axios";

/**
 * Fetch entire test plan tree (nested suites) with test cases and testers.
 */
export async function getPlanTreeService({
  planId,
  org,
  project,
  includeDetails,
  fields,
  roots,
}) {
  const API = "7.1-preview.1";
  const pat = process.env.ADO_PAT;
  if (!pat) throw new Error("Missing ADO_PAT in environment");
  const auth = Buffer.from(":" + pat).toString("base64");
  const encProject = encodeURIComponent(project);

  async function fetchSuites(parentSuiteId = null) {
    const base = `https://dev.azure.com/${org}/${encProject}/_apis/testplan/Plans/${planId}`;
    const url = parentSuiteId
      ? `${base}/suites/${parentSuiteId}/suites?api-version=${API}`
      : `${base}/suites?api-version=${API}`;

    const { data } = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    const suites = [];
    for (const suite of data.value || []) {
      // Optional: filter roots only at top-level
      if (!parentSuiteId && roots && roots.length && !roots.includes(suite.name)) {
        continue;
      }

      // Attach test cases + testers for this suite
      suite.testCases = await fetchTestCasesAndTesters(suite);

      // Recurse if has children
      if (suite.hasChildren) {
        suite.children = await fetchSuites(suite.id);
      } else {
        suite.children = [];
      }

      suites.push(suite);
    }
    return suites;
  }

  async function fetchTestCasesAndTesters(suite) {
    // --- test cases ---
    let testCases = [];
    if (suite._links?.testCases?.href) {
      const tcUrl = `${suite._links.testCases.href}?api-version=${API}`;
      try {
        const { data: casesData } = await axios.get(tcUrl, {
          headers: { Authorization: `Basic ${auth}` },
        });
        testCases = (casesData.value || []).map((tc) => ({
          id: tc.workItem?.id,
          name: tc.workItem?.name,
        }));
      } catch (err) {
        console.warn(`[WARN] Could not fetch test cases for suite ${suite.id}`, err.response?.status);
      }
    }

    // --- testers (test points) ---
    if (suite._links?.testPoints?.href && testCases.length) {
      const tpUrl = `${suite._links.testPoints.href}?api-version=${API}`;
      try {
        const { data: tpData } = await axios.get(tpUrl, {
          headers: { Authorization: `Basic ${auth}` },
        });
        const testerMap = {};
        for (const tp of tpData.value || []) {
          // testCaseReference.id matches tc id
          testerMap[tp.testCase?.id] = tp.assignedTo?.displayName || null;
        }
        // attach tester to test case
        testCases = testCases.map((tc) => ({
          ...tc,
          tester: testerMap[tc.id] || null,
        }));
      } catch (err) {
        console.warn(`[WARN] Could not fetch test points for suite ${suite.id}`, err.response?.status);
      }
    }

    // optional fields enrichment
    if (includeDetails && fields && fields.length && testCases.length) {
      const BATCH_SIZE = 200;
      const batchUrl = `https://dev.azure.com/${org}/${encProject}/_apis/wit/workitemsbatch?api-version=${API}`;
      const allIds = testCases.map((tc) => tc.id);
      let detailsMap = {};
      for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
        const slice = allIds.slice(i, i + BATCH_SIZE);
        const { data: batch } = await axios.post(
          batchUrl,
          { ids: slice, fields },
          { headers: { Authorization: `Basic ${auth}` } }
        );
        for (const item of batch.value || []) {
          detailsMap[item.id] = item.fields;
        }
      }
      testCases = testCases.map((tc) => ({
        ...tc,
        fields: detailsMap[tc.id] || {},
      }));
    }

    return testCases;
  }

  console.info("[INFO] Fetching suites recursively...");
  const suitesTree = await fetchSuites();
  return { planId, suites: suitesTree };
}
