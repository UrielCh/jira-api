// import { CacheSilotDenoKV } from "../mod.ts";
import { CacheSilotDenoKV } from "@u4/jira";
import { createJiraClient } from "./credentials.ts";

const client = createJiraClient().apiV3;

const projectName = "MyPROJECT";
const myWorkflow = "MyWorkflow";

async function main() {
  const issues = await client.search.$get({ jql: "project = MPRJ" });
  console.log(`Issues: `, issues.issues);
  for (const issue of issues.issues!) {
    await client.issue.$(issue.id!).$get();
  }

  {
    // enable default memory cache
    await client.project.$cache({ silotClass: CacheSilotDenoKV });
    const projects = await client.project.$get();
    console.log(`get ${projects.length} projects from API`);
    const projects2 = await client.project.$get();
    console.log(`get ${projects2.length} projects from Memory cache`);
    await client.project.$cache("flush");
  }

  const projects = await client.project.$get();
  // console.log(`Projects: ${projects.map((p) => p.name).join(", ")}`);
  let project = projects.find((p) => p.name === projectName)?.id;
  if (!project) {
    const myself = await client.myself.$get();
    const { id } = await client.project.$post({
      key: "MPRJ",
      name: projectName,
      leadAccountId: myself.accountId,
      projectTypeKey: "software",
    });
    project = id.toString();
    console.log(`Project '${project}' was successfully created.`);
  }
  const workflows = await client.workflow.$get({ workflowName: myWorkflow });
  if (!workflows.length) {
    console.log("workflow not found");
    await client.workflow.$post({
      name: myWorkflow,
      description: "My workflow description",
      statuses: [
        { id: "1", properties: { "jira.issue.editable": "false" } },
        { id: "2" },
        { id: "3" },
      ],
      transitions: [
        {
          from: [],
          name: "Created",
          to: "1",
          type: "initial",
        },
        {
          from: ["1"],
          name: "In progress",
          properties: {
            "custom-property": "custom-value",
          },
          rules: {
            conditions: {
              conditions: [
                {
                  type: "RemoteOnlyCondition",
                },
                {
                  configuration: {
                    groups: ["developers", "qa-testers"],
                  },
                  type: "UserInAnyGroupCondition",
                },
              ],
              operator: "AND",
            },
            postFunctions: [
              {
                type: "AssignToCurrentUserFunction",
              },
            ],
          },
          screen: {
            id: "10001",
          },
          to: "2",
          type: "directed",
        },
        {
          name: "Completed",
          rules: {
            postFunctions: [
              {
                configuration: {
                  fieldId: "assignee",
                },
                type: "ClearFieldValuePostFunction",
              },
            ],
            validators: [
              {
                configuration: {
                  parentStatuses: [
                    {
                      id: "3",
                    },
                  ],
                },
                type: "ParentStatusValidator",
              },
              {
                configuration: {
                  permissionKey: "ADMINISTER_PROJECTS",
                },
                type: "PermissionValidator",
              },
            ],
          },
          to: "3",
          type: "global",
        },
      ],
    });
  }

  //   if (projects.length) {
  //     const project = projects[projects.length - 1];
  //     console.log(
  //       `Selecting Project: ${project.name} (${project.key}) (${projects.length} project available)`,
  //     );
  //
  //     client.issuetype.$cache({ ttl: 1000, silotClass: CacheSilotDenoKV });
  //     const issuesTypes = await client.issuetype.$get();
  //     console.log(`Issue Types: ${issuesTypes.map((t) => t.name).join(", ")}`);
  //
  //     let id = "";
  //     const old = await client.search.$get({
  //       jql: `project = ${project.key} AND summary ~ "My first issue"`,
  //     });
  //     if (!old.total) {
  //       const newIssue = await client.issue.$post({
  //         fields: {
  //           summary: "My first issue",
  //           issuetype: {
  //             name: "Task",
  //           },
  //           project: {
  //             key: project.key,
  //           },
  //         },
  //       });
  //       if (!newIssue || !newIssue.id) {
  //         throw new Error("Failed to create issue");
  //       }
  //       id = newIssue.id;
  //     } else {
  //       id = old.issues![0].id!;
  //       if (old.total > 2) {
  //         for (const issue of old.issues!.slice(1)) {
  //           console.log(`Deleting issue ${issue.key}`);
  //           await client.issue.$(issue.id!).$delete();
  //         }
  //       }
  //     }
  //
  //     client.issue.$(id).$cache({ ttl: 1000, silotClass: CacheSilotDenoKV });
  //     const issue = await client.issue.$(id).$get();
  //
  //     // use cache
  //     // const issue2 = await client.issue.$(id).$get();
  //
  //     const fields = issue.fields!; //  as { summary: string };
  //     console.log(
  //       `Issue '${fields.summary}' was successfully added to '${project.name}' project as ${issue.key}`,
  //     );
  //   } else {
  //     const myself = await client.myself.$get();
  //     const { id } = await client.project.$post({
  //       key: "PROJECT",
  //       name: "My Project",
  //       leadAccountId: myself.accountId,
  //       projectTypeKey: "software",
  //     });
  //     const project = await client.project.$(id.toString()).$get();
  //     console.log(`Project '${project.name}' was successfully created.`);
  //   }
}

main().catch((e) => {
  console.error(e);
  throw new Error(JSON.stringify(e));
});
