import { CacheProvider } from "@emotion/react";
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import type { FC, PropsWithChildren } from "react";
import { startTransition, useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { ClientStyleContext } from "./context";
import { createEmotionCache, defaultCache } from "./create-emotion-cache";

Sentry.init({
  dsn: __sentryDsn__,
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
    }),
  ],
  // ...
});

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
  startTransition(() => {
    hydrateRoot(
      document,
      <ClientCacheProvider>
        <RemixBrowser />
      </ClientCacheProvider>,
    );
  });
};

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}
