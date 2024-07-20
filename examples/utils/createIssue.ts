import type { AtlassianV3, SecurityLevel } from "@u4/jira";

export async function createIssue(
  client: AtlassianV3["api"][3],
  summary = "My first issue",
): Promise<SecurityLevel> {
  const projects = await client.project.$get();

  // const summary = "My first issue";
  if (projects.length) {
    const { key } = projects[0];
    console.log(`Working with project: ${key}`);

    const issues = await client.search.$get({
      jql: `project = ${JSON.stringify(key)} AND summary ~ ${
        JSON.stringify(summary)
      }`,
    });
    if (issues.issues?.length) {
      console.log(
        `Using existing issue: ${issues.issues[0].key} (${
          issues.issues[0].id
        })`,
      );
      return client.issue.$(issues.issues[0].id!).$get();
    }
    // create ne issue
    const issue = await client.issue.$post({
      fields: {
        summary,
        issuetype: {
          name: "Task",
        },
        project: {
          key,
        },
      },
    });
    if (!issue.id) {
      throw new Error("Failed to create issue");
    }
    console.log(`Using new issue: ${issue.key} (${issue.id})`);
    return client.issue.$(issue.id).$get();
  }

  throw new Error("First create a project");
}
