# jira-api

a compact JIRA REST API


## sample

 ```ts
 import JiraClient from "@u4/jira";
 
 const client = new JiraClient("yourdomain", { user, token });
 // get api V3
 const api = client.root.api[3];
 const dashboards = await api.dashboard.$get({startAt: 0});
 console.log("dashboards", dashboards);
 ```