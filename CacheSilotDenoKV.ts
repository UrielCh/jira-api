import type { ICacheOptions, ICacheSilot } from "./common.ts";

/**
 * CacheSilotDenoKV is a cache implementation using Deno.KV
 *
 * Deno.KV is currently unstable and require the --unstable or the --unstable-kv flag
 *
 * use CacheSilotDenoKV.cleanup() to disconnect for the KV store
 */
export class CacheSilotDenoKV implements ICacheSilot {
  private static kv: Promise<Deno.Kv>;
  private ttl: number;

  constructor(public template: string, public options: ICacheOptions) {
    if (!CacheSilotDenoKV.kv) {
      CacheSilotDenoKV.kv = Deno.openKv();
    }
    this.ttl = (this.options.ttl || 360) * 1000;
  }

  async flush(): Promise<void> {
    const kv = await CacheSilotDenoKV.kv;
    await kv.delete([this.template]);
  }

  async store(
    path: string,
    value: unknown,
    _size: number,
  ): Promise<boolean> {
    const kv = await CacheSilotDenoKV.kv;
    // const result =
    await kv.set([this.template, path], value, { expireIn: this.ttl });
    return true;
  }

  async get(path: string): Promise<unknown | undefined> {
    const kv = await CacheSilotDenoKV.kv;
    const resp = await kv.get([this.template, path]);
    if (resp.versionstamp) {
      return resp.value;
    }
    return undefined;
  }

  async discard(path: string): Promise<boolean> {
    const kv = await CacheSilotDenoKV.kv;
    await kv.delete([this.template, path]);
    return true;
  }

  static async cleanup(): Promise<void> {
    const kv = await this.kv;
    kv.close();
  }
}
