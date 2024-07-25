# @u4/jira

The best JIRA REST API client

[![JSR](https://jsr.io/badges/@u4/jira)](https://jsr.io/@u4/jira)

## comparaison to other clients API

`@u4/jira` is built on top of deno, using the fetch API, and no external
dependency.

Compared to other APIs the lib is by far the smallest

| package           | node_modules size | files count | Api version | extra features |
| ----------------- | ----------------: | ----------: | ----------- | -------------- |
| `jsr:@u4/jira`    |                2M |          45 | V3 only     | built-in cache |
| `npm:jira-client` |               40M |       2 728 | V2 only     |                |
| `npm:jira.js`     |               96M |      20 784 | V2 and V3   |                |

## Samples

### Using Node

```bash
npx jsr add @u4/jira
```

Fill your creadential in env variable like: JRA_DOMAIN, JRA_USER and JRA_TOKEN

run your NodeJS code:

```js
import JiraClient from "@u4/jira";

const domain = process.env.JRA_DOMAIN;
const user = process.env.JRA_USER;
const token = process.env.JRA_TOKEN;
// built the client
const jira = new JiraClient(domain, { user, token });
// pick the V3 api
const client = jira.apiV3;
const issues = await client.search.$get({ jql: "project = MPRJ" });
console.log(`Issues: `, issues.issues);
for (const issue of issues.issues!) {
  await client.issue.$(issue.id!).$get();
}
```

### Using deno

```bash
deno add @u4/jira
```

```ts
import JiraClient from "@u4/jira";

const jira = new JiraClient("yourdomain", { user, token });
// get api V3
const client = jira.apiV3;
const dashboards = await client.dashboard.$get({ startAt: 0 });
console.log("dashboards", dashboards);
```

### use memory cache

```ts
// enable default memory cache
await client.project.$cache();
const projects = await client.project.$get();
console.log(`get ${projects.length} projects from API`);
const projects2 = await client.project.$get();
console.log(`get ${projects2.length} projects from Memory cache`);
await client.project.$cache("flush");
const projects3 = await client.project.$get();
console.log(`get ${projects3.length} projects from API after flush cache`);
```

### use KV cache

```ts
await client.project.$cache({ silotClass: CacheSilotDenoKV });
const projects = await client.project.$get();
console.log(`get ${projects.length} projects from API or cache`);
```
