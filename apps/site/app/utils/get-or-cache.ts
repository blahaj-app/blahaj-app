import type { CacheStorage, Response as CFResponse } from "@cloudflare/workers-types";
import { stringify, parse } from "remix-typedjson";

const getOrCache = async <T>(
  key: string,
  waitUntil: (promise: Promise<any>) => void,
  fn: () => Promise<T> | T,
  ttl: number,
): Promise<T> => {
  const url = new URL("https://example.com");
  url.searchParams.set("key", key);

  const cache = (caches as unknown as CacheStorage).default;

  const match = await cache.match(url);
  const promises: Promise<unknown>[] = [];

  if (match) {
    const deserialized = parse<T>(await match.text());

    if (deserialized) {
      return deserialized;
    } else {
      promises.push(cache.delete(url));
    }
  }

  const value = await fn();

  const response = new Response(stringify(value), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttl}`,
    },
  }) as unknown as CFResponse;

  promises.push(cache.put(url, response));

  waitUntil(Promise.all(promises));
  return value;
};

export default getOrCache;
