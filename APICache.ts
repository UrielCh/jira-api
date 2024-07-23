import { CacheSilotMemory } from "./CacheSilotMemory.ts";
import type { ICacheOptions, ICacheSilot, SlotConstructor } from "./common.ts";

/**
 * cache manager for REST API
 *
 * this class contains the code used to cache the API calls
 *
 * the cache mecanism is delegated to the provided slotClass, by default it uses CacheSilotMemory
 */
export class APICache {
  /**
   * the class used to create silot
   */
  private slotClass: SlotConstructor;
  /**
   * index slot cache by REST API template
   */
  private index: { [key: string]: ICacheSilot } = {};

  /**
   * APICache accept an option object to configure the slotClass with a single parameter
   *
   * @param options contains the slotClass to use
   */
  constructor(options?: { slotClass?: SlotConstructor }) {
    if (options && options.slotClass) {
      this.slotClass = options.slotClass;
    } else {
      this.slotClass = CacheSilotMemory;
    }
  }
  /**
   * enable cache
   * @param template
   * @param options
   */
  cache(template: string, options: ICacheOptions): void {
    const silot = this.index[template];
    if (silot) {
      silot.options = options;
    } else if (options.silotClass) {
      this.index[template] = new options.silotClass(template, options);
    } else {
      this.index[template] = new this.slotClass(template, options);
    }
  }

  /**
   * disable cache
   * @param template
   */
  async disable(template: string) {
    const silot = this.index[template];
    if (silot) {
      await silot.flush();
      delete this.index[template];
    }
  }

  /**
   * store value in cache
   * @param template REST url template with place holder
   * @param path real path used to store the value
   * @param value the value to store
   * @param size an estimated size of the value to handle cache eviction
   * @returns
   */
  store(
    template: string,
    path: string,
    value: unknown,
    size: number,
  ): Promise<boolean> | boolean {
    const silot = this.index[template];
    if (silot) {
      return silot.store(path, value, size);
    }
    return false;
  }

  /**
   * retrieve value from cache
   *
   * @param template REST url template with place holder
   * @param path real path used to store the value
   * @returns the cached value or undefined
   */
  get(template: string, path: string): unknown | undefined {
    const silot = this.index[template];
    if (silot) {
      return silot.get(path);
    }
  }

  discard(
    template: string,
    path: string,
  ): Promise<boolean> | boolean | undefined {
    const silot = this.index[template];
    if (silot) {
      return silot.discard(path);
    }
  }

  /**
   * evict all cache for a template
   *
   * @param template REST url template with place holder
   * @returns
   */
  flush(template: string): Promise<void> | void {
    const silot = this.index[template];
    if (silot) {
      return silot.flush();
    }
  }

  /**
   * get internal silot for advance actions
   * @param template
   */
  silot(template: string): ICacheSilot | undefined {
    return this.index[template];
  }
}
