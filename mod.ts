export type { CacheAction, ICacheOptions, SlotConstructor } from "./common.ts";
export type * from "./api-atlassianV3.ts";
export { CacheSilotDenoKV } from "./CacheSilotDenoKV.ts";
export { CacheSilotMemory } from "./CacheSilotMemory.ts";
export { JiraClient } from "./JiraClient.ts";
export { JiraClient as default } from "./JiraClient.ts";
export type * from "./api-atlassianV3.ts";

/**
 * This Library have a tiny footprint, it's only 1.5KB
 *
 * [![JSR](https://jsr.io/badges/@u4/midjourney)](https://jsr.io/@u4/jira)
 *
 * usage:
 * ```ts
 * import JiraClient from "@u4/jira";
 *
 * const client = new JiraClient("yourdomain", { user, token });
 * // get api V3
 * const api = client.root.api[3];
 * const dashboards = await api.dashboard.$get({startAt: 0});
 * console.log("dashboards", dashboards);
 * ```
 * @module
 */
