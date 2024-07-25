import JiraApi from 'jira-client';
import { readFileSync } from 'node:fs';

const certs = Object.fromEntries(readFileSync("../../.env", "utf8").split("\n").map((line) => line.split("=")));

const host = certs.JRA_BASE;
const username = certs.JRA_USER;
const password = certs.JRA_TOKEN;

const client = new JiraApi({
  protocol: 'https',
  host,
  username,
  password,
  apiVersion: '3',
  strictSSL: true
});

async function main() {
  const projects = await client.listProjects();

  if (projects.length) {
    const project = projects[0];

    const { id } = await client.issues.createIssue({
      fields: {
        summary: 'My first issue',
        issuetype: {
          name: 'Task'
        },
        project: {
          key: project.key,
        },
      }
    });

    const issue = await client.issues.getIssue({ issueIdOrKey: id });

    console.log(`Issue '${issue.fields.summary}' was successfully added to '${project.name}' project.`);
  } else {
    const myself = await client.getCurrentUser();

    const { id } = await client.createProject({
      key: 'PROJECT',
      name: "My Project",
      leadAccountId: myself.accountId,
      projectTypeKey: 'software',
    });

    const project = await client.projects.getProject({ projectIdOrKey: id.toString() });

    console.log(`Project '${project.name}' was successfully created.`);
  }
}

main();