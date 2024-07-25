import { Version3Client } from "jira.js";
import { readFileSync } from "fs";

const certs = Object.fromEntries(
  readFileSync("../../.env", "utf8").split("\n").map((line) => line.split("=")),
);

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

const dashboards = await client.dashboards.getAllDashboards()
for (const dashboard of dashboards.dashboards) {
  console.log(dashboard);
}
