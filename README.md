# jira-api

a compact JIRA REST API

## Why not using jira.js

jira.js is huge, 8.91MB containing more than 10,000 files, and relies on axios.
This library has fewer than 10 files, and once bundled it is less than 1KB, and uses fetch.


## sample

 ```ts
 import JiraClient from "@u4/jira";
 
 const client = new JiraClient("yourdomain", { user, token });
 // get api V3
 const api = client.root.api[3];
 const dashboards = await api.dashboard.$get({startAt: 0});
 console.log("dashboards", dashboards);
 ```

