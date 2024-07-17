import type { ApiParamsType, ApiRequestable } from "./common.ts";

/**
 * This class is used to call Atlassian API
 * 
 * This Library have a tiny footprint, it's only 1.5KB
 * 
 * @module
 */
export class ApiCallerAtlassian implements ApiRequestable {
  private base: string;
  constructor(
    domain: string,
    private opt: { user: string; token: string },
  ) {
    this.base = `https://${domain}.atlassian.net/rest`;
  }

  public get auth(): string {
    return `Basic ${btoa(`${this.opt.user}:${this.opt.token}`)}`;
  }

  async doRequest<T>(
    httpMethod: string,
    path: string,
    _pathTemplate: string,
    params?: ApiParamsType,
  ): Promise<T> {
    httpMethod = httpMethod.toUpperCase();

    let url = `${this.base}${path}`;
    const headers: string[][] = [
      ["User-Agent", "My Atlassian APi/0.0"],
      ["Accept", "application/json"],
      ["Authorization", this.auth],
    ];
    const option: RequestInit = {
      method: httpMethod,
      headers,
    };
    if (typeof params === "object" && Object.keys(params).length > 0) {
      if (httpMethod === "PUT" || httpMethod === "POST") {
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
    // console.log(`doRequest ${httpMethod} ${url}`); // , JSON.stringify(option, null, 2)
    // console.log(`doRequest ${url} params: ${JSON.stringify(params)}`);
    const req = await fetch(url, option);
    const { status } = req;
    if (status < 200 || status >= 300) {
      const error = await req.text();
      //  {"errorMessages":["The custom field doesn't support options."],"errors":{}}
      throw Error(
        `Request ${httpMethod} ${url} failed: ${status} ${req.statusText}\n ${error}`,
      );
    }
    const contentType = req.headers.get("content-type");
    if (
      contentType === "application/json" ||
      contentType === "application/json;charset=UTF-8"
    ) {
      const resp = await req.json();
      return resp;
    }
    throw Error(`return type ${contentType} not implemented yet`);
  }
}
