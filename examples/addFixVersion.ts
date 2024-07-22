import { createIssue } from "./utils/createIssue.ts";
import { createJiraClient } from "./credentials.ts";

async function addFixVersion() {
  const client = createJiraClient();

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
