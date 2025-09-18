import { getPlanTreeService } from "../lib/testPlanService.js";

export async function getPlanTree(req, res) {
  try {
    const { planId } = req.params;
    const { org, project, includeDetails = "false", fields = "", roots = "" } = req.query;

    if (!org || !project) {
      return res.status(400).json({ error: "org and project query parameters are required" });
    }

    // parse booleans / arrays
    const include = includeDetails === "true";
    const fieldsArr = fields ? fields.split(",").map(f => f.trim()) : [];
    const rootsArr = roots ? roots.split(",").map(r => r.trim()) : [];

    const result = await getPlanTreeService({
      planId,
      org,
      project,
      includeDetails: include,
      fields: fieldsArr,
      roots: rootsArr,
    });

    res.json(result);
  } catch (err) {
    console.error("Error in getPlanTree:", err.message);
    res.status(500).json({ error: err.message });
  }
}
