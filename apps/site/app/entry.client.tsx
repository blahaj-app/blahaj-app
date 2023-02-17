import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import type { FC, PropsWithChildren } from "react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { ClientStyleContext } from "./context";
import { createEmotionCache, defaultCache } from "./create-emotion-cache";

const ClientCacheProvider: FC<PropsWithChildren> = ({ children }) => {
  const [cache, setCache] = useState(defaultCache);

  const reset = () => {
    setCache(createEmotionCache());
  };

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
};

const hydrate = () => {
  hydrateRoot(
    document,
    <ClientCacheProvider>
      <RemixBrowser />
    </ClientCacheProvider>,
  );
};

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}
