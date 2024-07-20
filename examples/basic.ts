import JiraClient from "@u4/jira";

import { apiToken, email, host } from "./credentials.ts";

const client =
  new JiraClient(host, { user: email, token: apiToken }).root.api[3];

async function main() {
  const projects = await client.project.$get();

  if (projects.length) {
    const project = projects[0];
    console.log(
      `Selecting Project: ${project.name} (${project.key}) (${projects.length} project available)`,
    );

    const { id } = await client.issue.$post({
      fields: {
        summary: "My first issue",
        issuetype: {
          name: "Task",
        },
        project: {
          key: project.key,
        },
      },
    });
    if (!id) {
      throw new Error("Failed to create issue");
    }
    const issue = await client.issue.$(id).$get();
    const fields = issue.fields!; //  as { summary: string };
    console.log(
      `Issue '${fields.summary}' was successfully added to '${project.name}' project as ${issue.key}`,
    );
  } else {
    const myself = await client.myself.$get();
    const { id } = await client.project.$post({
      key: "PROJECT",
      name: "My Project",
      leadAccountId: myself.accountId,
      projectTypeKey: "software",
    });
    const project = await client.project.$(id.toString()).$get();
    console.log(`Project '${project.name}' was successfully created.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    throw new Error(JSON.stringify(e));
  });
