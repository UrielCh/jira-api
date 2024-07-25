import { Version3Client } from 'npm:jira.js';
import { readFileSync } from 'node:fs';

const certs = Object.fromEntries(readFileSync("../../.env", "utf8").split("\n").map((line) => line.split("=")));

const host = certs.JRA_BASE;
const email = certs.JRA_USER;
const apiToken = certs.JRA_TOKEN;

const client = new Version3Client({
  host: `https://${host}`,
  authentication: {
    basic: {
      email,
      apiToken,
    },
  },
});

async function main() {
  const projects = await client.projects.searchProjects();

  if (projects.values.length) {
    const project = projects.values[0];

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
    const myself = await client.myself.getCurrentUser();

    const { id } = await client.projects.createProject({
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