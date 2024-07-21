import type { AtlassianV3, Worklog } from "@u4/jira";

export const addWorklog = async (
  client: AtlassianV3["api"][3],
  issue: Worklog,
) => {
  if (!issue.id) {
    throw new Error("Issue id is required");
  }
  console.log(`Adding commet:`,  issue.comment);
  console.log(`Adding timeSpentSeconds:`,  issue.timeSpentSeconds);

  await client.issue.$(issue.id).worklog.$post({
    comment: issue.comment,
    timeSpentSeconds: issue.timeSpentSeconds,
  });
};
