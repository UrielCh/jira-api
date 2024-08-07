/**
 * 'flush' and 'disable' are the main action, other can be add later
 */
export type CacheAction = "flush" | "disable" | string;

/**
 * Public interface of a silot
 * you can have one silot per Ovh API call
 */
export interface ICacheSilot {
  options: ICacheOptions;
  flush(): Promise<void> | void;
  store(path: string, value: unknown, size: number): Promise<boolean> | boolean;
  get(path: string): Promise<unknown | undefined> | unknown | undefined;
  discard(path: string): Promise<boolean> | boolean;
}

/**
 * constructor for a silot cache
 */
export type SlotConstructor = new (
  template: string,
  options: ICacheOptions,
) => ICacheSilot;

/**
 * params to configure cache
 */
export interface ICacheOptions {
  /**
   * Time to live in second
   */
  ttl?: number;
  /**
   * max memmory used to store your cache
   */
  size?: number;
  /**
   * max number of entry in your cache
   */
  count?: number;
  /**
   * Silot class construtor used to replace the default in memory implementation: CacheSilotMemory
   */
  silotClass?: SlotConstructor;
}

/**
 * all type that should be sent as parameter to Api calls
 */
// deno-lint-ignore no-explicit-any
export type ApiParamsType = { [key: string]: any } | Array<any>;

/**
 * Common interface used to call API server
 */
export interface ApiRequestable {
  /**
   * Execute a request on the API with promise
   *
   * @param httpMethod: The HTTP method GET POST PUT DELETE
   * @param path: The request final path
   * @param pathTemplate: The request path with {pathParams}
   * @param params: The request parameters (passed as query string or body params)
   */
  doRequest<T>(
    httpMethod: string,
    path: string,
    pathTemplate: string,
    params?: ApiParamsType,
    encoding?: "json" | "form-data" | "x-www-form-urlencoded",
  ): Promise<T>;

  /**
   * cache controle
   */
  cache(template: string, param: ICacheOptions | CacheAction): void;
}
