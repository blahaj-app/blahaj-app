import { CacheProvider } from "@emotion/react";
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import type { FC, PropsWithChildren } from "react";
import { startTransition, useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { ClientStyleContext } from "./context";
import { createEmotionCache, defaultCache } from "./create-emotion-cache";
import rIC from "./utils/ric";

Sentry.init({
  dsn: __sentryDsn__,
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
    }),
    new Sentry.Replay({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],

  replaysSessionSampleRate: 0.4,
  replaysOnErrorSampleRate: 1.0,
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

rIC(hydrate);
