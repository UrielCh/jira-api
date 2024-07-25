import JiraClient from "@u4/jira";
import { readFileSync } from 'node:fs';

const certs = Object.fromEntries(readFileSync("../../.env", "utf8").split("\n").map((line) => line.split("=")));

const domain = certs.JRA_DOMAIN;
const user = certs.JRA_USER;
const token = certs.JRA_TOKEN;
const jira = new JiraClient(domain, { user, token });
const apiV3 = jira.apiV3;
const dashboards = await apiV3.dashboard.$get();
for (const dashboard of dashboards.dashboards) {
  console.log(dashboard);
}