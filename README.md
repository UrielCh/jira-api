# jira-api

a compact JIRA REST API

[![JSR](https://jsr.io/badges/@u4/midjourney)](https://jsr.io/@u4/jira)

## Why not using jira.js

jira.js is huge, 8.91MB containing more than 10,000 files, and relies on axios.
This library has fewer than 10 files, and once bundled it is less than 1KB, and
uses fetch.

## samples

### Using Node

```bash
npx jsr add @u4/jira
```

fill your creadential in env variable like: JRA_DOMAIN, JRA_USER and JRA_TOKEN

run your NodeJS code:

```js
import JiraClient from "@u4/jira";

const domain = process.env.JRA_DOMAIN;
const user = process.env.JRA_USER;
const token = process.env.JRA_TOKEN;
const jira = new JiraClient(domain, { user, token });
console.log(jira);
const apiV3 = jira.root.api[3];
const dashboards = await apiV3.dashboard.$get();
for (const dashboard of dashboards.dashboards) {
  await apiV3.dashboard.$(dashboard.id).$get();
  console.log(dashboard);
}
```

### using deno

```bash
deno add @u4/jira
```

```ts
import JiraClient from "@u4/jira";

const client = new JiraClient("yourdomain", { user, token });
// get api V3
const api = client.root.api[3];
const dashboards = await api.dashboard.$get({ startAt: 0 });
console.log("dashboards", dashboards);
```
