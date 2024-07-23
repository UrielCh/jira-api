import { CacheSilotDenoKV } from "@u4/jira";
import { createJiraClient } from "./credentials.ts";

const client = createJiraClient();

async function main() {
  const projects = await client.project.$get();

  if (projects.length) {
    const project = projects[projects.length - 1];
    console.log(
      `Selecting Project: ${project.name} (${project.key}) (${projects.length} project available)`,
    );

    client.issuetype.$cache({ ttl: 1000, silotClass: CacheSilotDenoKV });
    const issuesTypes = await client.issuetype.$get();
    console.log(`Issue Types: ${issuesTypes.map((t) => t.name).join(", ")}`);

    let id = "";
    const old = await client.search.$get({
      jql: `project = ${project.key} AND summary ~ "My first issue"`,
    });
    if (!old.total) {
      const newIssue = await client.issue.$post({
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
      if (!newIssue || !newIssue.id) {
        throw new Error("Failed to create issue");
      }
      id = newIssue.id;
    } else {
      id = old.issues![0].id!;
      if (old.total > 2) {
        for (const issue of old.issues!.slice(1)) {
          console.log(`Deleting issue ${issue.key}`);
          await client.issue.$(issue.id!).$delete();
        }
      }
    }

    client.issue.$(id).$cache({ ttl: 1000, silotClass: CacheSilotDenoKV });
    const issue = await client.issue.$(id).$get();

    // use cache
    // const issue2 = await client.issue.$(id).$get();

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
