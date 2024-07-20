import type { AtlassianV3, SecurityLevel } from "@u4/jira";

export async function createIssue(
  client: AtlassianV3["api"][3],
): Promise<SecurityLevel> {
  const projects = await client.project.$get();

  if (projects.length) {
    const { key } = projects[0];
    const { id } = await client.issue.$post({
      fields: {
        summary: "My first issue",
        issuetype: {
          name: "Task",
        },
        project: {
          key,
        },
      },
    });
    if (!id) {
      throw new Error("Failed to create issue");
    }
    return client.securitylevel.$(id).$get();
  }

  throw new Error("First create a project");
}
