import JiraClient from "../mod.ts";
import { createIssue } from "./utils/createIssue.ts";
import { apiToken, email, host } from "./credentials.ts";

async function addWorklog() {
  const client =
    new JiraClient(host, { user: email, token: apiToken }).root.api[3];

  // Used to reduce the amount of code that is not directly related to creating a worklog
  const { id: issueIdOrKey } = await createIssue(client);
  if (!issueIdOrKey) {
    throw new Error("Failed to create issue");
  }
  // The main part responsible for creating the worklog
  const worklog = await client.issue.$(issueIdOrKey).worklog.$post({
    comment: "My first worklog", // Not requited
    timeSpentSeconds: 60, // Required one of `timeSpentSeconds` or `timeSpent`
  });

  console.log(`Worklog successfully added for Issue Id: ${worklog.issueId}`);
}

addWorklog().catch((e) => {
  console.error(e);

  throw new Error(e.errorMessages.join(" "));
});
