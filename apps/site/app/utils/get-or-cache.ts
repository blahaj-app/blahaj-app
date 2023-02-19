import type { CacheStorage, Response as CFResponse } from "@cloudflare/workers-types";
import { stringify, parse } from "superjson";

const getOrCache = async <T>(key: string, fn: () => Promise<T> | T, ttl: number): Promise<T> => {
  const url = new URL("https://example.com");
  url.searchParams.set("key", key);

  const cache = (caches as unknown as CacheStorage).default;

  const match = await cache.match(url);

  if (match) {
    return parse<T>(await match.text());
  } else {
    const value = await fn();

    const response = new Response(stringify(value), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttl}`,
      },
    }) as unknown as CFResponse;

    await cache.put(url, response);

    return value;
  }
};

export default getOrCache;
