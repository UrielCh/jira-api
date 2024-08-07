import { assertEquals } from "jsr:@std/assert";
import { JiraClient } from "./JiraClient.ts";

Deno.test(function fullURL() {
  const jira = new JiraClient("https://yourdomain.atlassian.net", {
    token: "token",
    user: "user",
  });
  assertEquals(jira.baseUrl, "https://yourdomain.atlassian.net/rest");
});

Deno.test(function fullURI() {
  const jira = new JiraClient("yourdomain.atlassian.net", {
    token: "token",
    user: "user",
  });
  assertEquals(jira.baseUrl, "https://yourdomain.atlassian.net/rest");
});

Deno.test(function fullName() {
  const jira = new JiraClient("yourdomain", { token: "token", user: "user" });
  assertEquals(jira.baseUrl, "https://yourdomain.atlassian.net/rest");
});
