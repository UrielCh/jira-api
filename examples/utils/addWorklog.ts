import type { AtlassianV3 } from "../../api-atlassianV3.ts";
import type { Worklog } from "../../mod.ts";

export const addWorklog = async (
  client: AtlassianV3["api"][3],
  issue: Worklog,
) => {
  if (!issue.id) {
    throw new Error("Issue id is required");
  }
  await client.issue.$(issue.id).worklog.$post({
    comment: issue.comment,
    timeSpentSeconds: issue.timeSpentSeconds,
  });
};
