// deno-lint-ignore-file no-explicit-any
import type { ApiParamsType, ApiRequestable } from "./common.ts";

/**
 * handler for all proxy level except the root one
 * handle:
 * - Object Field
 * - $()
 * - $getv/$put()/$post()/$delete()
 * - path navigation
 */
const handlerChild: ProxyHandler<GenericProxyApi> = {
  get(target: GenericProxyApi, p: PropertyKey, _receiver: any) {
    if (typeof p === "symbol") {
      // symbol can not be part of API
      return (target as any)[p];
    }
    const key = p.toString();
    switch (key) {
      case "toString":
      case "valueOf":
      case "toLocaleString":
        return (target as any)[p];
    }
    return commonGet(key, target);
  },
};

/**
 * Common getter part for handlers child
 * - $()
 * - $get()/$put()/$post()/$delete()/$cache()
 * - path navigation
 */
const commonGet = (key: string, target: GenericProxyApi) => {
  if (key.startsWith("$")) {
    // give parameter in path
    if (key === "$") {
      return (id: string | number) => {
        const idStr = encodeURIComponent(String(id));
        const child = new GenericProxyApi(
          target._apiEngine,
          `${target._path}/${idStr}`,
          `${target._model}/*`,
        );
        return new Proxy(child, handlerChild);
      };
    }
    switch (key) {
      case "$get":
      case "$post":
      case "$delete":
      case "$put":
      case "$patch":
      case "$option":
      case "$head": {
        const fnc = (params: ApiParamsType) => {
          const mtd = key.substring(1);
          return target._apiEngine.doRequest(
            mtd,
            target._path,
            target._model,
            params,
          );
        };
        return fnc.bind(target._apiEngine);
      }
      default:
        return (id: string | number) => {
          const idStr = encodeURIComponent(String(id));
          const prefixKey = key.substring(1);
          const child = new GenericProxyApi(
            target._apiEngine,
            `${target._path}/${prefixKey}${idStr}`,
            `${target._model}/${prefixKey}*`,
          );
          return new Proxy(child, handlerChild);
        };
    }
  }
  if (key.startsWith("_")) {
    key = key.substring(1);
  }
  const child = new GenericProxyApi(
    target._apiEngine,
    `${target._path}/${key}`,
    `${target._model}/${key}`,
  );
  return new Proxy(child, handlerChild);
};

/**
 * handler for the first level of the proxy
 * handle:
 * - Object Field
 * - EventEmitter Field
 * - flat get/put/post/delete calls
 * - $()
 * - $get()/$put()/$post()/$delete()
 * - path navigation
 */
const handlerRoot: ProxyHandler<GenericProxyApi> = {
  get(target: GenericProxyApi, p: PropertyKey, _receiver: any) {
    if (typeof p === "symbol") {
      // symbol can not be part of API
      return (target as any)[p];
    }
    const key = p.toString();
    switch (key) {
      case "toString":
      case "valueOf":
      case "toLocaleString":
        return target[p as "toString" | "valueOf" | "toLocaleString"];
    }
    return commonGet(key, target);
  },
};

/**
 * For API 2.0 Proxy
 * Data cloned on each Proxy node call
 * maintains full request path for Api calls
 */
class GenericProxyApi {
  public _apiEngine: ApiRequestable;
  public _path: string;
  public _model: string;
  constructor(apiEngine: ApiRequestable, path = "", model = path) {
    this._apiEngine = apiEngine;
    this._path = path;
    this._model = model;
  }
  /**
   * Override toString to give a better debug information
   * @returns the current URI path
   */
  toString(): string {
    return `REST API to ${this._path}`;
  }
}

/**
 * Build an API proxy, to use as api-client
 * Use internaly only, should be cast by the public API client.
 *
 * @param apiEngine a requestable object containing the request implementation
 * @param path add a prefix to all path
 */
export function buildProxy<T>(apiEngine: ApiRequestable, path = ""): T {
  return new Proxy(new GenericProxyApi(apiEngine, path), handlerRoot) as T;
}
