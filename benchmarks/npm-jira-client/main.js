import JiraApi from "jira-client";
import { readFileSync } from "fs";

const certs = Object.fromEntries(
  readFileSync("../../.env", "utf8").split("\n").map((line) => line.split("=")),
);

const host = certs.JRA_BASE;
const username = certs.JRA_USER;
const password = certs.JRA_TOKEN;

const client = new JiraApi({
  protocol: "https",
  host,
  username,
  password,
  apiVersion: "3",
  strictSSL: true,
});

// listDashboard do not exists in API V2 
const projects = await client.listFields();
console.log(projects);
