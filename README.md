# @u4/jira

The best JIRA REST API client

[![JSR](https://jsr.io/badges/@u4/jira)](https://jsr.io/@u4/jira)

## comparaison to other clients API

`@u4/jira` is built on top of deno, using the fetch API, and no external dependency.

Compared to other APIs the lib is by far the smallest

|----------------|------------------|--------------|-------------|----------------|
| package        | node_modules size| files count  | Api version | extra features |
|----------------|------------------|-------------:|-------------|----------------|
|mpm:jira-client | 37M              | 2 728        | V2 only     |                |
|mpm:jira.js     | 96M              | 20 784       | V2 and V3   |                |
| jsr:@u4/jira   | 2.5M             | 45           | V3 only     | built-in cache |

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
const apiV3 = jira.apiV3;
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
const api = client.apiV3;
const dashboards = await api.dashboard.$get({ startAt: 0 });
console.log("dashboards", dashboards);
```
