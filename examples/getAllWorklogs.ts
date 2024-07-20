import JiraClient from "../mod.ts";
import { addWorklog } from "./utils/addWorklog.ts";
import { createIssue } from "./utils/createIssue.ts";
import { apiToken, email, host } from "./credentials.ts";

async function getAllWorklogs() {
  const client =
    new JiraClient(host, { user: email, token: apiToken }).root.api[3];

  // Used to reduce the amount of code that is not directly related to getting a worklogs
  const issue = await createIssue(client);

  // Let's add some worklogs
  await addWorklog(client, issue);
  await addWorklog(client, issue);
  await addWorklog(client, issue);

  // The main part responsible for getting the worklogs
  const worklogs = [];

  let offset = 0;
  let total = 0;

  if (!issue.id) {
    throw new Error("Issue id is required");
  }
  do {
    const worklogsPaginated = await client.issue.$(issue.id).worklog.$get({
      startAt: offset,
    });
    if (!worklogsPaginated) {
      throw new Error("Failed to get worklogs");
    }
    const { worklogs } = worklogsPaginated;
    if (!worklogs) {
      throw new Error("Failed to get worklogs");
    }
    offset += worklogs.length;
    total = worklogsPaginated.total!;
    worklogs.push(...worklogs);
  } while (offset < total);

  console.log(`Received ${worklogs.length} worklogs.`);
}

getAllWorklogs().catch((e) => {
  console.error(e);

  throw new Error(e.errorMessages.join(" "));
});
