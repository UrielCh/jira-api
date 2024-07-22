import { load } from "@std/dotenv";
import JiraClient, { AtlassianV3 } from "@u4/jira";

const env = await load();
export const host = env.JRA_DOMAIN as string;
export const email = env.JRA_USER as string;
export const apiToken = env.JRA_TOKEN as string;

if (!host) {
  throw new Error("Please specify host in JRA_USER environment variable");
} else if (!email) {
  throw new Error("Please specify email in JRA_TOKEN environment variable");
} else if (!apiToken) {
  throw new Error("Please specify apiToken in JRA_DOMAIN environment variable");
}

export function createJiraClient() : AtlassianV3["api"][3] {
  return new JiraClient(host, { user: email, token: apiToken }).root.api[3];
}
