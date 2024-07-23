import proxyAtlassianV3 from "./api-atlassianV3.ts";
import type { AtlassianV3 } from "./api-atlassianV3.ts";
import { APICache } from "./APICache.ts";
import type { ApiParamsType, ICacheSilot } from "./common.ts";
import type { CacheAction, ICacheOptions, SlotConstructor } from "./common.ts";

/**
 * This class is used to call Atlassian API
 */
export class JiraClient {
  /**
   * base URL for the API like https://yourdomain.atlassian.net/rest
   */
  private baseUrl: string;
  /**
   * caching object
   */
  private queryCache: APICache | null = null;

  /**
   * Slot class to use for cache
   * by default use: CacheSilotMemory
   */
  public slotClass: SlotConstructor | undefined;

  constructor(
    domain: string,
    private opt: { user: string; token: string },
  ) {
    this.baseUrl = `https://${domain}.atlassian.net/rest`;
  }

  /**
   * private auth builder
   */
  private get auth(): string {
    return `Basic ${btoa(`${this.opt.user}:${this.opt.token}`)}`;
  }

  /**
   * get REST API typed root entry point
   */
  public get root(): AtlassianV3 {
    const { baseUrl, auth } = this;
    /**
     * this is the main function to call the API, you can use it directly, but you will lose the type checking
     * use the .root proxy instead to access the API
     *
     * @param httpMethod get | post | put | delete
     * @param path path to the API
     * @param _pathTemplate path with placeholders
     * @param params params to send
     * @returns API response
     */
    const doRequest = async <T>(
      method: string,
      path: string,
      pathTemplate: string,
      params?: ApiParamsType,
    ): Promise<T> => {
      method = method.toUpperCase();

      let url = `${baseUrl}${path}`;
      // if (url.endsWith("/")) {
      //   url = url.slice(0, -1);
      // }

      const headers: string[][] = [
        ["User-Agent", "My Atlassian APi/0.0"],
        ["Accept", "application/json"],
        ["Authorization", auth],
      ];
      const option: RequestInit = {
        method,
        headers,
      };
      if (typeof params === "object" && Object.keys(params).length > 0) {
        if (method === "PUT" || method === "POST") {
          // Escape unicode
          const reqBody = JSON.stringify(params).replace(
            /[\u0080-\uFFFF]/g,
            (m) => "\\u" + ("0000" + m.charCodeAt(0).toString(16)).slice(-4),
          );
          headers.push(["Content-Type", "application/json"]);
          headers.push(["Content-Length", reqBody.length.toString()]);
          option.body = reqBody;
        } else {
          url += `?${new URLSearchParams(params).toString()}`;
        }
      }

      let cacheSilot: ICacheSilot | undefined;
      // httpMethod === 'GET' && this.queryCache
      if (this.queryCache) {
        cacheSilot = this.queryCache.silot(pathTemplate);
        if (cacheSilot && method === "GET") {
          const value = await cacheSilot.get(path);
          if (value !== undefined) {
            return value as T;
          }
        }
        // flush silot for PUT / POST / DELETE ?
      }

      const req = await fetch(url, option);
      const { status } = req;
      if (status < 200 || status >= 300) {
        const error = await req.text(); // {errorMessages:string[], errors:{}}
        throw Error(
          `Request ${method} ${url} failed: ${status} ${req.statusText}\n ${error}`,
        );
      }
      const contentType = req.headers.get("content-type");
      if (
        contentType === "application/json" ||
        contentType === "application/json;charset=UTF-8"
      ) {
        const respTxt = await req.text();
        let resp: T = null as T;
        if (respTxt !== "") {
          resp = JSON.parse(respTxt);
        }
        if (cacheSilot) {
          if (method === "GET") {
            const size = respTxt.length; // Number(req.headers.get("content-length") || "1") || 1;
            await cacheSilot.store(path, resp, size); // TODO fix size
          } else {
            await cacheSilot.discard(path);
            if (method === "DELETE") {
              await cacheSilot.discard(path.replace(/\/[^/]+$/, ""));
            }
          }
        }
        return resp;
      }

      if (
        contentType === "text/html" || contentType === "text/html;charset=UTF-8"
      ) {
        const respTxt = await req.text();
        if (cacheSilot) {
          if (method === "GET") {
            const size = respTxt.length; // Number(req.headers.get("content-length") || "1") || 1;
            await cacheSilot.store(path, respTxt, size); // TODO fix size
          } else {
            await cacheSilot.discard(path);
            if (method === "DELETE") {
              await cacheSilot.discard(path.replace(/\/[^/]+$/, ""));
            }
          }
        }
        return respTxt as unknown as T;
      }
      throw Error(`return type ${contentType} not implemented yet`);
    };

    const cache = (
      template: string,
      param?: ICacheOptions | CacheAction,
    ): void => {
      if (!this.queryCache) {
        this.queryCache = new APICache({ slotClass: this.slotClass });
      }
      param = param || { ttl: 3600 };
      if (typeof param === "string") {
        if (param === "disable") {
          // not implemented yet
        } else if (param === "flush") {
          this.queryCache.flush(template);
        }
      } else {
        this.queryCache.cache(template, param);
      }
    };

    const proxy = proxyAtlassianV3({ cache, doRequest });
    return proxy;
  }
}