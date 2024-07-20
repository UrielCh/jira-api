import JiraClient from "@u4/jira";
import { createIssue } from "./utils/createIssue.ts";
import { apiToken, email, host } from "./credentials.ts";

async function addFixVersion() {
  const client =
    new JiraClient(host, { user: email, token: apiToken }).root.api[3];

  const { id } = await createIssue(client);
  if (!id) {
    throw new Error("Failed to create issue");
  }
  const fix = await client.issue.$(id).properties.$("fixVersion").$put({
    propertyValue: "N/a",
  });
  console.log(fix);
}

addFixVersion().catch((e) => {
  console.error(e);
  throw new Error(e.errorMessages?.join(" "));
});
