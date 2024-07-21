import JiraClient from "@u4/jira";
import { createIssue } from "./utils/createIssue.ts";
import { apiToken, email, host } from "./credentials.ts";

async function addWorklog() {
  const client =
    new JiraClient(host, { user: email, token: apiToken }).root.api[3];

  // Used to reduce the amount of code that is not directly related to creating a worklog
  const newIssue = await createIssue(client);
  if (!newIssue.id) {
    throw new Error("Failed to create issue");
  }
  // The main part responsible for creating the worklog
  //  /rest/api/3/issue/{issueIdOrKey}/worklog
  // /** MODEL Worklog */

  const worklog = await client.issue.$(newIssue.id).worklog.$post({
    comment: {
      content: [
        {
          content: [
            {
              text: "I did some work here.",
              type: "text",
            },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
      version: 1,
    },
    started: "2021-01-17T12:34:00.000+0000",
    timeSpentSeconds: 12000,
    //visibility: {
    //  "identifier": "276f955c-63d7-42c8-9520-92d01dca0625",
    //  "type": "group"
    //}
  });
  console.log(`Worklog successfully added for Issue Id: ${worklog.issueId}`);
}

addWorklog().catch((e) => {
  console.error(e);

  throw new Error(e.errorMessages);
});
