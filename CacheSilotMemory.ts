import type { ICacheOptions, ICacheSilot } from "./common.ts";

export interface ICacheEntry {
  /**
   * expiration timestamp
   */
  exp: number;
  path: string;
  size: number;
  value: unknown;
}

/**
 * Default silot cache memory implementation
 */
export class CacheSilotMemory implements ICacheSilot {
  size: number = 0;
  count: number = 0;
  index: { [key: string]: ICacheEntry } = {};
  values: ICacheEntry[] = [];

  constructor(public template: string, public options: ICacheOptions) {
  }

  flush(): void {
    this.index = {};
    for (const value of this.values) {
      delete value.value;
    }
    this.values = [];
    this.count = 0;
    this.size = 0;
  }

  discard(path: string): boolean {
    const value = this.index[path];
    if (value && value.exp) {
      this.count--;
      this.size -= value.size;
      value.size = value.exp = 0;
      value.value = undefined;
      return true;
    }
    return false;
  }

  get(path: string): unknown | undefined {
    const value = this.index[path];
    if (value) {
      if (Date.now() < value.exp) {
        return value.value;
      } // force cleanup
      else {
        this.cleanup();
      }
    }
    return undefined;
  }

  cleanup(): void {
    const now = Date.now();
    while (this.values.length) {
      let value: ICacheEntry = this.values[0];
      if (
        value.exp < now ||
        (this.options.size && this.size > this.options.size) ||
        (this.options.count && this.size > this.options.count)
      ) {
        value = this.values.shift()!;
        if (value.exp) {
          this.count--;
          this.size -= value.size;
          value.value = undefined;
        }
        continue;
      }
      break;
    }
  }

  store(path: string, value: unknown, size: number): boolean {
    this.discard(path);
    if (this.options.size && size > this.options.size) {
      return false;
    }
    const ttl = (this.options.ttl || 3600) * 1000;
    const entry = {
      exp: Date.now() + ttl,
      path,
      size,
      value,
    } as ICacheEntry;
    this.index[path] = entry;
    this.values.push(entry);
    this.count++;
    this.size += size;
    if (this.options.size || this.options.count) {
      this.cleanup();
    }
    return true;
  }
}
